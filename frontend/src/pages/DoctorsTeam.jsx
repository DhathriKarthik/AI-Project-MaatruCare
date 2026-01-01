import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaCheckCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';
import axios from 'axios';
import './DoctorsTeam.css';
import SwitchDoctorModal from '../components/SwitchDoctorModal';

const DoctorsTeam = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1); 
  const [activeTab, setActiveTab] = useState('All'); 
  const [selectedDoctor, setSelectedDoctor] = useState(null); 
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const staticDoctor = {
    id: 'static-muskan-001', // Unique ID
    name: 'Dr. Muskan',
    specialty: 'Gynecologist',
    email: 'muskanfayaz48@gmail.com',
    phone: '+91 9535931452', // Valid looking format
    image: 'https://randomuser.me/api/portraits/women/32.jpg', // Professional ID photo
    isVerified: true, 
    location: 'Mysuru, Karnataka'
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.selectedDoctor) {
        setSelectedDoctor(res.data.selectedDoctor);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  
  const fetchDoctors = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      // USE "seed" TO GET CONSISTENT DATA
      const response = await fetch(`https://randomuser.me/api/?results=8&nat=in&seed=maatrucare&page=${pageNum}`);
      const data = await response.json();
      
      const newDoctors = data.results.map((user, index) => ({
        id: user.login.uuid, 
        name: `Dr. ${user.name.first} ${user.name.last}`,
        specialty: (doctors.length + index) % 2 === 0 ? 'Gynecologist' : 'Therapist',
        email: user.email,
        phone: user.phone,
        image: user.picture.large,
        isVerified: Math.random() > 0.3, 
        location: `${user.location.city}, ${user.location.state}`
      }));
      
      if (pageNum === 1) {
       setDoctors([staticDoctor, ...newDoctors]);
      } else {
        setDoctors(prev => [...prev, ...newDoctors]);
      }

      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchProfile();
    fetchDoctors(1);
  }, []);

  // --- ACTIONS ---
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDoctors(nextPage);
  };

  const handleSelectDoctor = async (doctor) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/user/select-doctor', 
        { doctor }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedDoctor(res.data.selectedDoctor);
    } catch (err) {
      alert("Failed to select doctor");
    }
  };

  const confirmRemoveDoctor = async ({ reason: reasonText, informed }) => {
    if (!reasonText?.trim()) { alert("Please provide a reason."); return; }
    if (!informed) { alert("Please select if you informed the doctor."); return; }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/user/remove-doctor', 
        { reason: reasonText, informed }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedDoctor(null);
      setShowRemoveModal(false); 
    } catch (err) {
      alert("Failed to remove doctor");
    }
  };

  // --- MERGE LOGIC ---
  const getAllDoctors = () => {
    let combinedList = [...doctors];
    if (selectedDoctor) {
      const exists = combinedList.find(d => d.name === selectedDoctor.name);
      if (!exists) combinedList.unshift(selectedDoctor);
    }
    return combinedList;
  };

  const allDoctors = getAllDoctors();
  const filteredDoctors = activeTab === 'All' 
    ? allDoctors 
    : allDoctors.filter(doc => doc.specialty === activeTab);

  return (
    <div className="doctors-page-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>Our Medical Experts</h1>
        {selectedDoctor && (
          <div className="current-doc-badge">
            Your Doctor: <strong>{selectedDoctor.name}</strong>
          </div>
        )}
      </div>

      <div className="doctors-content">
        <div className="filter-tabs">
          {['All', 'Gynecologist', 'Therapist'].map(tab => (
            <button 
              key={tab}
              className={activeTab === tab ? 'active' : ''} 
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'All' ? 'All Experts' : tab + 's'}
            </button>
          ))}
        </div>

        {/* Loading Initial State */}
        {loading && <div className="loading-msg">Finding best doctors...</div>}

        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => {
            const isSelected = selectedDoctor && selectedDoctor.name === doctor.name;
            const hasSelection = selectedDoctor !== null;

            return (
              <div key={doctor.id} className={`doctor-card ${isSelected ? 'card-selected' : ''} ${hasSelection && !isSelected ? 'card-dimmed' : ''}`}>
                <div className={`verified-badge ${doctor.isVerified ? 'verified' : 'unverified'}`}>
                  {doctor.isVerified ? <><FaCheckCircle /> Maatrucare Verified</> : <>Not Verified</>}
                </div>

                <div className="doctor-image-wrapper">
                  <img src={doctor.image} alt={doctor.name} className="doctor-img" />
                </div>

                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <span className="specialty-tag">{doctor.specialty}</span>
                  <p className="location-text">{doctor.location}</p>
                  
                  <div className="selection-area">
                    {!hasSelection && (
                      <button className="choose-btn" onClick={() => handleSelectDoctor(doctor)}>
                        Choose this Doctor
                      </button>
                    )}
                    {isSelected && (
                        <button className="remove-btn" onClick={() => { setShowRemoveModal(true); }}>
                        Change Doctor
                      </button>
                    )}
                  </div>

                  <div className={`action-buttons ${!isSelected ? 'disabled-actions' : ''}`}>
                    <a href={isSelected ? `tel:${doctor.phone}` : '#'} className="contact-btn call">
                      <FaPhoneAlt /> Call
                    </a>
                    <a href={isSelected ? `mailto:${doctor.email}` : '#'} className="contact-btn email">
                      <FaEnvelope /> Email
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- LOAD MORE BUTTON --- */}
        {!loading && (
          <div className="load-more-container">
            <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load More Doctors'} <FaRedo style={{marginLeft: '8px'}}/>
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {showRemoveModal && (
        <SwitchDoctorModal
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          onConfirm={(payload) => confirmRemoveDoctor(payload)}
        />
      )}
    </div>
  );
};

export default DoctorsTeam;