// Admin configuration - only these emails have admin access
export const ADMIN_EMAILS = [
  "skogki2312@ueab.ac.ke",
  "bluedonateldo@gmail.com", 
  "kogodennis390@gmail.com"
];

export function isAdmin(email: string): boolean {
  console.log(`[isAdmin] Received email: "${email}"`);
  
  if (!email) {
    console.log(`[isAdmin] Email is empty or falsy`);
    return false;
  }
  
  // Normalize email: trim whitespace and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase();
  console.log(`[isAdmin] Normalized email: "${normalizedEmail}"`);
  console.log(`[isAdmin] Admin emails list:`, ADMIN_EMAILS);
  
  // Check if email is in admin list (also normalize admin emails for comparison)
  const normalizedAdminEmails = ADMIN_EMAILS.map(e => e.trim().toLowerCase());
  console.log(`[isAdmin] Normalized admin emails:`, normalizedAdminEmails);
  
  const isAdminUser = normalizedAdminEmails.includes(normalizedEmail);
  
  // Log for debugging (remove in production if needed)
  if (isAdminUser) {
    console.log(`[isAdmin] ✅ Admin access granted for: ${normalizedEmail}`);
  } else {
    console.log(`[isAdmin] ❌ Admin access denied for: ${normalizedEmail}`);
    console.log(`[isAdmin] Email comparison:`, {
      normalizedEmail,
      normalizedAdminEmails,
      matches: normalizedAdminEmails.map(e => ({ email: e, matches: e === normalizedEmail }))
    });
  }
  
  return isAdminUser;
}
