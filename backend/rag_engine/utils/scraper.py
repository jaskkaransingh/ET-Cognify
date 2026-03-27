import logging
from newspaper import Article

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_article(url: str) -> str:
    """
    Downloads and parses an article from the given URL.
    Returns the main article text.
    """
    try:
        article = Article(url)
        article.download()
        article.parse()
        
        text = article.text
        if not text:
            raise ValueError("No text could be extracted from the article.")
            
        return text
    except Exception as e:
        logger.error(f"Error scraping article from {url}: {str(e)}")
        raise
