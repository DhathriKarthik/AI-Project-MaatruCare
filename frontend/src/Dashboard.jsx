import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#E66A6B' }}>Welcome to IVPOI</h1>
      <h2>You are logged in as a: {userRole?.toUpperCase()}</h2>
      
      <p style={{ marginTop: '1rem', color: '#666' }}>
        This is the protected dashboard area.
      </p>

      <button 
        onClick={handleLogout}
        style={{ 
          marginTop: '2rem', 
          padding: '10px 20px', 
          backgroundColor: '#333', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;