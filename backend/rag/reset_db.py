from src.config import QDRANT_URL, QDRANT_API_KEY, COLLECTION_NAME, EMBEDDING_DIM
from src.vector_store import QdrantVectorStore

def reset_database():
    print(f"Initializing reset for collection: {COLLECTION_NAME}")
    # Initializing with reset=True will trigger the deletion in QdrantVectorStore.__init__
    QdrantVectorStore(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=COLLECTION_NAME,
        vector_dim=EMBEDDING_DIM,
        reset=True
    )
    print("Database reset complete.")

if __name__ == "__main__":
    reset_database()
