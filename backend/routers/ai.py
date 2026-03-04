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
from config.prompts import AUDIT_PROMPT_TEMPLATE, TRANSCRIBE_DIARIZATION_PROMPT

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
    
    prompt = AUDIT_PROMPT_TEMPLATE.format(
        transcript_type=request.type,
        transcript=request.transcript
    )
    
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
                genai.types.Part.from_text(text=TRANSCRIBE_DIARIZATION_PROMPT)
            ]
        )
        return {"transcript": response.text}
    except Exception as e:
        print(f"Gemini Transcribe Error: {e}")
        return {"error": str(e)}
