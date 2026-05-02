import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin())       return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <AdminSidebar />
      <main style={{ marginLeft: 268, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
