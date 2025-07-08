import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wifi, WifiOff, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorStateProps {
  type: "500" | "404" | "offline" | "network" | "generic";
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

const ErrorState = ({ 
  type, 
  title, 
  message, 
  onRetry, 
  showHomeButton = true 
}: ErrorStateProps) => {
  const getErrorContent = () => {
    switch (type) {
      case "500":
        return {
          icon: <AlertTriangle className="h-8 w-8 text-destructive" />,
          title: title || "Server Error",
          message: message || "We're experiencing technical difficulties. Please try again later.",
          color: "text-destructive"
        };
      case "404":
        return {
          icon: <AlertTriangle className="h-8 w-8 text-muted-foreground" />,
          title: title || "Page Not Found",
          message: message || "The page you're looking for doesn't exist or has been moved.",
          color: "text-muted-foreground"
        };
      case "offline":
        return {
          icon: <WifiOff className="h-8 w-8 text-muted-foreground" />,
          title: title || "You're Offline",
          message: message || "Please check your internet connection and try again.",
          color: "text-muted-foreground"
        };
      case "network":
        return {
          icon: <Wifi className="h-8 w-8 text-destructive" />,
          title: title || "Connection Error",
          message: message || "Unable to connect to our servers. Please check your internet connection.",
          color: "text-destructive"
        };
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-destructive" />,
          title: title || "Something went wrong",
          message: message || "We encountered an unexpected error. Please try again.",
          color: "text-destructive"
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {content.icon}
          </div>
          <CardTitle className={content.color}>
            {content.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {content.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {showHomeButton && (
              <Button asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;