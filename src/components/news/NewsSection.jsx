import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '@/services/api';
import { getNewsList, isPublishedNews } from '@/lib/news';
import { getImageUrl } from '@/lib/getImageUrl';
import { formatNepaliDate } from '@/lib/nepaliDate';

// Text sizes in one place. About two steps below the Figma values (56 / 40 / 32 px at 1920 wide),
// scaling up with the screen. Change a size here and every news section follows.
const SIZE = {
  sectionTitle: 'text-2xl sm:text-3xl lg:text-4xl 2xl:text-[40px]',
  mainTitle: 'text-lg sm:text-xl lg:text-2xl 2xl:text-[28px]',
  sideTitle: 'text-base sm:text-lg xl:text-xl 2xl:text-[22px]',
};

function NewsSection({ selectedCategory, newsData, bottomLine = false }) {
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

        setNews(getNewsList(response).filter(isPublishedNews));
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

  const getImageurl = (item) => getImageUrl(item?.featured_image || item?.images?.[0]);

  const goToNews = (item) => {
    if (item.slug) {
      navigate(`/news/${item.slug}`);
    }
  };

  // Click and keyboard behaviour shared by the big story and the three small ones.
  const linkProps = (item) => ({
    role: item.slug ? 'link' : undefined,
    tabIndex: item.slug ? 0 : undefined,
    onClick: () => goToNews(item),
    onKeyDown: (event) => {
      if (item.slug && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        goToNews(item);
      }
    },
  });

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

  const mainNews = filteredNews[0];
  const sideNews = filteredNews.slice(1, 4);

  return (
    <>
      {/* Section: black line on top, 10px padding, 10px between title and grid (Figma "News Category") */}
      <section className="mb-10 flex w-full flex-col gap-[10px] border-t border-[#16181A] py-[10px] font-['Mukta',sans-serif] text-[#16181A] sm:mb-14 2xl:mb-[68px]">
        <h2 className={`font-bold leading-[1.2] tracking-[0.002em] ${SIZE.sectionTitle}`}>
          {selectedCategory === 'All'
            ? 'Latest News'
            : selectedCategory?.name || selectedCategory}
        </h2>

        {/* Big story 972 : small stories 683, 24px apart */}
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[972fr_683fr]">
          {/* LARGE NEWS */}
          <article
            {...linkProps(mainNews)}
            className={`group flex min-w-0 flex-col gap-[10px] border-t border-[#979EA9] py-[10px] ${
              mainNews.slug ? 'cursor-pointer' : ''
            }`}>
            <div className="aspect-[972/600] w-full overflow-hidden bg-[#DDE0E3]">
              {getImageurl(mainNews) ? (
                <img
                  src={getImageurl(mainNews)}
                  alt={mainNews.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-sm text-[#979EA9]">No image available</span>
                </div>
              )}
            </div>

            <h3
              className={`line-clamp-2 font-bold leading-[1.2] tracking-[0.002em] ${SIZE.mainTitle}`}>
              {mainNews.title}
            </h3>
            <p className="text-sm font-normal text-[#979EA9]">
              {formatNepaliDate(mainNews.published_at)}
            </p>
          </article>

          {/* SMALL NEWS: 24px between, each with its own grey line on top */}
          <div className="flex min-w-0 flex-col gap-6">
            {sideNews.map((item, index) => (
              <article
                key={item.id || item.slug || index}
                {...linkProps(item)}
                className={`group flex min-w-0 items-start gap-4 border-t border-[#979EA9] py-[10px] sm:gap-6 ${
                  item.slug ? 'cursor-pointer' : ''
                }`}>
                {/* image 260 : title 402 */}
                <div className="aspect-[260/200] w-[38%] shrink-0 overflow-hidden bg-[#DDE0E3]">
                  {getImageurl(item) ? (
                    <img
                      src={getImageurl(item)}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-xs text-[#979EA9]">No image</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`line-clamp-4 font-bold leading-[1.2] tracking-[0.002em] ${SIZE.sideTitle}`}>
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm font-normal text-[#979EA9]">
                    {formatNepaliDate(item.published_at)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing black line. When sections are stacked, the next section's top line already does this. */}
      {bottomLine && <div aria-hidden="true" className="border-t border-[#16181A]" />}
    </>
  );
}

export default NewsSection;
