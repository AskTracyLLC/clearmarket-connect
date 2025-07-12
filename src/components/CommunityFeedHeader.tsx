import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MessageSquare, Send } from "lucide-react";
import PostCreationModal from "./PostCreationModal";
import { SortOption, categories } from "@/utils/postUtils";

interface CommunityFeedHeaderProps {
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  showCreateModal: boolean;
  setShowCreateModal: (value: boolean) => void;
  handleCreatePost: (post: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    systemTags: string[];
  }) => void;
  resultsCount: number;
}

const CommunityFeedHeader = ({ 
  sortBy, 
  setSortBy, 
  selectedCategory, 
  setSelectedCategory,
  searchKeyword,
  setSearchKeyword,
  showCreateModal,
  setShowCreateModal,
  handleCreatePost,
  resultsCount
}: CommunityFeedHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground">
            Community Board
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="space-y-1">
                <label className="text-sm font-medium">Sort by:</label>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="post-type">Post Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Category:</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Create Post Button */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Create New Post
                </Button>
              </DialogTrigger>
              <PostCreationModal 
                onCreatePost={handleCreatePost}
                onClose={() => setShowCreateModal(false)}
              />
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by keyword..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Summary */}
          {(selectedCategory !== "all" || searchKeyword) && (
            <div className="text-sm text-muted-foreground">
              Showing {resultsCount} post{resultsCount !== 1 ? 's' : ''} 
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
              {searchKeyword && ` matching "${searchKeyword}"`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityFeedHeader;