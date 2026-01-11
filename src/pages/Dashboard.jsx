import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUsers, updateUserRole } from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      await updateUserRole(userId, newRole);
      // Odśwież listę użytkowników
      await fetchUsers();
      setUpdatingUserId(null);
    } catch (err) {
      alert('Nie udało się zmienić roli: ' + err);
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'ADMIN': return '#ef4444';
      case 'COURIER': return '#3b82f6';
      case 'USER': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome to Pizza Net Dashboard! 🍕</h1>
          <p>You have successfully logged in with JWT authentication.</p>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <div className="action-card" onClick={() => navigate('/pizzas')}>
              <div className="action-icon">🍕</div>
              <h3>Pizza Management</h3>
              <p>Zarządzaj menu pizzy</p>
            </div>
            <div className="action-card" onClick={() => navigate('/deliveries')}>
              <div className="action-icon">🚚</div>
              <h3>Delivery Management</h3>
              <p>Zarządzaj dostawami</p>
            </div>
          </div>
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
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: getRoleBadgeColor(user.role) + '20',
                      color: getRoleBadgeColor(user.role),
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {user.role}
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                        display: 'block'
                      }}>
                        Zmień rolę:
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingUserId === user.id}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          cursor: updatingUserId === user.id ? 'wait' : 'pointer'
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="COURIER">COURIER</option>
                      </select>
                    </div>
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
