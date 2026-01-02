import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage'; 
import Dashboard from './pages/Dashboard';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './pages/UserProfile';
import ProfileSetup from './pages/ProfileSetup'
import DoctorsTeam from './pages/DoctorsTeam';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register " replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-view" element={<UserProfile />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/doctors-team" element={<DoctorsTeam />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;