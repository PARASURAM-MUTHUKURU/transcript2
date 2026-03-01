from google import genai

class GeminiEmbedder:
    def __init__(self, model_name: str, api_key: str, dimension: int):
        self.client = genai.Client(api_key=api_key)
        self.model = model_name
        self.dimension = dimension

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        try:
            # The new SDK supports list of texts in one call
            result = self.client.models.embed_content(
                model=self.model,
                contents=texts,
                config={
                    "task_type": "retrieval_document",
                    "output_dimensionality": self.dimension
                }
            )
            return [e.values for e in result.embeddings]
        except Exception as e:
            print(f"Embedding failed: {e}")
            return []

    def embed_query(self, query: str) -> list[float]:
        try:
            result = self.client.models.embed_content(
                model=self.model,
                contents=query,
                config={
                    "task_type": "retrieval_query",
                    "output_dimensionality": self.dimension
                }
            )
            if not result.embeddings:
                return []
            return result.embeddings[0].values
        except Exception as e:
            print(f"Embedding query failed: {e}")
            return []