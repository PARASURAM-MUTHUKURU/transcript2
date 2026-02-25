import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "auditor.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create agents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    """)

    # Create audits table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id INTEGER NOT NULL,
            transcript TEXT NOT NULL,
            type TEXT NOT NULL,
            audio_data TEXT,
            mime_type TEXT,
            empathy_score INTEGER,
            resolution_score INTEGER,
            compliance_score INTEGER,
            overall_score INTEGER,
            violations TEXT,
            suggestions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    """)

    # Seed agents data
    cursor.execute("SELECT COUNT(*) FROM agents")
    if cursor.fetchone()[0] == 0:
        agents = [("Alice Smith",), ("Bob Jones",), ("Charlie Brown",), ("Diana Prince",)]
        cursor.executemany("INSERT INTO agents (name) VALUES (?)", agents)
        print("Seeded agents data.")

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
