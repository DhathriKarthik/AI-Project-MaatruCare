import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {FaArrowLeft} from 'react-icons/fa';
import './ProfileSetup.css'; 

const ProfileSetup = () => {
  const navigate = useNavigate();
  const[Loading,setLoading] = useState(true);
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

        // Helper to format date for HTML input (needs YYYY-MM-DD)
        const formatDate = (dateString) => {
          if (!dateString) return "";
          return new Date(dateString).toISOString().split("T")[0];
        };

        // Merge existing data into form
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
      
      // We use POST because our backend handles both Create & Update
      await axios.post("http://localhost:5000/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Profile Saved Successfully!");
      navigate("/profile-view"); // Go to the View page after saving
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      
      <div className="profile-form-section">
        <div className="form-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button 
            onClick={() => navigate('/profile-view')} 
            className="btn-back"
            title="Back to Dashboard"
          >
            <FaArrowLeft />
          </button>
          <h1 className='name' style={{alignItems:'center'}}>मातृCare</h1>
          </div>
          <h2 className='head' style={{color: '#fb6f6d' }}>Complete Your Profile</h2>
          <p>Help us personalize your care journey by providing these details.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
         
          <h3 className="section-title">Personal Details</h3>
          <div className="input-grid">
            <div className="profile-input-group">
              <label>Full Name</label>
              <input type="text" name="fullName" className="profile-input" placeholder="e.g. Sarah Jenkins" onChange={handleChange} required />
            </div>
            <div className="profile-input-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="profile-input" placeholder="+91 98765 00000" onChange={handleChange} required />
            </div>
            <div className="profile-input-group">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" className="profile-input" onChange={handleChange} required />
            </div>
             <div className="profile-input-group">
              <label>Blood Group</label>
              <select name="bloodGroup" className="profile-input" onChange={handleChange}>
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
              <input type="date" name="dueDate" className="profile-input" onChange={handleChange} required />
            </div>
             <div className="profile-input-group">
              <label>Any Medical Conditions?</label>
              <input type="text" name="medicalHistory" className="profile-input" placeholder="Thyroid, Diabetes, etc. (Optional)" onChange={handleChange} />
            </div>
          </div>

          
          <h3 className="section-title">Husband / Partner Details</h3>
          <div className="input-grid">
            <div className="profile-input-group">
              <label>Husband's Name</label>
              <input type="text" name="husbandName" className="profile-input" onChange={handleChange} required />
            </div>
            <div className="profile-input-group">
              <label>Occupation</label>
              <input type="text" name="husbandOccupation" className="profile-input" onChange={handleChange} />
            </div>
            <div className="profile-input-group">
              <label>Phone Number</label>
              <input type="tel" name="husbandPhone" className="profile-input" onChange={handleChange} required />
            </div>
            <div className="profile-input-group">
              <label>Email ID</label>
              <input type="email" name="husbandEmail" className="profile-input" onChange={handleChange} />
            </div>
          </div>

         
          <h3 className="section-title">Guardian Details (Optional)</h3>
          <div className="input-grid">
            <div className="profile-input-group">
              <label>Guardian Name</label>
              <input type="text" name="guardianName" className="profile-input" onChange={handleChange} />
            </div>
            <div className="profile-input-group">
              <label>Relation</label>
              <input type="text" name="guardianRelation" className="profile-input" placeholder="e.g. Mother, Sister" onChange={handleChange} />
            </div>
            <div className="profile-input-group">
              <label>Phone Number</label>
              <input type="tel" name="guardianPhone" className="profile-input" onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn-save">Save Profile & Continue</button>

        </form>
      </div>

      
      <div className="profile-quote-section">
        <div className="quote-card">
          <p className="quote-text">
            "To the world you may be one person, but to one person you may be the world"
          </p>
          <span className="quote-author">— Dr. Seuss</span>
        </div>
        
       
        <div style={{marginTop: '2rem', opacity: 0.8}}>
           <small style={{color: '#881337'}}>Building your safe space...Always for मातृCare</small>
        </div>
      </div>

    </div>
  );
};

export default ProfileSetup;