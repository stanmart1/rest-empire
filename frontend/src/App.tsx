import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { RootRedirect } from "./components/RootRedirect";
import DashboardLayout from "./components/layout/DashboardLayout";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Team = lazy(() => import("./pages/Team"));
const Bonuses = lazy(() => import("./pages/Bonuses"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Payouts = lazy(() => import("./pages/Payouts"));
const Ranks = lazy(() => import("./pages/Ranks"));
const Profile = lazy(() => import("./pages/Profile"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const Status = lazy(() => import("./pages/Status"));
const Support = lazy(() => import("./pages/Support"));
const Events = lazy(() => import("./pages/Events"));
const PromoMaterials = lazy(() => import("./pages/PromoMaterials"));
const Activation = lazy(() => import("./pages/Activation"));
const RankBonus = lazy(() => import("./pages/bonuses/RankBonus"));
const UnilevelBonus = lazy(() => import("./pages/bonuses/UnilevelBonus"));
const InfinityBonus = lazy(() => import("./pages/bonuses/InfinityBonus"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Books = lazy(() => import("./pages/Books"));
const CryptoSignals = lazy(() => import("./pages/CryptoSignals"));
const VideoGallery = lazy(() => import("./pages/VideoGallery"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminVerifications = lazy(() => import("./pages/admin/AdminVerifications"));
const AdminPayouts = lazy(() => import("./pages/admin/AdminPayouts"));
const AdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const AdminBonuses = lazy(() => import("./pages/admin/AdminBonuses"));
const AdminCryptoSignals = lazy(() => import("./pages/admin/AdminCryptoSignals"));
const AdminBooks = lazy(() => import("./pages/admin/AdminBooks"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminPromoMaterials = lazy(() => import("./pages/admin/AdminPromoMaterials"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminActivationPackages = lazy(() => import("./pages/admin/AdminActivationPackages"));
const AdminVideoGallery = lazy(() => import("./pages/admin/AdminVideoGallery"));
const AdminContentManagement = lazy(() => import("./pages/admin/AdminContentManagement"));
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const MotivationalTalk = lazy(() => import("./pages/MotivationalTalk"));
const BookReview = lazy(() => import("./pages/BookReview"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Routes */}
        <Route path="/home" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
        <Route path="/blog/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
        <Route path="/talk" element={<PageWrapper><MotivationalTalk /></PageWrapper>} />
        <Route path="/book-review" element={<PageWrapper><BookReview /></PageWrapper>} />
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
        <Route path="/video-gallery" element={<ProtectedRoute><DashboardLayout><PageWrapper><VideoGallery /></PageWrapper></DashboardLayout></ProtectedRoute>} />
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
        <Route path="/admin/video-gallery" element={<AdminRoute><DashboardLayout><PageWrapper><AdminVideoGallery /></PageWrapper></DashboardLayout></AdminRoute>} />
        <Route path="/admin/content-management" element={<AdminRoute><DashboardLayout><PageWrapper><AdminContentManagement /></PageWrapper></DashboardLayout></AdminRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
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