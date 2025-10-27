import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CheckCircle,
  CreditCard,
  DollarSign,
  Gift,
  HelpCircle,
  Settings,
  BookOpen,
  Calendar,
  FileText,
  Menu,
  X,
  TrendingUp,
  Package,
  Video,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const AdminSidebar = () => {
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermission();
  const [open, setOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'admin_dashboard:view' },
    { to: '/admin/users', icon: Users, label: 'Users', permission: 'users:list' },
    { to: '/admin/transactions', icon: Receipt, label: 'Transactions', permission: 'transactions:list' },
    { to: '/admin/verifications', icon: CheckCircle, label: 'Verifications', permission: 'verification:list' },
    { to: '/admin/payouts', icon: CreditCard, label: 'Payouts', permission: 'payouts:list' },
    { to: '/admin/finance', icon: DollarSign, label: 'Finance', permission: 'finance:view' },
    { to: '/admin/bonuses', icon: Gift, label: 'Bonuses', permission: 'bonuses:list' },
    { to: '/admin/activation-packages', icon: Package, label: 'Activation Packages', permission: 'packages:list' },
    { to: '/admin/crypto-signals', icon: TrendingUp, label: 'Crypto Signals', permission: 'crypto_signals:list' },
    { to: '/admin/books', icon: BookOpen, label: 'Books', permission: 'books:list' },
    { to: '/admin/events', icon: Calendar, label: 'Events', permission: 'events:list' },
    { to: '/admin/promo-materials', icon: FileText, label: 'Promo Materials', permission: 'promo_materials:list' },
    { to: '/admin/video-gallery', icon: Video, label: 'Video Gallery', permission: 'videos:list' },
    { to: '/admin/content-management', icon: FileEdit, label: 'Content Management', permission: 'content:list' },
    { to: '/admin/support', icon: HelpCircle, label: 'Support', permission: 'support:list' },
    { to: '/admin/settings', icon: Settings, label: 'Settings', permission: 'settings' },
  ];

  const visibleLinks = adminLinks.filter(link => {
    if (link.permission === 'settings') {
      return hasAnyPermission(['config:view', 'config:payment_gateways', 'config:bonus_settings', 'config:email_settings']);
    }
    return hasPermission(link.permission);
  });

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-white">
              {user?.full_name ? getInitials(user.full_name) : 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-sidebar-foreground">{user?.full_name || 'Admin'}</p>
            <p className="text-xs text-sidebar-muted">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1 bg-sidebar">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                "text-sidebar-foreground hover:bg-sidebar-accent",
                isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
              )
            }
          >
            <link.icon className="w-4 h-4 flex-shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-20 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate through admin dashboard sections
            </SheetDescription>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
