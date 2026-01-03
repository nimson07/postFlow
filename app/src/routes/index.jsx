import { Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import SetPassword from '../pages/SetPassword';
import AdminDashboard from '../pages/AdminDashboard';
import UserDashboard from '../pages/UserDashboard';
import { useAuth } from '../context/AuthContext';

// Protected Route Component
export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

// Route Configuration
export const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/set-password',
    element: <SetPassword />
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRole="USER">
        <UserDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />
  }
];
