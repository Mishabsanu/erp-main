export const getFileUrl = (path: string | undefined): string => {
  if (!path) return '';
  
  // If it's already a full URL (Cloudinary or Blob), return it
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return path;
  }
  
  // Get API URL and remove trailing slash
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  
  // Ensure path starts with a slash
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${apiUrl}${formattedPath}`;
};
