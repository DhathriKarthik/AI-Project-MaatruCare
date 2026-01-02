import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaPen, FaUserMd, FaHospital, FaRupeeSign, 
  FaLanguage, FaGraduationCap, FaClock, FaMapMarkerAlt, FaStar
} from 'react-icons/fa';
import './DoctorProfileView.css';

const DoctorProfileView = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data on Load ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const res = await axios.get('http://localhost:5000/api/doctor/me', config);
        setDoctor(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile", err);
        // If no profile, redirect to setup
        if (err.response && (err.response.status === 400 || err.response.status === 404)) {
            navigate('/doctor-profile-setup');
        } else {
            setLoading(false); // Show error state
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="loading-screen">Loading Profile...</div>;
  if (!doctor) return <div className="error-screen">Failed to load profile data.</div>;

  // Helper to safely get data
  const pInfo = doctor.personalInfo || {};
  const cInfo = doctor.clinicInfo || {};
  const stats = doctor.stats || {};

  return (
    <div className="doc-profile-view-container">
      
      {/* --- 1. RED HEADER (Matches image_7.png) --- */}
      <div className="view-header-red">
        <button className="header-back-btn" onClick={() => navigate('/doctor-dashboard')}>
          <FaArrowLeft />
        </button>
        <h1>My Profile</h1>
        <button className="header-edit-btn" onClick={() => navigate('/doctor-profile-setup')}>
          <FaPen /> Edit
        </button>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div className="profile-cards-grid">

        {/* CARD 1: PROFESSIONAL DETAILS */}
        <div className="profile-card">
          <div className="card-header">
            <FaUserMd className="card-header-icon" />
            <h3>Professional Details</h3>
          </div>
          
          <div className="data-group">
            <label>Full Name</label>
            <p className="data-value">{pInfo.name}</p>
          </div>
          <div className="data-group">
            <label>Specialty</label>
            <p className="data-value highlight-text">{pInfo.specialty}</p>
          </div>
           <div className="data-group two-col">
             <div>
                <label>Experience</label>
                <p className="data-value">{pInfo.experience || 'N/A'}</p>
             </div>
             <div>
                <label>Reg. Number</label>
                <p className="data-value">{pInfo.regNumber || 'N/A'}</p>
             </div>
          </div>
          <div className="data-group" style={{marginTop: '15px'}}>
             <label><FaGraduationCap/> Education</label>
             <p className="data-value small">{pInfo.education}</p>
          </div>
           <div className="data-group">
             <label><FaLanguage/> Languages Spoken</label>
             <p className="data-value small">{pInfo.languages ? pInfo.languages.join(", ") : 'N/A'}</p>
          </div>
        </div>

        {/* CARD 2: CLINIC & AVAILABILITY */}
        <div className="profile-card">
           <div className="card-header">
            <FaHospital className="card-header-icon" />
            <h3>Clinic & Timings</h3>
          </div>

           <div className="data-group">
            <label>Clinic Name</label>
            <p className="data-value">{cInfo.name || 'N/A'}</p>
          </div>

          <div className="clinic-address-box">
            <FaMapMarkerAlt className="pin-icon"/>
            <p>{cInfo.address || 'No address provided.'}</p>
          </div>
        </div>

        {/* CARD 3: FEES & STATS */}
        <div className="profile-card">
           <div className="card-header">
            <FaRupeeSign className="card-header-icon" />
            <h3>Fees & Overview</h3>
          </div>

           <div className="data-group">
            <label>Consultation Fee</label>
            <p className="data-value fee-large">₹ {cInfo.fee || '0'}</p>
          </div>

          <div className="stats-divider"></div>

          <div className="data-group two-col stats-row">
             <div>
                <label>Patients Served</label>
                <p className="data-value stat-num">{stats.patientsServed || 0}+</p>
             </div>
             <div>
                <label>Rating</label>
                 <p className="data-value rating-badge">
                    <FaStar className="star-gold"/> {stats.rating || 4.5}
                 </p>
             </div>
          </div>
          
           <div className="data-group" style={{marginTop: '20px'}}>
             <label>About Me</label>
             <p className="about-text">{pInfo.about || 'No bio added yet.'}</p>
          </div>
        </div>

      </div>

      {/* --- 3. FOOTER QUOTE BANNER --- */}
      <div className="quote-banner-pink">
        <p>"Wherever the art of Medicine is loved, there is also a love of Humanity."</p>
        <span className="quote-author">— HIPPOCRATES</span>
      </div>

    </div>
  );
};

export default DoctorProfileView;