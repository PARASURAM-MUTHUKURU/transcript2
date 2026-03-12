import os
import psycopg2
from dotenv import load_dotenv

print("Loading .env.local...")
load_dotenv(".env.local")

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing connection to: {DATABASE_URL[:20]}...")

try:
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=5)
    print("Connection successful!")
    cur = conn.cursor()
    cur.execute("SELECT 1")
    print("Query successful!")
    conn.close()
except Exception as e:
    print(f"Connection FAILED: {e}")
