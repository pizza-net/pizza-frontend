import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
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
          {isAdmin ? (
            // Menu dla administratora
            <>
              <button onClick={() => navigate('/dashboard')} className="nav-btn">
                📊 Dashboard
              </button>
              <button onClick={() => navigate('/pizzas')} className="nav-btn">
                🍕 Zarządzaj Pizzami
              </button>
            </>
          ) : (
            // Menu dla zwykłego użytkownika
            <button onClick={() => navigate('/user-dashboard')} className="nav-btn">
              🍕 Menu
            </button>
          )}
        </div>

        <div className="navbar-user">
          <span className="username">
            Witaj, {user?.username}! 
            <span className="user-role">({isAdmin ? 'Admin' : 'Użytkownik'})</span>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Wyloguj
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
