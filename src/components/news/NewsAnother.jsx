import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

import api from '@/services/api';
import { getNewsImageUrl, getNewsList, isPublishedNews } from '@/lib/news';

/*
 * News title styling
 */
const titleClass =
  "font-['Mukta',sans-serif] text-base font-semibold leading-[1.4] tracking-[0.002em] text-[#16181A] transition-colors group-hover:underline underline-offset-4 sm:text-[17px] md:text-lg xl:text-[19px]";

/*
 * News card
 */
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
      className={`group flex w-full cursor-pointer flex-col items-start gap-3 px-0 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${className}`}>
      <AspectRatio ratio={ratio} className="w-full overflow-hidden bg-neutral-200">
        {src ? (
          <img
            src={src}
            alt={story.title || ''}
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

  /*
   * Animation
   */
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

  /*
   * Equal spacing and responsive grid
   */
  const gridClass =
    'mx-auto grid w-full max-w-[1680px] grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.8fr)_minmax(0,0.9fr)] lg:gap-0 lg:divide-x lg:divide-gray-300';

  /*
   * Loading UI
   */
  if (!Array.isArray(newsData) && loading) {
    return (
      <div className={gridClass}>
        <Skeleton className="aspect-[402/386] w-full rounded-none lg:px-5" />

        <Skeleton className="aspect-[828/532] w-full rounded-none lg:px-5" />

        <Skeleton className="aspect-[402/386] w-full rounded-none lg:px-5" />
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
      {/* LEFT CARD */}
      {left && (
        <Card
          story={left}
          ratio={402 / 386}
          variants={item}
          getImageUrl={getImageUrl}
          onSelect={onSelect}
          className="md:col-start-1 md:row-start-2 lg:col-start-1 lg:row-start-1 lg:px-5 lg:pr-5"
        />
      )}

      {/* MAIN CENTRE CARD */}
      <Card
        story={main}
        ratio={828 / 532}
        variants={item}
        getImageUrl={getImageUrl}
        onSelect={onSelect}
        className="order-first md:order-none md:col-span-2 md:col-start-1 md:row-start-1 lg:col-span-1 lg:col-start-2 lg:px-5"
      />

      {/* RIGHT CARD */}
      {right && (
        <Card
          story={right}
          ratio={402 / 386}
          variants={item}
          getImageUrl={getImageUrl}
          onSelect={onSelect}
          className="md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1 lg:px-5 lg:pl-5"
        />
      )}
    </motion.section>
  );
}
