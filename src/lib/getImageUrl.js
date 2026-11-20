const getBackendBaseUrl = () => {
  const apiUrl = String(import.meta.env.VITE_API_URL || '').trim();

  return apiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');
};

/** Resolve a backend image value to a displayable URL. */
export const getImageUrl = (image) => {
  if (!image) return '';

  const imagePath =
    typeof image === 'string'
      ? image
      : image?.url || image?.path || image?.image || image?.image_path || '';
  const value = String(imagePath).trim();

  if (!value) return '';

  // Preserve fully qualified URLs returned by the API exactly as provided.
  if (/^https?:\/\//i.test(value)) return value;

  const backendBaseUrl = getBackendBaseUrl();
  const cleanPath = value.replace(/^\/+/, '').replace(/\/+$/, '');

  // Normalize storage prefixes so paths like /api/storage/news/a.jpg and
  // storage/news/a.jpg both resolve to one backend /storage/... URL.
  const storagePath = cleanPath
    .replace(/^(?:api\/)+(?=storage\/)/i, '')
    .replace(/^(?:storage\/)+/i, '');
  const resolvedPath = `storage/${storagePath}`;

  return backendBaseUrl ? `${backendBaseUrl}/${resolvedPath}` : `/${resolvedPath}`;
};
