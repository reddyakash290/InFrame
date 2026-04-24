from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.routers import auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="InFrame Backend")



app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"], # Your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "InFrame API is live"}

@app.get("/db-check")
async def db_check(db: AsyncSession = Depends(get_db)):
    """
    Diagnostic endpoint to verify connection to Supabase PostgreSQL.
    """
    try:
        # Execute a simple SELECT 1 query to test the signal
        result = await db.execute(text("SELECT 1"))
        val = result.scalar()
        return {
            "status": "Database connected successfully",
            "signal": val
        }
    except Exception as e:
        return {
            "status": "Database connection failed",
            "error": str(e)
        }
