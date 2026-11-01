import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '@/services/api';
import {
  getNewsImageUrl,
  getNewsList,
  isPublishedNews,
} from '@/lib/news';

function NewsSection({ selectedCategory, newsData }) {
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Array.isArray(newsData)) {
      return;
    }

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        setNews(getNewsList(response));
      } catch (error) {
        console.error('Unable to load news:', error);
        setError('Unable to load news.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsData]);

  const sourceNews = Array.isArray(newsData) ? newsData : news;
  const filteredNews = sourceNews.filter((item) => {
    if (!isPublishedNews(item)) {
      return false;
    }

    // Show all news
    if (selectedCategory === 'All') {
      return true;
    }

    const categoryValues = [
      item.category?.id,
      item.category_id,
      item.category?.name,
      item.category?.slug,
      item.category_slug,
    ]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase());

    const selectedValues = [
      selectedCategory?.id,
      selectedCategory?.name,
      selectedCategory?.slug,
    ]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase());

    return selectedValues.some((value) => categoryValues.includes(value));
  });

  const getImageUrl = (item) =>
    getNewsImageUrl(item?.featured_image || item?.images?.[0]);

  if (!Array.isArray(newsData) && loading) {
    return (
      <section className="py-10 text-center">
        <p className="text-gray-500">Loading news...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (filteredNews.length === 0) {
    return (
      <section className="py-10 text-center">
        <p className="text-gray-500">No news available.</p>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* SECTION TITLE */}
      <div className="mb-5 border-t border-gray-400 pt-2">
        <h2 className="text-4xl font-bold text-gray-900">
          {selectedCategory === 'All' ? 'Latest News' : selectedCategory?.name}
        </h2>

        <p className="mt-1 text-sm text-gray-500">Latest news and updates</p>
      </div>

      {/* GET FIRST NEWS AS LARGE NEWS */}
      {(() => {
        const mainNews = filteredNews[0];
        const sideNews = filteredNews.slice(1, 4);

        return (
          <div className="grid gap-5 lg:grid-cols-[58%_42%]">
            {/* =========================
              LARGE NEWS
          ========================== */}
            <article
              role={mainNews.slug ? 'link' : undefined}
              tabIndex={mainNews.slug ? 0 : undefined}
              onClick={() => mainNews.slug && navigate(`/news/${mainNews.slug}`)}
              onKeyDown={(event) => {
                if (mainNews.slug && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  navigate(`/news/${mainNews.slug}`);
                }
              }}
              className={`min-w-0 ${mainNews.slug ? 'cursor-pointer' : ''}`}>
              {/* LARGE IMAGE */}
              <div className="w-full overflow-hidden">
                {getImageUrl(mainNews) ? (
                  <img
                    src={getImageUrl(mainNews)}
                    alt={mainNews.title}
                    className="h-[447px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[447px] w-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* LARGE NEWS TITLE */}
              <h3 className="mt-3 pr-3 text-3xl font-bold leading-[1.15] text-gray-900">
                {mainNews.title}
              </h3>
            </article>

            {/* =========================
              RIGHT SIDE NEWS
          ========================== */}
            <div className="min-w-0">
              {sideNews.map((item, index) => (
                <article
                  key={item.id}
                  role={item.slug ? 'link' : undefined}
                  tabIndex={item.slug ? 0 : undefined}
                  onClick={() => item.slug && navigate(`/news/${item.slug}`)}
                  onKeyDown={(event) => {
                    if (item.slug && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      navigate(`/news/${item.slug}`);
                    }
                  }}
                  className={`grid grid-cols-[194px_minmax(0,1fr)] gap-4 ${
                    item.slug ? 'cursor-pointer' : ''
                  } ${
                    index !== sideNews.length - 1
                      ? 'mb-5 border-b border-gray-300 pb-5'
                      : ''
                  }`}>
                  {/* SMALL IMAGE */}
                  <div className="h-[150px] w-[194px] overflow-hidden">
                    {getImageUrl(item) ? (
                      <img
                        src={getImageUrl(item)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* SMALL NEWS TITLE */}
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold leading-[1.15] text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        );
      })()}
    </section>
  );
}

export default NewsSection;
