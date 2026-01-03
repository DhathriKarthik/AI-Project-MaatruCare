# MaatruCare_ML/moodanalysis.py
from transformers import pipeline
import torch
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MoodAnalyzer:
    def __init__(self):
        """Initialize grammar corrector and sentiment pipeline"""
        logger.info("Loading mood analyzer pipelines...")
        self.corrector = pipeline(
            "text2text-generation", 
            model="prithivida/grammar_error_correcter_v1"
        )
        self.sentiment = pipeline(
            "text-classification", 
            model="nlptown/bert-base-multilingual-uncased-sentiment"
        )
        logger.info(" Mood analyzer ready!")
    
    def getMoodAnalysisResult(self, text: str):
        """Analyze maternal journal → Risk level"""
        try:
            # Grammar correction
            corrected = self.corrector(text)[0]['generated_text']
            
            # Sentiment analysis
            res = self.sentiment(corrected)[0]
            label = res['label']
            score = res['score']
            
            # Your exact risk logic 
            if label in ('1 star', '2 stars') or (label == '3 stars' and score <= 0.4):
                mood = 'High Risk'
            elif label == '3 stars' and score > 0.4:
                mood = 'Moderate Risk'
            elif label == '4 stars' and score < 0.4:
                mood = 'Low Risk'
            else:
                mood = 'Normal'
            
            return {
                'risk_level': mood,
                'sentiment_label': label,
                'sentiment_score': round(score, 3),
                'corrected_text': corrected,
                'original_text': text[:100] + "..." if len(text) > 100 else text,
                'timestamp': datetime.now(),  # Return datetime object instead of ISO string
                'needs_alert': mood in ['High Risk', 'Moderate Risk']
            }
        except Exception as e:
            logger.error(f"Mood analysis failed: {e}")
            return {'risk_level': 'Error', 'error': str(e)}

# Global instance (fast startup)
analyzer = MoodAnalyzer()
