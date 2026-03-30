import React, { useState } from 'react';

interface AvatarProps {
  pictureUrl?: string | null;
  name?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ pictureUrl, name, email, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get initials from name or email
  const getInitials = (): string => {
    const identifier = name || email || '';
    if (!identifier) return '?';
    
    // If it looks like an email, use first character
    if (identifier.includes('@')) {
      return identifier.charAt(0).toUpperCase();
    }
    
    // If it's a name, use first letters of first and last word
    const parts = identifier.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Generate consistent color based on identifier
  const getAvatarColor = (): string => {
    const identifier = name || email || '';
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
    for (let i = 0; i < identifier.length; i++) {
      hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
      hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  
  const initials = getInitials();
  const colorClass = getAvatarColor();
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0`}>
      {/* Show image if available and no error */}
      {pictureUrl && !imageError ? (
        <img
          src={pictureUrl}
          alt={name || email || 'User avatar'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Fallback to initials */
        <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-semibold`}>
          {initials}
        </div>
      )}
    </div>
  );
};
