from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import feedparser
import httpx
import asyncio
from datetime import datetime
from email.utils import parsedate_to_datetime
import sys
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# Add rag_engine to PYTHONPATH so its internal module references work seamlessly
sys.path.append(os.path.join(os.path.dirname(__file__), "rag_engine"))
from api.routes import router as rag_router

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("VITE_GEMINI_API_KEY", "AIzaSyB3vIv6ILPLCMSGUK-U8K2xx9RJjemXAjE"))

app = FastAPI()
app.include_router(rag_router, prefix="/api/rag")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ET_FEEDS = [
    {"url": "https://economictimes.indiatimes.com/rssfeedsdefault.cms", "tag": "Top News Trending"},
    {"url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", "tag": "Markets"},
    {"url": "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms", "tag": "Tech"},
    {"url": "https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms", "tag": "Industry"},
    {"url": "https://economictimes.indiatimes.com/wealth/rssfeeds/8371324.cms", "tag": "Wealth"},
    {"url": "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms", "tag": "Economy"},
    {"url": "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", "tag": "Sports"},
    {"url": "https://economictimes.indiatimes.com/news/politics-and-nation/rssfeeds/1052732854.cms", "tag": "Politics"}
]

async def fetch_feed(client, feed_info):
    try:
        response = await client.get(feed_info["url"])
        feed = feedparser.parse(response.text)
        items = []
        for entry in feed.entries:
            entry["_sourceTag"] = feed_info["tag"]
            items.append(entry)
        return items
    except Exception as e:
        print(f"Failed to fetch {feed_info['url']}: {e}")
        return []

@app.get("/api/article")
async def fetch_article(url: str):
    if not url:
        return {"content": ""}
    
    import re
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Cache-Control": "no-cache",
        "Referer": "https://economictimes.indiatimes.com/"
    }
    
    urls_to_try = []
    if "economictimes.indiatimes.com" in url:
        mobile_url = url.replace("economictimes.indiatimes.com", "m.economictimes.indiatimes.com")
        urls_to_try = [mobile_url, url]
    else:
        urls_to_try = [url]
    
    # Hard patterns to always exclude (UI noise)
    noise_patterns = re.compile(
        r'(SHARE THIS NEWS|Close Font Size|Font Size Abc|Remove Ads|'
        r'Abc Small|Abc Normal|Abc Large|Follow us on|Download The Economic Times|'
        r'Read More:|Also Read:|Catch all the Business News|Subscribe to The Economic Times)',
        re.IGNORECASE
    )
    
    async def extract_text(html: str) -> list[str]:
        soup = BeautifulSoup(html, "html.parser")
        
        # Remove non-content elements
        for tag in soup(["script", "style", "nav", "footer", "header",
                         "aside", "form", "noscript", "figure", "picture",
                         "iframe", "button", "svg"]):
            tag.decompose()
        
        # ET selectors in priority order
        article_div = (
            soup.find("div", class_="artText") or
            soup.find("div", {"id": "artText"}) or
            soup.find("article", class_="artcl") or
            soup.find("div", class_="article-content") or
            soup.find("div", class_="Normal") or
            soup.find("div", class_="artBody") or
            soup.find("section", class_="artDetailed") or
            soup.find("div", class_="story__content") or
            soup.find("main") or
            soup.find("article")
        )
        
        if not article_div:
            article_div = soup
        
        # Get raw full text of article container
        raw = article_div.get_text(separator="\n", strip=True)
        
        # Split into lines and clean each
        lines = raw.split("\n")
        cleaned = []
        for line in lines:
            line = line.strip()
            if not line or len(line) < 40:
                continue
            # Skip pure UI noise lines
            if noise_patterns.search(line):
                continue
            # Clean inline noise from mixed lines
            line = re.sub(r'(SHARE THIS NEWS.*?Large|Remove Ads\s*)', '', line)
            line = re.sub(r'\s{2,}', ' ', line).strip()
            if len(line) >= 60:
                cleaned.append(line)
        
        # Deduplicate keeping order
        seen, unique = set(), []
        for t in cleaned:
            key = t[:60].lower()
            if key not in seen:
                seen.add(key)
                unique.append(t)
        
        return unique
    
    try:
        async with httpx.AsyncClient(verify=False, follow_redirects=True, timeout=15.0) as client:
            for attempt_url in urls_to_try:
                try:
                    resp = await client.get(attempt_url, headers=headers)
                    texts = await extract_text(resp.text)
                    if len(texts) > 2:
                        return {"content": "\n\n".join(texts[:40])}
                except Exception as e:
                    print(f"Attempt failed for {attempt_url}: {e}")
                    continue
    except Exception as e:
        print("Article fetch error:", e)
    
    return {"content": ""}

