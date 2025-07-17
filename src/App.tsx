import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import LoadingBar from "@/components/ui/loading-bar";
import BackToTop from "@/components/ui/back-to-top";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Prelaunch from "./pages/Prelaunch";
import VendorSearchPage from "./pages/VendorSearchPage";
import CommunityBoard from "./pages/CommunityBoard";
import VendorProfilePage from "./pages/VendorProfilePage";
import FieldRepProfilePage from "./pages/FieldRepProfilePage";
import FieldRepSearchPage from "./pages/FieldRepSearchPage";
import FieldRepDashboard from "./pages/FieldRepDashboard";
import FieldRepPublicProfile from "./pages/FieldRepPublicProfile";
import VendorPublicProfile from "./pages/VendorPublicProfile";
import FeedbackPage from "./pages/FeedbackPage";
import FAQPage from "./pages/FAQPage";
import MessagesPage from "./pages/MessagesPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ContactPage from "./pages/ContactPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import BetaNDA from "./pages/BetaNDA";
import ProtectedRouteWithNDA from "./components/ProtectedRouteWithNDA";
import NotFound from "./pages/NotFound";
import { TestingDashboard } from "./components/TestingDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <LoadingBar />
              <ErrorBoundary>
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/prelaunch" element={<Prelaunch />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin-auth" element={<AdminAuthPage />} />
                <Route path="/vendor/search" element={<ProtectedRouteWithNDA><VendorSearchPage /></ProtectedRouteWithNDA>} />
                <Route path="/vendor/profile" element={<ProtectedRouteWithNDA><VendorProfilePage /></ProtectedRouteWithNDA>} />
                <Route path="/fieldrep/search" element={<ProtectedRouteWithNDA><FieldRepSearchPage /></ProtectedRouteWithNDA>} />
                <Route path="/fieldrep/profile" element={<ProtectedRouteWithNDA><FieldRepProfilePage /></ProtectedRouteWithNDA>} />
                 <Route path="/fieldrep/profile/:id" element={<FieldRepPublicProfile />} />
                 <Route path="/vendor/profile/:id" element={<VendorPublicProfile />} />
                <Route path="/fieldrep/dashboard" element={
                  <ProtectedRouteWithNDA>
                    <FieldRepDashboard />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/testing" element={<TestingDashboard />} />
                <Route path="/community" element={
                  <ProtectedRouteWithNDA>
                    <CommunityBoard />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/messages" element={
                  <ProtectedRouteWithNDA>
                    <MessagesPage />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/calendar" element={
                  <ProtectedRouteWithNDA>
                    <CalendarPage />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/settings" element={
                  <ProtectedRouteWithNDA>
                    <SettingsPage />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/vendor/dashboard" element={
                  <ProtectedRouteWithNDA>
                    <VendorDashboard />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/admin" element={
                  <ProtectedRouteWithNDA>
                    <AdminDashboard />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/moderator" element={
                  <ProtectedRouteWithNDA>
                    <ModeratorDashboard />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />
                <Route path="/beta-nda" element={<BetaNDA />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <BackToTop />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
