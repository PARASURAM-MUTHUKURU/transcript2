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
    """Returns a new psycopg2 connection from the pool."""
    conn = db_pool.getconn()
    
    # We configure RealDictCursor here because it's not straightforward to pass it to the pool
    # It needs to be configured when the cursor is created
    return conn

def release_db_connection(conn):
    """Puts back the connection into the pool."""
    db_pool.putconn(conn)
