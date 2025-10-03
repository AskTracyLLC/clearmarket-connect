-- Remove duplicate NDA documents, keeping only the most recent one
DELETE FROM user_documents
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, document_type 
             ORDER BY created_at DESC
           ) as rn
    FROM user_documents
    WHERE document_type = 'nda'
  ) t
  WHERE rn > 1
);

-- Create partial unique index to prevent duplicate NDAs per user
CREATE UNIQUE INDEX unique_nda_per_user 
ON user_documents (user_id, document_type) 
WHERE document_type = 'nda';