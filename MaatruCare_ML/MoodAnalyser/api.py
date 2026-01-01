# api.py
from fastapi import FastAPI, Response,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from moodanalysis import analyzer
from alerts import check_daily_alerts
from report_generator import generate_mood_report
from pymongo import MongoClient
import uvicorn
import os
from bson import ObjectId 
from typing import Any,Dict
from datetime import datetime, UTC
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MaatruCare ML API v1.0")

# CORS for Node.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.MaatruCare
moods_collection = db.journals

class MoodRequest(BaseModel):
    text: str
    userId: str
    journalId: str 

@app.post("/analyze-mood")
def analyze_mood(req: MoodRequest):
    print("ANALYZE-MOOD called with:", req.dict())

    result: Dict[str, Any] = analyzer.getMoodAnalysisResult(req.text)
    print("Analyzer result:", result)

    update = {
        "$set": {
            "sentiment_score": result.get("sentiment_score", 0),
            "risk_level": result.get("risk_level") or result.get("risk"),
            "timestamp": result.get("timestamp", datetime.now(UTC)),
        }
    }

    filter_ = {
        "_id": ObjectId(req.journalId),
        "userId": ObjectId(req.userId),
    }
    print("Mongo filter:", filter_)
    print("Mongo update:", update)

    res = moods_collection.update_one(filter_, update)
    print("Mongo matched:", res.matched_count, "modified:", res.modified_count)

    return {"matched": res.matched_count, "modified": res.modified_count}


@app.post("/check-alerts")
def trigger_alerts():
    """Check daily high-risk users"""
    count = check_daily_alerts()
    return {"alerts_sent": count}

@app.get("/health")
def health():
    return {"status": "healthy", "analyzer": "ready"}

@app.get("/report/{user_id}")
def get_report(user_id: str):
    """Generate PDF mood report"""
    print("REPORT endpoint called with user_id:", repr(user_id))
    pdf = generate_mood_report(user_id)
    if pdf:
        return Response(content=pdf, media_type="application/pdf")
    raise HTTPException(status_code=404, detail="No mood data - journal first")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
