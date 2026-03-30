/**
 * Generate initials from a name or email
 */
export const getInitials = (nameOrEmail?: string): string => {
  if (!nameOrEmail) return '?';
  
  // If it looks like an email, use first character
  if (nameOrEmail.includes('@')) {
    return nameOrEmail.charAt(0).toUpperCase();
  }
  
  // If it's a name, use first letters of first and last word
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent color based on a string (for avatar backgrounds)
 */
export const getAvatarColor = (str?: string): string => {
  if (!str) return 'from-gray-400 to-gray-600';
  
  const colors = [
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-cyan-400 to-cyan-600',
    'from-orange-400 to-orange-600',
    'from-red-400 to-red-600',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
};
