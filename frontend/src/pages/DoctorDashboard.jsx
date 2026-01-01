import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserInjured, FaSignOutAlt, FaCalendarCheck, FaClock, 
  FaCheck, FaTimes, FaPhone, FaEnvelope, FaSave
} from 'react-icons/fa';
import axios from 'axios';
import './DoctorDashboard.css'; 

const DoctorDashboard = () => {
  const navigate = useNavigate();
  
  // --- 1. TAB STATE ---
  const [activeTab, setActiveTab] = useState('patients'); // Default tab

  // --- 2. DOCTOR DATA STATE ---
  const [doctor, setDoctor] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({
     name: 'Doctor',
     specialty: 'Health Professional',
     image: 'https://randomuser.me/api/portraits/men/32.jpg',
     status: 'Available'
  });

  const [stats, setStats] = useState({
     totalPatients: 0,
     todayAppointments: 0,
     pendingRequests: 0
  });

  const [myPatients, setMyPatients] = useState([]); 
  const [loadingProfile, setLoadingProfile] = useState(true);

  // --- 3. SCHEDULE & AVAILABILITY STATE ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [availability, setAvailability] = useState([
    { day: 'Monday', active: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', active: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
    { day: 'Friday', active: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', active: false, start: '10:00', end: '14:00' },
    { day: 'Sunday', active: false, start: '', end: '' },
  ]);

  const scheduleItems = [
    { id: 1, time: "09:30 AM", patient: "Sita Sharma", type: "Checkup", status: "confirmed" },
    { id: 2, time: "11:00 AM", patient: "Gita Patel", type: "Consultation", status: "confirmed" },
    { id: 3, time: "02:15 PM", patient: "Anita Roy", type: "Follow-up", status: "pending" },
  ];

  // --- 4. FETCH DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:5000/api/doctor/me', config);
        const d = res.data;
        
        setDoctor(d);
        setDoctorInfo({
            name: d.personalInfo?.name || 'Doctor',
            specialty: d.personalInfo?.specialty || 'Specialist',
            image: d.personalInfo?.image || "https://randomuser.me/api/portraits/men/32.jpg",
            status: 'Available'
        });
        
        // Mock Stats based on data (or use real data if available)
        setStats({
            totalPatients: d.stats?.patientsServed || 12,
            todayAppointments: 3,
            pendingRequests: 1
        });
        
        // Mock Patients (Replace with real API call later)
        setMyPatients([
            { id: 101, name: "Sneha Gupta", age: 28, issue: "Prenatal Checkup", time: "10:00 AM", status: "Pending" },
            { id: 102, name: "Priya Singh", age: 31, issue: "Blood Pressure", time: "11:30 AM", status: "Confirmed" }
        ]);

        setLoadingProfile(false);

      } catch (err) {
        if (err.response && (err.response.status === 400 || err.response.status === 404)) {
          console.log("Profile not found, redirecting to setup...");
          navigate('/doctor-profile-setup');
        } else {
          console.error("Server Error:", err);
          setLoadingProfile(false);
        }
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // --- HANDLERS ---
  const handleAccept = (id) => {
    setMyPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'Confirmed' } : p));
  };

  const handleReject = (id) => {
    setMyPatients(prev => prev.filter(p => p.id !== id));
  };

  const handleProfileClick = () => {
    if (doctor) {
      navigate('/doctor-profile-view');
    } else {
      navigate('/doctor-profile-setup');
    }
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvail = [...availability];
    newAvail[index][field] = value;
    setAvailability(newAvail);
  };

  const handleSaveAvailability = () => {
    alert("Availability Settings Saved!");
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for(let i=0; i<7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    return dates;
  };

  return (
    <div className="doc-dashboard-container">
      
      {/* --- SIDEBAR --- */}
      <div className="doc-sidebar">
        <div className="doc-profile-section">
            <img src={doctorInfo.image} alt="Doctor" className="doc-profile-img" />
            <h3>{doctorInfo.name}</h3>
            <span className="doc-specialty">{doctorInfo.specialty}</span>
            <div className="doc-status-indicator">
                <span className="doc-status-dot"></span> {doctorInfo.status}
            </div>
        </div>
        
        <nav className="doc-nav">
            {/* BUTTONS NOW CHANGE THE 'activeTab' STATE */}
            <button 
                className={`doc-nav-item ${activeTab === 'patients' ? 'active' : ''}`} 
                onClick={() => setActiveTab('patients')}
            >
                <FaUserInjured /> My Patients
            </button>
            <button 
                className={`doc-nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
            >
                <FaCalendarCheck /> Schedule
            </button>
            <button 
                className={`doc-nav-item ${activeTab === 'availability' ? 'active' : ''}`}
                onClick={() => setActiveTab('availability')}
            >
                <FaClock /> Availability
            </button>
        </nav>

        <button className="doc-logout-btn" onClick={() => navigate('/')}>
            <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="doc-main-content">
        
        {/* TOPBAR (Visible on all tabs) */}
        <div className="doc-topbar">
            <div className="doc-brand">
                <span className="doc-brand-name">मातृCare</span>
                <span className="doc-brand-sub">Doctor Portal</span>
            </div>
            <div className="doc-top-actions">
                <button className="doc-chip secondary" onClick={handleProfileClick}> Profile</button>
                <button className="doc-chip primary">Notifications</button>
            </div>
        </div>

        {/* --- TAB 1: MY PATIENTS (DEFAULT) --- */}
        {activeTab === 'patients' && (
            <div className="fade-in">
                <div className="doc-header">
                    <h1>Welcome back, {doctorInfo.name.split(' ')[0]} 👋</h1>
                    <p>Here is your daily activity summary.</p>
                </div>

                <div className="doc-stats-grid">
                    <div className="doc-stat-card">
                        <div className="doc-stat-icon pink"><FaUserInjured /></div>
                        <div className="doc-stat-info">
                            <h3>{stats.totalPatients}</h3>
                            <p>Total Patients</p>
                        </div>
                    </div>
                    <div className="doc-stat-card">
                        <div className="doc-stat-icon blue"><FaCalendarCheck /></div>
                        <div className="doc-stat-info">
                            <h3>{stats.todayAppointments}</h3>
                            <p>Today's Appts</p>
                        </div>
                    </div>
                    <div className="doc-stat-card">
                        <div className="doc-stat-icon orange"><FaClock /></div>
                        <div className="doc-stat-info">
                            <h3>{stats.pendingRequests}</h3>
                            <p>Pending Requests</p>
                        </div>
                    </div>
                </div>

                <div className="doc-section-container">
                    <h2>Upcoming Appointments</h2>
                    <div className="doc-patients-list">
                        {loadingProfile ? (
                            <p className="doc-no-data">Loading...</p>
                        ) : myPatients.length > 0 ? (
                            myPatients.map((patient) => (
                                <div key={patient.id} className="doc-patient-card">
                                    <div className="doc-patient-info">
                                        <h4>{patient.name}</h4>
                                        <p>{patient.issue} • Age: {patient.age}</p>
                                        <span className="doc-time-badge">{patient.time}</span>
                                    </div>
                                    <div className="doc-patient-actions">
                                        {patient.status === 'Pending' ? (
                                            <>
                                                <button className="doc-action-btn accept" onClick={() => handleAccept(patient.id)}>
                                                    <FaCheck /> Accept
                                                </button>
                                                <button className="doc-action-btn reject" onClick={() => handleReject(patient.id)}>
                                                    <FaTimes /> Reject
                                                </button>
                                            </>
                                        ) : (
                                            <div className="doc-contact-options">
                                                <button className="doc-icon-btn"><FaPhone /></button>
                                                <button className="doc-icon-btn"><FaEnvelope /></button>
                                                <span className={`doc-status-tag ${patient.status.toLowerCase()}`}>
                                                    {patient.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="doc-no-data">No appointments yet.</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: SCHEDULE VIEW --- */}
        {activeTab === 'schedule' && (
            <div className="fade-in">
                 <div className="doc-header">
                    <h1>My Schedule 📅</h1>
                    <p>Manage your weekly appointments.</p>
                </div>

                {/* Date Strip */}
                <div className="schedule-date-strip">
                    {getWeekDates().map((date, index) => (
                        <div 
                            key={index} 
                            className={`date-card ${date.getDate() === selectedDate.getDate() ? 'active' : ''}`}
                            onClick={() => setSelectedDate(date)}
                        >
                            <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="day-num">{date.getDate()}</span>
                        </div>
                    ))}
                </div>

                {/* Timeline */}
                <div className="doc-section-container">
                    <h3 className="section-heading">Timeline for {selectedDate.toLocaleDateString()}</h3>
                    <div className="timeline-grid">
                        {scheduleItems.map(item => (
                            <div key={item.id} className="timeline-item">
                                <div className="time-col">{item.time}</div>
                                <div className={`appt-card ${item.status}`}>
                                    <h4>{item.patient}</h4>
                                    <p>{item.type}</p>
                                    <span className="status-tag">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 3: AVAILABILITY SETTINGS --- */}
        {activeTab === 'availability' && (
            <div className="fade-in">
                <div className="doc-header">
                    <h1>Set Availability 🕒</h1>
                    <p>Configure your clinic hours.</p>
                </div>

                <div className="availability-card">
                    <div className="avail-header-row">
                        <span>Day</span>
                        <span>Status</span>
                        <span>Start</span>
                        <span>End</span>
                    </div>

                    <div className="avail-list">
                        {availability.map((item, index) => (
                            <div key={item.day} className={`avail-row ${item.active ? 'active' : 'inactive'}`}>
                                <div className="day-label">{item.day}</div>
                                <div className="toggle-wrapper">
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={item.active} 
                                            onChange={(e) => handleAvailabilityChange(index, 'active', e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                    <span className="status-text">{item.active ? 'Open' : 'Closed'}</span>
                                </div>
                                <input 
                                    type="time" className="time-input" 
                                    value={item.start} disabled={!item.active}
                                    onChange={(e) => handleAvailabilityChange(index, 'start', e.target.value)}
                                />
                                <span className="to-divider">-</span>
                                <input 
                                    type="time" className="time-input" 
                                    value={item.end} disabled={!item.active}
                                    onChange={(e) => handleAvailabilityChange(index, 'end', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="avail-footer">
                        <button className="save-avail-btn" onClick={handleSaveAvailability}>
                            <FaSave /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default DoctorDashboard;