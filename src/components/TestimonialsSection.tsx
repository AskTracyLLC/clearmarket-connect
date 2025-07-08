import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  role: "vendor" | "fieldrep";
  rating: number;
  quote: string;
  badge?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "S.J.",
    location: "GA Vendor",
    role: "vendor",
    rating: 5,
    quote: "I found three solid reps within a week of signing up — way easier than cold posting on Facebook. This platform is exactly what we needed!",
    badge: "Early Beta User"
  },
  {
    id: 2,
    name: "M.R.",
    location: "TX Field Rep",
    role: "fieldrep",
    rating: 5,
    quote: "ClearMarket connected me with quality vendors who actually pay on time. My scheduling has never been more consistent.",
    badge: "Top Performer"
  },
  {
    id: 3,
    name: "D.K.",
    location: "FL Vendor",
    role: "vendor",
    rating: 5,
    quote: "The trust scores and verification system gives me confidence when hiring new reps. No more guessing games.",
  },
  {
    id: 4,
    name: "A.L.",
    location: "CA Field Rep",
    role: "fieldrep",
    rating: 5,
    quote: "Finally, a platform built for our industry. The community features help me stay connected with other professionals.",
    badge: "Community Leader"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length]
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Trusted by Professionals Nationwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what Field Reps and Vendors are saying about their ClearMarket experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {visibleTestimonials.map((testimonial, index) => (
            <Card key={`${testimonial.id}-${currentIndex}`} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                
                <blockquote className="text-foreground mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                  
                  {testimonial.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;