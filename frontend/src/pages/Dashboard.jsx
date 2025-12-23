import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";
import { CgProfile } from "react-icons/cg";
import { IoMdLogOut } from "react-icons/io";
import MoodTrendChart from "../components/MoodTrendChart";
import MoodInput from "../components/MoodInput";
import JournalSection from "../components/JournalSection";
import HappyMoments from "../components/HappyMoments";
import NotificationsPanel from "../components/NotificationsPanel";
import MotivationalQuote from "../components/MotivationalQuote";
import ChatSidebar from "../components/ChatSidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const [profileRoute, setProfileRoute] = useState("/profile-setup");
  const [moodData, setMoodData] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [happyMoments, setHappyMoments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.isNewProfile) {
          setProfileRoute("/profile-setup");
        } else {
          setProfileRoute("/profile-view");
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };

    checkProfileStatus();
  }, []);

  useEffect(() => {
    loadMoodData();
    loadJournalEntries();
    loadHappyMoments();
    loadNotifications();
  }, [timeRange]);

  const loadMoodData = () => {
    /* ... */
  };
  const loadJournalEntries = () => {
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    setJournalEntries(entries);
  };
  const loadHappyMoments = () => {
    const moments = JSON.parse(localStorage.getItem("happyMoments") || "[]");
    setHappyMoments(moments);
  };
  const loadNotifications = () => {
    /* ... */
  };
  const generateMoodData = (range) => {
    /* ... */
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleAddJournalEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      text: entry,
    };
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem("journalEntries", JSON.stringify(updated));
  };

  const handleAddHappyMoment = (moment) => {
    const newMoment = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      description: moment,
    };
    const updated = [newMoment, ...happyMoments];
    setHappyMoments(updated);
    localStorage.setItem("happyMoments", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-top-bar">
        <div className="top-bar-left">
          <img src="/love.png" alt="Logo Icon" className="app-logo-icon" />
          <h1 className="app-title">मातृCare</h1>
        </div>

        <div className="header-actions">
           <button
            className="feature-box profile"
            
            onClick={() => navigate(profileRoute)}
          >
            <CgProfile />
            Profile
          </button>

          <button
            className="feature-box"
            onClick={() => navigate(profileRoute)}
          >
            <CgProfile />
            Doctors team
          </button>

          <button onClick={handleLogout} className="logout-btn">
            <IoMdLogOut />
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <header className="dashboard-header-extra">
          <h2 style={{ marginLeft: "100px" }}>
            Track your emotions and celebrate your journey
          </h2>
        </header>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-left">
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
            <div className="dashboard-card">
              <MotivationalQuote />
            </div>
            <div className="dashboard-card">
              <h2>How is your today?</h2>
              <MoodInput
                onMoodSelect={handleMoodSelect}
                selectedMood={selectedMood}
              />
            </div>
          </div>

          <div className="dashboard-right">
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
      <ChatSidebar />
    </div>
  );
};

export default Dashboard;
