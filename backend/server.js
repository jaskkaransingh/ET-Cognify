import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import Parser from 'rss-parser';

dotenv.config();

const app = express();
app.use(cors());

const parser = new Parser();

// Array of all major ET domains to aggregate
const ET_FEEDS = [
  { url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms', tag: 'Top News Trending' },
  { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', tag: 'Markets' },
  { url: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms', tag: 'Tech' },
  { url: 'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms', tag: 'Industry' },
  { url: 'https://economictimes.indiatimes.com/wealth/rssfeeds/8371324.cms', tag: 'Wealth' },
  { url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms', tag: 'Economy' },
  { url: 'https://economictimes.indiatimes.com/news/sports/rssfeeds/326869766.cms', tag: 'Sports' },
  { url: 'https://economictimes.indiatimes.com/news/politics-and-nation/rssfeeds/1052732854.cms', tag: 'Politics' }
];

app.get('/api/headlines', async (req, res) => {
  try {
    const allItems = [];

    // Fetch all feeds in parallel
    const feedPromises = ET_FEEDS.map(async (feedInfo) => {
      try {
        const feed = await parser.parseURL(feedInfo.url);
        feed.items.forEach(item => {
          allItems.push({
            ...item,
            _sourceTag: feedInfo.tag
          });
        });
      } catch (err) {
        console.error(`Failed to fetch ${feedInfo.url}:`, err.message);
      }
    });

    await Promise.all(feedPromises);

    // Sort by pubDate descending (latest first) to weave them together naturally
    allItems.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

    // Remove duplicates by title (since stories often overlap across feeds)
    const uniqueTitles = new Set();
    const uniqueItems = [];
    for (const item of allItems) {
      if (!uniqueTitles.has(item.title)) {
        uniqueTitles.add(item.title);
        uniqueItems.push(item);
      }
    }

    // Format the absolute top 50 unique latest headlines
    let formattedNews = uniqueItems.slice(0, 100).map((item, index) => {
      let impact = "Watchlist";
      if (index === 0) impact = "Critical Impact";
      else if (index < 4) impact = "High Impact";
      else if (['Markets', 'Tech'].includes(item._sourceTag)) impact = "Medium Impact";

      // Try to format pubDate nicely
      let timeStr = "Live Intel";
      if (item.pubDate) {
        const dateObj = new Date(item.pubDate);
        timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return {
        id: index.toString() + item.title.substring(0, 5), // unique enough key
        tag: item._sourceTag,
        title: item.title,
        impact,
        time: timeStr,
        link: item.link
      };
    });

    res.json({ headlines: formattedNews });
  } catch (error) {
    console.error("Error fetching headlines:", error);
    res.status(500).json({ error: "Failed to fetch headlines" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ET-Cognify Backend up aggregating multi-feeds on http://localhost:${PORT}`);
});
