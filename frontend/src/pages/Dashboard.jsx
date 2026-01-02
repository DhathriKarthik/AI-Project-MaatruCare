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
const loadJournalEntries = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/journals", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setJournalEntries(data);
  } catch (err) {
    console.error("Error loading journals", err);
  }
};

const handleMoodSaved = (moodLabel) => {
  console.log('🎉 Emoji saved:', moodLabel);
  loadJournalEntries();  // REFRESH list instantly
};

const loadHappyMoments = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/happymoments", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    
    const transformedData = data.map((m) => ({
      id: m._id,
      date: m.datetime ? new Date(m.datetime).toLocaleDateString() : "",
      text: m.text,
    }));
    
    setHappyMoments(transformedData);
  } catch (err) {
    console.error("Failed to load happy moments", err);
  }
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

const handleAddJournalEntry = async (entry) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/journals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: entry }),
    });

    const newEntry = await res.json();
    setJournalEntries((prev) => [newEntry, ...prev]);
  } catch (err) {
    console.error("Error adding journal", err);
  }
};

const handleAddMoodEntry = async (moodLabel) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/journals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        content: moodLabel,  // "Very Bad"
        entryDateTime: new Date().toISOString()
      }),
    });

    const newEntry = await res.json();
    // INSTANT ADD like text journals
    setJournalEntries(prev => [newEntry, ...prev]);
    console.log('Mood entry added:', newEntry.content);  // "Very Bad"
  } catch (err) {
    console.error("Error adding mood", err);
  }
};

  const handleAddHappyMoment = async (moment) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/happymoments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: moment }),  
    });

    const newMoment = await res.json();
    const transformedMoment = {
      id: newMoment._id,
      date: new Date(newMoment.datetime).toLocaleDateString(),
      text: newMoment.text,
    };
    
    setHappyMoments((prev)=>[transformedMoment, ...prev]);
  } catch (err) {
    console.error("Failed to add happy moment", err);
  }
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
            onClick={() => navigate('/doctors-team')}
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
                onMoodSaved={handleMoodSaved} 
              />
            </div>
          </div>

          <div className="dashboard-right">
            <div className="dashboard-card">
              <h2>Daily Journal</h2>
              <JournalSection
              entries={journalEntries.map((j) => ({
                id: j._id,
                date: j.entryDateTime
                  ? new Date(j.entryDateTime).toLocaleDateString()
                  : "",                      // avoid Invalid Date
                text: j.content,
              }))}
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
