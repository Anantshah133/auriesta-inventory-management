import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Auriesta Inventory</h1>
          <Button onClick={handleLogout} variant="outline" className="logout-btn">
            Logout
          </Button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome to your Dashboard</h2>
          <p>You have successfully logged in. Inventory management features will appear here.</p>
        </div>
      </main>
    </div>
  );
};
