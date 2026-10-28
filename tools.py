from langchain.tools import tool 
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os 
from dotenv import load_dotenv
from rich import print
load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

import time

@tool
def web_search(query : str) -> str:
    """Search the web for recent and reliable information on a topic . Returns Titles , URLs and snippets."""
    last_err = None
    for attempt in range(3):
        try:
            results = tavily.search(query=query, max_results=5)
            out = []
            for r in results.get('results', []):
                out.append(
                    f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content'][:300]}\n"
                )
            return "\n----\n".join(out)
        except Exception as e:
            last_err = e
            time.sleep(1.5)
    return f"Search error after 3 attempts: {str(last_err)}"

@tool
def scrape_url(url: str) -> str:
    """Scrape and return clean text content from a given URL for deeper reading."""
    try:
        resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        return soup.get_text(separator=" ", strip=True)[:3000]
    except Exception as e:
        return f"Could not scrape URL: {str(e)}"


# ---------------------------------------------------------------------------
# Multi-URL concurrent scraping (called directly from pipeline, not via LLM)
# ---------------------------------------------------------------------------
import asyncio
import aiohttp
import re as _re


async def _scrape_single_url(session: aiohttp.ClientSession, url: str) -> dict:
    """Scrape one URL inside an existing aiohttp session. Returns a result dict."""
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=8), headers=headers) as resp:
            html = await resp.text(errors="replace")
        soup = BeautifulSoup(html, "html.parser")

        # Extract page title
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else url.split("//")[-1].split("/")[0]

        # Clean content (same approach as scrape_url)
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        content = soup.get_text(separator=" ", strip=True)[:3000]

        return {"url": url, "title": title, "content": content, "success": True, "error": None}
    except Exception as e:
        return {"url": url, "title": "", "content": "", "success": False, "error": str(e)}


async def _scrape_all(urls: list) -> list:
    """Scrape multiple URLs concurrently via asyncio.gather."""
    async with aiohttp.ClientSession() as session:
        tasks = [_scrape_single_url(session, u) for u in urls[:3]]
        return await asyncio.gather(*tasks, return_exceptions=False)


def scrape_multiple_urls(urls: list) -> list:
    """
    Scrape up to 3 URLs concurrently using aiohttp.
    Safe to call from sync code — creates its own event loop if needed.

    Returns:
        list[dict] — each dict has keys: url, title, content, success, error
    """
    if not urls:
        return []

    # Handle case where an event loop is already running (e.g. inside Jupyter/uvicorn)
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            results = pool.submit(asyncio.run, _scrape_all(urls)).result()
    else:
        results = asyncio.run(_scrape_all(urls))

    return list(results)


def parse_urls_from_search_results(search_text: str) -> list:
    """
    Extract URLs from search output in any format:
      - Raw Tavily format:  'URL: https://...'
      - Markdown links:     '[title](https://...)'
      - Bare URLs:          'https://...'
    Returns deduplicated list of URL strings, in order of first appearance.
    """
    if not search_text:
        return []
    # Match any https URL, stripping trailing punctuation/parens/brackets
    raw_urls = _re.findall(r'https?://[^\s\)\]\"\'<>]+', search_text)
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for url in raw_urls:
        # Strip trailing punctuation that might be part of markdown
        url = url.rstrip('.,;:!?)]}')
        if url not in seen:
            seen.add(url)
            unique.append(url)
    return unique