import os
from typing import Optional
from fastapi import HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Initialize Supabase client for online verification (fallback)
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_ANON_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verifies the Supabase JWT and returns the user information.
    """
    token = credentials.credentials
    
    # 1. Local verification (Fastest & Preferred)
    if SUPABASE_JWT_SECRET:
        try:
            # Supabase tokens are signed with the JWT Secret using HS256
            payload = jwt.decode(
                token, 
                SUPABASE_JWT_SECRET, 
                algorithms=["HS256"], 
                options={"verify_aud": False} # Supabase uses "authenticated" or "anon" as audience
            )
            return payload
        except JWTError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    # 2. Online verification (Fallback if Secret is missing)
    if supabase:
        try:
            # This calls the Supabase Auth API to verify the token
            user_response = supabase.auth.get_user(token)
            if user_response and user_response.user:
                return user_response.user
            else:
                raise HTTPException(status_code=401, detail="User not found or token invalid")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
            
    # If neither method is available
    raise HTTPException(
        status_code=500, 
        detail="Authentication configuration missing on server (SUPABASE_JWT_SECRET or SUPABASE_URL/KEY)"
    )

def require_role(role: str):
    """
    Dependency to restrict access based on user role in metadata.
    """
    async def role_checker(user = Depends(get_current_user)):
        # Supabase stores roles in user_metadata or app_metadata
        # Check both for flexibility
        user_role = user.get("role") or (user.get("user_metadata", {}).get("role") if isinstance(user, dict) else getattr(user, "role", None))
        
        if user_role != role:
            raise HTTPException(status_code=403, detail=f"Requires {role} role")
        return user
    return role_checker
