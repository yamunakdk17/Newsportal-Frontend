export const isTrue = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

export const getNewsImageUrl = (image) => {
  const imagePath =
    typeof image === 'string' ? image : image?.url || image?.path || '';

  if (typeof imagePath !== 'string' || !imagePath.trim()) {
    return '';
  }

  const path = imagePath.trim();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const backendUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  if (/^https?:\/\/localhost(?::\d+)?(?:\/|$)/i.test(path) && backendUrl) {
    try {
      const imageUrl = new URL(path);
      const backendOrigin = new URL(backendUrl);

      imageUrl.protocol = backendOrigin.protocol;
      imageUrl.host = backendOrigin.host;

      return imageUrl.toString();
    } catch {
      return path;
    }
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${backendUrl}${path}`;
  }

  const normalizedPath = path.replace(/^\/+/, '');
  const storagePath =
    normalizedPath.startsWith('storage/') || normalizedPath.startsWith('api/')
      ? normalizedPath
      : `storage/${normalizedPath}`;

  return backendUrl ? `${backendUrl}/${storagePath}` : `/${storagePath}`;
};
