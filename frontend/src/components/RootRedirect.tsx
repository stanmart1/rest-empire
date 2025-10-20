import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    const hasAdminDashboard = user?.permissions?.includes('admin_dashboard:view');
    return <Navigate to={hasAdminDashboard ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Navigate to="/home" replace />;
};
