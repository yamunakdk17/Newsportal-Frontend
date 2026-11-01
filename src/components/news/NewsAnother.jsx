import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

import api from '@/services/api';
import { getNewsImageUrl, getNewsList, isPublishedNews } from '@/lib/news';

/**
 * Props:
 *  - onSelect: (item) => void
 */

const titleClass =
  "font-['Mukta',sans-serif] text-lg font-semibold leading-[1.2] tracking-[0.002em] text-black transition-colors group-hover:underline underline-offset-4 sm:text-xl md:text-2xl xl:text-[32px] xl:leading-[38px]";

function Card({ story, ratio, variants, getImageUrl, onSelect, className = '' }) {
  const src = getImageUrl(story);

  return (
    <motion.article
      variants={variants}
      role="link"
      tabIndex={0}
      aria-label={story.title}
      onClick={() => onSelect(story)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(story);
        }
      }}
      className={`group flex w-full cursor-pointer flex-col items-start gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${className}`}>
      <AspectRatio ratio={ratio} className="w-full overflow-hidden bg-neutral-200">
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
            No image available
          </div>
        )}
      </AspectRatio>

      <h3 className={titleClass}>{story.title}</h3>
    </motion.article>
  );
}

export default function NewsPost({ onSelect = () => {}, newsData }) {
  const reduce = useReducedMotion();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch news from backend
   */
  useEffect(() => {
    if (Array.isArray(newsData)) {
      return;
    }

    const fetchNews = async () => {
      try {
        setLoading(true);

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        /*
         * We need only 3 stories:
         *
         * news[0] = main
         * news[1] = left
         * news[2] = right
         */
        setNews(getNewsList(response).filter(isPublishedNews).slice(0, 3));
      } catch (error) {
        console.error('Unable to load news:', error);

        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsData]);

  /*
   * Backend image URL
   */
  const getImageUrl = (item) =>
    getNewsImageUrl(item?.featured_image || item?.images?.[0]);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
      },
    },
  };

  const item = {
    hidden: {
      opacity: reduce ? 1 : 0,
      y: reduce ? 0 : 20,
    },

    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const gridClass =
    'mx-auto grid w-full max-w-[1680px] grid-cols-1 items-center gap-6 md:grid-cols-2 lg:grid-cols-[402fr_828fr_402fr]';

  /*
   * Loading UI
   */
  if (!Array.isArray(newsData) && loading) {
    return (
      <div className={gridClass}>
        <Skeleton className="aspect-[402/502] w-full rounded-none md:col-span-2 md:order-first lg:order-none lg:col-span-1" />

        <Skeleton className="aspect-[828/609] w-full rounded-none" />

        <Skeleton className="aspect-[402/502] w-full rounded-none" />
      </div>
    );
  }

  const stories = Array.isArray(newsData)
    ? newsData.filter(isPublishedNews).slice(0, 3)
    : news;
  const [main, left, right] = stories;

  if (!main) {
    return null;
  }

  return (
    <motion.section
      aria-label="Top stories"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.15,
      }}
      className={gridClass}>
      {/* Left card */}
      {left && (
        <Card
          story={left}
          ratio={402 / 386}
          variants={item}
          getImageUrl={getImageUrl}
          onSelect={onSelect}
          className="md:col-start-1 md:row-start-2 lg:col-start-1 lg:row-start-1"
        />
      )}

      {/* Main centre card */}
      <Card
        story={main}
        ratio={828 / 532}
        variants={item}
        getImageUrl={getImageUrl}
        onSelect={onSelect}
        className="order-first md:order-none md:col-span-2 md:col-start-1 md:row-start-1 lg:col-span-1 lg:col-start-2"
      />

      {/* Right card */}
      {right && (
        <Card
          story={right}
          ratio={402 / 386}
          variants={item}
          getImageUrl={getImageUrl}
          onSelect={onSelect}
          className="md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1"
        />
      )}
    </motion.section>
  );
}
