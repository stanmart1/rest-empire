import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={<DashboardLayout />}
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="bonuses" element={<Bonuses />} />
              <Route path="bonuses/rank" element={<RankBonus />} />
              <Route path="bonuses/unilevel" element={<UnilevelBonus />} />
              <Route path="bonuses/infinity" element={<InfinityBonus />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="payouts" element={<Payouts />} />
              <Route path="ranks" element={<Ranks />} />
              <Route path="profile" element={<Profile />} />
              <Route path="status" element={<Status />} />
              <Route path="events" element={<Events />} />
              <Route path="promo-materials" element={<PromoMaterials />} />
              <Route path="activation" element={<Activation />} />
              <Route path="support" element={<Support />} />
              <Route path="books" element={<Books />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;