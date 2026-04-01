import chromadb
from chromadb.utils import embedding_functions
import os
import uuid
from typing import List

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "chroma_db")

# Automatically uses SentenceTransformers under the hood with all-MiniLM-L6-v2 model 
# which is good enough and very fast locally.
chroma_client = chromadb.PersistentClient(path=DB_PATH)
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

def get_or_create_collection():
    return chroma_client.get_or_create_collection(
        name="articles_collection",
        embedding_function=sentence_transformer_ef
    )

def add_article_chunks(url: str, chunks: List[str]):
    collection = get_or_create_collection()
    
    ids = [f"{url}_{uuid.uuid4()}" for _ in range(len(chunks))]
    metadatas = [{"url": url} for _ in range(len(chunks))]
    
    # We add documents and chroma automatically uses the embedding function
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )

def query_articles(question: str, url: str = None, top_k: int = 3) -> List[str]:
    collection = get_or_create_collection()
    
    where_clause = {}
    if url:
        where_clause = {"url": url}
        
    results = collection.query(
        query_texts=[question],
        n_results=top_k,
        where=where_clause if where_clause else None
    )
    
    if results and "documents" in results and len(results["documents"]) > 0:
        return results["documents"][0]
    return []
