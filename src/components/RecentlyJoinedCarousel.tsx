import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";

interface RecentMember {
  id: number;
  initials: string;
  state: string;
  type: "fieldrep" | "vendor";
  system?: string;
  lookingFor: string;
  joinedDays: number;
}

const recentMembers: RecentMember[] = [
  {
    id: 1,
    initials: "J.S.",
    state: "Michigan",
    type: "fieldrep",
    system: "EZinspections",
    lookingFor: "Looking for Work",
    joinedDays: 1
  },
  {
    id: 2,
    initials: "M.T.",
    state: "Florida",
    type: "vendor",
    lookingFor: "Seeking Coverage",
    joinedDays: 2
  },
  {
    id: 3,
    initials: "A.R.",
    state: "Texas",
    type: "fieldrep",
    system: "InspectorADE",
    lookingFor: "Looking for Work",
    joinedDays: 1
  },
  {
    id: 4,
    initials: "D.K.",
    state: "California",
    type: "vendor",
    lookingFor: "Seeking Coverage",
    joinedDays: 3
  },
  {
    id: 5,
    initials: "S.L.",
    state: "Georgia",
    type: "fieldrep",
    system: "ClearVue",
    lookingFor: "Looking for Work",
    joinedDays: 2
  },
  {
    id: 6,
    initials: "R.P.",
    state: "Arizona",
    type: "vendor",
    lookingFor: "Seeking Coverage",
    joinedDays: 1
  }
];

const RecentlyJoinedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, recentMembers.length - 2));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const visibleMembers = recentMembers.slice(currentIndex, currentIndex + 3);

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Recently Joined
          </h3>
          <p className="text-muted-foreground">
            Welcome our newest community members
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {visibleMembers.map((member) => (
              <Card key={`${member.id}-${currentIndex}`} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {member.type === "vendor" ? (
                        <Briefcase className="h-6 w-6 text-primary" />
                      ) : (
                        <Users className="h-6 w-6 text-accent" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {member.initials}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          — {member.state}
                        </span>
                      </div>
                      
                      {member.system && (
                        <div className="text-xs text-muted-foreground mb-1">
                          System: {member.system}
                        </div>
                      )}
                      
                      <Badge 
                        variant={member.type === "vendor" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {member.lookingFor}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-3 text-right">
                    Joined {member.joinedDays} day{member.joinedDays > 1 ? 's' : ''} ago
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyJoinedCarousel;