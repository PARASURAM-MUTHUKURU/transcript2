import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "auditor.db"

def get_connection():
    """Returns a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def clear_audits():
    """Deletes all records from the audits table."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM audits")
        conn.commit()
        print("Successfully cleared all audits.")
    except sqlite3.Error as e:
        print(f"Error clearing audits: {e}")
    finally:
        conn.close()

def delete_audit_by_id(audit_id):
    """Deletes a specific audit record by its ID."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM audits WHERE id = ?", (audit_id,))
        if cursor.rowcount > 0:
            conn.commit()
            print(f"Successfully deleted audit with ID {audit_id}.")
        else:
            print(f"No audit found with ID {audit_id}.")
    except sqlite3.Error as e:
        print(f"Error deleting audit {audit_id}: {e}")
    finally:
        conn.close()

def reset_audit_sequence():
    """Resets the autoincrement counter for the audits table."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM sqlite_sequence WHERE name = 'audits'")
        conn.commit()
        print("Successfully reset audit sequence.")
    except sqlite3.Error as e:
        print(f"Error resetting audit sequence: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python manage_db.py [clear|delete <id>|reset]")
    else:
        command = sys.argv[1].lower()
        if command == "clear":
            clear_audits()
        elif command == "delete" and len(sys.argv) == 3:
            delete_audit_by_id(sys.argv[2])
        elif command == "reset":
            reset_audit_sequence()
        else:
            print("Unknown command or missing arguments.")
