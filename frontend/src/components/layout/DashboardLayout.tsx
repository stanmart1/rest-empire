import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();

  // Show AdminSidebar only when on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Load Chatbase widget once
  useEffect(() => {
    const chatbaseId = import.meta.env.VITE_CHATBASE_ID;

    // Debug: Check if chatbase ID is loaded
    console.log('Chatbase ID:', chatbaseId ? 'Loaded' : 'Not found');

    // Skip if no chatbase ID is configured
    if (!chatbaseId) {
      console.warn('Chatbase widget not loaded: VITE_CHATBASE_ID environment variable is not set');
      return;
    }

    // Check if script is already loaded - if so, don't reload
    if (document.getElementById(chatbaseId)) {
      return;
    }

    // Initialize chatbase
    (function () {
      const win = window as any;
      if (!win.chatbase || win.chatbase("getState") !== "initialized") {
        win.chatbase = (...args: any[]) => {
          if (!win.chatbase.q) {
            win.chatbase.q = [];
          }
          win.chatbase.q.push(args);
        };
        win.chatbase = new Proxy(win.chatbase, {
          get(target: any, prop: string) {
            if (prop === "q") {
              return target.q;
            }
            return (...args: any[]) => target(prop, ...args);
          }
        });
      }

      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = chatbaseId;
      script.setAttribute("domain", "www.chatbase.co");
      script.defer = true;
      document.body.appendChild(script);
    })();

    // Don't cleanup - let the widget persist across page navigation
  }, []);

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