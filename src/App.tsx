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
import PWAInstallPrompt from "@/components/ui/pwa-install-prompt";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { SupabaseDebugPanel } from "@/components/ui/SupabaseDebugPanel";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedRouteWithNDA from "@/components/ProtectedRouteWithNDA";
import Index from "./pages/Index";
import VendorSearchPage from "./pages/VendorSearchPage";
import VendorPublicProfile from "./pages/VendorPublicProfile";
import CommunityBoard from "./pages/CommunityBoard";
import VendorProfilePage from "./pages/VendorProfilePage";
import FieldRepProfilePage from "./pages/FieldRepProfilePage";
import FieldRepSearchPage from "./pages/FieldRepSearchPage";
import FieldRepDashboard from "./pages/FieldRepDashboard";
import FieldRepPublicProfile from "./pages/FieldRepPublicProfile";
import FeedbackPage from "./pages/FeedbackPage";
import FAQPage from "./pages/FAQPage";
import HelpPage from "./pages/HelpPage";
import MessagesPage from "./pages/MessagesPage";
import SupportPage from "./pages/SupportPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ContactPage from "./pages/ContactPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import EmailVerifyHandler from "./pages/EmailVerifyHandler";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BetaRegister from "./pages/BetaRegister";
import BetaNDA from "./pages/BetaNDA";
import NotFound from "./pages/NotFound";
import AdminRoute from "@/components/admin/AdminRoute";
import AdminGiveawayDashboard from "./pages/AdminGiveawayDashboard";
import AdminUserDetailPage from "./pages/AdminUserDetailPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import NetworkPage from "./pages/NetworkPage";
import PasswordResetGateway from "./pages/PasswordResetGateway";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ImpersonationBanner />
            <SupabaseDebugPanel />
            <LoadingBar />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/verify" element={<EmailVerifyHandler />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/password-reset-gateway" element={<PasswordResetGateway />} />
                <Route path="/vendor/search" element={<VendorSearchPage />} />
                <Route path="/vendor/profile" element={<VendorProfilePage />} />
                <Route path="/vendor/public/:id" element={<VendorPublicProfile />} />
                <Route path="/fieldrep/search" element={<FieldRepSearchPage />} />
                <Route path="/fieldrep/profile" element={
                  <ProtectedRouteWithNDA>
                    <FieldRepProfilePage />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/fieldrep/public/:id" element={<FieldRepPublicProfile />} />
                <Route path="/fieldrep/dashboard" element={
                  <ProtectedRouteWithNDA>
                    <FieldRepDashboard />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/help" element={<HelpPage />} />
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
                <Route path="/support" element={
                  <ProtectedRouteWithNDA>
                    <SupportPage />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/calendar" element={
                  <ProtectedRouteWithNDA>
                    <CalendarPage />
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/network" element={
                  <ProtectedRouteWithNDA>
                    <NetworkPage />
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
                <Route path="/admin/giveaways" element={
                  <ProtectedRouteWithNDA>
                    <AdminRoute>
                      <AdminGiveawayDashboard />
                    </AdminRoute>
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/admin/users/:userId" element={
                  <ProtectedRouteWithNDA>
                    <AdminRoute>
                      <AdminUserDetailPage />
                    </AdminRoute>
                  </ProtectedRouteWithNDA>
                } />
                <Route path="/admin/profile" element={
                  <ProtectedRouteWithNDA>
                    <AdminRoute>
                      <AdminProfilePage />
                    </AdminRoute>
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
                <Route path="/nda" element={<BetaNDA />} />
                {/* Legacy routes - redirect to new flow */}
                <Route path="/beta-register" element={<BetaRegister />} />
                <Route path="/beta-nda" element={<BetaNDA />} />
                <Route path="/prelaunch" element={<AuthPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
            <BackToTop />
            <PWAInstallPrompt />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
