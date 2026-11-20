import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';

import api from '@/services/api';
import { getNewsList, isPublishedNews } from '@/lib/news';
import { getImageUrl } from '@/lib/getImageUrl';

export default function HeroBanner({ onSelect, isLoading = false, newsData }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  const [heroNews, setHeroNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const heights =
    'min-h-[320px] h-[420px] sm:h-[480px] md:h-[540px] lg:h-[620px] xl:h-[676px]';

  const getPriority = (news) => {
    const priority = Number(news?.priority);

    return Number.isFinite(priority) ? priority : 0;
  };

  const getPublishedTime = (news) => {
    const time = new Date(
      news?.published_at || news?.created_at || news?.updated_at || 0,
    ).getTime();

    return Number.isFinite(time) ? time : 0;
  };

  const selectHeroNews = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const candidates = items
      .filter(isPublishedNews)
      .filter((item) => Boolean(item?.featured_image));

    if (candidates.length === 0) {
      return null;
    }

    return [...candidates].sort((a, b) => {
      const priorityDifference = getPriority(b) - getPriority(a);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return getPublishedTime(b) - getPublishedTime(a);
    })[0];
  };

  useEffect(() => {
    let cancelled = false;

    if (Array.isArray(newsData)) {
      setHeroNews(selectHeroNews(newsData));
      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    const fetchHeroNews = async () => {
      try {
        setLoading(true);

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        const newsList = getNewsList(response);
        const selectedNews = selectHeroNews(newsList);

        if (!cancelled) {
          setHeroNews(selectedNews);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Unable to load hero news:',
            error.response?.data || error.message,
          );

          setHeroNews(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHeroNews();

    return () => {
      cancelled = true;
    };
  }, [newsData]);

  const showLoading = isLoading || loading;

  if (showLoading) {
    return <Skeleton className={`w-full rounded-none ${heights}`} />;
  }

  if (!heroNews) {
    return (
      <section
        className={`flex w-full items-center justify-center bg-[#164B99] px-4 ${heights}`}>
        <p className="text-center font-['Mukta',sans-serif] text-lg font-medium text-white sm:text-xl">
          No featured news available.
        </p>
      </section>
    );
  }

  const image = getImageUrl(heroNews.featured_image);
  const title = heroNews.title || 'Latest News';

  const excerpt = typeof heroNews.excerpt === 'string' ? heroNews.excerpt.trim() : '';

  const clickable = Boolean(heroNews.slug);

  const handleBannerClick = () => {
    if (!heroNews.slug) {
      return;
    }

    if (onSelect) {
      onSelect(heroNews);
      return;
    }

    navigate(`/news/${heroNews.slug}`);
  };

  const interactive = clickable
    ? {
        role: 'link',
        tabIndex: 0,
        onClick: handleBannerClick,
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleBannerClick();
          }
        },
      }
    : {};

  return (
    <section
      {...interactive}
      aria-label={title}
      className={`relative flex w-full items-start overflow-hidden bg-[#164B99] ${heights} ${
        clickable
          ? 'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2'
          : ''
      }`}>
      {image && (
        <motion.img
          src={image}
          alt={title}
          initial={
            reduce
              ? false
              : {
                  scale: 1.08,
                }
          }
          animate={{
            scale: 1,
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
          }}
          className="absolute inset-0 h-full w-full object-cover object-center"
          onError={(event) => {
            console.error('Hero image failed to load:', image);
            event.currentTarget.style.display = 'none';
          }}
        />
      )}

      <div aria-hidden="true" className="absolute inset-0 bg-black/20" />
      {excerpt && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        />
      )}

      {excerpt && (
        <div className="absolute inset-x-0 bottom-2 z-10 w-full px-4 pb-6 sm:px-6 sm:pb-8 md:px-10 md:pb-10 lg:px-16 lg:pb-12 xl:px-[120px] xl:pb-[60px]">
          <div className="mx-auto flex w-full max-w-[1680px] justify-center">
            <motion.p
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0,
                      y: 24,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
                delay: 0.2,
              }}
              className="
          line-clamp-2
          w-full
          max-w-[1100px]
          overflow-hidden
          text-center
          font-['Mukta',sans-serif]
          text-base
          font-bold
          leading-snug
          text-white
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]
          sm:text-lg
          md:text-2xl
          lg:text-3xl
          xl:text-4xl
        ">
              {excerpt}
            </motion.p>
          </div>
        </div>
      )}
    </section>
  );
}
