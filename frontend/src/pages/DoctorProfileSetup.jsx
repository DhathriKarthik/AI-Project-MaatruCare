import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'; // Added FaCheckCircle
import './DoctorProfileSetup.css'; 
import axios from 'axios';

const DoctorProfileSetup = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false); // Controls the Popup
  const [initialData, setInitialData] = useState(null);
  // Form State
  const [formData, setFormData] = useState({
    name: '', 
    phone: '',
    specialty: '',
    experience: '',
    regNumber: '',
    education: '',
    about: '',
    clinicName: '',
    clinicAddress: '',
    fee: '',
  });

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // If no token, user isn't logged in

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Get the existing profile
        const res = await axios.get('http://localhost:5000/api/doctor/me', config);
        const profile = res.data;

        // If profile exists, fill the form with that data
        if (profile) {
          setFormData({
            name: profile.personalInfo?.name || '',
            phone: profile.personalInfo?.phone || '', 
            specialty: profile.personalInfo?.specialty || '',
            image: profile.personalInfo?.image || '',
            about: profile.personalInfo?.about || '',
            experience: profile.personalInfo?.experience || '',
            education: profile.personalInfo?.education || '',
            regNumber: profile.personalInfo?.regNumber || '',
            languages: profile.personalInfo?.languages ? profile.personalInfo.languages.join(', ') : '',
         
            clinicName: profile.clinicInfo?.name || '',
            clinicAddress: profile.clinicInfo?.address || '',
            fee: profile.clinicInfo?.fee || ''
          });
          setFormData(profileData);
          setInitialData(profileData);
        }
      } catch (err) {
        if (err.response && err.response.status !== 400 && err.response.status !== 404) {
          console.error("Error fetching profile for edit:", err);
        }
      }
    };

    fetchCurrentProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (initialData && JSON.stringify(formData) === JSON.stringify(initialData)) {
      alert("No changes detected. Please edit your profile before saving.");
      return; // STOP HERE
    }

    try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    };

    //Send the form data to your new POST route
    await axios.post('http://localhost:5000/api/doctor', formData, config);
    setShowSuccess(true); 

  } catch (err) {
    console.error("Error saving profile:", err.response?.data || err.message);
    alert("Failed to save profile. Please check your connection.");
  }
};

  const handleFinalContinue = () => {
    navigate('/doctor-profile-view');
  };


  return (
    <div className="setup-page-container">
      
      {/* HEADER */}
      <div className="setup-header">
        <button className="back-icon-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>Complete your Profile</h1>
      </div>

      <p className="setup-subtext">
        Help us personalize your care journey by providing these details.
      </p>

      {/* FORM CARD */}
      <div className="setup-card">
        <form onSubmit={handleSubmit}>
          
          {/* PERSONAL DETAILS */}
          <h3 className="section-title">Personal Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>FULL NAME</label>
              <input type="text" name="name" placeholder="Dr. Tanuja A M"
              value={formData.name} onChange={handleChange} className="maatru-input"/>
            </div>
            <div className="form-group">
              <label>PHONE NUMBER</label>
              <input type="text" name="phone"  value={formData.phone}
              placeholder="+91 98562486251" onChange={handleChange} className="maatru-input"/>
            </div>
          </div>
          
          <div className="form-group full-width">
             <label>ABOUT YOU (BIO)</label>
             <textarea name="about" value={formData.about}
             placeholder="Briefly describe your expertise..." onChange={handleChange} className="maatru-input textarea-input" rows="3"/>
          </div>

          {/* PROFESSIONAL INFO */}
          <h3 className="section-title">Professional Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label>SPECIALTY</label>
              <select name="specialty" value={formData.specialty} onChange={handleChange} className="maatru-input">
                <option value="">Select Specialty</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Therapist">Therapist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="General Physician">General Physician</option>
              </select>
            </div>
            <div className="form-group">
              <label>EXPERIENCE (YEARS)</label>
              <input type="number" name="experience" value={formData.experience}
              placeholder="e.g. 12" onChange={handleChange} className="maatru-input"/>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>REGISTRATION NUMBER</label>
              <input type="text" name="regNumber"value={formData.regNumber}
               placeholder="Medical Council Reg No." onChange={handleChange} className="maatru-input"/>
            </div>
            <div className="form-group">
              <label>EDUCATION</label>
              <input type="text" name="education" value={formData.education}
              placeholder="e.g. MBBS, MD (OBG)" onChange={handleChange} className="maatru-input"/>
            </div>
          </div>

            <div className="form-row">
            <div className="form-group">
              <label>Languages Known</label>
              <input type="text" name="languages" value={formData.languages}
              placeholder="e.g.English,Hindi" onChange={handleChange} className="maatru-input"/>
            </div>
          </div>
          

          {/* CLINIC DETAILS */}
          <h3 className="section-title">Clinic & Availability</h3>
          <div className="form-row">
            <div className="form-group">
              <label>CLINIC NAME</label>
              <input type="text" name="clinicName" value={formData.clinicName}
               placeholder="e.g. Maatrucare Clinic" onChange={handleChange} className="maatru-input"/>
            </div>
            <div className="form-group">
              <label>CONSULTATION FEE (₹)</label>
              <input type="number" name="fee" value={formData.fee}
              placeholder="600" onChange={handleChange} className="maatru-input"/>
            </div>
          </div>

          <div className="form-group full-width">
            <label>CLINIC ADDRESS</label>
            <input type="text" name="clinicAddress" value={formData.clinicAddress}
            placeholder="Full address with city..." onChange={handleChange} className="maatru-input"/>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-profile-btn" >
              Save & Continue 
            </button>
          </div>

        </form>
      </div>

      {/* --- SUCCESS POPUP MODAL --- */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon-wrapper">
              <FaCheckCircle />
            </div>
            <h2>Profile Completed!</h2>
            <p>Your details have been saved successfully. You are now ready to accept patients.</p>
            <button className="modal-continue-btn" onClick={handleFinalContinue}>
              Go to Profile Page
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorProfileSetup;