export const isTrue = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

export const isPublishedNews = (news) =>
  news?.is_published === undefined ||
  news?.is_published === null ||
  isTrue(news.is_published);

export const isActiveNews = (news) => news?.deleted_at === null;

export const isDeletedNews = (news) => news?.deleted_at !== null;

export const getNewsId = (news) => {
  const candidates = [news?.id, news?.post_id];
  const id = candidates.find(
    (value) =>
      (typeof value === 'string' || typeof value === 'number') &&
      (typeof value !== 'number' || Number.isFinite(value)) &&
      String(value).trim() !== '' &&
      !['undefined', 'null', '[object object]'].includes(
        String(value).trim().toLowerCase(),
      ),
  );

  return id === undefined ? null : String(id).trim();
};

export const getNewsList = (response) => {
  const data = response?.data?.data;
  const candidates = [
    data,
    data?.data,
    data?.posts,
    data?.data?.posts,
    response?.data?.posts,
  ];

  return candidates.find(Array.isArray) || [];
};
