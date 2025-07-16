import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Brain, 
  Calendar, 
  Zap, 
  Save, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Hash,
  X
} from "lucide-react";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { ConflictAnalysisPanel } from "./ConflictAnalysisPanel";
import { SchedulingRecommendations } from "./SchedulingRecommendations";

interface DiscussionFormData {
  title: string;
  content: string;
  tags: string[];
  category: string;
  section: string;
}

interface SimilarityAnalysis {
  similarPosts: Array<{
    id: string;
    title: string;
    content: string;
    similarity: number;
    created_at: string;
    helpful_votes: number;
    comments_count: number;
  }>;
  conflictScore: number;
  recommendations: {
    action: 'post_now' | 'schedule' | 'revise';
    reasoning: string;
    recommendedDate?: string;
  };
}

export const AIDiscussionCreator = () => {
  const { user } = useAuth();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<DiscussionFormData>({
    title: "",
    content: "",
    tags: [],
    category: "discussion",
    section: "field-rep-forum"
  });
  const [tagInput, setTagInput] = useState("");
  const [similarityAnalysis, setSimilarityAnalysis] = useState<SimilarityAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const categories = [
    { value: "discussion", label: "Discussion" },
    { value: "question", label: "Q&A" },
    { value: "announcement", label: "Announcement" },
    { value: "tip", label: "Pro Tip" },
    { value: "resource", label: "Resource" }
  ];

  const sections = [
    { value: "field-rep-forum", label: "Field Rep Forum" },
    { value: "vendor-forum", label: "Vendor Forum" },
    { value: "general", label: "General Discussion" }
  ];

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd(tagInput);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in title and content before analyzing");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-discussion-content', {
        body: {
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          category: formData.category
        }
      });

      if (error) throw error;

      setSimilarityAnalysis(data);
      setShowAnalysis(true);
      toast.success("Content analysis completed");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze content");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !formData.title || !formData.content) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('admin_discussions')
        .insert({
          admin_user_id: user.id,
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          category: formData.category,
          section: formData.section,
          similarity_analysis: similarityAnalysis ? JSON.parse(JSON.stringify(similarityAnalysis)) : null,
          ai_suggestions_used: showAISuggestions,
          status: 'draft'
        });

      if (error) throw error;

      toast.success("Draft saved successfully");
      // Reset form after successful save
      setFormData({
        title: "",
        content: "",
        tags: [],
        category: "discussion",
        section: "field-rep-forum"
      });
      setSimilarityAnalysis(null);
      setShowAnalysis(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostNow = async () => {
    if (!user || !formData.title || !formData.content) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      // First save as admin discussion
      const { data: savedDiscussion, error: saveError } = await supabase
        .from('admin_discussions')
        .insert({
          admin_user_id: user.id,
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          category: formData.category,
          section: formData.section,
          similarity_analysis: similarityAnalysis ? JSON.parse(JSON.stringify(similarityAnalysis)) : null,
          ai_suggestions_used: showAISuggestions,
          status: 'posted'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Then create community post
      const { data: communityPost, error: postError } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          user_tags: formData.tags,
          post_type: formData.category,
          section: formData.section,
          board_type: formData.section
        })
        .select()
        .single();

      if (postError) throw postError;

      // Update admin discussion with posted post ID
      await supabase
        .from('admin_discussions')
        .update({ posted_post_id: communityPost.id })
        .eq('id', savedDiscussion.id);

      toast.success("Discussion posted successfully!");
      
      // Reset form
      setFormData({
        title: "",
        content: "",
        tags: [],
        category: "discussion",
        section: "field-rep-forum"
      });
      setSimilarityAnalysis(null);
      setShowAnalysis(false);
    } catch (error) {
      console.error('Post error:', error);
      toast.error("Failed to post discussion");
    }
  };

  const useSuggestion = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.suggested_title,
      content: suggestion.suggested_topic,
      tags: suggestion.tags || [],
      category: suggestion.category || 'discussion'
    }));
    setShowAISuggestions(false);
    toast.success("AI suggestion applied to form");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Create Community Discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Suggestions Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Need Topic Ideas?</Label>
              <p className="text-xs text-muted-foreground">
                Get AI-powered suggestions based on community activity
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={showAISuggestions}
                onCheckedChange={setShowAISuggestions}
              />
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {showAISuggestions && (
            <AISuggestionsPanel
              onUseSuggestion={useSuggestion}
              onClose={() => setShowAISuggestions(false)}
            />
          )}

          <Separator />

          {/* Discussion Content Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Discussion Title *</Label>
              <Input
                id="title"
                placeholder="Enter discussion title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Discussion Content *</Label>
              <Textarea
                id="content"
                placeholder="Start your discussion here. Ask questions, share insights, or provide helpful information..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                💡 Great discussions ask open-ended questions and encourage community participation
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec.value} value={sec.value}>{sec.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (up to 5)</Label>
              <div className="space-y-2">
                <Input
                  id="tags"
                  placeholder="Add tags (press Enter or comma to add)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={() => handleTagAdd(tagInput)}
                  className="text-sm"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Analysis */}
          {formData.title && formData.content && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing}
                variant="outline"
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze for Conflicts & Schedule Suggestions
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Analysis Results */}
          {showAnalysis && similarityAnalysis && (
            <>
              <ConflictAnalysisPanel analysis={similarityAnalysis} />
              <SchedulingRecommendations analysis={similarityAnalysis} />
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handlePostNow}
              disabled={!formData.title || !formData.content}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Post Now
            </Button>
            
            <Button
              onClick={handleSaveDraft}
              disabled={!formData.title || !formData.content || isSaving}
              variant="outline"
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};