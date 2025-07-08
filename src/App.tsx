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
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import VendorSearchPage from "./pages/VendorSearchPage";
import CommunityBoard from "./pages/CommunityBoard";
import VendorProfilePage from "./pages/VendorProfilePage";
import FieldRepProfilePage from "./pages/FieldRepProfilePage";
import FeedbackPage from "./pages/FeedbackPage";
import FAQPage from "./pages/FAQPage";
import MessagesPage from "./pages/MessagesPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/vendor/search" element={<VendorSearchPage />} />
                <Route path="/vendor/profile" element={<VendorProfilePage />} />
                <Route path="/fieldrep/profile" element={<FieldRepProfilePage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/community" element={
                  <ProtectedRoute>
                    <CommunityBoard />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/vendor/dashboard" element={
                  <ProtectedRoute>
                    <VendorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/moderator" element={
                  <ProtectedRoute>
                    <ModeratorDashboard />
                  </ProtectedRoute>
                } />
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
