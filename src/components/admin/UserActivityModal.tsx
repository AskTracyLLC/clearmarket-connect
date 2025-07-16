import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserActivityLog } from "./UserActivityLog";

interface UserActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export const UserActivityModal = ({
  open,
  onOpenChange,
  userId,
  userName
}: UserActivityModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Activity Log for {userName}</DialogTitle>
        </DialogHeader>
        <UserActivityLog targetUserId={userId} showUserFilter={false} />
      </DialogContent>
    </Dialog>
  );
};