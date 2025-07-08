import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ui/error-boundary";
import LoadingBar from "@/components/ui/loading-bar";
import BackToTop from "@/components/ui/back-to-top";
import PWAInstallPrompt from "@/components/ui/pwa-install-prompt";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LoadingBar />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/vendor/search" element={<VendorSearchPage />} />
              <Route path="/vendor/profile" element={<VendorProfilePage />} />
              <Route path="/fieldrep/profile" element={<FieldRepProfilePage />} />
              <Route path="/community" element={<CommunityBoard />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
          <BackToTop />
          <PWAInstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
