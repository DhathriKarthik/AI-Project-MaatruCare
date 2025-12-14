import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthShared.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ otp: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      setMessage('Password Changed! Redirecting to Login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <span className="logo">MamaMindSense</span>
          <h2 className="title">Reset Password</h2>
          <p className="subtitle">Enter the code sent to {email}</p>
        </div>

        {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', background: '#D1FAE5', padding: '10px', borderRadius: '5px' }}>{message}</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#FEE2E2', padding: '10px', borderRadius: '5px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>OTP Code</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="123456"
              maxLength="6"
              style={{ letterSpacing: '0.2em' }}
              onChange={(e) => setFormData({...formData, otp: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter new password"
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;