import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface QuickFiltersProps {
  onlyActiveUsers: boolean;
  onOnlyActiveUsersChange: (value: boolean) => void;
  onlyOutOfNetwork: boolean;
  onOnlyOutOfNetworkChange: (value: boolean) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

const QuickFilters = ({ 
  onlyActiveUsers, 
  onOnlyActiveUsersChange,
  onlyOutOfNetwork,
  onOnlyOutOfNetworkChange,
  sortBy,
  onSortByChange
}: QuickFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center space-x-2">
        <Switch 
          id="activeOnly"
          checked={onlyActiveUsers}
          onCheckedChange={onOnlyActiveUsersChange}
        />
        <Label htmlFor="activeOnly" className="text-sm">Show only active users</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="out-of-network"
          checked={onlyOutOfNetwork}
          onCheckedChange={onOnlyOutOfNetworkChange}
        />
        <Label htmlFor="out-of-network" className="text-sm">Only Out-of-Network</Label>
      </div>
      {sortBy && (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
          Sorted by: {sortBy}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => onSortByChange("")}
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuickFilters;