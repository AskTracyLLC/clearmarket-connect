import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Index Page Component
 * 
 * This is the main landing page that automatically redirects users to the pre-launch page.
 * The redirect is implemented client-side using React Router to ensure users visiting
 * the root URL (/) are automatically taken to /prelaunch where all the pre-launch
 * functionality is located.
 * 
 * Post-launch, this page can be updated to contain the main application content
 * while keeping the pre-launch functionality separate and accessible.
 */
const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect to prelaunch page immediately when component mounts
  // unless there's a bypass parameter or email verification tokens
  useEffect(() => {
    const bypass = searchParams.get('bypass');
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const currentPath = window.location.pathname;
    
    // Don't redirect if on admin routes
    if (currentPath.startsWith('/admin')) {
      console.log('✅ Index: Admin route detected, not redirecting to prelaunch');
      return;
    }
    
    // Don't redirect if this is an email verification scenario
    if (token && type === 'signup') {
      console.log('✅ Index: Email verification detected, redirecting to verify handler');
      navigate('/auth/verify', { replace: true });
      return;
    }
    
    // Check if user came from /auth or is trying to access authentication
    const referrer = document.referrer;
    const fromAuth = referrer.includes('/auth') || bypass === 'auth' || bypass === 'beta';
    
    if (bypass === 'admin') {
      // Bypass the redirect for admin access
      navigate('/auth', { replace: true });
    } else if (bypass === 'beta') {
      // Beta users can access auth directly
      navigate('/auth', { replace: true });
    } else if (fromAuth) {
      // If coming from auth page, don't redirect to prelaunch
      console.log('✅ Index: User coming from auth, staying on index');
      return;
    } else {
      navigate('/prelaunch', { replace: true });
    }
  }, [navigate, searchParams]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center">
      <Card className="p-8 max-w-md mx-auto text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">ClearMarket</h2>
        <p className="text-muted-foreground text-sm">
          Redirecting to the pre-launch page...
        </p>
      </Card>
    </div>
  );
};

export default Index;
