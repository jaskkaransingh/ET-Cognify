<div align="center">
  <h1>ET-Cognify</h1>
  <p><em>An AI-Augmented Market Intelligence OS for the Next Generation of Investors</em></p>
  <p><strong>Built for The Economic Times Hackathon 2026</strong></p>
</div>

---

## The Problem Statement
> *"Business news in 2026 is still delivered like it's 2005 — static text articles, a one-size-fits-all homepage, and the same rigid format for everyone. Build something that makes people say: 'I can't go back to reading news the old way.'"*

## The Solution: ET-Cognify
ET-Cognify is a sophisticated, AI-augmented Market Intelligence OS that transforms raw, static financial news into actionable, hyper-personalized intelligence. We discarded the endless scrolling feed and built a **"Dashboard-first" architecture**. This ensures a perfect fixed-viewport layout, behaving like a professional trading terminal regardless of screen ratio or zoom level.

---

## Deep Dive: Core Features

### The Arena (Intelligence Hub)
The core workspace where static news becomes an interactive, multi-dimensional intelligence briefing.
- **Context-Aware RAG Chatbot:** Ask specific questions about any article. The chatbot retrieves context from a local Vector database built around the live story, providing precise answers and analysis that base foundation models lack.
- **Nexora Debate Engine:** A specialized simulation module featuring AI agents like "Bull Bhai" and "Bear Baba". They actively debate the bullish merits and bearish risks of a breaking story in real-time, even synthesizing arguments in regional languages (like Hinglish).
- **Perspectives Engine:** Automatically analyzes any breaking news through 6 distinct analytical lenses:
  - **Retail Investor:** Personal finance and savings impact.
  - **Institutional Desk (FII):** Macro flows and bond yields.
  - **Tech/Gig Worker:** Salary, job security, and EMI implications.
  - **Global Macro:** Geopolitical and supply chain impacts.
  - **Farmer/Agri:** Rural demand and monsoon correlations.
  - **Short Seller:** Overvalued sectors and immediate downside risks.
- **Butterfly Effect Simulator:** A relational mapping engine that visualizes how a "Trigger" event (e.g., *Fed hikes rates*) leads to a "Direct Impact" (*Tech stocks dip*), which then cascades into actionable "Market Ripples" (*Your SIP allocations shift*).

### News DNA (Behavioral Profiling)
Your dashboard adapts to you. ET-Cognify actively tracks your reading patterns, dwell times, and interactions, storing them in a localized JSON Database (`user_profiles.json`). 
- It constructs a unique **Behavioral Profile**, identifying your "Blind Spots" (e.g., *You read about startups but ignore RBI policy*).
- **Dynamic Financial Check-ins:** The system intelligently prompts you to confirm financial products you likely own (e.g., Home Loans, Mutual Funds) based on the news you consume, further personalizing your intelligence feed.

### Dynamic Live Terminal Feed
- **Live Seismograph:** A continuously scrolling ticker monitoring 8 specific market sectors with assigned "Confidence" and "Status" tags (Volatile, Stable, Critical, Watch).
- **Intelligent Ingestion:** The feed aggregates live RSS data, deduplicates it, and uses AI to assign urgency tags (*Critical Impact*, *High Impact*, *Watchlist*) automatically.

### Unyielding "Zero-Scroll" Architecture
Designed entirely against the "infinite scroll" paradigm. The entire application lives within an `AppShell` enforcing `h-screen overflow-hidden`. 
- Components (Center Article, Right Debate Panel, Left RAG Chat) utilize sophisticated flexbox properties (`flex-1 min-h-0`) to perfectly fit into a 12-column grid.
- Guaranteed 100% layout integrity at any zoom level, aspect ratio, or mobile device—**no page-level spring/scroll fatigue**.

---

## Complete Tech Stack

### Backend (The "Insight" Engine)
- **Framework:** **FastAPI (Python)** – Chosen for its robust asynchronous native support (`async/await`), crucial for parallel fetching and parsing of multiple RSS feeds simultaneously.
- **AI Models:**
  - **Google Gemini 2.5 Flash:** The core foundation model powering the Nexora Debate Engine, the Perspectives Engine, and dynamic summarization. Selected for its rapid inference speed and superior multi-lingual synthesis.
  - **OpenRouter LLMs:** Utilized within the RAG subsystem for specialized data extraction and question-answering generation.
- **RAG (Retrieval-Augmented Generation) Architecture:**
  - **Vector Store:** **ChromaDB** – A highly efficient, local persistent vector database storing indexed context chunks of Economic Times articles.
  - **Embeddings:** **`sentence-transformers`** – Converts raw scraped text into high-dimensional vectors for semantic context retrieval.
- **Data Scraping & Cleaning:**
  - **`BeautifulSoup4` + `newspaper3k`:** Advanced extraction utilities that navigate directly to ET URLs, bypass paywalls/UI noise, and extract only the pure article text (`.artText`, `#artText` selectors) for the AI to ingest.
  - **`feedparser` & `httpx`:** Asynchronous RSS parsing engine.

### Frontend (The "Neural" Interface)
- **Framework:** **React (Vite) + TypeScript** for a blazing-fast, type-safe development environment.
- **Styling:** **Vanilla Tailwind CSS (v4)** utilizing a custom high-contrast, terminal-inspired design system:
  - 🔴 `#ED1C24` (Crimson Red) – Critical Impact / ET Brand Identity
  - 🟡 `#FFD700` (Cyber Gold) – Opportunity / AI Highlights
  - 🟢 `#00FF41` (Matrix Green) – Terminal / Live Data Flows
- **Animations:** **Framer Motion** (`motion/react`) orchestrates complex layout fluidity, spring dynamics, component mounting sequences, and the marquee ticker visualizations.
- **Routing:** **React Router DOM (v7)** for seamless, client-side SPA transitions.
- **Authentication:** **Firebase Auth** enabling secure user sessions to persist News DNA profiles.
- **Iconography:** **Lucide-react** for clean, scalable, and responsive UI vectors.

---

## 📡 Architecture & API Data Flow

### The Hybrid Ingestion Pipeline
ET-Cognify doesn't just display news; it processes it through a strict AI pipeline:

1. **Aggregation (`GET /api/headlines`):** The backend continuously monitors 8 distinct Economic Times RSS feeds (Markets, Tech, Economy, etc.) in parallel. It filters news from the trailing 24 hours and aggressively deduplicates.
2. **Impact assignment:** The system automatically assigns tags based on category priority and temporal relevance.
3. **Scraping (`GET /api/article`):** When a user triggers an article, the scraper pulls the live HTML from ET, strips Ads and "Read More" noise, and returns raw intelligence text.
4. **Vectorization (`POST /api/rag/ingest`):** The text is chunked using overlapping windows and embedded into ChromaDB.
5. **Debate / Q&A Synthesis (`POST /api/debate` & `POST /api/rag/query`):** Live queries are injected with the ChromaDB context, explicitly instructing Gemini to formulate answers strictly within the bounds of the provided financial news data.

---

## Getting Started 

### Prerequisites
- Node.js (v20+)
- Python (v3.10+)
- Gemini API Key

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # (or .venv\Scripts\activate on Windows)
pip install -r requirements.txt
pip install -r rag_engine/requirements.txt

# Create a .env file and add your keys:
# GEMINI_API_KEY="your_key_here"

# Start the FastAPI Intelligence Server
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install

# Start the Vite Development Server
npm run dev
```

Navigate to `http://localhost:5173` to enter the Market Intelligence OS.
