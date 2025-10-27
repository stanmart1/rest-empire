import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();

  // Show AdminSidebar only when on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen w-full bg-background">
      {isAdminRoute ? <AdminSidebar /> : <Sidebar />}
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