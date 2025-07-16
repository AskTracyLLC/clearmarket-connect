import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  MessageSquare, 
  ThumbsUp,
  TrendingUp,
  Calendar,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SimilarPost {
  id: string;
  title: string;
  content: string;
  similarity: number;
  created_at: string;
  helpful_votes: number;
  comments_count: number;
}

interface ConflictAnalysisProps {
  analysis: {
    similarPosts: SimilarPost[];
    conflictScore: number;
    recommendations: {
      action: 'post_now' | 'schedule' | 'revise';
      reasoning: string;
      recommendedDate?: string;
    };
  };
}

export const ConflictAnalysisPanel = ({ analysis }: ConflictAnalysisProps) => {
  const { similarPosts, conflictScore, recommendations } = analysis;

  const getConflictLevel = () => {
    if (conflictScore >= 0.7) return { label: "High Conflict", color: "destructive", icon: AlertTriangle };
    if (conflictScore >= 0.4) return { label: "Medium Conflict", color: "warning", icon: AlertTriangle };
    return { label: "Low Conflict", color: "success", icon: CheckCircle };
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.7) return "bg-red-100 text-red-800 border-red-200";
    if (similarity >= 0.4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.7) return "High Similarity";
    if (similarity >= 0.4) return "Medium Similarity";
    return "Low Similarity";
  };

  const conflictLevel = getConflictLevel();
  const ConflictIcon = conflictLevel.icon;

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Content Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Conflict Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Conflict Score</span>
            <Badge 
              variant={conflictLevel.color === 'destructive' ? 'destructive' : 'secondary'}
              className="flex items-center gap-1"
            >
              <ConflictIcon className="h-3 w-3" />
              {conflictLevel.label}
            </Badge>
          </div>
          <Progress value={conflictScore * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(conflictScore * 100)}% similarity to recent discussions
          </p>
        </div>

        {/* Recommendations */}
        <Alert className={
          recommendations.action === 'post_now' ? 'border-green-200 bg-green-50' :
          recommendations.action === 'schedule' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }>
          <ConflictIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                Recommended Action: {
                  recommendations.action === 'post_now' ? '⚡ Post Immediately' :
                  recommendations.action === 'schedule' ? '📅 Schedule for Later' :
                  '✏️ Revise Content'
                }
              </p>
              <p className="text-sm">{recommendations.reasoning}</p>
              {recommendations.recommendedDate && (
                <p className="text-sm">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Suggested date: {new Date(recommendations.recommendedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Similar Posts */}
        {similarPosts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Similar Discussions Found: {similarPosts.length}</h4>
            
            <div className="space-y-3">
              {similarPosts.slice(0, 3).map((post) => (
                <Card key={post.id} className="border-muted/50">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h5 className="font-medium text-sm line-clamp-1">{post.title}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {post.content.substring(0, 120)}...
                        </p>
                      </div>
                      <Badge 
                        className={`ml-2 text-xs ${getSimilarityColor(post.similarity)}`}
                        variant="outline"
                      >
                        {Math.round(post.similarity * 100)}% match
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {post.helpful_votes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments_count}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>

                    <div className="pt-1 border-t border-muted/50">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{getSimilarityLabel(post.similarity)}:</span>
                        {post.similarity >= 0.7 
                          ? " Very similar topic and content. Consider waiting or focusing on a different angle."
                          : post.similarity >= 0.4
                          ? " Some overlap detected. You could proceed but consider unique angles."
                          : " Minimal overlap. Good to proceed."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {similarPosts.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                + {similarPosts.length - 3} more similar posts found
              </p>
            )}
          </div>
        )}

        {similarPosts.length === 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-green-800">No Conflicts Detected</p>
                <p className="text-sm text-green-700">
                  Your discussion topic appears to be unique and doesn't conflict with recent posts. 
                  Perfect timing to engage the community!
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Engagement Prediction */}
        <div className="pt-3 border-t border-muted">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Predicted Engagement:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {conflictScore < 0.3 ? 'High' : conflictScore < 0.6 ? 'Medium' : 'Low'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on topic novelty, timing, and similar post performance
          </p>
        </div>
      </CardContent>
    </Card>
  );
};