import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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

  // TEMPORARILY DISABLED: Redirect to prelaunch page immediately when component mounts
  // unless there's a bypass parameter indicating admin access
  // useEffect(() => {
  //   const bypass = searchParams.get('bypass');
  //   if (bypass === 'admin') {
  //     // Bypass the redirect for admin access
  //     navigate('/auth', { replace: true });
  //   } else {
  //     navigate('/prelaunch', { replace: true });
  //   }
  // }, [navigate, searchParams]);

  // Show temporary content instead of loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center">
      <Card className="p-8 max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">ClearMarket</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Temporary landing page - redirects disabled for admin access
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/auth'} 
            className="block w-full text-primary hover:underline cursor-pointer"
          >
            Go to Auth Page (Force Reload)
          </button>
          <Link to="/prelaunch" className="block text-primary hover:underline">Go to Prelaunch</Link>
        </div>
      </Card>
    </div>
  );
};
export default Index;
