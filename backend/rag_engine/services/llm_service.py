import os
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()

# We use the openai package to access Gemini utilizing their OpenAI API compatible endpoint
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LLM_MODEL = "gemini-2.5-flash"

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=GEMINI_API_KEY,
)

def generate_rag_answer(question: str, context: str) -> str:
    """Uses LLM to answer a question based on retrieved context."""
    if not GEMINI_API_KEY:
        return "Warning: OPENROUTER_API_KEY not configured. Cannot generate response."

    prompt = f"Context information is below.\n---------------------\n{context}\n---------------------\nGiven the context information and not prior knowledge, answer the query.\nQuery: {question}\nAnswer: "
    
    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful, exact and concise AI assistant built for Retrieval Augmented Generation."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with LLM: {str(e)}"

def extract_metadata_from_text(text: str) -> dict:
    """Uses LLM to extract primary category and topics/keywords from article text."""
    if not GEMINI_API_KEY:
        return {"category": "general", "topics": ["news"]}

    # Truncate text to avoid massive token limits just for metadata extraction
    snippet = text[:2000]
    
    prompt = """Analyze the following article text snippet and extract:
1. A single primary 'category' (e.g. education, finance, politics, sports, general)
2. Up to 5 key 'topics' (e.g. ['JEE', 'Exams'] or ['RBI', 'Interest Rates']).

Output strictly in valid JSON format:
{
  "category": "category_name",
  "topics": ["topic1", "topic2"]
}

Article Text:
""" + snippet

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are an analytical assistant that outputs strict JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error extracting metadata: {str(e)}")
        return {"category": "general", "topics": ["news"]}

def generate_insight_message(user_id: str, user_profile: dict, article_category: str, article_topics: list) -> str:
    """Uses LLM to generate a personalized insight message comparing the article to the user's history."""
    if not GEMINI_API_KEY:
        return f"Hi {user_id}, we saved a new article in {article_category} for you!"

    profile_json = json.dumps({
        "categories": user_profile.get("categories", {}),
        "topics": user_profile.get("topics", {})
    })
    
    prompt = f"""You are a personalized reading assistant for user '{user_id}'.
A new article has been ingested with Category: {article_category} and Topics: {', '.join(article_topics)}.

The user's reading history profile is:
{profile_json}

Compare the new article's category and topics with the user's reading history profile.
Determine if this is a:
- strong match (user reads this category/topics often)
- partial match (some overlap)
- mismatch (user rarely or never reads this)

Generate a short, natural, conversational message addressing the user by name.
Example for match: "Hi {user_id}, this aligns well with your frequent interest in educational news, especially around JEE. Would you like me to fetch 5 key points from this article?"
Example for mismatch: "Hi {user_id}, this is quite different from your usual reads. You typically explore finance-related topics. Would you like me to fetch 5 key points from this article?"

Keep the result concise. Output only the message text itself.
"""

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": "You are a friendly and analytical reading assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Hi {user_id}, I noticed this new {article_category} article. Let me know if you want a summary!"
