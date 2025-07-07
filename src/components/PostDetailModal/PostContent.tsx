import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import { CommunityPost } from "@/data/mockCommunityPosts";

interface PostContentProps {
  post: CommunityPost;
}

const PostContent = ({ post }: PostContentProps) => {
  return (
    <div className={`space-y-3 ${post.isFlagged ? 'opacity-50' : ''}`}>
      <h2 className="text-xl font-semibold text-foreground">
        {post.title}
      </h2>
      <p className="text-foreground whitespace-pre-wrap">
        {post.content}
      </p>
      
      {/* System Tags */}
      {post.systemTags && post.systemTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            System Familiarity:
          </div>
          <div className="flex flex-wrap gap-2">
            {post.systemTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Screenshots */}
      {post.screenshots && post.screenshots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {post.screenshots.length} screenshot{post.screenshots.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {post.screenshots.map((screenshot, index) => (
              <img
                key={index}
                src={screenshot}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-auto max-h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(screenshot, '_blank')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostContent;