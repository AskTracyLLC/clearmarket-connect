import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, AlertCircle } from "lucide-react";

interface CreditFilterWarningProps {
  creditCost: number;
  isVisible: boolean;
}

const CreditFilterWarning = ({ creditCost, isVisible }: CreditFilterWarningProps) => {
  if (!isVisible || creditCost === 0) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>
            This search will cost <strong>{creditCost} credit{creditCost > 1 ? 's' : ''}</strong> for enhanced results including the selected premium filters.
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CreditFilterWarning;