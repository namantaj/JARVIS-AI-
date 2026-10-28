# PART 2 — DEEP DIVE INTO `tools.py`

---

# 1. What `tools.py` Does

### Responsibility in Your Project
The responsibility of `tools.py` is to act as the **External Capabilities Layer** for your AI agents. 

By default, an LLM like Gemini is completely isolated from the real world. It cannot browse the internet, search live news, or read webpage HTML. `tools.py` defines functions that bridge the gap between the AI model and external services (the internet).

### Key Answers
* **Why does this file exist?**  
  To keep external tool logic cleanly modularized. Instead of cluttering agent creation or pipeline code, all tool definitions, web search logic, and scraping logic live in `tools.py`.

* **Why shouldn't all this code be inside `agents.py` or `pipeline.py`?**  
  Following the **Single Responsibility Principle (SRP)**:
  - `tools.py` = Defines *what action functions can be performed* (web search, scraping).
  - `agents.py` = Defines *who performs the work* (prompts, LLM models, chains).
  - `pipeline.py` = Defines *how work flows between workers* (orchestration).

* **What does this file provide to the agents?**  
  It provides two `@tool` decorated functions: `web_search` and `scrape_url`.

* **Which other files use `tools.py`?**  
  `pipeline.py` imports `web_search` and `scrape_url` from `tools.py` to equip `search_agent` and `reader_agent`.

* **What external services does it communicate with?**  
  1. **Tavily Search API** (via `tavily.search()`) for live web searches.
  2. **Target Web Servers** (via `requests.get()`) to download raw web page HTML.

```
┌──────────────┐         ┌──────────────┐         ┌───────────────────────┐
│ Search Agent │ ──────> │  web_search  │ ──────> │      Tavily API       │
└──────────────┘         └──────────────┘         └───────────────────────┘
                                                           │
                                                           ▼
                                                  Formatted Snippets

┌──────────────┐         ┌──────────────┐         ┌───────────────────────┐
│ Reader Agent │ ──────> │  scrape_url  │ ──────> │ Target Website (HTTP) │
└──────────────┘         └──────────────┘         └───────────────────────┘
                                                           │
                                                           ▼
                                                  Clean Article Text
```

---

# 2. Project Context

`tools.py` is invoked at two specific points during pipeline execution:

```
React UI  ──>  FastAPI  ──>  pipeline.py
                                │
                                ├──> 1. search_agent  ──> calls web_search() (tools.py)  ──> Tavily API
                                │
                                ├──> 2. reader_agent  ──> calls scrape_url() (tools.py)  ──> Website HTTP
                                │
                                ├──> 3. writer_chain  (uses combined search + scraped text)
                                │
                                └──> 4. critic_chain  (evaluates report)
```

1. **First Execution Point (`search_agent`)**:
   - **When:** Step 1 of `run_research_pipeline()`.
   - **Input:** Topic string (e.g. *"AI in software engineering"*).
   - **Tool invoked:** `web_search(query)`.
   - **Output:** Formatted string of top 5 web search titles, URLs, and snippets.
   - **Destination:** Saved into `state['search_results']`.

2. **Second Execution Point (`reader_agent`)**:
   - **When:** Step 2 of `run_research_pipeline()`.
   - **Input:** Top target URL selected from search results.
   - **Tool invoked:** `scrape_url(url)`.
   - **Output:** Clean body text string truncated to 3,000 characters.
   - **Destination:** Saved into `state['scraped_content']`.

---

# 3. Imports — Line by Line

Here is the exact explanation of lines 1 to 7 in `tools.py`:

```python
1: from langchain.tools import tool 
2: import requests
3: from bs4 import BeautifulSoup
4: from tavily import TavilyClient
5: import os 
6: from dotenv import load_dotenv
7: from rich import print
```

### Line 1: `from langchain.tools import tool`
* **What is imported:** The `@tool` decorator function from LangChain's tool package.
* **What it is:** A Python decorator that converts a plain Python function into a `LangChain Tool` object containing metadata (name, description, schema).
* **Why needed:** Without `@tool`, an LLM agent cannot discover or execute the Python function.
* **What happens if removed:** Python will throw `NameError: name 'tool' is not defined`.

### Line 2: `import requests`
* **What is imported:** The standard Python HTTP client library `requests`.
* **What it is:** A third-party Python library for sending HTTP requests (GET, POST) over the network.
* **Why needed:** Used in `scrape_url` to download raw HTML content from website URLs.
* **What happens if removed:** `scrape_url` cannot fetch web pages; throws `NameError: name 'requests' is not defined`.

