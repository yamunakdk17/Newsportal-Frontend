// import { useEffect, useState } from 'react';
// import { motion, useReducedMotion } from 'framer-motion';
// import { CalendarDays } from 'lucide-react';

// import { AspectRatio } from '@/components/ui/aspect-ratio';
// import { Skeleton } from '@/components/ui/skeleton';

// import api from '@/services/api';
// import { getNewsList, isPublishedNews } from '@/lib/news';
// import { getImageUrl } from '@/lib/getImageUrl';
// import { formatNepaliDate } from '@/lib/nepaliDate';

// /*
//  * News title styling
//  */
// const titleClass =
//   "font-['Mukta',sans-serif] text-base font-semibold leading-[1.2] tracking-[0.002em] text-black transition-colors group-hover:underline underline-offset-4 sm:text-lg xl:text-xl 2xl:text-[22px]";

// /*
//  * Date styling
//  *
//  * Left aligned and kept close to the title.
//  */
// const dateClass =
//   "flex w-fit items-center justify-start gap-1.5 font-['Mukta',sans-serif] text-[13px] font-medium text-[#6B7280] sm:text-sm";

// /*
//  * Story date
//  *
//  * Prefer published date, then fall back to created date.
//  */
// const getStoryDate = (story) => story?.published_at || story?.created_at || null;

// /*
//  * News card
//  */
// function Card({
//   story,
//   ratio,
//   variants,
//   getImageUrl,
//   onSelect,
//   className = '',
//   titleLines = 'line-clamp-3',
// }) {
//   const src = getImageUrl(story);
//   const date = formatNepaliDate(getStoryDate(story));

//   return (
//     <motion.article
//       variants={variants}
//       role="link"
//       tabIndex={0}
//       aria-label={story.title}
//       onClick={() => onSelect(story)}
//       onKeyDown={(event) => {
//         if (event.key === 'Enter' || event.key === ' ') {
//           event.preventDefault();
//           onSelect(story);
//         }
//       }}
//       className={`group flex w-full cursor-pointer flex-col items-start gap-[10px] outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${className}`}>
//       <AspectRatio ratio={ratio} className="w-full overflow-hidden bg-[#DDE0E3]">
//         {src ? (
//           <img
//             src={src}
//             alt={story.title || ''}
//             loading="lazy"
//             className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
//           />
//         ) : (
//           <div className="flex h-full w-full items-center justify-center text-sm text-[#979EA9]">
//             No image available
//           </div>
//         )}
//       </AspectRatio>

//       <h3 className={`${titleClass} ${titleLines}`}>{story.title}</h3>

//       {date && (
//         <div className={dateClass}>
//           <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />

//           <time dateTime={getStoryDate(story)}>{date}</time>
//         </div>
//       )}
//     </motion.article>
//   );
// }

// export default function NewsPost({ onSelect = () => {}, newsData }) {
//   const reduce = useReducedMotion();

//   const [news, setNews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   /*
//    * Fetch news from backend
//    */
//   useEffect(() => {
//     if (Array.isArray(newsData)) {
//       return;
//     }

//     const fetchNews = async () => {
//       try {
//         setLoading(true);

//         const response = await api.get('/news', {
//           params: {
//             page: 1,
//             per_page: 8,
//           },
//         });

//         setNews(getNewsList(response).filter(isPublishedNews).slice(0, 3));
//       } catch (error) {
//         console.error('Unable to load news:', error);
//         setNews([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNews();
//   }, [newsData]);

//   /*
//    * Backend image URL
//    */
//   const getImageurl = (item) => getImageUrl(item?.featured_image || item?.images?.[0]);

//   /*
//    * Animation
//    */
//   const container = {
//     hidden: {},
//     show: {
//       transition: {
//         staggerChildren: reduce ? 0 : 0.12,
//       },
//     },
//   };

//   const item = {
//     hidden: {
//       opacity: reduce ? 1 : 0,
//       y: reduce ? 0 : 20,
//     },

//     show: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         ease: 'easeOut',
//       },
//     },
//   };

//   /*
//    * Figma "Newspost": 402 | 828 | 402
//    * Side stories vertically centred against the big one.
//    */
//   const gridClass =
//     'mx-auto grid w-full max-w-[1680px] grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-[402fr_828fr_402fr] lg:items-center';

//   /*
//    * Loading UI
//    */
//   if (!Array.isArray(newsData) && loading) {
//     return (
//       <div className={gridClass}>
//         <Skeleton className="aspect-[402/386] w-full rounded-none" />

//         <Skeleton className="aspect-[828/532] w-full rounded-none" />

//         <Skeleton className="aspect-[402/386] w-full rounded-none" />
//       </div>
//     );
//   }

//   const stories = Array.isArray(newsData)
//     ? newsData.filter(isPublishedNews).slice(0, 3)
//     : news;

//   const [main, left, right] = stories;

//   if (!main) {
//     return null;
//   }

