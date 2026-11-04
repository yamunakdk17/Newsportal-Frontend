export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  let imageUrl = String(imagePath).trim();

  // Backend returns localhost URL
  if (
    imageUrl.startsWith('http://localhost:') ||
    imageUrl.startsWith('https://localhost:')
  ) {
    try {
      const url = new URL(imageUrl);

      // Replace localhost with backend IP
      url.hostname = '192.168.1.118';

      console.log('Converted image URL:', url.toString());

      return url.toString();
    } catch (error) {
      console.error('Invalid image URL:', imageUrl);
      return imageUrl;
    }
  }

  // Already a complete URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Relative image path
  const apiUrl = import.meta.env.VITE_API_URL || 'http://192.168.1.118:8000/api';

  const baseUrl = apiUrl.replace(/\/api\/?$/, '');

  console.log('Base URL for image:', baseUrl);

  return `${baseUrl}/storage/${imageUrl.replace(/^\/+/, '')}`;
};
