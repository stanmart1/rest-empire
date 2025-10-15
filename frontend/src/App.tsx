import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { RootRedirect } from "./components/RootRedirect";
import DashboardLayout from "./components/layout/DashboardLayout";
import { motion, AnimatePresence } from "motion/react";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// User Pages
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import Bonuses from "./pages/Bonuses";
import Transactions from "./pages/Transactions";
import Payouts from "./pages/Payouts";
import Ranks from "./pages/Ranks";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import Status from "./pages/Status";
import Support from "./pages/Support";
import Events from "./pages/Events";
import PromoMaterials from "./pages/PromoMaterials";
import Activation from "./pages/Activation";
import RankBonus from "./pages/bonuses/RankBonus";
import UnilevelBonus from "./pages/bonuses/UnilevelBonus";
import InfinityBonus from "./pages/bonuses/InfinityBonus";
import NotFound from "./pages/NotFound";
import Books from "./pages/Books";
import CryptoSignals from "./pages/CryptoSignals";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminPayouts from "./pages/admin/AdminPayouts";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminBonuses from "./pages/admin/AdminBonuses";
import AdminCryptoSignals from "./pages/admin/AdminCryptoSignals";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminPromoMaterials from "./pages/admin/AdminPromoMaterials";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminActivationPackages from "./pages/admin/AdminActivationPackages";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Public Routes */}
        <Route path="/home" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
        <Route path="/blog/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><PageWrapper><Dashboard /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><DashboardLayout><PageWrapper><Team /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/bonuses" element={<ProtectedRoute><DashboardLayout><PageWrapper><Bonuses /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/bonuses/rank" element={<ProtectedRoute><DashboardLayout><PageWrapper><RankBonus /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/bonuses/unilevel" element={<ProtectedRoute><DashboardLayout><PageWrapper><UnilevelBonus /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/bonuses/infinity" element={<ProtectedRoute><DashboardLayout><PageWrapper><InfinityBonus /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><DashboardLayout><PageWrapper><Transactions /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/payouts" element={<ProtectedRoute><DashboardLayout><PageWrapper><Payouts /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/ranks" element={<ProtectedRoute><DashboardLayout><PageWrapper><Ranks /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><DashboardLayout><PageWrapper><Profile /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/account-settings" element={<ProtectedRoute><DashboardLayout><PageWrapper><AccountSettings /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/status" element={<ProtectedRoute><DashboardLayout><PageWrapper><Status /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><DashboardLayout><PageWrapper><Events /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/promo-materials" element={<ProtectedRoute><DashboardLayout><PageWrapper><PromoMaterials /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/activation" element={<ProtectedRoute><DashboardLayout><PageWrapper><Activation /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><DashboardLayout><PageWrapper><Support /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/books" element={<ProtectedRoute><DashboardLayout><PageWrapper><Books /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/crypto-signals" element={<ProtectedRoute><DashboardLayout><PageWrapper><CryptoSignals /></PageWrapper></DashboardLayout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><DashboardLayout><PageWrapper><AdminDashboard /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><DashboardLayout><PageWrapper><AdminUsers /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/transactions" element={<AdminRoute><DashboardLayout><PageWrapper><AdminTransactions /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/verifications" element={<AdminRoute><DashboardLayout><PageWrapper><AdminVerifications /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/payouts" element={<AdminRoute><DashboardLayout><PageWrapper><AdminPayouts /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/finance" element={<AdminRoute><DashboardLayout><PageWrapper><AdminFinance /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/bonuses" element={<AdminRoute><DashboardLayout><PageWrapper><AdminBonuses /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/crypto-signals" element={<AdminRoute><DashboardLayout><PageWrapper><AdminCryptoSignals /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/activation-packages" element={<AdminRoute><DashboardLayout><PageWrapper><AdminActivationPackages /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/books" element={<AdminRoute><DashboardLayout><PageWrapper><AdminBooks /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/events" element={<AdminRoute><DashboardLayout><PageWrapper><AdminEvents /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/promo-materials" element={<AdminRoute><DashboardLayout><PageWrapper><AdminPromoMaterials /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/support" element={<AdminRoute><DashboardLayout><PageWrapper><AdminSupport /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><DashboardLayout><PageWrapper><AdminSettings /></PageWrapper></DashboardLayout></AdminRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;