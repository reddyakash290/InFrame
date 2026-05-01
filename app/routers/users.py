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
            
        # 1. Count Projects
        projects_query = text("""
            SELECT COUNT(id) 
            FROM portfolio_items 
            WHERE user_id = CAST(:user_id AS uuid)
        """)
        projects_result = await db.execute(projects_query, {"user_id": current_user_id})
        projects_count = projects_result.scalar() or 0

        # 2. Count Active Connections (status is 'connected')
        connections_query = text("""
            SELECT COUNT(id) 
            FROM connections 
            WHERE (requester_id = CAST(:user_id AS uuid) OR receiver_id = CAST(:user_id AS uuid)) 
            AND status = 'connected'
        """)
        connections_result = await db.execute(connections_query, {"user_id": current_user_id})
        connections_count = connections_result.scalar() or 0

        # 3. Append to user dictionary
        user_dict = dict(user) 
        user_dict["stats"] = {
            "connections": connections_count,
            "projects": projects_count,
            "views": 0,             # Still a placeholder
            "festival_credits": 0,  # Still a placeholder
            "response_rate": "100%" # Still a placeholder
        }

        # 4. Fetch Skills
        skills_query = text("SELECT skill_name FROM user_skills WHERE user_id = CAST(:user_id AS uuid)")
        skills_result = await db.execute(skills_query, {"user_id": current_user_id})
        user_dict["skills"] = [dict(r) for r in skills_result.mappings().all()]

        # 5. Fetch Gear
        gear_query = text("SELECT name, description FROM user_gear WHERE user_id = CAST(:user_id AS uuid)")
        gear_result = await db.execute(gear_query, {"user_id": current_user_id})
        user_dict["gear"] = [dict(r) for r in gear_result.mappings().all()]

        # 6. Fetch Links
        links_query = text("SELECT platform, url FROM user_links WHERE user_id = CAST(:user_id AS uuid)")
        links_result = await db.execute(links_query, {"user_id": current_user_id})
        user_dict["links"] = [dict(r) for r in links_result.mappings().all()]

        return user_dict
    except Exception as e:
        print(f"[USERS ERROR] Failed to fetch profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred.")

@router.get("/me/portfolio")
async def get_my_portfolio(
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Fetches the portfolio items for the logged-in user.
    """
    query = text("""
        SELECT id, title, project_type, description, media_url, aspect_ratio, year
        FROM portfolio_items
        WHERE user_id = CAST(:user_id AS uuid)
        ORDER BY year DESC
    """)
    
    try:
        result = await db.execute(query, {"user_id": current_user_id})
        items = [dict(row) for row in result.mappings().all()]
        return items
    except Exception as e:
        print(f"[PORTFOLIO ERROR] Failed to fetch portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred.")
