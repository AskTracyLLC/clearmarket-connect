import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageCircle, Calendar, ThumbsUp, ThumbsDown, Reply, Eye, EyeOff } from 'lucide-react';

const VendorReviews = () => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      fieldRepName: "John Davis",
      fieldRepInitials: "J.D.",
      rating: 5,
      date: "2024-03-10",
      reviewText: "Excellent vendor to work with! Payment was prompt and the work orders were clear and detailed. Communication was great throughout the process. Would definitely work with them again.",
      categories: {
        communication: 5,
        payment: 5,
        workOrders: 5,
        overall: 5
      },
      response: null,
      helpful: 8,
      notHelpful: 0,
      visible: true,
      jobType: "BPO Exterior",
      location: "Los Angeles, CA"
    },
    {
      id: 2,
      fieldRepName: "Sarah Miller",
      fieldRepInitials: "S.M.",
      rating: 4,
      date: "2024-03-05",
      reviewText: "Good vendor overall. Payments are on time and work orders are usually clear. Sometimes there can be delays in communication, but nothing major. Happy to continue working together.",
      categories: {
        communication: 4,
        payment: 5,
        workOrders: 4,
        overall: 4
      },
      response: {
        text: "Thanks for the feedback Sarah! We're working on improving our communication response times. We appreciate your continued partnership.",
        date: "2024-03-06"
      },
      helpful: 6,
      notHelpful: 1,
      visible: true,
      jobType: "REO Interior",
      location: "Dallas, TX"
    },
    {
      id: 3,
      fieldRepName: "Robert Wilson",
      fieldRepInitials: "R.W.",
      rating: 3,
      date: "2024-02-28",
      reviewText: "Mixed experience. While payments are reliable, there have been some issues with work order clarity and last-minute changes. Could improve on providing more detailed instructions upfront.",
      categories: {
        communication: 3,
        payment: 5,
        workOrders: 2,
        overall: 3
      },
      response: null,
      helpful: 4,
      notHelpful: 2,
      visible: true,
      jobType: "Occupancy Check",
      location: "Miami, FL"
    }
  ];

  const overallRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const handleReply = (reviewId: number) => {
    if (replyText.trim()) {
      console.log('Replying to review:', reviewId, 'with:', replyText);
      setReplyingTo(null);
      setReplyText('');
    }
  };

  const handleToggleVisibility = (reviewId: number) => {
    console.log('Toggling visibility for review:', reviewId);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            My Reviews
          </CardTitle>
          <CardDescription>
            Reviews from Field Reps you've worked with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">{overallRating.toFixed(1)}</div>
              <div className="flex justify-center mb-1">{renderStars(overallRating, 'md')}</div>
              <div className="text-sm text-muted-foreground">{totalReviews} reviews</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-1">
                {reviews.filter(r => r.response).length}
              </div>
              <div className="text-sm text-muted-foreground">Responses</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-1">
                {reviews.filter(r => r.visible).length}
              </div>
              <div className="text-sm text-muted-foreground">Visible</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-1">
                {reviews.reduce((sum, r) => sum + r.helpful, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Helpful votes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border border-muted">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {review.fieldRepInitials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{review.fieldRepName}</h3>
                      <Badge variant="outline" className="text-xs">{review.jobType}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {review.location}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleVisibility(review.id)}
                    className="h-8 w-8"
                  >
                    {review.visible ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Badge variant={review.visible ? "default" : "secondary"}>
                    {review.visible ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-foreground">{review.reviewText}</p>
                
                {/* Category Ratings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Communication</div>
                    {renderStars(review.categories.communication)}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Payment</div>
                    {renderStars(review.categories.payment)}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Work Orders</div>
                    {renderStars(review.categories.workOrders)}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Overall</div>
                    {renderStars(review.categories.overall)}
                  </div>
                </div>
                
                {/* Helpful votes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {review.helpful} helpful
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" />
                      {review.notHelpful} not helpful
                    </div>
                  </div>
                  
                  {!review.response && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(review.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}
                </div>
                
                {/* Existing Response */}
                {review.response && (
                  <div className="bg-muted/20 rounded-lg p-4 border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Your Response</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.response.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{review.response.text}</p>
                  </div>
                )}
                
                {/* Reply Form */}
                {replyingTo === review.id && (
                  <div className="space-y-3 border-t pt-4">
                    <Textarea
                      placeholder="Write your response to this review..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(review.id)}
                        disabled={!replyText.trim()}
                      >
                        Post Response
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {reviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start working with Field Reps to receive your first reviews.
          </p>
          <Button>
            Find Field Reps
          </Button>
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
