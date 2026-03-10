from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from typing import List, Optional
from database import get_db_connection, release_db_connection

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

class Alert(BaseModel):
    id: int
    audit_id: int
    type: str
    description: str
    severity: str
    created_at: str
    is_resolved: bool

@router.get("")
def get_alerts(resolved: Optional[bool] = None):
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = "SELECT * FROM alerts"
        params = []
        if resolved is not None:
            query += " WHERE is_resolved = %s"
            params.append(resolved)
        query += " ORDER BY created_at DESC"
        cur.execute(query, params)
        alerts = cur.fetchall()
        
        # Convert datetime to string for JSON serialization
        for alert in alerts:
            if alert['created_at']:
                alert['created_at'] = alert['created_at'].isoformat()
        
        cur.close()
        return alerts
    finally:
        release_db_connection(conn)

@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: int):
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("UPDATE alerts SET is_resolved = TRUE WHERE id = %s RETURNING id", (alert_id,))
        updated = cur.fetchone()
        conn.commit()
        cur.close()
        if updated:
            return {"success": True}
        raise HTTPException(status_code=404, detail="Alert not found")
    finally:
        release_db_connection(conn)
