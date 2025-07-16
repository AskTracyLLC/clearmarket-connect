import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Brain, 
  Calendar, 
  Zap, 
  RotateCcw,
  Clock,
  Hash,
  X,
  ArrowLeft,
  Search
} from "lucide-react";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { ConflictAnalysisPanel } from "./ConflictAnalysisPanel";

interface DiscussionFormData {
  title: string;
  content: string;
  tags: string[];
  category: string;
  section: string;
  scheduledDate: string;
  scheduledTime: string;
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
  const [checkSimilarPosts, setCheckSimilarPosts] = useState(false);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  const [postingOption, setPostingOption] = useState<'now' | 'schedule'>('now');
  const [formData, setFormData] = useState<DiscussionFormData>({
    title: "",
    content: "",
    tags: [],
    category: "Ask the Community",
    section: "field-rep-forum",
    scheduledDate: "",
    scheduledTime: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [similarityAnalysis, setSimilarityAnalysis] = useState<SimilarityAnalysis | null>(null);

  const categories = [
    { value: "Ask the Community", label: "❓ Ask the Community" },
    { value: "Tips & Advice", label: "💡 Tips & Advice" },
    { value: "Business Talk", label: "💼 Business Talk" },
    { value: "Tech Help", label: "🔧 Tech Help" },
    { value: "Announcements", label: "📢 Announcements" },
    { value: "Poll", label: "📋 Poll" }
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

  const handleCheckSimilarPosts = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in title and content before checking");
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
      setShowAnalysisResults(true);
      toast.success(`Found ${data.similarPosts.length} similar posts`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to check for similar posts");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      content: "",
      tags: [],
      category: "Ask the Community",
      section: "field-rep-forum",
      scheduledDate: "",
      scheduledTime: ""
    });
    setSimilarityAnalysis(null);
    setShowAnalysisResults(false);
    setShowAISuggestions(false);
    setCheckSimilarPosts(false);
    setPostingOption('now');
    toast.success("Form reset");
  };

  const handleScheduleOrPost = async () => {
    if (!user || !formData.title || !formData.content) {
      toast.error("Please fill in required fields");
      return;
    }

    if (postingOption === 'schedule' && (!formData.scheduledDate || !formData.scheduledTime)) {
      toast.error("Please select a date and time for scheduling");
      return;
    }

    try {
      const scheduledDate = postingOption === 'schedule' 
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        : null;

      if (postingOption === 'now') {
        // Post immediately
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

        // Create community post
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
      } else {
        // Schedule for later
        await supabase
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
            scheduled_date: scheduledDate?.toISOString(),
            status: 'scheduled'
          });

        toast.success(`Discussion scheduled for ${scheduledDate?.toLocaleDateString()} at ${scheduledDate?.toLocaleTimeString()}`);
      }
      
      handleReset();
    } catch (error) {
      console.error('Post/Schedule error:', error);
      toast.error("Failed to post/schedule discussion");
    }
  };

  const useSuggestion = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.suggested_title,
      content: suggestion.suggested_topic,
      tags: suggestion.tags || [],
      category: suggestion.category || 'Ask the Community'
    }));
    setShowAISuggestions(false);
    toast.success("AI suggestion applied to form");
  };

  const backToForm = () => {
    setShowAnalysisResults(false);
  };

  // Show analysis results page
  if (showAnalysisResults && similarityAnalysis) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Similar Posts Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ConflictAnalysisPanel analysis={similarityAnalysis} />
            
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={backToForm}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-accent/20 border-accent">
        <CardHeader>
          <CardTitle className="text-lg">Schedule Community Discussion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Suggestions Toggle */}
          <div className="flex items-center gap-3">
            <Label className="text-sm">Need Topic Ideas?</Label>
            <Button
              variant={showAISuggestions ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAISuggestions(!showAISuggestions)}
            >
              {showAISuggestions ? "Yes" : "Yes"}
            </Button>
            <span className="text-xs text-muted-foreground">
              ← Auto-populate Title/Content when triggered.
              Get AI-powered suggestions based on community activity
            </span>
          </div>

          {/* AI Suggestions Panel */}
          {showAISuggestions && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <AISuggestionsPanel
                onUseSuggestion={useSuggestion}
                onClose={() => setShowAISuggestions(false)}
              />
            </div>
          )}

          {/* Discussion Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Discussion Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-accent/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Discussion Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="bg-accent/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-accent/30">
                    <SelectValue />
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
                  <SelectTrigger className="bg-accent/30">
                    <SelectValue />
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
              <Input
                id="tags"
                placeholder="Add tags (press Enter or comma to add)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => handleTagAdd(tagInput)}
                className="bg-accent/30"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
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

            {/* Similar Posts Check */}
            <div className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="similarCheck"
                  checked={checkSimilarPosts}
                  onCheckedChange={(checked) => setCheckSimilarPosts(checked as boolean)}
                />
                <Label htmlFor="similarCheck" className="text-sm">
                  Check for similar existing posts
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                When clicked run check and give results # as link to similar posts.
                (include back button to this)
              </p>
              {checkSimilarPosts && formData.title && formData.content && (
                <Button
                  onClick={handleCheckSimilarPosts}
                  disabled={isAnalyzing}
                  variant="outline"
                  size="sm"
                  className="ml-6"
                >
                  {isAnalyzing ? "Checking..." : "Run Check"}
                </Button>
              )}
            </div>

            {/* Scheduling Options */}
            <div className="space-y-3 p-3 border rounded-lg">
              <Label className="text-sm font-medium">When should this discussion be posted?</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="now"
                    name="posting"
                    checked={postingOption === 'now'}
                    onChange={() => setPostingOption('now')}
                  />
                  <Label htmlFor="now" className="text-sm">Now</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="schedule"
                    name="posting"
                    checked={postingOption === 'schedule'}
                    onChange={() => setPostingOption('schedule')}
                  />
                  <Label htmlFor="schedule" className="text-sm">Schedule</Label>
                </div>
                
                {postingOption === 'schedule' && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className="bg-accent/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Time</Label>
                      <Input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="bg-accent/30"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleScheduleOrPost}
                disabled={!formData.title || !formData.content}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {postingOption === 'now' ? (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Post
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule / Post
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};