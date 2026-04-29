import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
JWT_SECRET = os.getenv("JWT_SECRET") # Use this for decoding

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY missing in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Supabase JWT token using the Supabase SDK.
    This handles ES256/HS256 algorithms and secret management automatically.
    """
    token = credentials.credentials
    try:
        # Use the Supabase SDK to verify the token and get user data
        # Note: This makes a request to the Supabase Auth API
        response = supabase.auth.get_user(token)
        
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session",
            )
            
        return str(response.user.id)

    except Exception as e:
        # Log the error for debugging
        print(f"[AUTH ERROR] Supabase verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )
