export const getBannerHref = (banner) => {
  const raw = String(banner?.link ?? banner?.link_url ?? banner?.url ?? '').trim();

  if (!raw) {
    return '';
  }

  // Already an internal React route.
  if (raw.startsWith('/')) {
    return raw;
  }

  // Relative React route such as:
  // news/my-news
  // category/technology
  // login
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw) && !raw.startsWith('//')) {
    return `/${raw.replace(/^\/+/, '')}`;
  }

  // External URL.
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(raw)
    ? raw
    : `https://${raw.replace(/^\/\//, '')}`;

  try {
    const url = new URL(withProtocol);

    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

export const isExternalHref = (href) => {
  if (!href) {
    return false;
  }

  return /^https?:\/\//i.test(href);
};
