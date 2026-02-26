from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sqlite3
import json
import os
from pathlib import Path
from rag.pipeline import RAGPipeline
from fastapi import UploadFile, File, Form
import shutil

app = FastAPI()

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local dev project
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Pipeline
# Note: reset=True in RAGPipeline.__init__ will wipe the collection. 
# For production, we'd set this to False after first initialization.
try:
    rag_pipeline = RAGPipeline()
except Exception as e:
    print(f"Failed to initialize RAG Pipeline: {e}")
    rag_pipeline = None

# SQLite database setup (reuse existing db)
DB_PATH = Path(__file__).parent.parent / "auditor.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Types
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

@app.get("/api/agents")
def get_agents():
    conn = get_db_connection()
    agents = conn.execute("SELECT * FROM agents").fetchall()
    conn.close()
    return [dict(ix) for ix in agents]

@app.get("/api/audits")
def get_audits():
    conn = get_db_connection()
    query = """
      SELECT a.*, ag.name as agent_name 
      FROM audits a 
      JOIN agents ag ON a.agent_id = ag.id 
      ORDER BY a.created_at DESC
    """
    audits = conn.execute(query).fetchall()
    conn.close()
    
    results = []
    for audit in audits:
        audit_dict = dict(audit)
        # Parse violations json string back to dict list to match frontend expectations
        if audit_dict.get("violations"):
            try:
                audit_dict["violations"] = json.loads(audit_dict["violations"])
            except:
                audit_dict["violations"] = []
        results.append(audit_dict)
        
    return results

@app.post("/api/audits")
def create_audit(audit: AuditRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
      INSERT INTO audits 
      (agent_id, transcript, type, audio_data, mime_type, empathy_score, 
       resolution_score, compliance_score, overall_score, violations, suggestions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        audit.agent_id, audit.transcript, audit.type, audit.audio_data, audit.mime_type, 
        audit.empathy_score, audit.resolution_score, audit.compliance_score, 
        audit.overall_score, json.dumps(audit.violations), audit.suggestions
    ))
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return {"id": last_id}

@app.post("/api/ingest")
async def ingest_document(file: UploadFile = File(...)):
    if not rag_pipeline:
        return {"error": "RAG Pipeline not initialized"}
    
    # Save file temporarily
    temp_path = Path("temp") / file.filename
    temp_path.parent.mkdir(exist_ok=True)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        rag_pipeline.ingest_file(str(temp_path))
        return {"message": f"Successfully ingested {file.filename}"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        if temp_path.exists():
            os.remove(temp_path)

@app.post("/api/audit-with-rag")
async def audit_with_rag(request: Request):
    data = await request.json()
    transcript = data.get("transcript", "")
    
    if not rag_pipeline:
        return {"error": "RAG Pipeline not initialized"}
    
    # Query RAG for policy context
    question = f"Analyze this support transcript for compliance and quality issues based on policy: {transcript[:1000]}"
    answer, sources = rag_pipeline.query(question)
    
    # Simple parsing or just return the RAG result as suggestions
    return {
        "suggestions": answer,
        "sources": sources
    }

@app.get("/api/analytics")
def get_analytics():
    conn = get_db_connection()
    
    stats_query = """
      SELECT 
        ag.name as agent_name,
        AVG(a.overall_score) as avg_score,
        COUNT(a.id) as total_audits
      FROM agents ag
      LEFT JOIN audits a ON ag.id = a.agent_id
      GROUP BY ag.id
    """
    stats = conn.execute(stats_query).fetchall()
    
    trend_query = """
      SELECT 
        strftime('%Y-%m-%d', created_at) as date,
        AVG(overall_score) as avg_score
      FROM audits
      GROUP BY date
      ORDER BY date ASC
      LIMIT 30
    """
    trend = conn.execute(trend_query).fetchall()
    
    conn.close()
    
    return {
        "stats": [dict(ix) for ix in stats],
        "trend": [dict(ix) for ix in trend]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
