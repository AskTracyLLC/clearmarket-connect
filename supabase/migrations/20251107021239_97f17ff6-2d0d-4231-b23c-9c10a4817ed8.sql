-- Allow vendors to create coverage requests
CREATE POLICY "Vendors can create coverage requests"
ON coverage_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = vendor_user_id);

-- Allow vendors to view and update their own coverage requests
CREATE POLICY "Vendors can view own coverage requests"
ON coverage_requests
FOR SELECT
TO authenticated
USING (auth.uid() = vendor_user_id);

CREATE POLICY "Vendors can update own coverage requests"
ON coverage_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = vendor_user_id);