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

  // Show loading state while redirect is happening
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center">
      <Card className="p-8 max-w-md mx-auto text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Redirecting to ClearMarket...</h2>
        <p className="text-muted-foreground text-sm">
          Taking you to our pre-launch signup page
        </p>
      </Card>
    </div>
  );
};
export default Index;
