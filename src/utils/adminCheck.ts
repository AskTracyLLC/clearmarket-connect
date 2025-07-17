// Admin email list - centralized for consistency
export const ADMIN_EMAILS = ['admin@clearmarket.com', 'admin@lovable.app'];

/**
 * Check if a user email is in the admin emails list
 * This provides immediate admin status without database calls
 */
export const isAdminByEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};