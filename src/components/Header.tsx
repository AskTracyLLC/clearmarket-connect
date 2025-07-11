import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Home, 
  MessageSquare, 
  Calendar, 
  Settings,
  Shield // Add Shield icon for admin indication
} from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsSheetOpen(false);
  };

  const getDashboardPath = () => {
    // This would need to be implemented based on user role
    return "/fieldrep/dashboard";
  };

  // Hidden admin access function
  const handleFaviconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to admin login with a special query parameter
    navigate("/auth?admin=true");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2">
            {/* Clickable Favicon for Admin Access */}
            <div 
              className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
              onClick={handleFaviconClick}
              title="ClearMarket" // Normal title, no hint about admin access
            >
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">ClearMarket</span>
          </Link>

          {/* Desktop Navigation */}
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
                <Link to="/messages" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                  <Badge variant="destructive" className="text-xs">2</Badge>
                </Link>
                <Link to="/calendar" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Link>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
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
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth">Join</Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  {user ? (
                    <>
                      <Link 
                        to={getDashboardPath()} 
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Home className="h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link 
                        to="/vendor/search" 
                        className="text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Find Coverage
                      </Link>
                      <Link 
                        to="/community" 
                        className="text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Community
                      </Link>
                      <Link 
                        to="/messages" 
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Messages
                        <Badge variant="destructive" className="text-xs">2</Badge>
                      </Link>
                      <Link 
                        to="/calendar" 
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Calendar className="h-5 w-5" />
                        Calendar
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </Link>
                      <div className="border-t pt-4 mt-4">
                        <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/#how-it-works" 
                        className="text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        How It Works
                      </Link>
                      <Link 
                        to="/vendor/search" 
                        className="text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Find Coverage
                      </Link>
                      <Link 
                        to="/#pricing" 
                        className="text-lg font-medium"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Pricing
                      </Link>
                      <div className="border-t pt-4 mt-4">
                        <Button variant="hero" className="w-full" asChild>
                          <Link to="/auth" onClick={() => setIsSheetOpen(false)}>
                            Join
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
