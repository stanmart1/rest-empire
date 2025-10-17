import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Megaphone,
  Gift,
  Star,
  Network,
  Infinity,
  CreditCard,
  Receipt,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Menu,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboardStats } from '@/hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const Sidebar = () => {
  const { user } = useAuth();
  const { data: dashboardStats } = useDashboardStats();
  const [bonusesOpen, setBonusesOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: bonusConfig } = useQuery({
    queryKey: ['bonusConfig'],
    queryFn: async () => {
      const response = await api.get('/admin/config/config/public/payout-settings');
      return response.data;
    },
  });

  const getStatusDate = () => {
    if (dashboardStats?.is_active && dashboardStats?.activated_at) {
      return new Date(dashboardStats.activated_at).toLocaleDateString('en-GB');
    } else if (!dashboardStats?.is_active && dashboardStats?.deactivated_at) {
      return new Date(dashboardStats.deactivated_at).toLocaleDateString('en-GB');
    }
    return 'N/A';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const mainLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/status', icon: Users, label: 'My Status', enabled: bonusConfig?.rank_bonus_enabled },
    { to: '/team', icon: Users, label: 'My Team' },
    { to: '/video-gallery', icon: TrendingUp, label: 'Video Gallery' },
    { to: '/crypto-signals', icon: TrendingUp, label: 'Crypto Signals' },
    { to: '/events', icon: Calendar, label: 'Our Events' },
    { to: '/promo-materials', icon: Megaphone, label: 'Promo Materials' },
    { to: '/books', icon: BookOpen, label: 'Books' },
  ].filter(link => link.enabled !== false);

  const bonusSubLinks = [
    { to: '/bonuses/rank', icon: Star, label: 'Rank bonus', enabled: bonusConfig?.rank_bonus_enabled },
    { to: '/bonuses/unilevel', icon: Network, label: 'Unilevel Bonus', enabled: bonusConfig?.unilevel_enabled },
    { to: '/bonuses/infinity', icon: Infinity, label: 'Infinity Bonus', enabled: bonusConfig?.infinity_enabled },
  ].filter(link => link.enabled);
  
  const showBonusesMenu = bonusSubLinks.length > 0;

  const personalLinks = [
    { to: '/payouts', icon: CreditCard, label: 'Payouts' },
    { to: '/transactions', icon: Receipt, label: 'Transactions' },
    { to: '/activation', icon: CheckCircle, label: 'Activation' },
    { to: '/support', icon: HelpCircle, label: 'Support' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto z-50 md:hidden"
          >
        {/* User Profile Card */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-white">
                {user?.full_name ? getInitials(user.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-sidebar-foreground">{user?.full_name || 'User'}</p>
            </div>
          </div>
          <div className="text-center py-2 bg-muted rounded-lg">
            <p className="text-xs text-white mb-1">{dashboardStats?.is_active ? "Active" : "Inactive"}</p>
            <p className="text-sm font-medium text-white">since {getStatusDate()}</p>
          </div>
        </div>

        {/* Navigation */}
        <motion.nav 
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
          className="p-3 space-y-1 bg-sidebar"
        >
          {mainLinks.map((link) => (
            <motion.div
              key={link.to}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                  "text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
                )
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
            </motion.div>
          ))}

          {/* Bonuses Section with Submenu */}
          {showBonusesMenu && (
          <div className="pt-4 bg-sidebar">
            <div className="flex items-center gap-1">
              <NavLink
                to="/bonuses"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm flex-1",
                    "text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
                  )
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Gift className="w-4 h-4 flex-shrink-0" />
                <span>Bonuses</span>
              </NavLink>
              <button
                onClick={() => setBonusesOpen(!bonusesOpen)}
                className="p-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {bonusesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {bonusesOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {bonusSubLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                        "text-sidebar-foreground hover:bg-sidebar-accent",
                        isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
                      )
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Personal Section */}
          <div className="pt-4">
            <p className="px-3 text-xs font-medium text-sidebar-muted mb-2">Personal</p>
            {personalLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                    "text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
                  )
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </motion.nav>
      </motion.aside>
      )}
      </AnimatePresence>

      {/* Desktop sidebar - always visible on md and larger screens */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
        {/* User Profile Card */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-white">
                {user?.full_name ? getInitials(user.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-sidebar-foreground">{user?.full_name || 'User'}</p>
            </div>
          </div>
          <div className="text-center py-2 bg-muted rounded-lg">
            <p className="text-xs text-white mb-1">{dashboardStats?.is_active ? "Active" : "Inactive"}</p>
            <p className="text-sm font-medium text-white">since {getStatusDate()}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 bg-sidebar">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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

          {/* Bonuses Section with Submenu */}
          {showBonusesMenu && (
          <div className="pt-4 bg-sidebar">
            <div className="flex items-center gap-1">
              <NavLink
                to="/bonuses"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm flex-1",
                    "text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
                  )
                }
              >
                <Gift className="w-4 h-4 flex-shrink-0" />
                <span>Bonuses</span>
              </NavLink>
              <button
                onClick={() => setBonusesOpen(!bonusesOpen)}
                className="p-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {bonusesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {bonusesOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {bonusSubLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
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
              </div>
            )}
          </div>
          )}

          {/* Personal Section */}
          <div className="pt-4">
            <p className="px-3 text-xs font-medium text-sidebar-muted mb-2">Personal</p>
            {personalLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
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
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;