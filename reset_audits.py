import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "auditor.db"

def reset_audits():
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Delete all records from the audits table
        cursor.execute("DELETE FROM audits")
        # Reset the autoincrement counter for audits
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='audits'")
        
        conn.commit()
        print("Successfully cleared all audit records from the database.")
    except Exception as e:
        print(f"Error resetting audits: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    confirm = input("Are you sure you want to delete all audit records? (y/N): ")
    if confirm.lower() == 'y':
        reset_audits()
    else:
        print("Reset cancelled.")
