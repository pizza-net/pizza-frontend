import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import CourierDashboard from './pages/CourierDashboard';
import PizzaManagement from './pages/PizzaManagement';
import DeliveryManagement from './pages/DeliveryManagement';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import OrderTracking from './pages/OrderTracking';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import CourierRoute from './components/CourierRoute';
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

          {/* Courier Dashboard - dla kurierów */}
          <Route
            path="/courier-dashboard"
            element={
              <CourierRoute>
                <CourierDashboard />
              </CourierRoute>
            }
          />

          {/* Order Tracking - śledzenie zamówień dla użytkowników */}
          <Route
            path="/order-tracking"
            element={
              <ProtectedRoute>
                <OrderTracking />
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
          {/* Delivery Management - tylko dla adminów */}
          <Route
            path="/deliveries"
            element={
              <AdminRoute>
                <DeliveryManagement />
              </AdminRoute>
            }
          />
          
          {/* Strony płatności */}
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-cancel"
            element={
              <ProtectedRoute>
                <PaymentCancel />
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
