# MaatruCare_ML/test_moods.py
from moodanalysis import analyzer

# Maternal health journal samples
test_journals = [
    "im so scared about delivery baby not moving much today",
    "feeling tired but baby kicks strong, happy today",
    "hospital bills stressing me out, cant sleep at night",
    "third trimester normal? feeling moderate anxiety"
]

print("🧠 MaatruCare Mood Analysis Results\n")
for journal in test_journals:
    result = analyzer.getMoodAnalysisResult(journal)
    print(f"📝 '{result['original_text']}'")
    print(f"🎯 Risk: {result['risk_level']} | Stars: {result['sentiment_label']} ({result['sentiment_score']})")
    print(f"🚨 Alert: {result['needs_alert']}\n")
