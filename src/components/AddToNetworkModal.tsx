import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addRepToNetwork } from "@/data/mockVendorData";

interface AddToNetworkModalProps {
  repId: number;
  repInitials: string;
  onNetworkAdded: () => void;
}

const AddToNetworkModal = ({ repId, repInitials, onNetworkAdded }: AddToNetworkModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToNetwork = async () => {
    setIsAdding(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = addRepToNetwork(repId, repInitials);
    
    if (success) {
      toast({
        title: "Added to Network!",
        description: `${repInitials} has been added to your network. Their profile will remain visible in all future searches.`,
      });
      onNetworkAdded();
      setIsOpen(false);
    } else {
      toast({
        title: "Failed to Add",
        description: "This rep is already in your network or an error occurred.",
        variant: "destructive",
      });
    }
    
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Add to My Network
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {repInitials} to Your Network</DialogTitle>
          <DialogDescription>
            Are you sure you want to add {repInitials} to your Network? 
            Once added, their profile will remain visible in all future searches without using credits.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToNetwork}
            disabled={isAdding}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isAdding ? "Adding..." : "Add to Network"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToNetworkModal;