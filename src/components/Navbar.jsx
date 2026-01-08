import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getTotalItems, toggleCart } = useCart();
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
            <>
              <button onClick={() => navigate('/dashboard')} className="nav-btn">
                📊 Dashboard
              </button>
              <button onClick={() => navigate('/pizzas')} className="nav-btn">
                🍕 Zarządzaj Pizzami
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/user-dashboard')} className="nav-btn">
                🍕 Menu
              </button>
              <button onClick={toggleCart} className="nav-btn cart-btn">
                🛒 Koszyk
                {getTotalItems() > 0 && (
                  <span className="cart-badge">{getTotalItems()}</span>
                )}
              </button>
            </>
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
