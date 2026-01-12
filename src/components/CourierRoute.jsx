import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourierRoute = ({ children }) => {
  const { isAuthenticated, isCourier, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.5rem',
        color: '#667eea'
      }}>
        Ładowanie...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isCourier) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CourierRoute;
