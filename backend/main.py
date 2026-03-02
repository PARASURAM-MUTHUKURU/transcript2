from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import os
from pathlib import Path
from fastapi import UploadFile, File, Form
import shutil
import shutil
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv(".env.local")

# Add RAG directory to sys.path for imports
RAG_PATH = Path(__file__).parent / "rag"
sys.path.append(str(RAG_PATH))

from src.pipeline import RAGPipeline

app = FastAPI()

# Initialize RAG Pipeline
rag_pipeline = RAGPipeline()

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local dev project
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PostgreSQL database setup
DATABASE_URL = os.getenv("DATABASE_URL")

# Gemini AI setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
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
    cur = conn.cursor()
    cur.execute("SELECT * FROM agents")
    agents = cur.fetchall()
    cur.close()
    conn.close()
    return agents

@app.get("/api/audits")
def get_audits():
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
      SELECT a.*, ag.name as agent_name 
      FROM audits a 
      JOIN agents ag ON a.agent_id = ag.id 
      ORDER BY a.created_at DESC
    """
    cur.execute(query)
    audits = cur.fetchall()
    cur.close()
    conn.close()
    
    results = []
    for audit in audits:
        audit_dict = dict(audit)
        # Violations is JSONB in PG, so it might already be a list/dict
        # but let's be safe if it comes as a string
        if isinstance(audit_dict.get("violations"), str):
            try:
                audit_dict["violations"] = json.loads(audit_dict["violations"])
            except:
                audit_dict["violations"] = []
        elif audit_dict.get("violations") is None:
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
    conn.close()
    return {"id": last_id}


@app.get("/api/analytics")
def get_analytics():
    conn = get_db_connection()
    cur = conn.cursor()
    
    stats_query = """
      SELECT 
        ag.id as agent_id,
        ag.name as agent_name,
        AVG(a.overall_score) as avg_score,
        AVG(a.empathy_score) as avg_empathy,
        AVG(a.resolution_score) as avg_resolution,
        AVG(a.compliance_score) as avg_compliance,
        COUNT(a.id) as total_audits
      FROM agents ag
      LEFT JOIN audits a ON ag.id = a.agent_id
      GROUP BY ag.id, ag.name
    """
    cur.execute(stats_query)
    stats = cur.fetchall()
    
    trend_query = """
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        AVG(overall_score) as avg_score,
        AVG(empathy_score) as avg_empathy,
        AVG(resolution_score) as avg_resolution,
        AVG(compliance_score) as avg_compliance
      FROM audits
      GROUP BY date
      ORDER BY date ASC
      LIMIT 30
    """
    cur.execute(trend_query)
    trend = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        "stats": stats,
        "trend": trend
    }

@app.get("/api/agents/{agent_id}/analytics")
def get_agent_analytics(agent_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get agent's personal trend
    trend_query = """
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        AVG(overall_score) as avg_score,
        AVG(empathy_score) as avg_empathy,
        AVG(resolution_score) as avg_resolution,
        AVG(compliance_score) as avg_compliance
      FROM audits
      WHERE agent_id = %s
      GROUP BY date
      ORDER BY date ASC
      LIMIT 30
    """
    cur.execute(trend_query, (agent_id,))
    trend = cur.fetchall()
    
    # Get agent's recent audits
    recent_query = """
      SELECT id, overall_score, created_at, type
      FROM audits
      WHERE agent_id = %s
      ORDER BY created_at DESC
      LIMIT 5
    """
    cur.execute(recent_query, (agent_id,))
    recent = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        "trend": trend,
        "recent_audits": recent
    }

# RAG Endpoints
class RAGQueryRequest(BaseModel):
    question: str

@app.post("/api/rag/query")
async def rag_query(request: RAGQueryRequest):
    answer, sources = rag_pipeline.query(request.question)
    return {"answer": answer, "sources": sources}

@app.post("/api/rag/ingest")
async def rag_ingest(file: UploadFile = File(...)):
    # Create temp directory if not exists
    temp_dir = Path(__file__).parent / "temp_ingest"
    temp_dir.mkdir(exist_ok=True)
    
    file_path = temp_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        rag_pipeline.ingest_file(str(file_path))
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        # Clean up temp file
        if file_path.exists():
            file_path.unlink()

# Gemini AI Endpoints
class AuditAIRequest(BaseModel):
    transcript: str
    type: str

@app.post("/api/ai/audit")
async def ai_audit_transcript(request: AuditAIRequest):
    model_name = "gemini-2.0-flash-lite"
    model = genai.GenerativeModel(model_name)
    
    prompt = f"""
    Analyze the following customer support {request.type} transcript and provide a quality audit.
    
    Metrics to score (0-100):
    1. Empathy: How well did the agent understand and validate the customer's feelings?
    2. Resolution: Did the agent solve the problem or provide a clear path forward?
    3. Compliance: Did the agent follow standard protocols (greeting, privacy check, closing)?
    
    Identify specific compliance violations. For each violation, specify:
    - type: A short name for the violation
    - description: A detailed explanation
    - severity: 'Critical', 'Warning', or 'Info'
    - transcript_line_index: The 0-based index of the line in the transcript where this violation occurred or is most relevant.
    
    Transcript:
    \"\"\"
    {request.transcript}
    \"\"\"
    
    Return the result as a raw JSON object with the following keys:
    empathy_score, resolution_score, compliance_score, overall_score, violations (list of objects with keys type, description, severity, transcript_line_index), suggestions.
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Audit Error: {e}")
        return {"error": str(e)}

class TranscribeRequest(BaseModel):
    base64_data: str
    mime_type: str

@app.post("/api/ai/transcribe")
async def ai_transcribe_audio(request: TranscribeRequest):
    model_name = "gemini-2.0-flash-lite"
    model = genai.GenerativeModel(model_name)
    
    try:
        response = model.generate_content([
            {
                "mime_type": request.mime_type,
                "data": request.base64_data
            },
            {
                "text": """Transcribe this customer support call audio accurately. 
              CRITICAL INSTRUCTION: You must differentiate between the two speakers. 
              Format the output so each line starts with EXACTLY either "Agent: " or "Customer: ". 
              
              To identify the agent, look for heuristic patterns such as:
              - "Thank you for calling"
              - "How can I help you today"
              - "I'll be happy to assist"
              - "Let me check"
              - "I am transferring"
              - "Please hold"
              
              Provide only the transcript text."""
            }
        ])
        return {"transcript": response.text}
    except Exception as e:
        print(f"Gemini Transcribe Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
