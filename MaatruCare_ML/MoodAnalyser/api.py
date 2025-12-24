# api.py
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from moodanalysis import analyzer
from alerts import check_daily_alerts
from report_generator import generate_mood_report
from pymongo import MongoClient
import uvicorn
import os

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
db = client.maatruCareBot
moods_collection = db.moods

class MoodRequest(BaseModel):
    text: str
    userId: str

@app.post("/analyze-mood")
def analyze_mood(req: MoodRequest):
    """Analyze journal text → Save to MongoDB"""
    result = analyzer.getMoodAnalysisResult(req.text)
    
    # Save to YOUR MongoDB
    moods_collection.insert_one({
        "userId": req.userId,
        **result,
        "timestamp": result["timestamp"]
    })
    
    return result

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
    pdf = generate_mood_report(user_id)
    if pdf:
        return Response(content=pdf, media_type="application/pdf")
    return {"error": "No mood data found"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
