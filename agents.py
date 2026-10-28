from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search , scrape_url 
from dotenv import load_dotenv

import os
from dotenv import load_dotenv

load_dotenv()

# Map GEMINI_API_KEY to GOOGLE_API_KEY if needed for ChatGoogleGenerativeAI
if not os.getenv("GOOGLE_API_KEY") and os.getenv("GEMINI_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

# model setup 
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite",
    google_api_key=api_key,
    temperature=0
)


#1st agent 
def build_search_agent():
    return create_agent(
        model = llm,
        tools= [web_search]
    )

#2nd agent 

def build_reader_agent():
    return create_agent(
        model = llm,
        tools = [scrape_url]
    )


#writer chain 

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert research writer. Write clear, structured and insightful reports.

CITATION RULES (CRITICAL):
- The research below contains multiple labeled sources: SOURCE [1], SOURCE [2], SOURCE [3], etc.
- When you use information from a specific source, cite it inline using its number, e.g. [1], [2], [3].
- If multiple sources agree on a fact, cite all of them, e.g. [1][2].
- If sources disagree on a fact, mention the disagreement and cite each side.
- Every factual claim should have at least one citation.
- In the Sources section at the end, list each source with its number and URL."""),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points, with inline [1], [2], [3] citations)
- Conclusion
- Sources (numbered list matching the citation numbers used above, with URLs)

Be detailed, factual and professional. Synthesize across all provided sources."""),
])

writer_chain = writer_prompt | llm | StrOutputParser()

#critic_chain 

critic_prompt = ChatPromptTemplate.from_messages([
     ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])

critic_chain = critic_prompt | llm | StrOutputParser()