from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from utils.scraper import scrape_article
from utils.text_processor import chunk_text
from utils.json_db import get_user_profile, update_user_profile
from services.vector_store import add_article_chunks, query_articles
from services.llm_service import generate_rag_answer
from services.insight_service import process_insight

router = APIRouter()

class IngestRequest(BaseModel):
    url: str
    user_id: str

class QueryRequest(BaseModel):
    question: str
    article_id: Optional[str] = None

class MarkReadRequest(BaseModel):
    user_id: str
    article_url: str
    category: str
    topics: List[str]
    starred: bool = False

@router.post("/ingest")
def ingest_article(req: IngestRequest):
    """
    Ingests an article from the given URL, extracts text, chunks it, 
    stores embeddings in ChromaDB, and generates an insight message 
    based on the user's reading profile.
    """
    try:
        # 1. Scrape text
        text = scrape_article(req.url)
        
        # 2. Chunk text
        chunks = chunk_text(text, chunk_size=1000, overlap=100)
        
        # 3. Store in Vector DB
        add_article_chunks(req.url, chunks)
        
        # 4. Generate Insight Message
        insight_message = process_insight(req.user_id, text)
        
        return {
            "success": True,
            "insight_message": insight_message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
def query_article(req: QueryRequest):
    """
    Queries the RAG system using the OpenRouter LLM and ChromaDB context.
    Optionally narrow the search using `article_id` (url).
    """
    try:
        # Retrieve chunks (article_id maps to url)
        context_chunks = query_articles(req.question, url=req.article_id, top_k=3)
        if not context_chunks:
            return {"answer": "No relevant context found in the database for this question."}
            
        context = "\n\n".join(context_chunks)
        
        # Generate Answer using RAG logic
        answer = generate_rag_answer(req.question, context)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mark-read")
def mark_read(req: MarkReadRequest):
    """
    Updates the user's reading profile with category and topic weights.
    If starred is True, weights are higher (+2 instead of +1).
    """
    try:
        profile = get_user_profile(req.user_id)
        
        weight = 2 if req.starred else 1
        
        # Update Categories
        if req.category not in profile["categories"]:
            profile["categories"][req.category] = 0
        profile["categories"][req.category] += weight
        
        # Update Topics
        for topic in req.topics:
            if topic not in profile["topics"]:
                profile["topics"][topic] = 0
            profile["topics"][topic] += weight
            
        # Update Read Articles
        if req.article_url not in profile["read_articles"]:
            profile["read_articles"].append(req.article_url)
            
        update_user_profile(req.user_id, profile)
        
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-profile/{user_id}")
def get_profile(user_id: str):
    """
    Returns the user's reading profile statistics.
    """
    profile = get_user_profile(user_id)
    return profile
