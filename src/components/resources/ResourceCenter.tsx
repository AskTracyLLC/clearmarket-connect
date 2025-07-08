import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, FileText, Clock, ExternalLink } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  excerpt: string;
  category: "reps" | "vendors" | "general";
  readTime: string;
  author: string;
  date: string;
}

const ResourceCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const resources: Resource[] = [
    {
      id: "1",
      title: "How to Price Your Services as a Field Rep",
      excerpt: "Learn the key factors that determine competitive pricing in your market.",
      category: "reps",
      readTime: "5 min read",
      author: "ClearMarket Team",
      date: "2024-01-15"
    },
    {
      id: "2", 
      title: "What Vendors Wish Reps Knew",
      excerpt: "Insider tips from experienced vendors on building lasting partnerships.",
      category: "reps",
      readTime: "7 min read",
      author: "Sarah M., Vendor",
      date: "2024-01-10"
    },
    {
      id: "3",
      title: "Reducing QC Issues and Rejections", 
      excerpt: "Best practices for quality control that save time and build trust.",
      category: "general",
      readTime: "6 min read",
      author: "Mike R., Senior Rep",
      date: "2024-01-08"
    },
    {
      id: "4",
      title: "Building Your Vendor Network Effectively",
      excerpt: "Strategies for finding and connecting with the right field representatives.",
      category: "vendors",
      readTime: "8 min read", 
      author: "ClearMarket Team",
      date: "2024-01-05"
    },
    {
      id: "5",
      title: "Understanding HUD Key Requirements",
      excerpt: "Complete guide to HUD key codes, applications, and compliance.",
      category: "general",
      readTime: "10 min read",
      author: "Legal Team",
      date: "2024-01-01"
    }
  ];

  const filteredResources = selectedCategory === "all" 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  const getCategoryBadge = (category: string) => {
    const styles = {
      reps: "bg-blue-100 text-blue-800",
      vendors: "bg-green-100 text-green-800", 
      general: "bg-purple-100 text-purple-800"
    };
    return styles[category as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Resource Center</h1>
        <p className="text-muted-foreground">
          Expert tips, guides, and insights to help you succeed on ClearMarket
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="reps">For Field Reps</TabsTrigger>
          <TabsTrigger value="vendors">For Vendors</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-elevated transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <Badge 
                        variant="secondary" 
                        className={getCategoryBadge(resource.category)}
                      >
                        {resource.category === "reps" ? "Field Reps" : 
                         resource.category === "vendors" ? "Vendors" : "General"}
                      </Badge>
                      <CardTitle className="text-lg leading-tight">
                        {resource.title}
                      </CardTitle>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {resource.readTime}
                      </span>
                      <span>By {resource.author}</span>
                    </div>
                    <span>{new Date(resource.date).toLocaleDateString()}</span>
                  </div>
                  
                  <Button variant="outline" className="w-full" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Article
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit Content CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Share Your Expertise</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Have insights to share? Submit your tips or guides to help the community.
          </p>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Submit Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceCenter;