from langchain_google_genai import ChatGoogleGenerativeAI
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

    def generate(self, question: str, context: str) -> str:
        prompt_template = ChatPromptTemplate.from_template(
            """Answer based **only** on the context below. Be concise and factual.
If not enough information, reply exactly: "Insufficient information in documents."

Context:
{context}

Question: {question}

Answer:"""
        )

        chain = prompt_template | self.llm | StrOutputParser()
        return chain.invoke({"context": context, "question": question}).strip()