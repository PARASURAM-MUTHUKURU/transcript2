from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env", override=True)

BASE_DIR = Path(__file__).parent.parent

EMBEDDING_MODEL = "models/gemini-embedding-001"
LLM_MODEL       = "gemini-2.5-flash"
EMBEDDING_DIM   = 768

CHUNK_SIZE      = 1000
CHUNK_OVERLAP   = 200

QDRANT_URL      = os.getenv("QDRANT_URL")
QDRANT_API_KEY  = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "rag_collection"

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY missing")
if not QDRANT_API_KEY or not QDRANT_URL:
    raise ValueError("QDRANT_API_KEY / QDRANT_URL missing")