-- Create the missing get_user_saved_posts function
CREATE OR REPLACE FUNCTION public.get_user_saved_posts(target_user_id uuid)
 RETURNS TABLE(
   post_id uuid, 
   title text, 
   content text, 
   post_type text, 
   section text, 
   saved_at timestamp with time zone, 
   post_created_at timestamp with time zone
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.post_type,
    p.section,
    sp.created_at as saved_at,
    p.created_at as post_created_at
  FROM public.saved_posts sp
  JOIN public.community_posts p ON sp.post_id = p.id
  WHERE sp.user_id = target_user_id
  ORDER BY sp.created_at DESC;
END;
$function$