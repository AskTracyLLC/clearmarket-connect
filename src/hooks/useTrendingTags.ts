import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface TrendingTag {
  tag_name: string;
  tag_count: number;
}

export interface UseTrendingTagsOptions {
  daysBack?: number;
  tagLimit?: number;
  section?: 'field-rep-forum' | 'vendor-bulletin' | null;
  enabled?: boolean;
}

export const useTrendingTags = (options: UseTrendingTagsOptions = {}) => {
  const {
    daysBack = 30,
    tagLimit = 5,
    section = null,
    enabled = true
  } = options;

  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrendingTags = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Call the database function we created
      const { data, error: dbError } = await supabase.rpc('get_trending_tags', {
        days_back: daysBack,
        tag_limit: tagLimit,
        section_filter: section
      });

      if (dbError) {
        throw new Error(`Failed to fetch trending tags: ${dbError.message}`);
      }

      setTrendingTags(data || []);
    
