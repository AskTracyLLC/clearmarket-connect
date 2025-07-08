import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import VendorSearchPage from "./pages/VendorSearchPage";
import CommunityBoard from "./pages/CommunityBoard";
import VendorProfilePage from "./pages/VendorProfilePage";
import FieldRepProfilePage from "./pages/FieldRepProfilePage";
import FeedbackPage from "./pages/FeedbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vendor/search" element={<VendorSearchPage />} />
            <Route path="/vendor/profile" element={<VendorProfilePage />} />
            <Route path="/fieldrep/profile" element={<FieldRepProfilePage />} />
            <Route path="/community" element={<CommunityBoard />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
