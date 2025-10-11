import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
        <Route path="/blog/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={<DashboardLayout />}
        >
          <Route path="dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="team" element={<PageWrapper><Team /></PageWrapper>} />
          <Route path="bonuses" element={<PageWrapper><Bonuses /></PageWrapper>} />
          <Route path="bonuses/rank" element={<PageWrapper><RankBonus /></PageWrapper>} />
          <Route path="bonuses/unilevel" element={<PageWrapper><UnilevelBonus /></PageWrapper>} />
          <Route path="bonuses/infinity" element={<PageWrapper><InfinityBonus /></PageWrapper>} />
          <Route path="transactions" element={<PageWrapper><Transactions /></PageWrapper>} />
          <Route path="payouts" element={<PageWrapper><Payouts /></PageWrapper>} />
          <Route path="ranks" element={<PageWrapper><Ranks /></PageWrapper>} />
          <Route path="profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="status" element={<PageWrapper><Status /></PageWrapper>} />
          <Route path="events" element={<PageWrapper><Events /></PageWrapper>} />
          <Route path="promo-materials" element={<PageWrapper><PromoMaterials /></PageWrapper>} />
          <Route path="activation" element={<PageWrapper><Activation /></PageWrapper>} />
          <Route path="support" element={<PageWrapper><Support /></PageWrapper>} />
          <Route path="books" element={<PageWrapper><Books /></PageWrapper>} />
        </Route>

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