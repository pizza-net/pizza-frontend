import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getUsers } from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome to Pizza Net Dashboard! 🍕</h1>
          <p>You have successfully logged in with JWT authentication.</p>
        </div>

        <div className="users-section">
          <h2>Registered Users</h2>
          
          {loading && <p className="loading">Loading users...</p>}
          
          {error && (
            <div className="error-box">
              <p>Error loading users: {error}</p>
            </div>
          )}
          
          {!loading && !error && users.length > 0 && (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <p className="user-role">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && users.length === 0 && (
            <p className="no-users">No users found.</p>
          )}
        </div>

        <div className="info-section">
          <h2>System Information</h2>
          <div className="info-cards">
            <div className="info-card">
              <h3>🔐 Authentication</h3>
              <p>JWT with 24h expiration</p>
            </div>
            <div className="info-card">
              <h3>🌐 CORS</h3>
              <p>Configured for localhost:5173</p>
            </div>
            <div className="info-card">
              <h3>🔒 Security</h3>
              <p>BCrypt password hashing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
