from utils.json_db import get_user_profile
from services.llm_service import extract_metadata_from_text, generate_insight_message

def process_insight(user_id: str, article_text: str) -> str:
    """
    1. Extracts metadata from the article text.
    2. Retrieves the user's profile.
    3. Generates a personalized insight message using LLM.
    """
    # 1. Extract metadata
    metadata = extract_metadata_from_text(article_text)
    category = metadata.get("category", "general")
    topics = metadata.get("topics", [])
    
    # 2. Get user profile
    profile = get_user_profile(user_id)
    
    # 3. Generate insight message
    message = generate_insight_message(user_id, profile, category, topics)
    
    return message
