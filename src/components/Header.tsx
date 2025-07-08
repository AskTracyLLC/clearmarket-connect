import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import MobileNav from "@/components/ui/mobile-nav";
import { ChevronDown, UserPlus, Building, MessageSquare, Settings, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MobileNav />
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">ClearMarket</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/vendor/search" className="text-muted-foreground hover:text-foreground transition-colors">
              Find Coverage
            </Link>
            <Link to="/community" className="text-muted-foreground hover:text-foreground transition-colors">
              Community
            </Link>
            <Link to="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
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
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                Sign In
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
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden">
              <Button variant="hero" size="sm">
                Join
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;