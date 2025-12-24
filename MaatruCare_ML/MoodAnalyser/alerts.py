# alerts.py
from pymongo import MongoClient
from datetime import date
import logging
from dotenv import load_dotenv
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.maatruCareBot
moods_collection = db.moods

CAREGIVER_EMAIL = "caregiver@maatru.care"  # Hardcoded for now

def check_daily_alerts():
    """Check today's high-risk users"""
    today = date.today().isoformat()
    
    pipeline = [
        {"$match": {"timestamp": {"$regex": f"^{today}"}}},
        {"$group": {
            "_id": "$userId",
            "mood_count": {"$sum": 1},
            "high_risk_count": {
                "$sum": {"$cond": [{"$eq": ["$risk_level", "High Risk"]}, 1, 0]}
            }
        }},
        {"$match": {
            "$expr": {"$gte": [{"$divide": ["$high_risk_count", "$mood_count"]}, 0.5]}
        }}
    ]
    
    alerts = list(moods_collection.aggregate(pipeline))
    
    for alert in alerts:
        send_caregiver_alert(alert)
    
    logger.info(f" Sent {len(alerts)} alerts")
    return len(alerts)

def send_caregiver_alert(alert):
    """Mock email alert (replace with SendGrid later)"""
    risk_ratio = round((alert["high_risk_count"] / alert["mood_count"]) * 100, 1)
    logger.warning(f"""
            HIGH RISK ALERT!
User ID: {alert['_id']}
Risk Ratio: {risk_ratio}%
Moods Analyzed: {alert['mood_count']}
Caregiver: {CAREGIVER_EMAIL}
    """)

if __name__ == "__main__":
    check_daily_alerts()
