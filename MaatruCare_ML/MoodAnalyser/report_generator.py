# report_generator.py - COMPLETE FIXED VERSION
from pymongo import MongoClient
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
import io
import os
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.MaatruCare
moods_collection = db.journals


def generate_mood_report(user_id: str, days: int = 7):
    """Generate PDF mood report for last N days"""
    print("REPORT user_id =", repr(user_id))
    
    # Smart userId filter - handles ObjectId OR string
    filter_query = {"userId": user_id}  # Default string match
    try:
        filter_query["userId"] = ObjectId(user_id)
        print("DEBUG: Using ObjectId filter")
    except:
        print("DEBUG: Using string filter")
    
    moods = list(moods_collection.find(filter_query).sort("timestamp", 1))
    print("FOUND moods:", len(moods))
    
    # DEBUG: Print first mood document to see actual fields
    if moods:
        print("DEBUG - First mood document:", moods[0])
        print("DEBUG - Fields present:", list(moods[0].keys()))
    
    if not moods:
        print("No moods found - returning None")
        return None
    
    # Stats
    scores = [float(m.get("sentiment_score", 0)) for m in moods]
    avg_mood = sum(scores) / len(scores) if scores else 0.0
    high_risk_days = len([m for m in moods if "High Risk" in str(m.get("risk_level", ""))])
    
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
    for mood in moods[-10:]:
        ts = mood.get("timestamp", "Unknown")
        
        # Handle datetime object, ISO string, or fallback
        if isinstance(ts, datetime):
            date_str = ts.strftime("%Y-%m-%d")
        elif isinstance(ts, str) and ts != "Unknown":
            try:
                # Parse ISO format or just take first 10 chars (YYYY-MM-DD)
                date_str = datetime.fromisoformat(ts.replace('Z', '+00:00')).strftime("%Y-%m-%d")
            except:
                date_str = ts[:10] if len(ts) >= 10 else ts
        else:
            # Fallback to entryDateTime, createdAt or ObjectId creation time
            created_at = mood.get("entryDateTime") or mood.get("createdAt") or mood.get("_id")
            if isinstance(created_at, datetime):
                date_str = created_at.strftime("%Y-%m-%d")
            elif hasattr(created_at, 'generation_time'):  # ObjectId
                date_str = created_at.generation_time.strftime("%Y-%m-%d")
            else:
                date_str = "Unknown"
        
        risk = mood.get("risk_level") or mood.get("risk") or "Not Analyzed Yet"
        score = mood.get("sentiment_score")
        
        # Show '-' if not analyzed yet instead of 0.00
        score_str = f"{float(score):.2f}" if score is not None else "-"
        
        table_data.append([date_str, risk, score_str])
    
    story.append(Table(table_data, colWidths=[1.5*inch, 1.5*inch, 1*inch]))
    
    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.getvalue()
    print(f"PDF generated: {len(pdf_bytes)} bytes")
    return pdf_bytes
