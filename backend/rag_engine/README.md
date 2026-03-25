# RAG Engine

A modular backend-only RAG (Retrieval Augmented Generation) system for ingesting and querying Economic Times articles, complete with a specialized personalized insight engine.

## Prerequisites

- Python 3.9+
- OpenRouter API Key (to use for OpenRouter LLM capabilities)

## Setup Instructions

1. **Navigate to the Engine Directory**
   ```bash
   cd rag_engine
   ```

2. **Create and Activate a Virtual Environment**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up the Environment Variables**
   Create a `.env` file in the `rag_engine` root directory and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY="your_openrouter_api_key_here"
   # Optionally override the default model:
   # LLM_MODEL="meta-llama/llama-3.1-8b-instruct:free"
   ```

5. **Run the FastAPI Server**
   ```bash
   uvicorn main:app --reload
   ```
   The API will start at `http://127.0.0.1:8000`.

## API Documentation

FastAPI automatically generates interactive API documentation. Once the server is running, navigate to:
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

## Components Highlights

- **`scraper.py`**: Uses `newspaper3k` to elegantly pull readable article text.
- **`vector_store.py`**: Local ChromaDB persistence for ultra-fast vector retrieval via `sentence-transformers` mappings.
- **`json_db.py`**: Lightweight JSON-based file DB (`/data/user_profiles.json`) tracking explicit actions and metrics.
- **`insight_service.py`**: Utilizes LLM via metadata extraction to evaluate overlap and synthesize a personalized message when ingesting new content.

## Testing with Postman

Import the provided `postman_collection.json` directly into Postman to have quick access to example requests for all endpoints (`/ingest`, `/query`, `/mark-read`, `/user-profile`).
