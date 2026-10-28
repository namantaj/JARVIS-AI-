export const AGENT_STAGES = [
  {
    id: "planner",
    name: "Research Planner",
    role: "Orchestrator",
    icon: "Brain",
    description: "Formulates key research hypotheses, scope, and query breakdown.",
    detail: "Decomposed research topic into key search queries and focus areas."
  },
  {
    id: "search",
    name: "Search Agent",
    role: "Web Intelligence",
    icon: "Search",
    description: "Executes autonomous web search queries across authoritative indices.",
    detail: "Generated search parameters and dispatched queries via Tavily API."
  },
  {
    id: "tavily",
    name: "Tavily Search",
    role: "External Tool",
    icon: "Globe",
    description: "Fetches live web search results, news articles, and domain metrics.",
    detail: "Retrieved real-time web search results and source link metadata."
  },
  {
    id: "reader",
    name: "Reader Agent",
    role: "Content Selector",
    icon: "BookOpen",
    description: "Filters search results for depth, credibility, and relevance.",
    detail: "Selected target primary URL for deep document content extraction."
  },
  {
    id: "bs4",
    name: "BeautifulSoup",
    role: "Extraction Tool",
    icon: "FileText",
    description: "Parses DOM trees, removes clutter/ads, and extracts clean article text.",
    detail: "Parsed HTML DOM tree and extracted clean article body text."
  },
  {
    id: "writer",
    name: "Writer Pipeline",
    role: "Synthesis LLM",
    icon: "PenTool",
    description: "Synthesizes multi-source findings into a structured research report.",
    detail: "Synthesized research findings into structured Markdown report draft."
  },
  {
    id: "critic",
    name: "Critic Pipeline",
    role: "Verification LLM",
    icon: "ShieldCheck",
    description: "Evaluates factual consistency, source grounding, and flags discrepancies.",
    detail: "Audited report factual consistency and computed quality score."
  },
  {
    id: "report",
    name: "Final Report",
    role: "Output Artifact",
    icon: "CheckCircle2",
    description: "Finalized production research report ready for export.",
    detail: "Research completed and report artifact generated successfully."
  }
];

export const SAMPLE_TOPICS = [
  "Impact of AI on software engineering jobs",
  "Effects of geopolitical conflicts on global markets",
  "Future of renewable energy and grid storage",
  "Cybersecurity threats and autonomous defense in 2026",
  "Quantum computing breakthroughs in cryptography",
  "Next-generation solid-state battery technology"
];
