import os
import json
import base64
from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from pathlib import Path
import sys

# Add backend dir to path for imports
BACKEND_PATH = Path(__file__).parent.parent
sys.path.append(str(BACKEND_PATH))
from backoff_util import async_exponential_backoff

# Load environment variables
env_path = BACKEND_PATH / ".env.local"
load_dotenv(env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/api/ai", tags=["AI"])

class AuditAIRequest(BaseModel):
    transcript: str
    type: str

@router.post("/audit")
@async_exponential_backoff(max_retries=3)
async def ai_audit_transcript(request: AuditAIRequest):
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
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
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "OBJECT",
                    "properties": {
                        "empathy_score": {"type": "INTEGER"},
                        "resolution_score": {"type": "INTEGER"},
                        "compliance_score": {"type": "INTEGER"},
                        "overall_score": {"type": "INTEGER"},
                        "violations": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "type": {"type": "STRING"},
                                    "description": {"type": "STRING"},
                                    "severity": {"type": "STRING"},
                                    "transcript_line_index": {"type": "INTEGER"}
                                },
                                "required": ["type", "description", "severity", "transcript_line_index"]
                            }
                        },
                        "suggestions": {"type": "STRING"}
                    },
                    "required": ["empathy_score", "resolution_score", "compliance_score", "overall_score", "violations", "suggestions"]
                }
            }
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Audit Error: {e}")
        return {"error": str(e)}

class TranscribeRequest(BaseModel):
    base64_data: str
    mime_type: str

@router.post("/transcribe")
@async_exponential_backoff(max_retries=3)
async def ai_transcribe_audio(request: TranscribeRequest):
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[
                genai.types.Part.from_bytes(
                    data=base64.b64decode(request.base64_data),
                    mime_type=request.mime_type
                ),
                genai.types.Part.from_text(text="""Transcribe this customer support call audio accurately. 
              
              TASK: Perform ADVANCED SPEAKER DIARIZATION. 
              Analyze the acoustic subpopulations and vocal signatures to distinguish speakers.
              
              FORMAT: Each line MUST follow this EXACT format:
              [MM:SS] Speaker Name (Confidence%): Message
              
              EXAMPLES:
              [00:05] Agent (98%): Thank you for calling tech support.
              [00:12] Customer (85%): My internet is down again.
              
              HEURISTICS for identification:
              - "Agent": Look for standard greetings, professional tone, and process-oriented speech.
              - "Customer": Look for the person stating the problem or providing details.
              - If names are explicitly mentioned, use them.
              
              CRITICAL:
              1. Ensure timestamps are accurate.
              2. Provide a confidence percentage for each attribution based on the clarity of the vocal signature.
              
              Provide ONLY the transcript text in the specified format."""
                )
            ]
        )
        return {"transcript": response.text}
    except Exception as e:
        print(f"Gemini Transcribe Error: {e}")
        return {"error": str(e)}
