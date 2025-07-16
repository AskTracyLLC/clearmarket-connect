import React from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { User, Settings, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import { UserProfile } from "@/hooks/useUserProfile";

interface ProfileDropdownProps {
  profile: UserProfile | null;
  firstName?: string | null;
  lastName?: string | null;
  companyLogo?: string | null;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  profile,
  firstName,
  lastName,
  companyLogo,
  onSignOut
}) => {
  const getProfilePath = () => {
    if (!profile) return "/vendor/profile";
    return profile.role === "vendor" ? "/vendor/profile" : "/fieldrep/profile";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
          <UserAvatar
            displayName={profile?.display_name}
            firstName={firstName}
            lastName={lastName}
            role={profile?.role}
            companyLogo={companyLogo}
            size="md"
            className="cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border border-border">
        <DropdownMenuItem asChild>
          <Link to={getProfilePath()} className="flex items-center cursor-pointer">
            <User className="mr-3 h-4 w-4" />
            User Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings?tab=notifications" className="flex items-center cursor-pointer">
            <Bell className="mr-3 h-4 w-4" />
            Notification Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="flex items-center cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;