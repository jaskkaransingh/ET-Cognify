import json
import os
from typing import Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user_profiles.json")

def load_db() -> Dict[str, Any]:
    if not os.path.exists(DB_PATH):
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        with open(DB_PATH, "w") as f:
            json.dump({}, f)
        return {}
    
    try:
        with open(DB_PATH, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def save_db(data: Dict[str, Any]):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)

def get_user_profile(user_id: str) -> Dict[str, Any]:
    db = load_db()
    if user_id not in db:
        # Create default profile
        db[user_id] = {
            "user_id": user_id,
            "categories": {},
            "topics": {},
            "read_articles": []
        }
        save_db(db)
    return db[user_id]

def update_user_profile(user_id: str, profile_data: Dict[str, Any]):
    db = load_db()
    db[user_id] = profile_data
    save_db(db)
