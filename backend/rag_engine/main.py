from fastapi import FastAPI
from api.routes import router

app = FastAPI(
    title="ET RAG Engine API", 
    version="1.0",
    description="A modular backend-only RAG system for Economic Times articles."
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    # Make sure to run from within the rag_engine directory:
    # `uvicorn main:app --reload`
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

@app.get("/")
def root():
    return {"message": "ET Cognify RAG is running 🚀"}