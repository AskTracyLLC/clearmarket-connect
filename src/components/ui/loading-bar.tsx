import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const LoadingBar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setProgress(20);

    const timer1 = setTimeout(() => setProgress(60), 100);
    const timer2 = setTimeout(() => setProgress(90), 300);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className={cn(
          "h-1 bg-gradient-primary transition-all duration-300 ease-out",
          progress === 100 ? "opacity-0" : "opacity-100"
        )}
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 ? "width 0.2s ease-out, opacity 0.2s ease-out 0.2s" : "width 0.3s ease-out"
        }}
      />
    </div>
  );
};

export default LoadingBar;