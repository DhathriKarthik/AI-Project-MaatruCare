import React, { useState } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import "./AuthShared.css";

const RegisterPage = () => {
  const [role, setRole] = useState("mother");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  
  const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const googleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setSuccess("");
        setError("");
        console.log("Google Access Token:", tokenResponse.access_token);

        const res = await axios.post("http://localhost:5000/api/auth/google", {
          token: tokenResponse.access_token,
          role: role,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userRole", res.data.user.role);

        setSuccess("Account created with Google! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (err) {
        console.error("Google Register Error:", err);
        setError("Google Registration Failed. Please try again.");
      }
    },
    onError: () => setError("Google Sign-In failed"),
  });


  const handleFacebookRegister = async (response) => {
    try {
      setSuccess("");
      setError("");
      console.log("Facebook Response:", response);

      const res = await axios.post("http://localhost:5000/api/auth/facebook", {
        accessToken: response.accessToken,
        userID: response.userID,
        role: role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role);

      setSuccess("Account created with Facebook! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setError("Facebook Registration Failed.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: role,
      });

      setSuccess("Account created! Redirecting to verification...");

      setTimeout(() => {
        navigate("/verify-otp", { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 200) {
        setSuccess("OTP resent to existing email. Redirecting...");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: formData.email } });
        }, 2000);
      } else {
        setError(
          err.response?.data?.message || "Registration failed. Try again."
        );
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        
        
        <div className="auth-header">
          <span className="name">मातृCare</span>
          <h2 className="title">Create your account.</h2>
          <p className="subtitle">Join us to start your journey.</p>
        </div>

       
        <div className="role-toggle">
          <button
            type="button"
            onClick={() => setRole("mother")}
            className={`toggle-btn ${role === "mother" ? "active" : ""}`}
          >
            Mother
          </button>
          <button
            type="button"
            onClick={() => setRole("professional")}
            className={`toggle-btn ${role === "professional" ? "active" : ""}`}
          >
            Healthcare Professional
          </button>
        </div>

        {success && (
          <div
            style={{
              backgroundColor: "#D1FAE5",
              color: "#065F46",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
              fontSize: "0.9rem",
              border: "1px solid #34D399",
            }}
          >
            {success}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
              fontSize: "0.9rem",
              border: "1px solid #FCA5A5",
            }}
          >
            {error}
          </div>
        )}

   
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Sarah Jenkins"
              className="form-input"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              className="form-input"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              className="form-input"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Sign Up
          </button>
        </form>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">or sign up with</span>
        </div>

        <div className="social-login">
          <button
            className="btn-social"
            type="button"
            onClick={() => googleRegister()}
          >
            <FaGoogle size={20} />
            Google
          </button>

          <FacebookLogin
            appId={FACEBOOK_APP_ID}
            onSuccess={(response) => {
              console.log("FB Success:", response);
              handleFacebookRegister(response); 
            }}
            onFail={(error) => {
              console.log("FB Failed:", error);
              setError("Facebook Login Failed");
            }}
            render={({ onClick }) => (
              <button
                className="btn-social"
                type="button"
                onClick={onClick}
              >
                <FaFacebook size={22} />
                Facebook
              </button>
            )}
          />
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="link-highlight">
              Log In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;