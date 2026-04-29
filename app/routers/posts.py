from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import get_current_user
import datetime

router = APIRouter()

# --- SCHEMAS ---

class PostCreate(BaseModel):
    content: str
    media_url: Optional[str] = None
    tags: Optional[List[str]] = []

class PostResponse(BaseModel):
    id: int
    user_id: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    content: str
    media_url: Optional[str]
    tags: List[str]
    created_at: datetime.datetime
    likes_count: int

# --- ENDPOINTS ---

@router.get("/feed", response_model=List[PostResponse])
async def get_feed(db: AsyncSession = Depends(get_db)):
    """
    Public route to fetch the global feed.
    Joins with post_likes to get the count.
    """
    query = text("""
        SELECT p.id, p.user_id::text, p.content, p.media_url, p.tags, p.created_at,
               u.full_name, u.avatar_url,
               COUNT(l.id) as likes_count
        FROM posts p
        LEFT JOIN users u ON p.user_id::uuid = u.id::uuid
        LEFT JOIN post_likes l ON p.id = l.post_id
        GROUP BY p.id, u.full_name, u.avatar_url
        ORDER BY p.created_at DESC
        LIMIT 20
    """)
    
    result = await db.execute(query)
    # Use .mappings().all() to return a list of dictionaries that match the schema
    posts = result.mappings().all()
    return posts

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate, 
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Protected route to create a new post.
    """
    query = text("""
        INSERT INTO posts (user_id, content, media_url, tags)
        VALUES (:user_id, :content, :media_url, :tags)
        RETURNING id
    """)
    
    try:
        result = await db.execute(query, {
            "user_id": current_user_id,
            "content": post.content,
            "media_url": post.media_url,
            "tags": post.tags
        })
        await db.commit()
        new_post_id = result.scalar()

        # Fetch the fully joined data for the new post
        fetch_query = text("""
            SELECT 
                p.id, p.user_id::text, p.content, p.media_url, p.tags, p.created_at,
                u.full_name, u.avatar_url,
                0 as likes_count
            FROM posts p
            LEFT JOIN users u ON p.user_id::uuid = u.id::uuid
            WHERE p.id = :new_post_id
        """)
        
        result = await db.execute(fetch_query, {"new_post_id": new_post_id})
        return result.mappings().first()

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/{post_id}/like")
async def toggle_like(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Protected route to toggle a like on a post.
    """
    # Check if like exists
    check_query = text("""
        SELECT id FROM post_likes 
        WHERE post_id = :post_id AND user_id = :user_id
    """)
    
    result = await db.execute(check_query, {"post_id": post_id, "user_id": current_user_id})
    existing_like = result.scalar()
    
    if existing_like:
        # Remove like
        delete_query = text("DELETE FROM post_likes WHERE id = :like_id")
        await db.execute(delete_query, {"like_id": existing_like})
        action = "unliked"
    else:
        # Add like
        insert_query = text("""
            INSERT INTO post_likes (post_id, user_id)
            VALUES (:post_id, :user_id)
        """)
        await db.execute(insert_query, {"post_id": post_id, "user_id": current_user_id})
        action = "liked"
    
    try:
        await db.commit()
        return {"message": f"Post {action} successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