### Line 3: `from bs4 import BeautifulSoup`
* **What is imported:** The `BeautifulSoup` class from the `bs4` (BeautifulSoup4) package.
* **What it is:** An HTML parsing library that parses raw HTML strings into a searchable DOM tree.
* **Why needed:** Used in `scrape_url` to parse raw HTML, remove scripts/navbars, and extract clean text.
* **What happens if removed:** Throws `NameError: name 'BeautifulSoup' is not defined`.

### Line 4: `from tavily import TavilyClient`
* **What is imported:** The `TavilyClient` Python SDK class provided by Tavily.
* **What it is:** An API Client wrapper that manages HTTP connections to Tavily's search servers.
* **Why needed:** Used to instantiate `tavily = TavilyClient(api_key=...)`.
* **What happens if removed:** Throws `NameError: name 'TavilyClient' is not defined`.

### Line 5: `import os`
* **What is imported:** Python's built-in `os` (Operating System) module.
* **What it is:** Provides functions to interact with operating system environment variables (`os.getenv`).
* **Why needed:** Reads `TAVILY_API_KEY` from system environment variables.
* **What happens if removed:** Throws `NameError: name 'os' is not defined`.

### Line 6: `from dotenv import load_dotenv`
* **What is imported:** `load_dotenv` function from `python-dotenv`.
* **What it is:** A helper that reads key-value pairs from a `.env` file on disk and loads them into `os.environ`.
* **Why needed:** Ensures `TAVILY_API_KEY` in `.env` is loaded before `os.getenv()` is called.
* **What happens if removed:** `os.getenv("TAVILY_API_KEY")` returns `None`, causing Tavily authentication failure.

### Line 7: `from rich import print`
* **What is imported:** Rich terminal printing function.
* **What it is:** A Python library for rich text formatting in terminal consoles.
* **Why needed:** Enables colorful debugging console output.
* **What happens if removed:** Python falls back to built-in `print()`.

---

# 4. Environment Variables

```python
8: load_dotenv()
10: tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
```

### What is an Environment Variable?
An environment variable is a dynamic key-value pair set outside your source code in the operating system environment.

### Why Developer Use Them
1. **Security**: Keeps confidential credentials (like `TAVILY_API_KEY`) out of public git repositories.
2. **Configuration Flexibility**: Allows running the same code across different environments (development, testing, production) without modifying code.

### The Flow in `tools.py`:

```
.env file on disk
  │ (TAVILY_API_KEY="tvly-xxx...")
  ▼
load_dotenv()
  │ (reads .env file and sets OS process memory)
  ▼
os.environ
  │
  ▼
os.getenv("TAVILY_API_KEY")
  │ (fetches string "tvly-xxx...")
  ▼
TavilyClient(api_key="tvly-xxx...")
  │
  ▼
Authenticated Tavily API Session
```

### What happens if the API key is missing?
`os.getenv("TAVILY_API_KEY")` returns `None`. `TavilyClient` will raise an authentication error when `.search()` is called, halting the research pipeline with an API key exception.

---

# 5. Tavily Integration

### What is Tavily?
Tavily is a search engine built specifically for AI agents and RAG applications. Standard Google Search returns HTML pages designed for human eyes. Tavily filters out ads, popups, and clutter, returning structured JSON snippets optimized for LLM token context.

### Code Breakdown (Line 10 & Line 15)
```python
10: tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
...
15: results = tavily.search(query=query, max_results=5)
```

- **`tavily`**: An instance of `TavilyClient` representing an authenticated API connection session.
- **`.search()`**: Method that sends an HTTP `POST` request to Tavily's endpoint (`https://api.tavily.com/search`).
- **`query=query`**: The search string passed from the agent (e.g., *"Impact of AI on software engineering jobs"*).
- **`max_results=5`**: Limits the response to the top 5 search result objects.

### Tavily API Response Structure
Tavily returns a Python dictionary looking like this:
```python
{
  "results": [
    {
      "title": "Goldman Sachs Report on AI Employment",
      "url": "https://example.com/ai-report",
      "content": "Goldman Sachs estimates AI will automate routine tasks...",
      "score": 0.98
    },
    ...
  ]
}
```

Your code iterates over `results['results']` and formats each item into a clean Markdown block separated by `\n----\n`.

---

