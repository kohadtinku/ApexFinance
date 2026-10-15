/**
 * Resolves full image URL for profile pictures and receipts.
 * Handles:
 * - base64 Data URIs (data:image/...)
 * - External Cloudinary/CDN URLs (https://...)
 * - Relative backend paths (/uploads/...) by prefixing with backend host URL
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const backendBase = apiUrl.replace(/\/api\/?$/, '');

  if (backendBase) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanPath}`;
  }

  return url;
};

export default getImageUrl;
