import sys
import io
import time
from agents import build_search_agent , writer_chain , critic_chain
from tools import scrape_multiple_urls, parse_urls_from_search_results

def invoke_with_retry(runnable, input_data, max_retries=3, step_name="Agent"):
    """Invoke a LangChain runnable or agent with automatic retry for transient connection drops."""
    for attempt in range(max_retries):
        try:
            return runnable.invoke(input_data)
        except Exception as e:
            safe_print(f"  [WARN] {step_name} attempt {attempt + 1} failed ({type(e).__name__}: {e})")
            if attempt == max_retries - 1:
                raise e
            time.sleep(2 * (attempt + 1))

# Force UTF-8 stdout/stderr on Windows to avoid 'charmap' codec errors
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs)
    except Exception:
        clean_args = []
        for arg in args:
            if isinstance(arg, str):
                clean_args.append(arg.encode('utf-8', errors='replace').decode('utf-8', errors='replace'))
            else:
                clean_args.append(str(arg))
        try:
            print(*clean_args, **kwargs)
        except Exception:
            pass

def stringify_content(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                if "text" in item:
                    parts.append(item["text"])
                else:
                    parts.append(str(item))
            elif hasattr(item, "text"):
                parts.append(getattr(item, "text"))
            else:
                parts.append(str(item))
        return "\n".join(parts)
    return str(content)

def extract_messages_text(messages):
    text_blocks = []
    for msg in messages:
        content = msg.content if hasattr(msg, "content") else str(msg)
        text_str = stringify_content(content)
        if text_str.strip():
            text_blocks.append(text_str)
    return "\n\n".join(text_blocks)

def run_research_pipeline(topic : str, progress_callback=None) -> dict:

    state = {}

    def notify(agent_id, progress, msg):
        if progress_callback:
            try:
                progress_callback(agent_id, progress, msg)
            except Exception:
                pass

    #step 1 - search agent working 
    safe_print("\n"+" ="*50)
    safe_print("step 1 - search agent is working ...")
    safe_print("="*50)
    notify("search", 25, "Search Agent querying web sources via Tavily API...")

    search_agent = build_search_agent()
    search_result = invoke_with_retry(
        search_agent,
        {"messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]},
        step_name="Search Agent"
    )
    state["search_results"] = extract_messages_text(search_result['messages'])

    safe_print("\n search result ",state['search_results'])

    #step 2 - reader agent (multi-source concurrent scraping)
    safe_print("\n"+" ="*50)
    safe_print("step 2 - Reader agent is scraping top 3 resources concurrently ...")
    safe_print("="*50)
    notify("reader", 50, "Reader Agent scraping top 3 sources concurrently via aiohttp...")

    # Extract top 3 URLs from search results and scrape them concurrently
    all_urls = parse_urls_from_search_results(state['search_results'])
    top_urls = all_urls[:3]
    safe_print(f"\n URLs to scrape: {top_urls}")

    scrape_results = scrape_multiple_urls(top_urls) if top_urls else []

    # Separate successes from failures
    successful_scrapes = [r for r in scrape_results if r.get('success')]
    failed_scrapes = [r for r in scrape_results if not r.get('success')]

    for f in failed_scrapes:
        safe_print(f"  [WARN] Failed to scrape {f['url']}: {f['error']}")

    # Store structured scraped sources for server.py evidence building
    state['scraped_sources'] = successful_scrapes

    # Build formatted multi-source text for the Writer Chain
    if successful_scrapes:
        source_blocks = []
        for idx, src in enumerate(successful_scrapes, 1):
            source_blocks.append(
                f"SOURCE [{idx}] ({src['url']}):\n"
                f"Title: {src['title']}\n"
                f"Content: {src['content']}\n"
            )
        state['scraped_content'] = "\n---\n".join(source_blocks)
    else:
        # Fallback: all scrapes failed — use only Tavily snippets
        safe_print("  [WARN] All scrapes failed — falling back to Tavily snippets only.")
        state['scraped_content'] = "(No pages could be scraped. Use the search snippets below as primary evidence.)"

    safe_print(f"\nSuccessfully scraped {len(successful_scrapes)} of {len(top_urls)} sources.")
    safe_print("\nscraped content preview: \n", state['scraped_content'][:500])

    #step 3 - writer chain 
    safe_print("\n"+" ="*50)
    safe_print("step 3 - Writer is drafting the report ...")
    safe_print("="*50)
    notify("writer", 75, "Writer Pipeline synthesizing report draft...")

    research_combined = (
        f"SEARCH RESULTS : \n {state['search_results']} \n\n"
        f"DETAILED SCRAPED CONTENT : \n {state['scraped_content']}"
    )

    state["report"] = invoke_with_retry(
        writer_chain,
        {"topic": topic, "research": research_combined},
        step_name="Writer Chain"
    )

    safe_print("\n Final Report\n",state['report'])

    #step 4 - critic report 
    safe_print("\n"+" ="*50)
    safe_print("step 4 - critic is reviewing the report ")
    safe_print("="*50)
    notify("critic", 90, "Critic Pipeline auditing factual consistency & source grounding...")

    state["feedback"] = invoke_with_retry(
        critic_chain,
        {"report": state['report']},
        step_name="Critic Chain"
    )

    safe_print("\n critic report \n", state['feedback'])

    return state



if __name__ == "__main__":
    topic = input("\n Enter a research topic : ")
    run_research_pipeline(topic)