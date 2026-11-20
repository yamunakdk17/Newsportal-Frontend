const getBackendBaseUrl = () => {
  const apiUrl = String(import.meta.env.VITE_API_URL || '').trim();
  const targetUrl = String(import.meta.env.VITE_TARGET || '').trim();

  if (/^https?:\/\//i.test(apiUrl)) {
    return apiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');
  }

  if (import.meta.env.DEV && /^https?:\/\//i.test(targetUrl)) {
    return targetUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

export const getImageUrl = (image) => {
  if (!image) return '';

  const imagePath =
    typeof image === 'string'
      ? image
      : image?.url ||
        image?.path ||
        image?.image ||
        image?.image_path ||
        image?.featured_image ||
        '';

  const value = String(imagePath).trim();

  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);

      if (
        import.meta.env.DEV &&
        (url.hostname === 'localhost' ||
          url.hostname === '127.0.0.1' ||
          url.hostname === '192.168.1.118')
      ) {
        const backendBaseUrl = getBackendBaseUrl();

        if (backendBaseUrl) {
          return `${backendBaseUrl}${url.pathname}${url.search}${url.hash}`;
        }
      }

      return url.toString();
    } catch {
      return value;
    }
  }

  const cleanPath = value.replace(/^\/+/, '').replace(/\/+$/, '');

  const storagePath = cleanPath
    .replace(/^(?:api\/)+(?=storage\/)/i, '')
    .replace(/^(?:storage\/)+/i, '');

  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    return `/storage/${storagePath}`;
  }

  return `${backendBaseUrl}/storage/${storagePath}`;
};
