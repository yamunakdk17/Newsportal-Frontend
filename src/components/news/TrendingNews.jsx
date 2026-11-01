import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

import api from '@/services/api';
import { getNewsImageUrl, isTrue } from '@/lib/news';

/**
 * Backend:
 * GET /api/news
 *
 * Priority order:
 * high → medium → low
 *
 * Only published news are shown.
 * First 4 priority-sorted news are displayed.
 */

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ne-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

const gridClass = 'grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4';

function TrendingCard({ story, variants, getImageUrl, onSelect }) {
  const src = getImageUrl(story);
  const date = formatDate(story.published_at);
  const canSelect = Boolean(story?.slug);

  return (
    <motion.article
      variants={variants}
      role={canSelect ? 'link' : undefined}
      tabIndex={canSelect ? 0 : undefined}
      aria-label={story.title}
      onClick={() => canSelect && onSelect(story)}
      onKeyDown={(event) => {
        if (canSelect && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect(story);
        }
      }}
      className={`group flex min-w-0 flex-col items-start gap-4 outline-none focus-visible:ring-2 focus-visible:ring-[#16181A] focus-visible:ring-offset-2 2xl:gap-6 ${
        canSelect ? 'cursor-pointer' : ''
      }`}>
      <AspectRatio ratio={402 / 300} className="w-full overflow-hidden bg-neutral-200">
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
            No image available
          </div>
        )}
      </AspectRatio>

      <div className="flex w-full flex-col items-start gap-3 2xl:gap-4">
        <div className="flex w-full flex-col items-start gap-2">
          <h3 className="line-clamp-2 w-full font-['Mukta',sans-serif] text-2xl font-bold leading-8 tracking-[0.002em] text-[#16181A] transition-colors group-hover:text-[#164B99] md:text-3xl md:leading-10 lg:text-lg lg:leading-7 xl:text-2xl xl:leading-8 2xl:text-[40px] 2xl:leading-[48px]">
            {story.title}
          </h3>

          <div className="flex w-full items-center justify-between gap-4 font-['Mukta',sans-serif] text-sm leading-6 tracking-[0.002em] text-[#16181A] sm:text-base 2xl:gap-12">
            {story.author && <span className="truncate underline">{story.author}</span>}

            {date && <span className="shrink-0">{date}</span>}
          </div>
        </div>

        {story.caption && (
          <p className="line-clamp-3 w-full font-['Mukta',sans-serif] text-base leading-6 tracking-[0.002em] text-[#4A4E54] 2xl:text-xl">
            {story.caption}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default function Trending({ title = 'चर्चामा', onSelect }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch news from backend
   */
  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        setLoading(true);

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        const newsData = Array.isArray(response.data?.data) ? response.data.data : [];

        /*
         * Only published news.
         */
        const publishedNews = newsData.filter((item) => isTrue(item?.is_published));

        /*
         * Priority order:
         *
         * high   = 1
         * medium = 2
         * low    = 3
         */
        const priorityOrder = {
          high: 1,
          medium: 2,
          low: 3,
        };

        /*
         * Sort:
         *
         * HIGH
         * then MEDIUM
         * then LOW
         */
        const priorityNews = [...publishedNews].sort((a, b) => {
          const priorityA = priorityOrder[String(a.priority || '').toLowerCase()] ?? 999;

          const priorityB = priorityOrder[String(b.priority || '').toLowerCase()] ?? 999;

          return priorityA - priorityB;
        });

        /*
         * Show only first 4.
         */
        setNews(priorityNews.slice(0, 4));
      } catch (error) {
        console.error('Unable to load trending news:', error);

        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingNews();
  }, []);

  /*
   * Backend image URL.
   */
  const getImageUrl = (item) =>
    getNewsImageUrl(item?.featured_image || item?.images?.[0]);

  const handleSelect = (story) => {
    if (!story?.slug) {
      return;
    }

    if (onSelect) {
      onSelect(story);
      return;
    }

    navigate(`/news/${story.slug}`);
  };

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
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

  const stories = news.slice(0, 4);

  if (!loading && stories.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="trending-heading"
      className="mx-auto flex w-full max-w-[1926px] flex-col items-start gap-6 px-4 sm:px-6 md:px-10 lg:px-16 xl:gap-8 xl:px-[120px]">
      <h2
        id="trending-heading"
        className="font-['Mukta',sans-serif] text-2xl font-bold leading-[1.2] tracking-[0.002em] text-[#16181A] sm:text-3xl md:text-4xl 2xl:text-[40px] 2xl:leading-[48px]">
        {title}
      </h2>

      {loading ? (
        <div className={`${gridClass} w-full`}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[402/300] w-full rounded-none" />

              <Skeleton className="h-8 w-full" />

              <Skeleton className="h-6 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          className={`${gridClass} w-full`}>
          {stories.map((story) => (
            <TrendingCard
              key={story.id}
              story={story}
              variants={item}
              getImageUrl={getImageUrl}
              onSelect={handleSelect}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
