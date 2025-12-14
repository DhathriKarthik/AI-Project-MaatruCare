import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import MoodTrendChart from '../components/MoodTrendChart';
import MoodInput from '../components/MoodInput';
import JournalSection from '../components/JournalSection';
import HappyMoments from '../components/HappyMoments';
import NotificationsPanel from '../components/NotificationsPanel';
import MotivationalQuote from '../components/MotivationalQuote';

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  navigate('/login');
};

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const [moodData, setMoodData] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [happyMoments, setHappyMoments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    loadMoodData();
    loadJournalEntries();
    loadHappyMoments();
    loadNotifications();
  }, [timeRange]);

  const loadMoodData = () => {
    const mockData = generateMoodData(timeRange);
    setMoodData(mockData);
  };

  const loadJournalEntries = () => {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    setJournalEntries(entries);
  };

  const loadHappyMoments = () => {
    const moments = JSON.parse(localStorage.getItem('happyMoments') || '[]');
    setHappyMoments(moments);
  };

  const loadNotifications = () => {
    const notif = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(notif);
  };

  const generateMoodData = (range) => {
    const moods = [1, 2, 3, 4, 5];
    const labels = range === 'day' ? Array.from({length: 24}, (_, i) => `${i}:00`) 
                 : range === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                 : Array.from({length: 30}, (_, i) => `Day ${i + 1}`);
    
    return labels.map((label, idx) => ({
      label,
      mood: moods[Math.floor(Math.random() * moods.length)]
    }));
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleAddJournalEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      text: entry
    };
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('journalEntries', JSON.stringify(updated));
  };

  const handleAddHappyMoment = (moment) => {
    const newMoment = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      description: moment
    };
    const updated = [newMoment, ...happyMoments];
    setHappyMoments(updated);
    localStorage.setItem('happyMoments', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
  <div className="dashboard-wrapper">
    <div className="dashboard-top-bar">
      <div className="top-bar-left">
        <h1 className="app-title">मातृCare</h1>
      </div>

      <div className="header-actions">
        <button
          className="feature-box"
          title="My Profile"
          onClick={() => navigate('/profile-view')}
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