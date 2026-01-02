import React, { useState } from 'react';

const MoodInput = ({ onMoodSelect, selectedMood, onMoodSaved }) => {
  const moods = [
    { emoji: '😢', label: 'Very Bad', value: 1, color: '#FF6B6B' },
    { emoji: '😞', label: 'Bad', value: 2, color: '#FFA500' },
    { emoji: '😐', label: 'Okay', value: 3, color: '#FFD93D' },
    { emoji: '🙂', label: 'Good', value: 4, color: '#6BCB77' },
    { emoji: '😄', label: 'Excellent', value: 5, color: '#4D96FF' }
  ];

  // Rich descriptions for accurate analysis
  const moodTexts = {
    1: "I feel very bad and hopeless today ",
    2: "I feel bad and anxious today ", 
    3: "I feel neutral and okay today ",
    4: "I feel good and happy today ",
    5: "I feel excellent and joyful today "
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    const moodObj = moods.find(m => m.value === selectedMood);
    const moodLabel = moodObj?.label || '';
    const moodEmoji = moodObj?.emoji || '😢';
    const journalText = moodTexts[selectedMood] || moodLabel;
    
    const payload = {
      entryDateTime: new Date().toISOString(),
      content: journalText,
      userId: localStorage.getItem('userId') || 'current-user'
    };
    
    console.log('Emoji payload:', payload);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Journal save failed:', error);
        alert(` Save failed: ${error.message}`);
        return;
      }
      
      const savedJournal = await res.json();
      console.log('✅ Journal saved:', savedJournal);
 
      // KEEP YOUR EXISTING ALERT + ADD REFRESH
      alert(`${moodEmoji} ${moodLabel} saved!`);  // Your alert ✅
      onMoodSaved?.(moodLabel);  // INSTANT journal list update
      onMoodSelect(null);  // Reset
    } catch (err) {
      console.error('Network error:', err);
      alert(' Network error - please try again');
    }
  };

  return (
    <div className="mood-input-container">
      <div className="mood-emojis">
        {moods.map((mood) => (
          <button
            key={mood.value}
            className={`mood-emoji-btn ${selectedMood === mood.value ? 'selected' : ''}`}
            onClick={() => onMoodSelect(mood.value)}
            style={{
              borderColor: selectedMood === mood.value ? mood.color : '#ddd',
              backgroundColor: selectedMood === mood.value ? mood.color + '20' : 'transparent'
            }}
            title={mood.label}
          >
            <span className="emoji-large">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>
      <button 
        className="save-mood-btn"
        onClick={handleSubmit}
        disabled={!selectedMood}
      >
        Save Mood
      </button>
    </div>
  );
};

export default MoodInput;
