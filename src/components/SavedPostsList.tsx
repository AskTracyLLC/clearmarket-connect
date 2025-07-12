import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, MessageSquare, ThumbsUp } from "lucide-react";
import { useSavedPosts } from "@/hooks/useTrendingTags";
import { formatDistanceToNow } from "date-fns";

const SavedPostsList = () => {
  const { savedPosts, loading, toggleSavePost } = useSavedPosts();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading saved posts...</p>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No saved posts yet</h3>
        <p className="text-muted-foreground">Posts you save will appear here for easy access</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedPosts.map((savedPost) => (
        <Card key={savedPost.post_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                {savedPost.title && (
                  <h3 className="font-semibold text-lg mb-2">{savedPost.title}</h3>
                )}
                <p className="text-muted-foreground mb-3 line-clamp-3">
                  {savedPost.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSavePost(savedPost.post_id)}
                className="ml-2"
              >
                <Bookmark className="h-4 w-4 fill-current" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline">{savedPost.post_type}</Badge>
                <Badge variant="secondary">{savedPost.section}</Badge>
                <span>{formatDistanceToNow(new Date(savedPost.post_created_at))} ago</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Saved {formatDistanceToNow(new Date(savedPost.saved_at))} ago
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedPostsList;