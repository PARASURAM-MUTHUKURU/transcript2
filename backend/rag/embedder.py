import google.generativeai as genai

class GeminiEmbedder:
    def __init__(self, model_name: str, api_key: str, dimension: int):
        genai.configure(api_key=api_key)
        self.model = model_name
        self.dimension = dimension

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        embeddings = []
        for text in texts:
            try:
                result = genai.embed_content(
                    model=self.model,
                    content=text,
                    task_type="retrieval_document",
                    output_dimensionality=self.dimension
                )
                embeddings.append(result["embedding"])
            except Exception as e:
                print(f"Embedding failed: {e}")
        return embeddings

    def embed_query(self, query: str) -> list[float]:
        result = genai.embed_content(
            model=self.model,
            content=query,
            task_type="retrieval_query",
            output_dimensionality=self.dimension
        )
        return result["embedding"]