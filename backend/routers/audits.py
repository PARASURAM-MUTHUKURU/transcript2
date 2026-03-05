from fastapi import APIRouter
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from database import get_db_connection, release_db_connection

router = APIRouter(prefix="/api/audits", tags=["Audits"])

class AuditRequest(BaseModel):
    agent_id: int
    transcript: str
    type: str
    audio_data: Optional[str] = None
    mime_type: Optional[str] = None
    empathy_score: int
    resolution_score: int
    compliance_score: int
    overall_score: int
    violations: List[Dict[str, Any]]
    suggestions: str

@router.get("")
def get_audits():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = """
          SELECT a.*, ag.name as agent_name 
          FROM audits a 
          JOIN agents ag ON a.agent_id = ag.id 
          ORDER BY a.created_at DESC
        """
        cur.execute(query)
        audits = cur.fetchall()
        cur.close()
    finally:
        release_db_connection(conn)
    
    results = []
    for audit in audits:
        audit_dict = dict(audit)
        if isinstance(audit_dict.get("violations"), str):
            try:
                audit_dict["violations"] = json.loads(audit_dict["violations"])
            except:
                audit_dict["violations"] = []
        elif audit_dict.get("violations") is None:
            audit_dict["violations"] = []
        results.append(audit_dict)
        
    return results

@router.post("")
def create_audit(audit: AuditRequest):
    conn = get_db_connection()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
          INSERT INTO audits 
          (agent_id, transcript, type, audio_data, mime_type, empathy_score, 
           resolution_score, compliance_score, overall_score, violations, suggestions)
          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
          RETURNING id
        """, (
            audit.agent_id, audit.transcript, audit.type, audit.audio_data, audit.mime_type, 
            audit.empathy_score, audit.resolution_score, audit.compliance_score, 
            audit.overall_score, json.dumps(audit.violations), audit.suggestions
        ))
        last_id = cursor.fetchone()['id']
        conn.commit()
        cursor.close()
        return {"id": last_id}
    finally:
        release_db_connection(conn)
