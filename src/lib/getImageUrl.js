// export const getImageUrl = (imagePath) => {
//   if (!imagePath) {
//     return '';
//   }

//   let imageUrl = String(imagePath).trim();

//   if (
//     imageUrl.startsWith('http://localhost:') ||
//     imageUrl.startsWith('https://localhost:')
//   ) {
//     try {
//       const url = new URL(imageUrl);

//       url.hostname = '192.168.1.118';

//       console.log('Converted image URL:', url.toString());

//       return url.toString();
//     } catch (error) {
//       console.error('Invalid image URL:', imageUrl);
//       return imageUrl;
//     }
//   }

//   if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//     return imageUrl;
//   }

//   const apiUrl = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_TARGET}/api`;

//   const baseUrl = apiUrl.replace(/\/api\/?$/, '');

//   console.log('Base URL for image:', baseUrl);

//   return `${baseUrl}/storage/${imageUrl.replace(/^\/+/, '')}`;
// };

// const getBackendUrl = () => {
//   const apiUrl = import.meta.env.VITE_API_URL;
//   const targetUrl = import.meta.env.VITE_TARGET;

//   if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
//     return apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
//   }

//   if (targetUrl && /^https?:\/\//i.test(targetUrl)) {
//     return targetUrl.replace(/\/+$/, '');
//   }

//   return '';
// };

// export const getImageUrl = (imagePath) => {
//   if (!imagePath) {
//     return '';
//   }

//   let value = String(imagePath).trim();

//   if (!value) {
//     return '';
//   }

//   if (/^https?:\/\//i.test(value)) {
//     try {
//       const url = new URL(value);

//       if (
//         url.hostname === 'localhost' ||
//         url.hostname === '127.0.0.1' ||
//         url.hostname === '192.168.1.118'
//       ) {
//         const backendUrl = getBackendUrl();

//         if (backendUrl) {
//           const path = `${url.pathname}${url.search}${url.hash}`;
//           return `${backendUrl}${path}`;
//         }
//       }

//       return url.toString();
//     } catch {
//       return value;
//     }
//   }

//   value = value.replace(/^\/+/, '');

//   const backendUrl = getBackendUrl();

//   if (!backendUrl) {
//     return `/storage/${value}`;
//   }

//   if (value.startsWith('storage/')) {
//     return `${backendUrl}/${value}`;
//   }

//   if (value.startsWith('api/storage/')) {
//     return `${backendUrl}/${value.replace(/^api\//, '')}`;
//   }

//   if (value.startsWith('api/')) {
//     return `${backendUrl}/${value}`;
//   }

//   return `${backendUrl}/storage/${value}`;
// };

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  const value = String(imagePath).trim();

  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  if (!baseUrl) {
    return `/storage/${value.replace(/^\/+/, '')}`;
  }

  const cleanPath = value.replace(/^\/+/, '');

  if (cleanPath.startsWith('storage/')) {
    return `${baseUrl}/${cleanPath}`;
  }

  if (cleanPath.startsWith('api/storage/')) {
    return `${baseUrl}/${cleanPath.replace(/^api\//, '')}`;
  }

  return `${baseUrl}/storage/${cleanPath}`;
};
