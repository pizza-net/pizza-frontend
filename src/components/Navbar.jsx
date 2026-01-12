import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isCourier } = useAuth();
  const { getTotalItems, toggleCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserRoleLabel = () => {
    if (isAdmin) return 'Admin';
    if (isCourier) return 'Kurier';
    return 'Użytkownik';
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
                📊 Kokpit
              </button>
              <button onClick={() => navigate('/pizzas')} className="nav-btn">
                🍕 Zarządzaj Pizzami
              </button>
            </>
          ) : isCourier ? (
            // Kurier nie ma menu nawigacji - tylko widzi panel dostaw
            <></>
          ) : (
            <>
              <button onClick={() => navigate('/user-dashboard')} className="nav-btn">
                🍕 Menu
              </button>
              <button onClick={() => navigate('/order-tracking')} className="nav-btn">
                📦 Moje zamówienia
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
            <span className="user-role">({getUserRoleLabel()})</span>
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
