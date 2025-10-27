import { ChevronDown, LayoutDashboard, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if on admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Check if user has admin permissions
  const hasAdminAccess = user?.permissions?.some(
    (permission) => permission.includes('admin') || permission.includes('super_admin')
  ) || false;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Function to open help page
  const openHelp = () => {
    const chatbaseId = import.meta.env.VITE_CHATBASE_ID;
    if (chatbaseId) {
      window.open(`https://www.chatbase.co/${chatbaseId}/help`, '_blank');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-lg hidden sm:block text-foreground">
          <span className="text-primary">Opened Seal</span>
          <span className="font-normal"> and Rest Empire</span>
        </span>
      </div>

      {/* Right: User menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Help Button - Only show for non-admin users */}
        {!isAdminRoute && (
          <Button
            variant="ghost"
            size="icon"
            onClick={openHelp}
            className="relative"
            title="Get Help"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        )}
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {user?.full_name ? getInitials(user.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden sm:block text-foreground">{user?.full_name || 'User'}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Dashboard Links */}
            {hasAdminAccess && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Dashboards</DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  User Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Regular menu items */}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/account-settings')}
            >
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/team')}
            >
              Referral Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;