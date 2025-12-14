import React, { useState } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import "./AuthShared.css";

const LoginPage = () => {
  const [role, setRole] = useState("mother");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  
  const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google Token:", tokenResponse.access_token);

        const res = await axios.post("http://localhost:5000/api/auth/google", {
          token: tokenResponse.access_token,
          role: role,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userRole", res.data.user.role);

        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Google Login Failed");
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  const handleFacebookLogin = async (response) => {
    try {
      console.log("Facebook Response:", response);

      const res = await axios.post("http://localhost:5000/api/auth/facebook", {
        accessToken: response.accessToken,
        userID: response.userID,
        role: role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role);
      navigate("/dashboard");
    } catch (err) {
      console.error("FB Login Error:", err);
      setError(err.response?.data?.message || "Facebook Login Failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
        role: role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <span className="name">मातृCare</span>
          <h2 className="title">Support for your journey.</h2>
          <p className="subtitle">How are you joining us today?</p>
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

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "1rem",
              textAlign: "center",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
              className="form-input"
              onChange={handleChange}
              required
            />
            <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
              <Link
                to="/forgot-password"
                className="link-highlight"
                style={{ fontSize: "0.875rem" }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Continue
          </button>
        </form>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">or</span>
        </div>

        <div className="social-login">
          <button
            className="btn-social"
            type="button"
            onClick={() => googleLogin()}
          >
            <FaGoogle size={20} />
            Continue with Google
          </button>

          <FacebookLogin
            appId={FACEBOOK_APP_ID}
            onSuccess={(response) => {
              console.log("FB Success:", response);
              handleFacebookLogin(response); 
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
                Continue with Facebook
              </button>
            )}
          />
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="link-highlight">
              Sign Up
            </Link>
          </p>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "#9CA3AF",
            }}
          >
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;