//   return (
//     <motion.section
//       aria-label="Top stories"
//       variants={container}
//       initial="hidden"
//       whileInView="show"
//       viewport={{
//         once: true,
//         amount: 0.15,
//       }}
//       className={gridClass}>
//       {/* LEFT CARD */}
//       {left && (
//         <Card
//           story={left}
//           ratio={402 / 386}
//           variants={item}
//           getImageUrl={getImageurl}
//           onSelect={onSelect}
//           className="md:col-start-1 md:row-start-2 lg:col-start-1 lg:row-start-1"
//         />
//       )}

//       {/* MAIN CENTRE CARD */}
//       <Card
//         story={main}
//         ratio={828 / 532}
//         variants={item}
//         getImageUrl={getImageurl}
//         onSelect={onSelect}
//         titleLines="line-clamp-2"
//         className="order-first md:order-none md:col-span-2 md:col-start-1 md:row-start-1 lg:col-span-1 lg:col-start-2"
//       />

//       {/* RIGHT CARD */}
//       {right && (
//         <Card
//           story={right}
//           ratio={402 / 386}
//           variants={item}
//           getImageUrl={getImageurl}
//           onSelect={onSelect}
//           className="md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1"
//         />
//       )}
//     </motion.section>
//   );
// }

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

import api from '@/services/api';
import { getNewsList, isPublishedNews } from '@/lib/news';
import { getImageUrl } from '@/lib/getImageUrl';
import { formatNepaliDate } from '@/lib/nepaliDate';

const titleClass =
  "font-['Mukta',sans-serif] font-bold leading-[1.2] tracking-[0.002em] text-black transition-colors group-hover:underline underline-offset-4";

const excerptClass =
  "font-['Mukta',sans-serif] font-normal leading-[1.45] tracking-[0.002em] text-[#4A4E54]";

const SIDE_TITLE_CLAMP = 'line-clamp-3';
const MAIN_TITLE_CLAMP = 'line-clamp-2';

const dateClass =
  "flex min-h-5 w-fit items-center justify-start gap-1.5 font-['Mukta',sans-serif] text-[13px] font-normal text-[#6B7280] sm:text-sm";

const getStoryDate = (story) => story?.published_at || story?.created_at || null;

function Card({
  story,
  ratio,
  variants,
  getImageUrl,
  onSelect,
  className = '',
  titleClamp = SIDE_TITLE_CLAMP,
  isMain = false,
}) {
  const src = getImageUrl(story);
  const storyDate = getStoryDate(story);
  const date = formatNepaliDate(storyDate);
  const excerpt = story?.excerpt || '';

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
      className={`group flex w-full cursor-pointer flex-col items-start outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${className}`}>
      <AspectRatio ratio={ratio} className="w-full overflow-hidden bg-[#DDE0E3]">
        {src ? (
          <img
            src={src}
            alt={story.title || ''}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#979EA9]">
            No image available
          </div>
        )}
      </AspectRatio>

      <div className="mt-3 w-full">
        <h3
          className={`${titleClass} ${titleClamp} ${
            isMain
              ? 'text-base sm:text-lg xl:text-xl 2xl:text-[22px]'
              : 'text-base sm:text-lg xl:text-xl 2xl:text-[22px]'
          }`}>
          {story.title}
        </h3>

        {excerpt && (
          <p
            className={`mt-2 line-clamp-3 w-full overflow-hidden text-justify text-sm sm:text-base ${
              isMain ? 'xl:text-lg' : 'xl:text-base'
            } ${excerptClass}`}>
            {excerpt}
          </p>
        )}

        <div className="mt-2">
          <div className={dateClass}>
            {date && (
              <>
                <CalendarDays
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <time dateTime={storyDate}>{date}</time>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function NewsPost({ onSelect = () => {}, newsData }) {
  const reduce = useReducedMotion();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Array.isArray(newsData)) {
      setLoading(false);
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

  const getImageurl = (item) => getImageUrl(item?.featured_image || item?.images?.[0]);

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
    'mx-auto grid w-full max-w-[1680px] grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-[402fr_828fr_402fr] lg:items-center';

  if (!Array.isArray(newsData) && loading) {
    return (
      <div className={gridClass}>
        <Skeleton className="aspect-[402/386] w-full rounded-none" />

        <Skeleton className="aspect-[828/532] w-full rounded-none" />

        <Skeleton className="aspect-[402/386] w-full rounded-none" />
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
      {left && (
        <Card
          story={left}
          ratio={402 / 386}
          variants={item}
          getImageUrl={getImageurl}
          onSelect={onSelect}
          titleClamp={SIDE_TITLE_CLAMP}
          className="md:col-start-1 md:row-start-2 lg:col-start-1 lg:row-start-1"
        />
      )}

      <Card
        story={main}
        ratio={828 / 532}
        variants={item}
        getImageUrl={getImageurl}
        onSelect={onSelect}
        titleClamp={MAIN_TITLE_CLAMP}
        isMain
        className="order-first md:order-none md:col-span-2 md:col-start-1 md:row-start-1 lg:col-span-1 lg:col-start-2"
      />

      {right && (
        <Card
          story={right}
          ratio={402 / 386}
          variants={item}
          getImageUrl={getImageurl}
          onSelect={onSelect}
          titleClamp={SIDE_TITLE_CLAMP}
          className="md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1"
        />
      )}
    </motion.section>
  );
}
