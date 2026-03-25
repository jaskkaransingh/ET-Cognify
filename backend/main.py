from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import feedparser
import httpx
import asyncio
from datetime import datetime
from email.utils import parsedate_to_datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

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
    def get_timestamp(item):
        try:
            if hasattr(item, 'published_parsed') and item.published_parsed:
                return time.mktime(item.published_parsed)
            return 0
        except:
            return 0
            
    all_items.sort(key=get_timestamp, reverse=True)
    
    # Remove duplicates and filter for last 24 hours
    current_time = time.time()
    twenty_four_hours_ago = current_time - 24 * 3600

    unique_titles = set()
    unique_items = []
    for item in all_items:
        title = item.get("title", "")
        item_time = get_timestamp(item)
        
        # Keep items from last 24 hours. If timestamp is 0 (missing), we can exclude it or include it.
        # It's safer to include if timeline parsing fell back, but since they want last 24 hours specifically, let's filter correctly.
        # Actually let's include items within 24 hours OR strictly missing timestamps to be safe, but RSS usually has good timestamps
        if title not in unique_titles and (item_time >= twenty_four_hours_ago or item_time == 0):
            unique_titles.add(title)
            unique_items.append(item)
            
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
