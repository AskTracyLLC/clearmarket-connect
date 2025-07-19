-- Test if the RLS policy is working by temporarily allowing all operations
-- First, let's check if we can insert data as an anonymous user

-- Check current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'pre_launch_signups';

-- Let's also check the table structure
\d pre_launch_signups;