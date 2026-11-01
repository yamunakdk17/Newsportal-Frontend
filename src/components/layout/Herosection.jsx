import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

import api from '@/services/api';
import {
  getNewsImageUrl,
  getNewsList,
  isPublishedNews,
  isTrue,
} from '@/lib/news';

/**
 * Font required: Mukta (700) -> load once in index.html / CSS.
 *
 * Fetches news from backend and automatically selects:
 *  - Published news only
 *  - Published and featured news
 *
 * Props:
 *  - onSelect: optional, makes the banner clickable
 *              and returns the selected news item
 */
export default function HeroBanner({ onSelect, newsData, isLoading = false }) {
  const reduce = useReducedMotion();

  const [featuredNews, setFeaturedNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const heights =
    'min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[560px] xl:h-[676px]';

  useEffect(() => {
    if (Array.isArray(newsData)) {
      return;
    }

    const fetchFeaturedNews = async () => {
      try {
        setLoading(true);

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        const publishedNews = getNewsList(response).filter(isPublishedNews);
        const featuredNews = publishedNews.find((item) => isTrue(item?.is_featured));

        setFeaturedNews(featuredNews || publishedNews[0] || null);
      } catch (error) {
        console.error('Unable to load featured news:', error);
        setFeaturedNews(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, [newsData]);

  if ((!Array.isArray(newsData) && loading) || isLoading) {
    return <Skeleton className={`w-full rounded-none ${heights}`} />;
  }

  const publishedNews = Array.isArray(newsData)
    ? newsData.filter(isPublishedNews)
    : [];
  const selectedNews = Array.isArray(newsData)
    ? publishedNews.find((item) => isTrue(item?.is_featured)) ||
      publishedNews[0] ||
      null
    : featuredNews;

  const image = getNewsImageUrl(
    selectedNews?.featured_image || selectedNews?.images?.[0],
  );
  const title = selectedNews?.title || 'Latest News';
  const category = selectedNews?.category?.name || selectedNews?.category_slug || '';
  const excerpt = selectedNews?.excerpt || '';

  const clickable = Boolean(selectedNews?.slug) && typeof onSelect === 'function';

  const interactive = clickable
    ? {
        role: 'link',
        tabIndex: 0,
        onClick: () => {
          if (selectedNews?.slug) {
            onSelect(selectedNews);
          }
        },
        onKeyDown: (event) => {
          if (selectedNews?.slug && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onSelect(selectedNews);
          }
        },
      }
    : {};

  return (
    <section
      {...interactive}
      aria-label={title || 'Featured story'}
      className={`relative flex w-full items-end overflow-hidden bg-[#164B99] px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:px-16 lg:py-16 xl:px-[120px] xl:py-20 ${heights} ${
        clickable
          ? 'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2'
          : ''
      }`}>
      {/* Background image */}
      {image && (
        <motion.img
          src={image}
          alt=""
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* rgba(0,0,0,0.2) overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/20" />

      {/* Caption */}
      <div className="relative mx-auto flex w-full max-w-[1680px] flex-col items-center gap-2.5">
        {category && (
          <p className="font-['Mukta',sans-serif] text-lg font-semibold text-white sm:text-xl">
            {category}
          </p>
        )}

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
            delay: 0.2,
          }}
          className="w-full text-center font-['Mukta',sans-serif] text-2xl font-bold leading-[1.2] tracking-[0.002em] text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-[72px] xl:leading-[86px]">
          {title}
        </motion.h2>

        {excerpt && (
          <p className="max-w-3xl text-center font-['Mukta',sans-serif] text-base text-white sm:text-lg">
            {excerpt}
          </p>
        )}
      </div>
    </section>
  );
}
