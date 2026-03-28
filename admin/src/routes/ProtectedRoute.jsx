import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Đang tải...</div>;
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
}
