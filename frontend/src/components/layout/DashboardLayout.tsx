import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex min-h-screen w-full bg-background">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}
      <div className="flex-1 flex flex-col md:ml-64">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto pt-16 md:pt-4">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;