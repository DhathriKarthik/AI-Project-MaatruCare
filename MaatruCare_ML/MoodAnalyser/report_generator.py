# report_generator.py
from pymongo import MongoClient
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
import io

MONGO_URI = "mongodb+srv://nsmaithreyi_db_user:maatru123@maatrucarebot.c1h2da8.mongodb.net/?appName=maatruCareBot"
client = MongoClient(MONGO_URI)
db = client.maatruCareBot
moods_collection = db.moods

def generate_mood_report(user_id: str, days: int = 7):
    """Generate PDF mood report for last N days"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    moods = list(moods_collection.find({
        "userId": user_id,
        "timestamp": {"$gte": start_date.isoformat()}
    }).sort("timestamp", 1))
    
    if not moods:
        return None
    
    # Stats
    scores = [float(m.get("sentiment_score", 0)) for m in moods]
    avg_mood = sum(scores) / len(scores)
    high_risk_days = len([m for m in moods if m["risk_level"] == "High Risk"])
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    story = [
        Paragraph("MaatruCare Mood Report", styles['Title']),
        Spacer(1, 20),
        Paragraph(f"<b>Period:</b> Last {days} days", styles['Normal']),
        Paragraph(f"<b>Average Mood Score:</b> {avg_mood:.2f}", styles['Normal']),
        Paragraph(f"<b>High Risk Days:</b> {high_risk_days}/{len(moods)}", styles['Normal']),
        Spacer(1, 20),
    ]
    
    # Mood table
    table_data = [["Date", "Risk Level", "Score"]]
    for mood in moods[-10:]:  # Last 10 entries
        table_data.append([
            mood["timestamp"][:10],
            mood["risk_level"],
            f"{mood.get('sentiment_score', 0):.2f}"
        ])
    
    story.append(Table(table_data, colWidths=[1.5*inch, 1.5*inch, 1*inch]))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
