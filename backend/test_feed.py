import feedparser
import httpx
import asyncio

async def test():
    feed_url = "https://economictimes.indiatimes.com/news/sports/rssfeeds/326869766.cms"
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.get(feed_url, follow_redirects=True)
            print("Status:", response.status_code)
            feed = feedparser.parse(response.text)
            print("Items count:", len(feed.entries))
            if len(feed.entries) > 0:
                print("First item:", feed.entries[0].title)
            else:
                print("Feed output:", response.text[:200])
        except Exception as e:
            print("Error:", e)

asyncio.run(test())
