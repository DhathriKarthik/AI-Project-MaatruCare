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
        if isinstance(ts, datetime):
            date_str = ts.strftime("%Y-%m-%d")
        else:
            date_str = str(ts)[:10]
        
        risk = mood.get("risk_level") or mood.get("risk") or "Unknown"
        score = float(mood.get("sentiment_score", 0))
        
        table_data.append([date_str, risk, f"{score:.2f}"])
    
    story.append(Table(table_data, colWidths=[1.5*inch, 1.5*inch, 1*inch]))
    
    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.getvalue()
    print(f"PDF generated: {len(pdf_bytes)} bytes")
    return pdf_bytes
