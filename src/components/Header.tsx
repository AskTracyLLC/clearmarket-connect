
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDualBalance } from '@/hooks/dual_balance_hook';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import ClearMarketLogo from '@/components/ui/ClearMarketLogo';
import ProfileDropdown from '@/components/ui/ProfileDropdown';
import NotificationBell from '@/components/ui/NotificationBell';
import CreditBalance from '@/components/ui/CreditBalance';
import SendFieldRepNetworkAlert from '@/components/FieldRepDashboard/SendFieldRepNetworkAlert';
import { 
  User, 
  LogOut, 
  Trophy, 
  CreditCard, 
  Gift,
  Settings,
  Menu,
  X,
  MessageSquare,
  MapPin,
  Users,
  Calendar,
  Bell,
  Megaphone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile, loading } = useUserProfile();
  const { balance, isLoading } = useDualBalance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [networkAlertOpen, setNetworkAlertOpen] = useState(false);

  // Debug logging to check profile data
  console.log('Header - Profile data:', { profile, loading, role: profile?.role });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  const handleViewGiveaways = () => {
    navigate('/giveaways');
    setMobileMenuOpen(false);
  };

  const handleBuyCredits = () => {
    navigate('/credits/purchase');
    setMobileMenuOpen(false);
  };

  const handleNetworkAlerts = () => {
    setNetworkAlertOpen(true);
    setMobileMenuOpen(false);
  };

  // Show network alert button for field reps or if profile is still loading
  const showNetworkAlerts = !loading && profile?.role === 'field_rep';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ClearMarketLogo size={32} />
              <span className="font-bold text-xl text-gray-900">ClearMarket</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden lg:inline">Community</span>
            </Link>
            <Link to="/coverage" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden lg:inline">Coverage</span>
            </Link>
            <Link to="/network" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Network</span>
            </Link>
            <Link to="/calendar" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Calendar</span>
            </Link>
          </nav>

          {/* Desktop Actions & User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* RepPoints */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewGiveaways}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Trophy className="h-4 w-4" />
              <span className="font-medium">
                {isLoading ? '0' : balance.repPoints}
              </span>
              <span className="text-xs hidden lg:inline">RepPoints</span>
            </Button>

            {/* Credits */}
            <CreditBalance />
            
            {/* Network Alert Button - only for field reps */}
            {showNetworkAlerts && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNetworkAlerts}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary bg-blue-50 hover:bg-blue-100 border border-blue-200"
              >
                <Megaphone className="h-4 w-4 text-blue-600" />
                <span className="text-xs hidden lg:inline text-blue-900">Network Alerts</span>
              </Button>
            )}

            {/* Notifications */}
            <NotificationBell count={0} onClick={() => navigate('/notifications')} />

            {/* User Profile */}
            <ProfileDropdown
              profile={profile}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            
            {/* Mobile Balance Display */}
            <div className="flex justify-center space-x-2 pb-4 border-b border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewGiveaways}
                className="flex items-center gap-2 bg-blue-50 border-blue-200"
              >
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  {isLoading ? '...' : balance.repPoints}
                </span>
                <span className="text-blue-600 text-xs">RepPoints</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBuyCredits}
                className="flex items-center gap-2 bg-green-50 border-green-200"
              >
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-green-900 font-medium">
                  {isLoading ? '...' : balance.clearCredits}
                </span>
                <span className="text-green-600 text-xs">Credits</span>
              </Button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              <Link 
                to="/fieldrep/dashboard" 
                className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                to="/community" 
                className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="h-4 w-4" />
                Community
              </Link>
              <Link 
                to="/coverage" 
                className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="h-4 w-4" />
                Coverage
              </Link>
              <Link 
                to="/network" 
                className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                Network
              </Link>
              <Link 
                to="/calendar" 
                className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Link>
              
              {/* Network Alerts in Mobile Menu for Field Reps */}
              {showNetworkAlerts && (
                <button 
                  onClick={handleNetworkAlerts}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-muted-foreground hover:bg-muted rounded-md bg-blue-50 border border-blue-200"
                >
                  <Megaphone className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-900">Network Alerts</span>
                </button>
              )}
              
              <button 
                onClick={handleViewGiveaways}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
              >
                <Gift className="h-4 w-4" />
                Giveaways
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Network Alert Modal */}
      {showNetworkAlerts && (
        <SendFieldRepNetworkAlert
          open={networkAlertOpen}
          onOpenChange={setNetworkAlertOpen}
          networkSize={0}
        />
      )}
    </header>
  );
};

export default Header;
