import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import MobileNav from "@/components/ui/mobile-nav";
import NotificationBell from "@/components/ui/NotificationBell";
import ProfileDropdown from "@/components/ui/ProfileDropdown";
import { ChevronDown, UserPlus, Building, MessageSquare, Calendar, Home, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useNDAStatus } from "@/hooks/useNDAStatus";
import CreditBalance from "@/components/ui/CreditBalance";

const Header = () => {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { unreadCount } = useNotifications();
  const { hasSignedNDA, loading: ndaLoading } = useNDAStatus();

  const getDashboardPath = () => {
    const role = profile?.role || "field_rep";
    return role === "vendor" ? "/vendor/dashboard" : "/fieldrep/dashboard";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MobileNav />
            <Link to="/auth" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/5d315367-d1a1-4352-939e-bbe0ead13db2.png" 
                alt="ClearMarket" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">ClearMarket</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to={getDashboardPath()} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/vendor/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Find Coverage
                </Link>
                <Link to="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </Link>
                <Link to="/calendar" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Link>
                <CreditBalance />
              </>
            ) : (
              <>
                <Link to="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
                <Link to="/vendor/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Find Coverage
                </Link>
                <Link to="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  {/* NDA Status Indicator for authenticated users */}
                  {!ndaLoading && !hasSignedNDA && (
                    <Link to="/beta-nda">
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-600 hover:bg-orange-50">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Complete Legal Agreement
                      </Button>
                    </Link>
                  )}
                  
                  {!ndaLoading && hasSignedNDA && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Agreement Signed</span>
                    </div>
                  )}
                  
                  {/* Circular Icon Layout */}
                  <div className="flex items-center space-x-2">
                    {/* Notification Bell */}
                    <NotificationBell count={unreadCount} />
                    
                    {/* Messages Icon */}
                    <Link to="/messages">
                      <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                        <MessageSquare className="h-5 w-5" />
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          2
                        </Badge>
                      </Button>
                    </Link>
                    
                    {/* Profile Avatar with Dropdown */}
                    <ProfileDropdown
                      profile={profile}
                      firstName={user?.user_metadata?.first_name}
                      lastName={user?.user_metadata?.last_name}
                      companyLogo={user?.user_metadata?.company_logo}
                      onSignOut={handleSignOut}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="hero" size="sm">
                        Create Profile
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/profile" className="flex items-center cursor-pointer">
                          <Building className="mr-2 h-4 w-4" />
                          Vendor Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/fieldrep/profile" className="flex items-center cursor-pointer">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Field Rep Profile
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden">
              {user ? (
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth">Join</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;