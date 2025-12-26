import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import MoodInput from './components/MoodInput';
import JournalSection from './components/JournalSection';
import HappyMoments from './components/HappyMoments';
import MotivationalQuote from './components/MotivationalQuote';
import { text } from 'stream/consumers';

const Dashboard = () => {
  const navigate = useNavigate();

  const [journalEntries, setJournalEntries] = useState([]);
  const [happyMoments, setHappyMoments] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    loadJournalEntries();
    loadHappyMoments();
  }, []);

  const loadJournalEntries = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/journals", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setJournalEntries(data);
    } catch (err) {
      console.error("Error loading journals", err);
    }
  };

  const loadHappyMoments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/happymoments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setHappyMoments(data);
    } catch (err) {
      console.error("Failed to load happy moments", err);
    }
  };

  const handleAddJournalEntry = async (entry) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: entry })
      });

      const newEntry = await res.json();
      setJournalEntries([newEntry, ...journalEntries]);
    } catch (err) {
      console.error("Error adding journal", err);
    }
  };

  const handleAddHappyMoment = async (moment) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/happymoments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: moment })
      });

      const newMoment = await res.json();
      setHappyMoments([newMoment, ...happyMoments]);
    } catch (err) {
      console.error("Failed to add happy moment", err);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
  <div className="dashboard-wrapper">
    {/* Top bar: app title, role, profile feature box and logout */}
    <div className="dashboard-top-bar">
      <div className="top-bar-left">
        <h1 className="app-title">मातृCare</h1>
      </div>

      <div className="header-actions">
        <button
          className="feature-box"
          title="Go to profile"
        >
          <div className="feature-label">Profile</div>
        </button>

        <button
          onClick={handleLogout}
          className="logout-btn"
          title="Logout"
        >
          Logout
        </button>
      </div>
    </div>

    {/* Main Dashboard Container */}
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Track your emotions and celebrate your journey</h2>
      </header>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Happy Moments */}
          <div className="dashboard-card">
            <h2>Happy Moments</h2>
            <HappyMoments 
              moments={happyMoments}
              onAddMoment={handleAddHappyMoment}
            />
          </div>

        </div>

        {/* Middle Column */}
        <div className="dashboard-middle">
          {/* Motivational Quote */}
          <div className="dashboard-card">
            <MotivationalQuote />
          </div>
          {/* Daily Mood Input */}
          <div className="dashboard-card">
            <h2>How is your today?</h2>
            <MoodInput onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />
            
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Journal Section */}
          <div className="dashboard-card">
            <h2>Daily Journal</h2>
            <JournalSection 
              entries={journalEntries}
              onAddEntry={handleAddJournalEntry}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
export default Dashboard;