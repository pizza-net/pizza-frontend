import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import PizzaManagement from './pages/PizzaManagement';
import DeliveryManagement from './pages/DeliveryManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          
          {/* User Dashboard - dla zwykłych użytkowników */}
          <Route
            path="/user-dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard - tylko dla adminów */}
          <Route
            path="/dashboard" 
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          
          {/* Pizza Management - tylko dla adminów */}
          <Route
            path="/pizzas"
            element={
              <AdminRoute>
                <PizzaManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/deliveries"
            element={
              <ProtectedRoute>
                <DeliveryManagement />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect na podstawie roli */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
