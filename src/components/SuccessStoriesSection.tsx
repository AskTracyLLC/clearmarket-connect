import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";

interface SuccessStory {
  id: number;
  before: string;
  after: string;
  location: string;
  timeframe: string;
}

const successStories: SuccessStory[] = [
  {
    id: 1,
    before: "Couldn't find a rep in rural Arkansas",
    after: "Connected with two reps in 48 hours using the zip search filter",
    location: "Arkansas Vendor",
    timeframe: "Within 2 days"
  },
  {
    id: 2,
    before: "Struggling to find consistent work as a new field rep",
    after: "Booked 3 weeks solid after completing my ClearMarket profile",
    location: "Nevada Field Rep",
    timeframe: "First week"
  },
  {
    id: 3,
    before: "Lost money on unreliable contractors",
    after: "Found verified reps with proven track records and great reviews",
    location: "Texas Vendor",
    timeframe: "Same day"
  },
  {
    id: 4,
    before: "Spending hours on social media looking for work",
    after: "Get job notifications directly based on my coverage areas",
    location: "Florida Field Rep",
    timeframe: "Immediately"
  }
];

const SuccessStoriesSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            ClearMarket Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real transformations from our community of professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {successStories.map((story) => (
            <Card key={story.id} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                    <div className="text-sm font-medium text-foreground mb-1">Before:</div>
                    <p className="text-foreground">{story.before}</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="p-4 bg-success/10 rounded-lg border-l-4 border-success">
                    <div className="text-sm font-medium text-foreground mb-1">After:</div>
                    <p className="text-foreground">{story.after}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      {story.location}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {story.timeframe}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline-primary" size="lg">
            <MessageSquare className="h-5 w-5" />
            Submit Your Story
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Share your ClearMarket success and inspire others
          </p>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;