# 6. Python Decorators & `@tool`

### What is a Decorator?
In Python, a decorator is a function that takes another function as an input, extends its behavior without modifying its source code, and returns a new modified function.

### What `@tool` Does in LangChain
When you write:
```python
@tool
def web_search(query: str) -> str:
    """Search the web for recent and reliable information on a topic."""
    ...
```

LangChain wraps `web_search` and creates a `StructuredTool` instance:

```
Normal Python Function: web_search(query)
          │
          ▼  @tool Decorator
LangChain Tool Object:
  ├── name: "web_search"
  ├── description: "Search the web for recent and reliable information..."
  ├── args_schema: { "query": { "type": "string" } }
  └── func: <web_search function pointer>
```

### Why the Docstring Matters
The docstring (`"""Search the web for recent and reliable information..."""`) is **NOT** just a comment! 

LangChain sends this docstring directly to Gemini inside the system prompt. **The LLM reads your docstring to understand when and why it should call the tool.** If you delete or alter the docstring, the agent may fail to understand what the tool does and skip using it.

---

# 7. Tool Functions — Line-by-Line Breakdown

---

### Function 1: `web_search`

```python
12: @tool
13: def web_search(query : str) -> str:
14:     """Search the web for recent and reliable information on a topic . Returns Titles , URLs and snippets."""
15:     results = tavily.search(query=query,max_results=5)
16: 
17:     out = []
18: 
19:     for r in results['results']:
20:         out.append(
21:             f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content'][:300]}\n"
22:         )
23:     
24:     return "\n----\n".join(out)
```

#### Line-by-Line Explanation:

- **Line 12: `@tool`**  
  Registers `web_search` as a LangChain Tool object so agents can invoke it.

- **Line 13: `def web_search(query : str) -> str:`**  
  - `def`: Defines a Python function named `web_search`.
  - `query : str`: Type hint indicating parameter `query` must be a string.
  - `-> str`: Type hint indicating the function returns a string.

- **Line 14: `"""Search the web..."""`**  
  Docstring providing tool description to the LLM agent.

- **Line 15: `results = tavily.search(query=query,max_results=5)`**  
  Calls Tavily Search API for the top 5 results and assigns the dictionary to `results`.

- **Line 16: `out = []`**  
  Initializes an empty list to accumulate formatted string blocks.

- **Line 17: `for r in results['results']:`**  
  Loops over each dictionary item `r` in the returned results list.

- **Lines 18-22: `out.append(...)`**  
  Extracts `r['title']`, `r['url']`, and truncates `r['content']` to the first 300 characters (`[:300]`), formatting them into a readable block.

- **Line 24: `return "\n----\n".join(out)`**  
  Joins all formatted strings in `out` with `\n----\n` as a separator and returns a single text string.

---

### Function 2: `scrape_url`

```python
26: @tool
27: def scrape_url(url: str) -> str:
28:     """Scrape and return clean text content from a given URL for deeper reading."""
29:     try:
30:         resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
31:         soup = BeautifulSoup(resp.text, "html.parser")
32:         for tag in soup(["script", "style", "nav", "footer"]):
33:             tag.decompose()
34:         return soup.get_text(separator=" ", strip=True)[:3000]
35:     except Exception as e:
36:         return f"Could not scrape URL: {str(e)}"
```

#### Line-by-Line Explanation:

- **Line 26: `@tool`**  
  Registers `scrape_url` as a LangChain Tool.

- **Line 27: `def scrape_url(url: str) -> str:`**  
  Function accepting target webpage `url` string and returning extracted text string.

- **Line 28: `"""Scrape and return clean text..."""`**  
  Docstring describing tool capability for the Reader Agent.

- **Line 29: `try:`**  
  Opens an exception handling block to catch network timeouts or HTTP errors.

- **Line 30: `resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})`**  
  - `requests.get()`: Sends an HTTP GET request to `url`.
  - `timeout=8`: Aborts the request if the server doesn't respond within 8 seconds.
  - `headers={"User-Agent": "Mozilla/5.0"}`: Mimics a desktop browser to prevent websites from blocking automated requests.

- **Line 31: `soup = BeautifulSoup(resp.text, "html.parser")`**  
  Parses raw HTML text `resp.text` into a BeautifulSoup DOM object `soup`.

- **Line 32-33: `for tag in soup(["script", "style", "nav", "footer"]): tag.decompose()`**  
  Finds all JavaScript (`script`), CSS (`style`), Navigation (`nav`), and Footer (`footer`) HTML elements and completely removes them (`decompose()`) from the document tree.

