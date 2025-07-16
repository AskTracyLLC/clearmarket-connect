import React from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  count = 0, 
  onClick 
}) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative h-10 w-10 rounded-full"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {count > 9 ? '9+' : count}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;