import { useState } from 'react';
import { useSupabaseDebug } from '@/hooks/useSupabaseDebug';
import { Card } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { Database, AlertTriangle, Activity, X, Minimize2, Maximize2 } from 'lucide-react';

export const SupabaseDebugPanel = () => {
  const { requests, loops } = useSupabaseDebug();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) return null;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const hasLoops = loops.length > 0;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-[9999] shadow-lg border-2"
        title="Open Supabase Debug Panel"
      >
        <Database className="h-4 w-4 mr-2" />
        DB Debug
        {pendingRequests.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {pendingRequests.length}
          </Badge>
        )}
        {hasLoops && (
          <AlertTriangle className="h-4 w-4 ml-2 text-destructive animate-pulse" />
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-[9999] shadow-2xl border-2 bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="font-semibold text-sm">Supabase Debug</span>
          <Activity className="h-3 w-3 text-muted-foreground animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="w-80">
          {/* Loop Warning */}
          {hasLoops && (
            <div className="p-3 bg-destructive/10 border-b border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-destructive">Request Loop Detected!</p>
                  {loops.map((loop, i) => (
                    <p key={i} className="text-xs text-destructive/80 mt-1 font-mono">
                      {loop}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Requests */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Active Requests</span>
              <Badge variant="secondary" className="text-xs">
                {pendingRequests.length}
              </Badge>
            </div>
            {pendingRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active requests</p>
            ) : (
              <ScrollArea className="h-24">
                <div className="space-y-1">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="text-xs font-mono flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-muted-foreground">{req.operation}</span>
                      <span className="font-semibold truncate flex-1">{req.table}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Recent Requests */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Recent (5s)</span>
              <Badge variant="outline" className="text-xs">
                {requests.length}
              </Badge>
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {requests.slice(0, 20).map(req => (
                  <div key={req.id} className="text-xs font-mono flex items-center gap-2">
                    <Badge 
                      variant={req.status === 'pending' ? 'secondary' : req.status === 'success' ? 'default' : 'destructive'}
                      className="text-[10px] px-1 py-0"
                    >
                      {req.status === 'pending' ? '...' : req.status === 'success' ? '✓' : '✗'}
                    </Badge>
                    <span className="text-muted-foreground w-12">{req.operation}</span>
                    <span className="truncate flex-1">{req.table}</span>
                    {req.duration && (
                      <span className="text-muted-foreground">{req.duration}ms</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </Card>
  );
};