- **Line 34: `return soup.get_text(separator=" ", strip=True)[:3000]`**  
  Extracts clean text content from remaining HTML, separates words with spaces, strips extra whitespace, and truncates the string to 3,000 characters.

- **Lines 35-36: `except Exception as e: return f"Could not scrape URL: {str(e)}"`**  
  Catches any runtime error (connection failure, timeout, 404) and returns a friendly error message string to the agent instead of crashing the program.

---

# 8. Web Scraping & Requests Overview

Web scraping is the automated extraction of text data from HTML websites.

```
Target URL ──> requests.get() ──> Raw HTML String ──> BeautifulSoup ──> Clean Text
```

### Why Scraping Is Necessary
Tavily's search snippets are short (approx. 300 characters). For detailed research reports, `scrape_url` fetches full article text so the LLM has deep contextual evidence to cite.

---

# 9. HTTP Requests & Headers

### Common HTTP Status Codes
* **200 OK**: Request succeeded; HTML received.
* **301/302 Moved**: Webpage redirected.
* **403 Forbidden**: Server blocked the automated script.
* **404 Not Found**: Page URL does not exist.
* **429 Too Many Requests**: Rate limit exceeded.
* **500 Server Error**: Target website crashed internally.

### Role of `User-Agent`
Websites often block default Python HTTP client headers (`User-Agent: python-requests/2.x`). Passing `headers={"User-Agent": "Mozilla/5.0"}` identifies the request as coming from a standard web browser, improving scraping success rates.

---

# 10. BeautifulSoup & Content Cleaning

### Why Tags Are Decomposed (`tag.decompose()`)
Raw webpage HTML contains huge amounts of non-literary text:
- `<script>`: JavaScript code.
- `<style>`: CSS styling rules.
- `<nav>`: Menu link lists.
- `<footer>`: Copyright and legal links.

If passed to an LLM:
1. **Wastes Token Budget**: Increases API cost.
2. **Distracts Model**: Introduces irrelevant code noise.
3. **Increases Hallucination Risk**: Model may misinterpret menu links as factual content.

Removing non-content tags reduces noise by over 70%, leaving clean article paragraphs.

---

# 11. Error Handling Analysis

`scrape_url` uses a `try...except` block:

```python
try:
    resp = requests.get(...)
    ...
except Exception as e:
    return f"Could not scrape URL: {str(e)}"
```

### Benefits of This Pattern
If a target website is offline or takes longer than 8 seconds to respond, `requests.get()` throws an exception. Catching it and returning a string (`"Could not scrape URL: ..."`):
1. **Prevents Backend Server Crash**: The FastAPI process continues running smoothly.
2. **Informs Agent gracefully**: The LLM agent receives the error string, realizes the URL is unreachable, and moves on to synthesizing the report using available search snippets.

---

# 12. Security Considerations in `tools.py`

1. **API Key Exposure Risk**: Mitigated by using `python-dotenv` and `os.getenv("TAVILY_API_KEY")`. `TAVILY_API_KEY` is kept out of source code.
2. **Server-Side Request Forgery (SSRF)**: `scrape_url` accepts any `url` parameter string. In production environments, scraping internal IP addresses (e.g. `http://127.0.0.1` or `http://169.254.169.254`) should be blocked.
3. **Unbounded Timeout Protection**: `requests.get(url, timeout=8)` prevents hanging HTTP connections from blocking server threads indefinitely.

---

# 13. Data Flow Execution Example

**Topic:** *"Impact of AI on software engineering jobs"*

1. **Search Call**: `web_search("Impact of AI on software engineering jobs")` is called.
2. **Tavily API Executed**: Returns top 5 result snippets.
3. **Format**: Returns markdown string formatted with titles, URLs, and 300-char content snippets separated by `\n----\n`.
4. **Scrape Selection**: Reader Agent selects URL `https://budgetlab.yale.edu/research/evaluating-impact-ai-labor-market`.
5. **Scrape Call**: `scrape_url("https://budgetlab.yale.edu/...")` is called.
6. **HTTP Fetch**: `requests.get()` retrieves HTML response within 8 seconds.
7. **HTML Cleanup**: BeautifulSoup strips `<script>`, `<style>`, `<nav>`, and `<footer>` elements.
8. **Output**: Returns first 3,000 characters of clean article text to the Reader Agent.

