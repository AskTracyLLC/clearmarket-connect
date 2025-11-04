
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useDualBalance } from '@/hooks/dual_balance_hook';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ClearMarketLogo from '@/components/ui/ClearMarketLogo';
import ProfileDropdown from '@/components/ui/ProfileDropdown';
import NotificationBell from '@/components/ui/NotificationBell';
import SendFieldRepNetworkAlert from '@/components/FieldRepDashboard/SendFieldRepNetworkAlert';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  User, 
  LogOut, 
  Star, 
  CreditCard, 
  Settings,
  Menu,
  MessageSquare,
  Calendar,
  HelpCircle,
  ShoppingCart,
  LayoutDashboard,
  X,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const { profile, loading } = useUserProfile();
  const { balance, isLoading } = useDualBalance();
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  // Fetch NDA signature data for user initials
  useEffect(() => {
    const isFetching = { current: false } as { current: boolean };
    const fetchNDAData = async () => {
      if (!user?.id || isFetching.current) return;
      isFetching.current = true;
      try {
        const { data } = await supabase
          .from('nda_signatures')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .order('signed_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          setFirstName(data.first_name);
          setLastName(data.last_name);
        }
      } catch (error) {
        console.error('Failed to load NDA data for avatar:', error);
      } finally {
        isFetching.current = false;
      }
    };
    fetchNDAData();
  }, [user?.id]);

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

  const handleBuyCredits = () => {
    navigate('/credits/purchase');
    setMobileSheetOpen(false);
  };

  // Get appropriate dashboard route based on user role
  const getDashboardRoute = () => {
    if (!profile) return '/dashboard';
    return profile.role === 'vendor' ? '/vendor/dashboard' : '/fieldrep/dashboard';
  };

  // Mobile navigation close handler
  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileSheetOpen(false);
  };

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            
            {/* Desktop Layout */}
            {!isMobile ? (
              <>
                {/* Logo */}
                <div className="flex items-center flex-shrink-0">
                  <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <ClearMarketLogo size={32} />
                    <span className="font-bold text-xl text-foreground whitespace-nowrap">ClearMarket</span>
                  </Link>
                  <span className="ml-3 px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-md border border-primary/20 whitespace-nowrap">
                    BETA
                  </span>
                </div>

                {/* Main Navigation */}
                <nav className="flex items-center space-x-6 flex-shrink-0">
                  <Link 
                    to={getDashboardRoute()} 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-md hover:bg-muted/50"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/community" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-md hover:bg-muted/50"
                  >
                    Community
                  </Link>
                  <Link 
                    to="/messages" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-md hover:bg-muted/50"
                  >
                    Messages
                  </Link>
                  <Link 
                    to="/support" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-md hover:bg-muted/50"
                  >
                    Support
                  </Link>
                </nav>

                {/* User Area */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {/* Currency Display */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/giveaways')}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {isLoading ? '0' : balance?.repPoints || 0}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/store')}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <CreditCard className="h-4 w-4 text-accent" />
                      <span className="font-medium">
                        {isLoading ? '0' : balance?.clearCredits || 0}
                      </span>
                    </Button>
                  </div>

                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* Notifications */}
                  <NotificationBell />

                  {/* User Profile */}
                  <ProfileDropdown
                    profile={profile}
                    firstName={firstName}
                    lastName={lastName}
                    anonymousUsername={profile?.anonymous_username}
                    onSignOut={handleSignOut}
                  />
                </div>
              </>
            ) : (
              /* Mobile Layout */
              <>
                {/* Mobile Menu Button */}
                <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="p-6 pb-4">
                      <SheetTitle className="text-left">Menu</SheetTitle>
                    </SheetHeader>
                    
                    {/* User Info Section */}
                    <div className="px-6 pb-4 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {firstName && lastName 
                              ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                              : profile?.anonymous_username?.[0] || 'U'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {profile?.anonymous_username || 'User'}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {profile?.role?.replace('_', ' ') || 'field rep'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Currency Section */}
                    <div className="p-6 space-y-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <Star className="h-4 w-4 text-primary" />
                                <span className="text-lg font-bold">
                                  {isLoading ? '0' : balance?.repPoints || 0}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">RepPoints</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <CreditCard className="h-4 w-4 text-accent" />
                                <span className="text-lg font-bold">
                                  {isLoading ? '0' : balance?.clearCredits || 0}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">ClearCredits</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Button 
                        onClick={handleBuyCredits} 
                        className="w-full" 
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy More Credits
                      </Button>
                    </div>

                    {/* Theme Toggle for Mobile */}
                    <div className="px-6 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeToggle />
                      </div>
                    </div>

                    {/* Navigation */}
                    <nav className="px-6 space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleMobileNavClick(getDashboardRoute())}
                      >
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleMobileNavClick('/community')}
                      >
                        <MessageSquare className="h-5 w-5 mr-3" />
                        Community
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleMobileNavClick('/messages')}
                      >
                        <Mail className="h-5 w-5 mr-3" />
                        Messages
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleMobileNavClick('/support')}
                      >
                        <HelpCircle className="h-5 w-5 mr-3" />
                        Support
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleMobileNavClick('/calendar')}
                      >
                        <Calendar className="h-5 w-5 mr-3" />
                        Calendar
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleMobileNavClick('/settings')}
                      >
                        <Settings className="h-5 w-5 mr-3" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleMobileNavClick('/help')}
                      >
                        <HelpCircle className="h-5 w-5 mr-3" />
                        Help & FAQ
                      </Button>
                    </nav>

                    {/* Sign Out */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setMobileSheetOpen(false);
                          handleSignOut();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Mobile Logo */}
                <Link to="/" className="flex items-center space-x-2">
                  <ClearMarketLogo size={28} />
                  <span className="font-bold text-lg text-foreground">ClearMarket</span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded border border-primary/20">
                    BETA
                  </span>
                </Link>

                {/* Mobile Notifications */}
                <NotificationBell />
              </>
            )}
          </div>
        </div>

        {/* Mobile Quick Currency Strip */}
        {isMobile && (
          <div className="bg-muted/30 border-t border-border px-4 py-2">
            <div className="flex justify-center space-x-6">
              <div className="flex items-center space-x-1 text-sm">
                <Star className="h-3 w-3 text-primary" />
                <span className="font-medium">{isLoading ? '0' : balance?.repPoints || 0}</span>
                <span className="text-muted-foreground text-xs">RP</span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <CreditCard className="h-3 w-3 text-accent" />
                <span className="font-medium">{isLoading ? '0' : balance?.clearCredits || 0}</span>
                <span className="text-muted-foreground text-xs">Credits</span>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
