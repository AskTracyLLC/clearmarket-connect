console.log('🚨 FEEDBACK BOARD NEW FILE IS LOADING');

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import FeedbackCard from './FeedbackCard';

type FeedbackPost = {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  author: string;
  created_at: string;
  upvotes: number;
  comments_count: number;
};

export const FeedbackBoardNew = () => {
  console.log('🔥 Component starting...');
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data, error } = await supabase
        .from('feedback_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Unable to fetch feedback posts.');
        console.error(error);
      } else {
        const transformedPosts = (data || []).map((post: any) => ({
          ...post,
          type: post.category,
          comments_count: 0
        }));
        setPosts(transformedPosts);
      }

      setLoading(false);
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-12">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Community Feedback</h2>
      <div className="space-y-4">
        {posts.map((item) => (
          <FeedbackCard key={item.id} feedback={item} />
        ))}
      </div>
    </div>
  );
};
