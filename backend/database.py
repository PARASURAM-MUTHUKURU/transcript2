import os
import psycopg2
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / ".env.local"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize connection pool
# minconn=1, maxconn=20 gives us a good balance for a standard web app
db_pool = ThreadedConnectionPool(1, 20, DATABASE_URL)

def get_db_connection():
    """Returns a new psycopg2 connection from the pool, ensuring it's alive."""
    try:
        conn = db_pool.getconn()
        # Ping the connection to check if it's alive (often needed for Supabase idle timeout)
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        except (psycopg2.OperationalError, psycopg2.InterfaceError):
            print("Connection dead, removing from pool and getting a fresh one.")
            db_pool.putconn(conn, close=True)
            conn = db_pool.getconn()
        return conn
    except Exception:
        # Fallback: just return a regular connection if pool fails
        return psycopg2.connect(DATABASE_URL)

def release_db_connection(conn):
    """Puts back the connection into the pool."""
    try:
        db_pool.putconn(conn)
    except Exception:
        # If it wasn't from the pool, or the pool is broken, just close it.
        try:
            conn.close()
        except:
            pass
