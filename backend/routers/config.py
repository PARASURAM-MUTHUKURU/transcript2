import os
from fastapi import APIRouter
from dotenv import load_dotenv

import logging
load_dotenv()
load_dotenv(".env.local")

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api/config", tags=["config"])

@router.get("")
def get_config():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        logger.warning(f"Supabase configuration missing: URL={bool(supabase_url)}, Key={bool(supabase_key)}")
        
    return {
        "supabaseUrl": supabase_url,
        "supabaseAnonKey": supabase_key
    }