---

# 14. Common Beginner Confusions

| Concept | Clarification |
| :--- | :--- |
| **API vs. API Key** | An **API** is the service endpoint (`https://api.tavily.com`). An **API Key** is your secret password to access it. |
| **Tavily vs. Gemini** | **Tavily** searches the web for current live data. **Gemini** is the AI language model that processes text and writes reports. |
| **Tool vs. Agent** | A **Tool** is a passive function (`scrape_url`). An **Agent** is the active AI worker that decides *when* to call the tool. |
| **Request vs. Response** | A **Request** is your program asking a server for data (`requests.get()`). A **Response** is what the server sends back (`resp.text`). |
| **HTML vs. Text** | **HTML** includes tags (`<div>`, `<p>`). **Text** is the human-readable content extracted after stripping HTML tags. |

---

# 15. Viva Questions & Answers for `tools.py`

### Beginner
* **Q: What does `@tool` do in `tools.py`?**  
  *Answer:* It wraps a standard Python function into a LangChain `StructuredTool` object, attaching metadata and args schemas so LLM agents can discover and execute it.
* **Q: Why do we use `load_dotenv()`?**  
  *Answer:* To load secret configuration keys from a local `.env` file into system environment variables (`os.environ`).

### Intermediate
* **Q: Why do we pass `headers={"User-Agent": "Mozilla/5.0"}` in `requests.get()`?**  
  *Answer:* To identify the HTTP request as coming from a desktop web browser, preventing target servers from blocking automated scraping requests.
* **Q: Why do we call `tag.decompose()` in BeautifulSoup?**  
  *Answer:* To remove non-literary HTML tags (`script`, `style`, `nav`, `footer`), which reduces noise and saves LLM token window budget.

### Advanced
* **Q: How does the LLM agent know what parameters to pass to `web_search`?**  
  *Answer:* LangChain inspects function signatures (`query: str`) and docstrings, generating a JSON Schema that is passed in Gemini's tool definition payload.

---

# 16. Code Comprehension Test

Answer these 10 questions to test your understanding of `tools.py`:

1. **What is the exact data type returned by `web_search()`?**
2. **What does `content[:300]` do in line 21 of `tools.py`?**
3. **What happens if `TAVILY_API_KEY` is not present in `.env` when `TavilyClient` is instantiated?**
4. **Why is `timeout=8` included in `requests.get()` in `scrape_url`?**
5. **What method in BeautifulSoup completely deletes an HTML element from the parsed document tree?**
6. **Why is the docstring of a `@tool` function critically important for AI agents?**
7. **What string separates individual search results in the return value of `web_search()`?**
8. **What character limit is applied to the string returned by `scrape_url()`?**
9. **If `requests.get()` encounters a 404 error or connection timeout, what does `scrape_url()` return?**
10. **What is the structural difference between a plain Python function and a function decorated with `@tool`?**

---

# WHAT YOU SHOULD REMEMBER

1. `tools.py` defines external capabilities (`web_search` & `scrape_url`) for AI agents.
2. Tavily provides structured, AI-optimized web search results.
3. BeautifulSoup cleans HTML by decomposing scripts, styles, navbars, and footers.
4. `@tool` registers functions with JSON schemas and docstring descriptions that LLM agents read.
5. `requests.get()` uses browser `User-Agent` headers and an 8-second timeout for safe scraping.
6. Secret API keys are loaded securely from `.env` via `load_dotenv()` and `os.getenv()`.
7. `web_search` limits output to top 5 results; `scrape_url` limits text to 3,000 characters.
8. Exceptions in `scrape_url` are caught gracefully so errors return as informational text rather than crashing the backend.

---

# ONE-MINUTE VIVA EXPLANATION

> *"In my project, `tools.py` acts as the external capability layer for my AI agents. It defines two main `@tool` decorated functions: `web_search` and `scrape_url`. `web_search` uses the Tavily API to fetch current web search snippets and links, while `scrape_url` uses `requests` and `BeautifulSoup` to download and clean full article content by removing scripts, styles, and navigation bars. These functions are registered with `@tool` decorators so that my LangGraph search and reader agents can discover and call them during pipeline execution."*

---

# DO NOT MOVE TO PART 3 YET

Part 3 will cover **`agents.py`** in depth (LLM initializations, `writer_chain`, `critic_chain`, prompt engineering, and output parsers).  
*Please review Part 2 and complete the test questions whenever you are ready!*
