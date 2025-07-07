import { useState } from "react";
import { mockCommunityPosts, CommunityPost } from "@/data/mockCommunityPosts";

export const usePostManagement = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const handleVote = (postId: number, type: 'helpful' | 'not-helpful') => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          if (type === 'helpful') {
            return { ...post, helpfulVotes: post.helpfulVotes + 1 };
          } else {
            return { ...post, notHelpfulVotes: post.notHelpfulVotes + 1 };
          }
        }
        return post;
      })
    );

    // Update selected post if it's open
    if (selectedPost && selectedPost.id === postId) {
      if (type === 'helpful') {
        setSelectedPost({ ...selectedPost, helpfulVotes: selectedPost.helpfulVotes + 1 });
      } else {
        setSelectedPost({ ...selectedPost, notHelpfulVotes: selectedPost.notHelpfulVotes + 1 });
      }
    }
  };

  const handleReplyVote = (replyId: number, type: 'helpful' | 'not-helpful') => {
    // Update reply votes in posts
    setPosts(prevPosts =>
      prevPosts.map(post => ({
        ...post,
        replies: post.replies.map(reply => {
          if (reply.id === replyId) {
            if (type === 'helpful') {
              return { ...reply, helpfulVotes: reply.helpfulVotes + 1 };
            } else {
              return { ...reply, notHelpfulVotes: reply.notHelpfulVotes + 1 };
            }
          }
          return reply;
        })
      }))
    );

    // Update selected post if it contains the reply
    if (selectedPost) {
      const updatedReplies = selectedPost.replies.map(reply => {
        if (reply.id === replyId) {
          if (type === 'helpful') {
            return { ...reply, helpfulVotes: reply.helpfulVotes + 1 };
          } else {
            return { ...reply, notHelpfulVotes: reply.notHelpfulVotes + 1 };
          }
        }
        return reply;
      });
      setSelectedPost({ ...selectedPost, replies: updatedReplies });
    }
  };

  const handleFlag = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isFlagged: true } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isFlagged: true });
    }
  };

  const handleFollow = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isFollowed: !post.isFollowed } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isFollowed: !selectedPost.isFollowed });
    }
  };

  const handleSave = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isSaved: !selectedPost.isSaved });
    }
  };

  const handleResolve = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isResolved: true } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, isResolved: true });
    }
  };

  const handlePinReply = (postId: number, replyId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, pinnedReplyId: replyId } : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, pinnedReplyId: replyId });
    }
  };

  const handleCreatePost = (newPost: {
    type: string;
    title: string;
    content: string;
    isAnonymous: boolean;
    systemTags: string[];
  }) => {
    const post: CommunityPost = {
      id: Math.max(...posts.map(p => p.id)) + 1,
      type: newPost.type as any,
      title: newPost.title,
      content: newPost.content,
      authorInitials: newPost.isAnonymous ? "Anonymous" : "Y.U.", // Mock current user initials
      isAnonymous: newPost.isAnonymous,
      timePosted: new Date(),
      helpfulVotes: 0,
      notHelpfulVotes: 0,
      isFlagged: false,
      isFollowed: false,
      isSaved: false,
      isResolved: false,
      systemTags: newPost.systemTags,
      replies: [],
      authorBadges: [],
      communityScore: 50 // Default score for new users
    };

    setPosts(prevPosts => [post, ...prevPosts]);
  };

  return {
    posts,
    selectedPost,
    setSelectedPost,
    handleVote,
    handleReplyVote,
    handleFlag,
    handleFollow,
    handleSave,
    handleResolve,
    handlePinReply,
    handleCreatePost,
  };
};