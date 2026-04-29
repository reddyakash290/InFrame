from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class Post(BaseModel):
    id: int
    creator_name: str
    creator_role: str
    creator_id: str
    creator_color: Optional[str] = None
    time_ago: str
    location: str
    content: str
    tags: List[str]
    media_type: str # 'video', 'photo', 'design', 'collab'
    media_url: Optional[str] = None
    likes: int
    comments: int
    is_liked: bool = False
    is_open_to_collab: bool = False

@router.get("/feed", response_model=List[Post])
async def get_feed():
    # Mock data mirroring the cinematic aesthetic of InFrame
    return [
        {
            "id": 1,
            "creator_name": "Riya Nair",
            "creator_role": "Cinematographer · DOP",
            "creator_id": "riya_nair",
            "creator_color": "linear-gradient(135deg, #4a90d9, #2c5f8a)",
            "time_ago": "2 hours ago",
            "location": "Mumbai",
            "content": "Just wrapped a two-day outdoor shoot for an indie short. Natural light at golden hour is unbeatable — here's a clip from the behind-the-scenes. Looking to connect with directors working on feature films this year.",
            "tags": ["Cinematography", "IndieFilm", "OpenToCollab", "DOP"],
            "media_type": "video",
            "media_url": None, # In a real app, this would be a URL
            "likes": 214,
            "comments": 38,
            "is_liked": True,
            "is_open_to_collab": True
        },
        {
            "id": 2,
            "creator_name": "Karan Sethi",
            "creator_role": "Motion Designer",
            "creator_id": "karan_sethi",
            "creator_color": "linear-gradient(135deg, #d4a06a, #8b5a2b)",
            "time_ago": "5 hours ago",
            "location": "Bangalore",
            "content": "New brand identity project dropped. Spent 3 weeks on this motion system — super happy with how the kinetic type came together. Drop a 🔥 if you want me to break down the process.",
            "tags": ["MotionDesign", "BrandIdentity", "AfterEffects"],
            "media_type": "design",
            "media_url": None,
            "likes": 89,
            "comments": 17,
            "is_liked": False
        },
        {
            "id": 3,
            "creator_name": "Sneha Pillai",
            "creator_role": "Documentary Director",
            "creator_id": "sneha_pillai",
            "creator_color": "linear-gradient(135deg, #7bc67a, #2d6b2c)",
            "time_ago": "Yesterday",
            "location": "Delhi",
            "content": "Casting call for a short documentary on street musicians of Old Delhi. Seeking: 1 Sound Designer, 1 Editor, and 1 Production Assistant. Unpaid but full credit + festival submission.",
            "tags": ["DocumentaryFilm", "SoundDesign", "Editing", "Delhi"],
            "media_type": "collab",
            "media_url": None,
            "likes": 56,
            "comments": 24,
            "is_open_to_collab": True
        }
    ]
