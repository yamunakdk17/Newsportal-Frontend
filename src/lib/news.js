export const isTrue = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

export const isPublishedNews = (news) =>
  news?.is_published === undefined ||
  news?.is_published === null ||
  isTrue(news.is_published);

export const getNewsList = (response) => {
  const data = response?.data?.data;

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.data) ? data.data : [];
};
