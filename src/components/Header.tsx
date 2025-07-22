import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDualBalance } from '@/hooks/useDualBalance';
import { 
  User, 
  LogOut, 
  Trophy, 
  CreditCard, 
  Gift,
  Settings,
  Menu,
  X
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
  const { balance, isLoading } = useDualBalance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const handleViewGiveaways = () => {
    navigate('/giveaways');
    setMobileMenuOpen(false);
  };

  const handleBuyCredits = () => {
    navigate('/credits/purchase');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="font-bold text-xl text-gray-900">ClearMarket</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/community" className="text-gray-700 hover:text-primary transition-colors">
              Community
            </Link>
            <Link to="/coverage" className="text-gray-700 hover:text-primary transition-colors">
              Coverage
            </Link>
            <Link to="/network" className="text-gray-700 hover:text-primary transition-colors">
              Network
            </Link>
          </nav>

          {/* Desktop Balance & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Dual Balance Display */}
            <div className="flex items-center space-x-2">
              {/* RepPoints */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewGiveaways}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  {isLoading ? '...' : balance.repPoints}
                </span>
                <span className="text-blue-600 text-xs">RepPoints</span>
              </Button>

              {/* ClearCredits */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBuyCredits}
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200"
              >
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-green-900 font-medium">
                  {isLoading ? '...' : balance.clearCredits}
                </span>
                <span className="text-green-600 text-xs">Credits</span>
              </Button>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">John D.</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleViewGiveaways}>
                  <Gift className="mr-2 h-4 w-4" />
                  Giveaways
                  <Badge variant="outline" className="ml-auto text-xs">
                    {balance.repPoints} pts
                  </Badge>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleBuyCredits}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Buy Credits
                  <Badge variant="outline" className="ml-auto text-xs">
                    {balance.clearCredits}
                  </Badge>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                to="/dashboard" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/community" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Community
              </Link>
              <Link 
                to="/coverage" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Coverage
              </Link>
              <Link 
                to="/network" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Network
              </Link>
              <button 
                onClick={handleViewGiveaways}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Giveaways
              </button>
              <button 
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
