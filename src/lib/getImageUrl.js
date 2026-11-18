// export const getImageUrl = (imagePath) => {
//   if (!imagePath) {
//     return '';
//   }

//   let imageUrl = String(imagePath).trim();

//   // Backend returns localhost URL
//   if (
//     imageUrl.startsWith('http://localhost:') ||
//     imageUrl.startsWith('https://localhost:')
//   ) {
//     try {
//       const url = new URL(imageUrl);

//       // Replace localhost with backend IP
//       url.hostname = '192.168.1.118';

//       console.log('Converted image URL:', url.toString());

//       return url.toString();
//     } catch (error) {
//       console.error('Invalid image URL:', imageUrl);
//       return imageUrl;
//     }
//   }

//   // Already a complete URL
//   if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//     return imageUrl;
//   }

//   // Relative image path
//   const apiUrl = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_TARGET}/api';

//   const baseUrl = apiUrl.replace(/\/api\/?$/, '');

//   console.log('Base URL for image:', baseUrl);

//   return `${baseUrl}/storage/${imageUrl.replace(/^\/+/, '')}`;
// };

const BACKEND_URL = 'http://192.168.1.118:8000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  let value = String(imagePath).trim();

  if (!value) {
    return '';
  }

  /*
   * Already a complete URL.
   */
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);

      /*
       * Backend sometimes returns localhost URLs.
       * Convert those to the backend machine IP so
       * other devices can access the image.
       */
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        url.hostname = '192.168.1.118';
      }

      return url.toString();
    } catch {
      return value;
    }
  }

  /*
   * Remove leading slash.
   */
  value = value.replace(/^\/+/, '');

  /*
   * If backend already returned:
   * storage/news/image.jpg
   *
   * don't add /storage again.
   */
  if (value.startsWith('storage/')) {
    return `${BACKEND_URL}/${value}`;
  }

  /*
   * If backend returned:
   * api/storage/news/image.jpg
   *
   * don't add another /api or /storage.
   */
  if (value.startsWith('api/storage/')) {
    return `${BACKEND_URL}/${value}`;
  }

  /*
   * Normal backend image path:
   *
   * news/image.jpg
   *
   * becomes:
   *
   * http://192.168.1.118:8000/storage/news/image.jpg
   */
  return `${BACKEND_URL}/storage/${value}`;
};
