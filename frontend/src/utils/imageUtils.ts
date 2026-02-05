/**
 * Get the full URL for an image from the API
 * Handles both relative paths and absolute URLs
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return '/placeholder.svg';
  }

  // If it's already a full URL (http:// or https://), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's a relative path starting with /, prepend the API base URL
  if (path.startsWith('/')) {
    return `${import.meta.env.VITE_API_BASE_URL}${path}`;
  }

  // Otherwise, assume it's a relative path and prepend API base URL with /
  return `${import.meta.env.VITE_API_BASE_URL}/${path}`;
};

/**
 * Get placeholder image for a specific type
 */
export const getPlaceholderImage = (type: 'book' | 'profile' | 'event' | 'video' = 'book'): string => {
  const placeholders = {
    book: '/placeholder-book.png',
    profile: '/placeholder.svg',
    event: '/placeholder.svg',
    video: '/placeholder.svg',
  };
  
  return placeholders[type] || '/placeholder.svg';
};
