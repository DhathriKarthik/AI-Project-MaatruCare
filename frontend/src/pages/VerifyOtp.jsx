import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthShared.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('')
  const [timer, setTimer] = useState(30);     // Countdown timer
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Timer Logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;
    
    setSuccess('');
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      setSuccess('New code sent to your email!');
      setTimer(30); // Reset timer
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      setSuccess('Email Verified! Redirecting to login...');

     setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <span className="logo">MamaMindSense</span>
          <h2 className="title">Verify it's you.</h2>
          <p className="subtitle">We sent a code to {email}</p>
        </div>

       {success && (
          <div style={{ 
            backgroundColor: '#D1FAE5', 
            color: '#065F46',           
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            border: '1px solid #34D399'
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ 
            backgroundColor: '#FEE2E2', 
            color: '#B91C1C', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem', 
            textAlign: 'center', 
            fontSize: '0.9rem',
            border: '1px solid #FCA5A5'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              maxLength="6"
              placeholder="123456"
              className="form-input"
              style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5rem' }}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Verify Email</button>
        </form>
        
        <div className="auth-footer">
          <p className="subtitle">
            Didn't receive code?{' '}
            <span 
              onClick={handleResend}
              className={canResend ? "link-highlight" : ""}
              style={{ 
                cursor: canResend ? 'pointer' : 'not-allowed', 
                opacity: canResend ? 1 : 0.5,
                fontWeight: 'bold'
              }}
            >
              {canResend ? "Resend" : `Resend in ${timer}s`}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;