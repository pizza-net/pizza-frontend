import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1>🍕 Pizza Net</h1>
        </div>
        
        <div className="navbar-menu">
          <button onClick={() => navigate('/dashboard')} className="nav-btn">
            📊 Dashboard
          </button>
          <button onClick={() => navigate('/pizzas')} className="nav-btn">
            🍕 Pizze
          </button>
        </div>

        <div className="navbar-user">
          <span className="username">Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
