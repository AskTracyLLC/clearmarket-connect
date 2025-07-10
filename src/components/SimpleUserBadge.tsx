import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";

interface SimpleUserBadgeProps {
  name: string;
  role: string;
  showTrustScore?: boolean;
}

const SimpleUserBadge = ({ name, role, showTrustScore = false }: SimpleUserBadgeProps) => {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vendor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'field_rep':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'moderator':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const formatRole = (role: string) => {
    switch (role.toLowerCase()) {
      case 'field_rep':
        return 'Field Rep';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">{name}</span>
      <Badge 
        variant="outline" 
        className={`text-xs flex items-center gap-1 ${getRoleColor(role)}`}
      >
        {getRoleIcon(role)}
        {formatRole(role)}
      </Badge>
    </div>
  );
};

export default SimpleUserBadge;