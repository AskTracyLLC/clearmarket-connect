import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeedbackPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Page Moved</h1>
            <p className="text-muted-foreground">
              The feedback system has been moved to the Community page under the Support tab.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/community', { state: { activeTab: 'support' } })} 
              className="w-full"
            >
              Go to Community Support
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;