# ─── Debate models ───────────────────────────────────────────────────────────

class DebateHistoryItem(BaseModel):
    agent: str
    text: str

class DebateRequest(BaseModel):
    agentId: str
    topic: str
    language: str
    history: List[DebateHistoryItem] = []
    systemInstruction: str
    agentName: str

@app.post("/api/debate")
async def generate_debate(req: DebateRequest):
    """Generate a single debate turn using OpenRouter."""
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    # Build the user prompt
    prompt = f'Debate Topic: "{req.topic}"\n\n'
    if req.history:
        prompt += "Previous turns:\n"
        for msg in req.history:
            name = "Bull Bhai" if msg.agent == "bull" else "Bear Baba"
            prompt += f"{name}: {msg.text}\n"
        prompt += f"\nNow, generate your response as {req.agentName}."
    else:
        prompt += f"You are starting the debate. Make your opening statement as {req.agentName}."

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "google/gemini-2.5-flash",
                    "max_tokens": 300,
                    "messages": [
                        {"role": "system", "content": req.systemInstruction},
                        {"role": "user", "content": prompt}
                    ],
                },
            )
        data = resp.json()
        if resp.status_code != 200:
            print(f"[Debate] OpenRouter error: {data}")
            return {"text": f"(Debate engine error: {data.get('error', {}).get('message', 'unknown')})"}
        text = data["choices"][0]["message"]["content"].strip()
        return {"text": text}
    except Exception as e:
        print(f"[Debate] Exception: {e}")
        return {"text": "(Debate generation failed. Check backend logs.)"}


@app.get("/api/headlines")
async def get_headlines():
    all_items = []
    
    # Fetch all feeds in parallel using httpx async client
    async with httpx.AsyncClient(verify=False) as client:
        tasks = [fetch_feed(client, feed) for feed in ET_FEEDS]
        results = await asyncio.gather(*tasks)
        for items in results:
            all_items.extend(items)
            
    # Sort by published date descending
    import time
    import calendar
    def get_timestamp(item):
        try:
            if hasattr(item, 'published_parsed') and item.published_parsed:
                return calendar.timegm(item.published_parsed)
            return 0
        except:
            return 0
            
    all_items.sort(key=get_timestamp, reverse=True)
    
    unique_titles = set()
    unique_items = []
    for item in all_items:
        title = item.get("title", "")
        # Keep items uniquely, limiting to top 60 to ensure we have content while avoiding massive payload.
        if title and title not in unique_titles:
            unique_titles.add(title)
            unique_items.append(item)
            if len(unique_items) >= 60:
                break
            
    # Format all uniquely merged headlines
    formatted_news = []
    for index, item in enumerate(unique_items):
        impact = "Watchlist"
        source_tag = item.get("_sourceTag", "Market Alert")
        
        if index == 0:
            impact = "Critical Impact"
        elif index < 4:
            impact = "High Impact"
        elif source_tag in ['Markets', 'Tech']:
            impact = "Medium Impact"
            
        time_str = "Live Intel"
        try:
            import calendar
            from datetime import datetime
            if hasattr(item, 'published_parsed') and item.published_parsed:
                dt = datetime.fromtimestamp(calendar.timegm(item.published_parsed))
                time_str = dt.strftime("%I:%M %p").lstrip('0')
        except:
            pass
            
        formatted_news.append({
            "id": f"{index}_{item.get('title', '')[:5]}",
            "tag": source_tag,
            "title": item.get("title", ""),
            "impact": impact,
            "time": time_str,
            "link": item.get("link", "")
        })
        
    return {"headlines": formatted_news}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

