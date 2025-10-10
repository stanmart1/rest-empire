import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6">
      {/* Left: Logo and Blog */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RE</span>
          </div>
          <span className="font-bold text-lg hidden sm:block text-foreground">
            <span className="text-primary">REST</span>
            <span className="font-normal"> EMPIRE</span>
          </span>
        </div>
        <button
          onClick={() => window.open('https://blog.restempire.com', '_blank')}
          className="text-sm text-primary hover:underline font-medium hidden sm:block"
        >
          Blog
        </button>
      </div>

      {/* Right: Language selector and User menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Selector */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8"
          onClick={() => {
            // TODO: Implement language selector
            alert('Language selection coming soon');
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
            <path d="M16 2C16 2 20 8 20 16C20 24 16 30 16 30" stroke="#1E3A8A" strokeWidth="2"/>
            <path d="M16 2C16 2 12 8 12 16C12 24 16 30 16 30" stroke="#1E3A8A" strokeWidth="2"/>
            <path d="M2 16H30" stroke="#DC2626" strokeWidth="2"/>
            <path d="M4 10H28" stroke="#DC2626" strokeWidth="1.5"/>
            <path d="M4 22H28" stroke="#DC2626" strokeWidth="1.5"/>
          </svg>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-muted text-foreground text-sm">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden sm:block text-foreground">{user?.name || 'User'}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              Profile
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