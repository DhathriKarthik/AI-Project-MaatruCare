import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthShared.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage('OTP sent! Redirecting...');
      
      // Wait 1.5s then go to Reset Page
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <span className="logo">MamaMindSense</span>
          <h2 className="title">Forgot Password?</h2>
          <p className="subtitle">Enter your email to receive a reset code.</p>
        </div>

        {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', background: '#D1FAE5', padding: '10px', borderRadius: '5px' }}>{message}</div>}
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#FEE2E2', padding: '10px', borderRadius: '5px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="Enter your registered email"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary">Send OTP</button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="link-highlight">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;