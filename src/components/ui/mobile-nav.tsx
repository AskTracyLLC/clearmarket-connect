import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, MessageCircle, Settings, Users, Home, HelpCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavProps {
  className?: string;
}

const MobileNav = ({ className }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const publicNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/#how-it-works", icon: HelpCircle, label: "How It Works" },
    { href: "/vendor/search", icon: Users, label: "Find Coverage" },
    { href: "/#pricing", icon: Settings, label: "Pricing" },
    { href: "/faq", icon: HelpCircle, label: "FAQ" },
  ];

  const privateNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/community", icon: Users, label: "Community" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/faq", icon: HelpCircle, label: "FAQ" },
  ];

  const navItems = user ? privateNavItems : publicNavItems;

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-6">
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent"
              >
                ClearMarket
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="border-t p-6">
              {user ? (
                <Button className="w-full" variant="outline" onClick={() => setIsOpen(false)}>
                  <Link to="/settings" className="w-full">
                    Account Settings
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" variant="hero" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    Join ClearMarket
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;