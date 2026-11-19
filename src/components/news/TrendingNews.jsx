import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

import api from '@/services/api';
import { getImageUrl } from '@/lib/getImageUrl';
import { formatNepaliDate } from '@/lib/nepaliDate';

const getAuthor = (story) => {
  const author = story?.author ?? story?.author_name;

  if (!author) return '';

  return typeof author === 'string' ? author : author.name || '';
};

const SIZE = {
  heading: 'text-[clamp(28px,2.083vw,40px)] leading-[1.2]',
  title: 'text-[clamp(19px,1.25vw,24px)] leading-[1.35]',
  meta: 'text-[clamp(14px,0.833vw,16px)] leading-[1.4]',
  caption: 'text-[clamp(16px,0.9375vw,18px)] leading-[1.55]',
};

const gridClass = 'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4';

function TrendingCard({ story, variants, getImageUrl, onSelect }) {
  const src = getImageUrl(story);

  const date = formatNepaliDate(story.published_at || story.created_at);

  const author = getAuthor(story);

  const canSelect = Boolean(story?.slug);

  const caption = story?.excerpt || story?.caption || story?.description || '';

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
      className={`group flex min-w-0 flex-col items-start font-['Mukta',sans-serif] tracking-[0.002em] text-[#16181A] outline-none focus-visible:ring-2 focus-visible:ring-[#16181A] focus-visible:ring-offset-2 ${
        canSelect ? 'cursor-pointer' : ''
      }`}>
      {/* Image */}
      <AspectRatio ratio={402 / 300} className="w-full overflow-hidden bg-[#DDE0E3]">
        {src ? (
          <img
            src={src}
            alt={story.title || ''}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#979EA9]">
            No image available
          </div>
        )}
      </AspectRatio>

      {/* Content */}
      <div className="mt-4 flex w-full flex-col">
        {/* Title */}
        <div className="h-[3.9rem] w-full overflow-hidden">
          <h3
            className={`line-clamp-2 w-full font-bold tracking-[0.002em] transition-colors group-hover:text-[#164B99] ${SIZE.title}`}>
            {story.title}
          </h3>
        </div>

        {/* Date + Author */}
        <div
          className={`mt-2 flex w-full items-center justify-between gap-6 ${SIZE.meta}`}>
          {/* Left: Nepali Date */}
          {date ? (
            <div className="flex min-w-0 items-center gap-2 text-[#979EA9]">
              <CalendarDays
                className="h-4 w-4 shrink-0"
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span className="whitespace-nowrap">{date}</span>
            </div>
          ) : (
            <span />
          )}

          {/* Right: Author */}
          {author ? (
            <span className="min-w-0 truncate text-right underline underline-offset-2">
              {author}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Description */}
        {caption && (
          <p className={`mt-3 w-full text-justify text-[#4A4E54] ${SIZE.caption}`}>
            {caption}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default function Trending({ title = 'Trending News', onSelect }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const priorityOrder = {
          high: 1,
          medium: 2,
          low: 3,
        };

        const priorityNews = [...newsData].sort((a, b) => {
          const priorityA = priorityOrder[String(a.priority || '').toLowerCase()] ?? 999;

          const priorityB = priorityOrder[String(b.priority || '').toLowerCase()] ?? 999;

          return priorityA - priorityB;
        });

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

  const getImageurl = (item) => getImageUrl(item?.featured_image || item?.images?.[0]);

  const handleSelect = (story) => {
    if (!story?.slug) return;

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
      className="mx-auto flex w-full max-w-[1920px] flex-col items-start gap-6 px-4 py-10 sm:px-6 sm:py-12 md:px-10 lg:px-16 xl:gap-8 xl:px-[120px] xl:py-20">
      <h2
        id="trending-heading"
        className={`font-['Mukta',sans-serif] font-bold tracking-[0.002em] text-[#16181A] ${SIZE.heading}`}>
        {title}
      </h2>

      {loading ? (
        <div className={`${gridClass} w-full`}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-5">
              <Skeleton className="aspect-[402/300] w-full rounded-none" />

              <Skeleton className="h-7 w-full" />

              <Skeleton className="h-5 w-2/3" />

              <Skeleton className="h-20 w-full" />
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
              key={story.id || story.slug}
              story={story}
              variants={item}
              getImageUrl={getImageurl}
              onSelect={handleSelect}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}
