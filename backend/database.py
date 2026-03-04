import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / ".env.local"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Returns a new psycopg2 connection to the PostgreSQL database."""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn
