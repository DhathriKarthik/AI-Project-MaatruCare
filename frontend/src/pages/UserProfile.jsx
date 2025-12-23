import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";
import {
  FaUserEdit,
  FaBaby,
  FaNotesMedical,
  FaUserFriends,
  FaArrowLeft,
  FaPhoneAlt,
  FaFileAlt
} from "react-icons/fa";

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.isNewProfile) {
          setProfile(null);
        } else {
          setProfile(res.data);
        }
      } catch (err) {
        console.error(err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !profile) {
      navigate("/profile-setup");
    }
  }, [loading, profile, navigate]);

  if (!profile) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not Provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard-container">
    <header className="dashboard-header">
      
      <button
        onClick={() => navigate("/dashboard")}
        className="btn-back"
        title="Back to Dashboard"
      >
        <FaArrowLeft />
      </button>

      <h1 className="header-title" style={{color:'white'}}>
        My Profile
      </h1>

      <button 
      className="btn-pill"
      onClick={() => navigate("/reports")} 
    >
      <FaFileAlt style={{ marginRight: "6px" }} /> My Report
    </button>

      <button
        className="btn-edit"
        onClick={() => navigate("/profile-setup")}
      >
        <FaUserEdit style={{ marginRight: "8px" }} /> Edit
      </button>

    </header>

     
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))" }}
      >
        
        <div className="feature-box profile-card">
          <div className="card-header-row">
            <div className="icon-circle">
              <FaNotesMedical />
            </div>
            <h3>Personal Details</h3>
          </div>

          <div className="detail-list">
            <div className="detail-item">
              <span className="label">Full Name</span>
              <span className="value">{profile.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Date of Birth</span>
              <span className="value">{formatDate(profile.dateOfBirth)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Blood Group</span>
              <span className="value badge">{profile.bloodGroup || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Phone</span>
              <span className="value">{profile.phone || "-"}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: PREGNANCY JOURNEY (Highlighted) */}
        <div className="feature-box profile-card highlight">
          <div className="card-header-row">
            <div className="icon-circle pink">
              <FaBaby />
            </div>
            <h3>Pregnancy Journey</h3>
          </div>

          <div className="edd-display">
            <span className="edd-label">Expected Due Date</span>
            <span className="edd-value">{formatDate(profile.dueDate)}</span>
          </div>

          <div className="medical-note">
            <strong>Medical Conditions:</strong>
            <p>{profile.medicalHistory || "No conditions listed."}</p>
          </div>
        </div>

        {/* CARD 3: SUPPORT SYSTEM */}
        <div className="feature-box profile-card">
          <div className="card-header-row">
            <div className="icon-circle">
              <FaUserFriends />
            </div>
            <h3>Support System</h3>
          </div>

          <div className="support-section">
            <h4>Husband / Partner</h4>
            <p className="support-name">
              {profile.husbandName || "Not listed"}
            </p>
            <div className="contact-row">
              <FaPhoneAlt size={12} /> {profile.husbandPhone || "-"}
            </div>
            {profile.husbandOccupation && (
              <div className="sub-text">{profile.husbandOccupation}</div>
            )}
          </div>

          {profile.guardianName && (
            <div
              className="support-section"
              style={{
                marginTop: "1rem",
                borderTop: "1px solid #eee",
                paddingTop: "1rem",
              }}
            >
              <h4>Guardian ({profile.guardianRelation})</h4>
              <p className="support-name">{profile.guardianName}</p>
              <div className="contact-row">
                <FaPhoneAlt size={12} /> {profile.guardianPhone}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="full-width-quote-wrapper">
        <div className="quote-center-box">
          <div className="motivational-quote-extra">
            <div className="quote-content">
              <p className="quote-text">
                "Pregnancy is a process that invites you to surrender to the unseen force behind all life."
              </p>
              <p className="quote-author" style={{color:'#BE123C'}}>— Judy Ford</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
