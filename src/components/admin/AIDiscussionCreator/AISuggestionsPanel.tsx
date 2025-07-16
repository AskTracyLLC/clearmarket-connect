import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock,
  Lightbulb,
  RefreshCw,
  X,
  ThumbsUp
} from "lucide-react";

interface AISuggestion {
  id: string;
  suggested_title: string;
  suggested_topic: string;
  rationale: string;
  confidence_score: number;
  tags: string[];
  category: string;
}

interface AISuggestionsPanelProps {
  onUseSuggestion: (suggestion: AISuggestion) => void;
  onClose: () => void;
}

export const AISuggestionsPanel = ({ onUseSuggestion, onClose }: AISuggestionsPanelProps) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // First check for cached suggestions
      const { data: cachedSuggestions, error: cacheError } = await supabase
        .from('discussion_suggestions')
        .select('*')
        .eq('admin_user_id', user.id)
        .eq('used_by_admin', false)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false })
        .limit(3);

      if (cacheError) throw cacheError;

      if (cachedSuggestions && cachedSuggestions.length > 0) {
        setSuggestions(cachedSuggestions);
        setIsLoading(false);
        return;
      }

      // Generate new suggestions via Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('generate-discussion-suggestions', {
        body: { adminUserId: user.id }
      });

      if (functionError) throw functionError;

      setSuggestions(data?.suggestions || []);
      
      if (!data?.suggestions || data.suggestions.length === 0) {
        setError("No relevant suggestions found. Try again later or create a custom discussion.");
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError("Failed to generate suggestions. Please try again.");
      toast.error("Failed to generate AI suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [user]);

  const handleUseSuggestion = async (suggestion: AISuggestion) => {
    try {
      // Mark suggestion as used
      await supabase
        .from('discussion_suggestions')
        .update({ 
          used_by_admin: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', suggestion.id);

      onUseSuggestion(suggestion);
    } catch (error) {
      console.error('Error marking suggestion as used:', error);
      toast.error("Failed to apply suggestion");
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-orange-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High Confidence";
    if (score >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            AI Topic Suggestions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              variant="ghost"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="h-5 w-5 animate-pulse" />
              <span>Analyzing community activity...</span>
            </div>
          </div>
        )}

        {error && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && suggestions.length === 0 && (
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              No suggestions available right now. The community seems well-covered! 
              Try creating a custom discussion instead.
            </AlertDescription>
          </Alert>
        )}

        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="border-muted">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h4 className="font-medium text-sm">{suggestion.suggested_title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {suggestion.suggested_topic}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-2 text-xs ${getConfidenceColor(suggestion.confidence_score)}`}
                >
                  {getConfidenceLabel(suggestion.confidence_score)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{suggestion.rationale}</span>
              </div>

              {suggestion.tags && suggestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {suggestion.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {suggestion.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{suggestion.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Category: {suggestion.category}</span>
                </div>
                <Button
                  onClick={() => handleUseSuggestion(suggestion)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Use This Topic
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {suggestions.length > 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription className="text-xs">
              These suggestions are based on recent community activity, trending topics, and engagement gaps. 
              Feel free to modify any suggestion to better match your vision.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};