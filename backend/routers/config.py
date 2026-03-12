import os
from fastapi import APIRouter
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

router = APIRouter(prefix="/api/config", tags=["config"])

@router.get("")
def get_config():
    return {
        "supabaseUrl": os.getenv("SUPABASE_URL"),
        "supabaseAnonKey": os.getenv("SUPABASE_ANON_KEY")
    }
