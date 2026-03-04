import os
import sys
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
# Add backend to path to import backoff_util
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from backoff_util import exponential_backoff
from config.prompts import RAG_QA_PROMPT
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class GeminiLLM:
    def __init__(self, model_name: str, api_key: str):
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.7,
            max_output_tokens=600
        )

    @exponential_backoff(max_retries=3)
    def generate(self, question: str, context: str) -> str:
        prompt_template = ChatPromptTemplate.from_template(RAG_QA_PROMPT)

        chain = prompt_template | self.llm | StrOutputParser()
        return chain.invoke({"context": context, "question": question}).strip()