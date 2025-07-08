import { Card } from "@/components/ui/card";
import { Users, Building, TrendingUp } from "lucide-react";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
}

interface StatsBarProps {
  className?: string;
}

export const StatsBar = ({ className }: StatsBarProps) => {
  const stats: StatItem[] = [
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      value: "500+",
      label: "Active Field Reps"
    },
    {
      icon: <Building className="h-5 w-5 text-accent" />,
      value: "200+",
      label: "Trusted Vendors"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-trust" />,
      value: "84",
      label: "Matches This Month"
    }
  ];

  return (
    <Card className={`bg-gradient-card border shadow-card ${className}`}>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background/50 rounded-lg flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export const PlatformGrowthStats = ({ className }: { className?: string }) => (
  <div className={`text-center space-y-2 ${className}`}>
    <p className="text-muted-foreground text-sm">Paving the Way to a Better Way to Work Together</p>
    <div className="flex items-center justify-center flex-wrap gap-6 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        🚀 <strong className="text-primary">500+</strong> Active Field Reps
      </span>
      <span className="flex items-center gap-1">
        🏢 <strong className="text-accent">200+</strong> Vendors
      </span>
      <span className="flex items-center gap-1">
        📈 <strong className="text-trust">84</strong> Matches This Month
      </span>
    </div>
  </div>
);