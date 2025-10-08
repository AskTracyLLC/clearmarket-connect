import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Gift } from "lucide-react";

interface ProfileStep {
  id: string;
  label: string;
  completed: boolean;
  required?: boolean;
}

interface ProfileProgressProps {
  steps: ProfileStep[];
  userType: "vendor" | "fieldrep";
  className?: string;
}

export const ProfileProgress = ({ steps, userType, className }: ProfileProgressProps) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const isComplete = completedSteps === totalSteps;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Profile Completion</CardTitle>
          {isComplete && (
            <Badge variant="default" className="flex items-center gap-1">
              <Gift className="h-3 w-3" />
              +5 Credits Earned!
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSteps} of {totalSteps} steps completed
            </span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-sm ${step.completed ? 'text-foreground line-through' : 'text-muted-foreground'}`}>
              {step.label}
              {step.required && !step.completed && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </span>
          </div>
        ))}
        
        {isComplete && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              🎉 Profile complete! You've earned 5 credits and increased your visibility to potential partners.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Sample data generators
export const getVendorProfileSteps = (mockProfile?: any): ProfileStep[] => [
  {
    id: "service-area",
    label: "Added service area",
    completed: mockProfile?.serviceAreas?.length > 0 || true,
    required: true
  },
  {
    id: "platforms",
    label: "Listed platforms used",
    completed: mockProfile?.platforms?.length > 0 || false,
    required: true
  },
  {
    id: "work-types",
    label: "Set work types",
    completed: mockProfile?.workTypes?.length > 0 || false,
    required: true
  },
  {
    id: "community",
    label: "Interacted on Community Board",
    completed: false
  },
  {
    id: "network",
    label: "Connected with a field rep",
    completed: mockProfile?.networkSize > 0 || false
  }
];

export const getFieldRepProfileSteps = (mockProfile?: any): ProfileStep[] => [
  {
    id: "personal-info",
    label: "Personal Information Complete",
    completed: mockProfile?.personalInfoComplete || false,
    required: true
  },
  {
    id: "verification",
    label: "Verification Complete",
    completed: mockProfile?.verificationComplete || false,
    required: true
  },
  {
    id: "coverage-setup",
    label: "Coverage Setup Complete",
    completed: mockProfile?.coverageSetupComplete || false,
    required: true
  },
  {
    id: "community",
    label: "Interacted on Community Board",
    completed: false
  },
  {
    id: "network",
    label: "Connected with a vendor",
    completed: mockProfile?.networkSize > 0 || false
  }
];