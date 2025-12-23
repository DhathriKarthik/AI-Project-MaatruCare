import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import './ProfileSetup.css'; 

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    bloodGroup: '',
    phone: '',
    dueDate: '',
    husbandName: '',
    husbandPhone: '',
    husbandEmail: '',
    husbandOccupation: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    medicalHistory: '',
  });

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

        const formatDate = (dateString) => {
          if (!dateString) return "";
          return new Date(dateString).toISOString().split("T")[0];
        };

        setFormData((prev) => ({
          ...prev,
          ...res.data,
          dateOfBirth: formatDate(res.data.dateOfBirth),
          dueDate: formatDate(res.data.dueDate),
        }));

        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile", err);
        if (err.response?.status === 401) navigate("/login");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Profile Saved Successfully!");
      navigate("/profile-view");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="profile-setup-page">
      <header className="dashboard-header">
        <button
          onClick={() => navigate('/profile-view')}
          className="btn-back"
          title="Back to Profile"
        >
          <FaArrowLeft />
        </button>
        <h1 className="header-title"  style={{color:'white'}}>Complete your Profile</h1>
      </header>

      <div className="setup-content-wrapper">
        <div className="setup-subtitle">
          <p>Help us personalize your care journey by providing these details.</p>
        </div>

        <div className="form-card">
          <form id="setup-form" onSubmit={handleSubmit}>
            
            <h3 className="section-title">Personal Details</h3>
            <div className="input-grid">
              <div className="profile-input-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} className="profile-input" placeholder="e.g. Sarah Jenkins" onChange={handleChange} required />
              </div>
              <div className="profile-input-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} className="profile-input" placeholder="+91 98765 00000" onChange={handleChange} required />
              </div>
              <div className="profile-input-group">
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} className="profile-input" onChange={handleChange} required />
              </div>
              <div className="profile-input-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} className="profile-input" onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="O+">O+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="A-">A-</option>
                  <option value="O-">O-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

        
            <h3 className="section-title">Pregnancy Details</h3>
            <div className="input-grid">
              <div className="profile-input-group">
                <label>Expected Due Date (EDD)</label>
                <input type="date" name="dueDate" value={formData.dueDate} className="profile-input" onChange={handleChange} required />
              </div>
              <div className="profile-input-group">
                <label>Any Medical Conditions?</label>
                <input type="text" name="medicalHistory" value={formData.medicalHistory} className="profile-input" placeholder="Thyroid, Diabetes, etc. (Optional)" onChange={handleChange} />
              </div>
            </div>

      
            <h3 className="section-title">Husband / Partner Details</h3>
            <div className="input-grid">
              <div className="profile-input-group">
                <label>Husband's Name</label>
                <input type="text" name="husbandName" value={formData.husbandName} className="profile-input" onChange={handleChange} required />
              </div>
              <div className="profile-input-group">
                <label>Occupation</label>
                <input type="text" name="husbandOccupation" value={formData.husbandOccupation} className="profile-input" onChange={handleChange} />
              </div>
              <div className="profile-input-group">
                <label>Phone Number</label>
                <input type="tel" name="husbandPhone" value={formData.husbandPhone} className="profile-input" onChange={handleChange} required />
              </div>
              <div className="profile-input-group">
                <label>Email ID</label>
                <input type="email" name="husbandEmail" value={formData.husbandEmail} className="profile-input" onChange={handleChange} />
              </div>
            </div>

          
            <h3 className="section-title">Guardian Details (Optional)</h3>
            <div className="input-grid">
              <div className="profile-input-group">
                <label>Guardian Name</label>
                <input type="text" name="guardianName" value={formData.guardianName} className="profile-input" onChange={handleChange} />
              </div>
              <div className="profile-input-group">
                <label>Relation</label>
                <input type="text" name="guardianRelation" value={formData.guardianRelation} className="profile-input" placeholder="e.g. Mother, Sister" onChange={handleChange} />
              </div>
              <div className="profile-input-group">
                <label>Phone Number</label>
                <input type="tel" name="guardianPhone" value={formData.guardianPhone} className="profile-input" onChange={handleChange} />
              </div>
            </div>

        
            <button type="submit" className="btn-save-bottom">Save Profile & Continue</button>

          </form>
        </div>


        <div className="quote-footer">
          <p>
            "To the world you may be one person, but to one person you may be the world"
            <br />
            <span className="quote-author">— Dr. Seuss</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ProfileSetup;