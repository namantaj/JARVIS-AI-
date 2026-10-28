# 🤖 JARVIS — Justified Autonomous Research & Verification Intelligence System

JARVIS is an autonomous multi-agent deep research and verification engine powered by Google Gemini, LangGraph, Tavily Search, FastAPI, and a React + Tailwind CSS dashboard.

---

## 🌟 Key Features

- **Autonomous Multi-Agent Pipeline:** 4-stage pipeline orchestrated with LangGraph ReAct agents:
  1. **Search Agent:** Formulates optimal search strategies and queries live web data via Tavily.
  2. **Reader Agent:** Scrapes, cleans, and extracts contextual intelligence using BeautifulSoup4.
  3. **Writer Pipeline:** Synthesizes multi-source evidence into structured, citation-backed Markdown reports.
  4. **Critic Pipeline:** Audits research quality, verifies source claims, scores depth, and highlights strengths and gaps.
- **Asynchronous Execution:** Non-blocking FastAPI backend with real-time status polling and job persistence.
- **Supabase Integration:** Full database support for persisting jobs, stages, telemetry logs, and final reports.
- **Interactive Telemetry Dashboard:** Modern React + Vite frontend with live visual stage nodes, streaming logs, expandable evidence cards, and markdown report rendering.

---

## 🛠️ Tech Stack

- **Backend / AI:** Python 3.10+, Google Gemini (`gemini-1.5-flash` / `gemini-2.5-flash`), LangChain, LangGraph, Tavily API, BeautifulSoup4, FastAPI, Uvicorn, Supabase Python SDK
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, Supabase JS

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/namantaj/JARVIS-AI-.git
cd JARVIS-AI-
```

### 3. Backend Setup
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables in a `.env` file (refer to `.env.example`):
   ```env
   TAVILY_API_KEY=your_tavily_api_key
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```
4. Start the backend server:
   ```bash
   python run_server.py
   ```
   Backend runs at: `http://localhost:8000`

### 4. Frontend Setup
1. In a new terminal, install frontend dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
├── agents.py                 # LangGraph ReAct agents (Search, Reader, Writer, Critic)
├── pipeline.py               # Research workflow orchestration & state graph
├── server.py                 # FastAPI backend endpoints & job runner
├── run_server.py             # Uvicorn server entrypoint
├── tools.py                  # Tavily search & web scraping tools
├── db_supabase.py            # Supabase database client and queries
├── supabase_schema.sql       # Database schema and tables
├── src/                      # React frontend source code
│   ├── components/           # UI components (AgentStages, Evidence, Logs, etc.)
│   ├── api/                  # API client and endpoints
│   └── App.jsx               # Main application component
├── index.html                # HTML entry point
├── package.json              # Frontend dependencies and scripts
└── requirements.txt          # Python dependencies
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
