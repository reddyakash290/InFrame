from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/me")
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Fetches the logged-in user's profile data from the public users table.
    """
    query = text("""
        SELECT id::text, email, full_name, role, bio, location, avatar_url, 
               is_open_to_collab, created_at
        FROM users
        WHERE id = :user_id
    """)
    
    try:
        result = await db.execute(query, {"user_id": current_user_id})
        user = result.mappings().first()
        
        if not user:
            # Fallback if the user is in auth but not yet in public.users table
            # (Though in a real app, a trigger usually handles this)
            raise HTTPException(status_code=404, detail="Profile not found in public database.")
            
        return dict(user)
    except Exception as e:
        print(f"[USERS ERROR] Failed to fetch profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred.")
