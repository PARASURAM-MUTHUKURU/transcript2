import os
from qdrant_client import QdrantClient
from dotenv import load_dotenv

print("Loading .env.local...")
load_dotenv(".env.local")

URL = os.getenv("QDRANT_URL")
API_KEY = os.getenv("QDRANT_API_KEY")

print(f"Testing Qdrant connection to: {URL}...")
try:
    client = QdrantClient(url=URL, api_key=API_KEY, timeout=10)
    print("Client initialized. Fetching collections...")
    collections = client.get_collections()
    print(f"Success! Found {len(collections.collections)} collections.")
    for c in collections.collections:
        print(f" - {c.name}")
except Exception as e:
    print(f"Qdrant connection FAILED: {e}")
