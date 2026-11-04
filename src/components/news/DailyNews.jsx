import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

import { getImageUrl } from '@/lib/getImageUrl';
import api from '@/services/api';

const LEVELS = [
  { w: 555, h: 890, visible: 555, overlay: 0.1 },
  { w: 457, h: 790, visible: 291, overlay: 0.3 },
  { w: 353, h: 690, visible: 187, overlay: 0.5 },
  { w: 250, h: 590, visible: 84, overlay: 0.6 },
];

const CANVAS_H = 890;

function useMaxSideLevels() {
  const read = () => {
    if (typeof window === 'undefined') return 3;

    if (window.matchMedia('(min-width: 1024px)').matches) {
      return 3;
    }

    if (window.matchMedia('(min-width: 640px)').matches) {
      return 2;
    }

    return 1;
  };

  const [levels, setLevels] = useState(read);

  useEffect(() => {
    const update = () => {
      setLevels(read());
    };

    const queries = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 640px)'),
    ];

    queries.forEach((query) => {
      query.addEventListener('change', update);
    });

    return () => {
      queries.forEach((query) => {
        query.removeEventListener('change', update);
      });
    };
  }, []);

  return levels;
}

function buildLayout(k) {
  const sideVisible = LEVELS.slice(1, k + 1).reduce(
    (sum, level) => sum + level.visible,
    0,
  );

  const total = LEVELS[0].visible + sideVisible * 2;

  const cards = [
    {
      level: 0,
      side: 'center',
      left: sideVisible,
      ...LEVELS[0],
    },
  ];

  for (let level = 1; level <= k; level += 1) {
    const startOfVisible = LEVELS.slice(level + 1, k + 1).reduce(
      (sum, currentLevel) => sum + currentLevel.visible,
      0,
    );

    cards.push({
      level,
      side: 'left',
      left: startOfVisible,
      ...LEVELS[level],
    });

    cards.push({
      level,
      side: 'right',
      left: total - startOfVisible - LEVELS[level].w,
      ...LEVELS[level],
    });
  }

  return {
    total,
    cards,
  };
}

export default function DailyNews({ title = 'Daily Updates' }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const maxLevels = useMaxSideLevels();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeIndex, setActiveIndex] = useState(0);

  /*
   * FETCH NEWS FROM BACKEND
   */
  useEffect(() => {
    const fetchNews = async () => {
      try {
        console.log('Fetching daily news from backend...');
        setLoading(true);
        setError('');

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        console.log('DAILY NEWS BACKEND RESPONSE:', response.data);

        /*
         * Your backend appears to return:
         *
         * {
         *   success: true,
         *   data: {
         *     data: [...]
         *   }
         * }
         *
         * Therefore:
         */
        const newsData = response.data?.data || [];

        console.log('DAILY NEWS ARRAY:', newsData);

        setNews(Array.isArray(newsData) ? newsData : []);
      } catch (error) {
        console.error('DAILY NEWS FETCH ERROR:', error);

        setError(
          error.response?.data?.message || error.message || 'Unable to load daily news.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  /*
   * Keep active index valid when API data changes.
   */
  useEffect(() => {
    if (news.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => {
      if (current >= news.length) {
        return 0;
      }

      return current;
    });
  }, [news.length]);

  const k = maxLevels;

  const { total, cards } = buildLayout(k);

  /*
   * Circular index.
   */
  const getCircularIndex = (index) => {
    if (news.length === 0) {
      return 0;
    }

    return ((index % news.length) + news.length) % news.length;
  };

  /*
   * Get story for each visual position.
   */
  /*
   * Which news index belongs to this visual slot.
   */
  const indexFor = (card) => {
    if (news.length === 0) return null;

    let index = activeIndex;

    if (card.side === 'left') index = activeIndex - card.level;
    if (card.side === 'right') index = activeIndex + card.level;

    return getCircularIndex(index);
  };

  /*
   * Move carousel LEFT.
   */
  const moveLeft = () => {
    if (news.length <= 1) {
      return;
    }

    setActiveIndex((current) => getCircularIndex(current - 1));
  };

  /*
   * Move carousel RIGHT.
   */
  const moveRight = () => {
    if (news.length <= 1) {
      return;
    }

    setActiveIndex((current) => getCircularIndex(current + 1));
  };

  /*
   * Clicking the empty area of the carousel:
   *
   * left half  -> previous
   * right half -> next
   */
  const handleCarouselClick = (event) => {
    const carousel = event.currentTarget;

    const rect = carousel.getBoundingClientRect();

    const clickX = event.clientX - rect.left;

    const centerX = rect.width / 2;

    if (clickX < centerX) {
      moveLeft();
      return;
    }

    if (clickX > centerX) {
      moveRight();
    }
  };

  /*
   * CENTER IMAGE CLICK
   *
   * This directly navigates to:
   *
   * /news/{slug}
   */
  const handleCenterClick = (event, story) => {
    event.stopPropagation();

    if (!story) {
      return;
    }

    console.log('CLICKED NEWS:', story);

    console.log('NEWS SLUG:', story.slug);

    if (!story.slug) {
      console.error('News slug is missing:', story);

      return;
    }

    navigate(`/news/${story.slug}`);
  };

  /*
   * SIDE CARD CLICK
   */
  const handleSideClick = (event, newsIndex) => {
    event.stopPropagation();
    setActiveIndex(newsIndex);
  };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <section
        aria-labelledby="daily-updates-heading"
        className="
          mx-auto
          flex
          w-full
          max-w-[1920px]
          flex-col
          items-start
          gap-3
          px-4
          sm:gap-4
          sm:px-6
          md:px-10
          lg:px-16
          xl:px-[60px]
        ">
        {title}

        <h2
          id="daily-updates-heading"
          className="font-['Mukta',sans-serif] text-3xl font-semibold leading-[1.2] tracking-[0.002em] text-[#16181A]">
          {title}
        </h2>
        <div
          className="
            relative
            mx-auto
            w-full
            max-w-[1680px]
            overflow-hidden
          "
          style={{
            aspectRatio: `${total} / ${CANVAS_H}`,
          }}>
          <Skeleton
            className="
              absolute
              inset-0
              rounded-none
            "
          />
        </div>
      </section>
    );
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <section
        className="
          mx-auto
          w-full
          max-w-[1920px]
          px-4
          sm:px-6
          md:px-10
          lg:px-16
          xl:px-[60px]
        ">
        <h2
          className="
            font-['Mukta',sans-serif]
            text-2xl
            font-semibold
            text-[#16181A]
            sm:text-3xl
          ">
          {title}
        </h2>

        <p className="mt-4 text-sm text-red-500">{error}</p>
      </section>
    );
  }

  /*
   * No news.
   */
  if (news.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="daily-updates-heading"
      className="flex w-full flex-col items-start gap-3 sm:gap-4
      ">
      {/* TITLE */}

      <h2
        id="daily-updates-heading"
        className="
          text-2xl font-bold leading-tight text-gray-900 sm:text-3xl
        ">
        {title}
      </h2>

      {/* CAROUSEL */}

      <div
        onClick={handleCarouselClick}
        className="
          relative
          mx-auto
          w-full
          max-w-[1680px]
          overflow-hidden
        "
        style={{
          aspectRatio: `${total} / ${CANVAS_H}`,
        }}>
        {cards.map((card) => {
          const newsIndex = indexFor(card);
          if (newsIndex === null) return null;

          const story = news[newsIndex];
          if (!story) return null;

          const imagePath = story?.featured_image || story?.images?.[0];
          const src = getImageUrl(imagePath);

          const zIndex = card.side === 'center' ? 20 : 10 - card.level;

          /*
           * STABLE KEY: tied to the story, not the slot.
           * The same element moves between slots instead of remounting.
           * (If the list is shorter than the slot count, the same story can
           * appear twice, so the slot is added in that case only.)
           */
          const storyKey = story.id ?? story.slug ?? newsIndex;
          const key =
            news.length >= cards.length
              ? `story-${storyKey}`
              : `story-${storyKey}-${card.side}-${card.level}`;

          return (
            <motion.button
              key={key}
              type="button"
              aria-label={story.title ? `Read ${story.title}` : 'Read news'}
              title={story.title}
              onClick={(event) => {
                if (card.side === 'center') {
                  handleCenterClick(event, story);
                } else {
                  handleSideClick(event, newsIndex);
                }
              }}
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{
                opacity: 1,
                scale: 1,
                left: `${(card.left / total) * 100}%`,
                width: `${(card.w / total) * 100}%`,
                height: `${(card.h / CANVAS_H) * 100}%`,
                top: `${((CANVAS_H - card.h) / 2 / CANVAS_H) * 100}%`,
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: 0.65,
                      ease: [0.22, 1, 0.36, 1],
                      opacity: { duration: 0.35 },
                      scale: { duration: 0.5, ease: 'easeOut' },
                    }
              }
              className="
        group
        absolute
        cursor-pointer
        overflow-hidden
        bg-neutral-300
        outline-none
        focus-visible:ring-2
        focus-visible:ring-[#164B99]
        focus-visible:ring-offset-2
      "
              style={{ zIndex }}>
              {/* IMAGE */}
              {src ? (
                <img
                  src={src}
                  alt={story.title || 'News image'}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={() => console.error('Failed to load image:', src)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-300 text-xs text-neutral-500">
                  No image
                </div>
              )}

              {/* DARK OVERLAY (now fades smoothly between levels) */}
              <div
                aria-hidden="true"
                className="absolute inset-0 transition-[background-color,opacity] duration-700 group-hover:opacity-0"
                style={{ backgroundColor: `rgba(0, 0, 0, ${card.overlay})` }}
              />

              {card.side === 'center' && (
                <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

// import { motion, useReducedMotion } from 'framer-motion';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay } from 'swiper/modules';
// import { useNavigate } from 'react-router-dom';
// import { useState } from 'react';

// import 'swiper/css';
// import { getImageUrl } from '@/lib/getImageUrl';

// export default function DailyNews({
//   title = 'Daily Updates',
//   news = [],
//   loading = false,
// }) {
//   const reduce = useReducedMotion();
//   const navigate = useNavigate();

//   const [activeIndex, setActiveIndex] = useState(0);

//   const slides = Array.isArray(news) ? news : [];

//   if (!loading && slides.length === 0) {
//     return null;
//   }

//   const handleNewsClick = (item) => {
//     if (!item?.slug) {
//       console.error('News slug is missing:', item);
//       return;
//     }

//     navigate(`/news/${item.slug}`);
//   };

//   /*
//    * Get the position of an image relative to
//    * the currently active/center image.
//    */
//   const getDistanceFromActive = (index) => {
//     if (!slides.length) return 0;

//     let distance = index - activeIndex;

//     // Handle loop movement.
//     const total = slides.length;

//     if (distance > total / 2) {
//       distance -= total;
//     }

//     if (distance < -total / 2) {
//       distance += total;
//     }

//     return distance;
//   };

//   const getCardClass = (index) => {
//     const distance = getDistanceFromActive(index);

//     if (distance === 0) {
//       return `
//         h-[890px]
//         w-[555px]
//         opacity-100
//         brightness-100
//         z-40
//       `;
//     }

//     if (Math.abs(distance) === 1) {
//       return `
//         h-[790px]
//         w-[457px]
//         opacity-100
//         brightness-[0.75]
//         z-30
//       `;
//     }

//     if (Math.abs(distance) === 2) {
//       return `
//         h-[690px]
//         w-[354px]
//         opacity-100
//         brightness-[0.55]
//         z-20
//       `;
//     }

//     return `
//       h-[590px]
//       w-[250px]
//       opacity-100
//       brightness-[0.4]
//       z-10
//     `;
//   };

//   return (
//     <motion.section
//       aria-labelledby="daily-updates-heading"
//       initial={
//         reduce
//           ? false
//           : {
//               opacity: 0,
//               y: 20,
//             }
//       }
//       whileInView={{
//         opacity: 1,
//         y: 0,
//       }}
//       viewport={{
//         once: true,
//         amount: 0.1,
//       }}
//       transition={{
//         duration: 0.5,
//         ease: 'easeOut',
//       }}
//       className="
//         mx-auto
//         w-full
//         max-w-[1920px]
//         overflow-hidden
//         px-4
//         py-5
//         sm:px-6
//         md:px-10
//         lg:px-16
//         xl:px-[120px]
//       ">
//       {/* TITLE */}

//       <h2
//         id="daily-updates-heading"
//         className="
//           mb-4
//           font-['Mukta',sans-serif]
//           text-2xl
//           font-semibold
//           leading-[1.2]
//           tracking-[0.002em]
//           text-[#16181A]
//           sm:mb-6
//           sm:text-3xl
//           md:text-4xl
//           xl:text-5xl
//           2xl:text-[56px]
//           2xl:leading-[67px]
//         ">
//         {title}
//       </h2>

//       {/* LOADING */}

//       {loading ? (
//         <div
//           className="
//             mx-auto
//             h-[350px]
//             w-full
//             max-w-[1680px]
//             animate-pulse
//             bg-gray-200
//             md:h-[510px]
//             lg:h-[650px]
//             xl:h-[890px]
//           "
//         />
//       ) : (
//         <Swiper
//           modules={[Autoplay]}
//           centeredSlides
//           slidesPerView="auto"
//           /*
//            * Negative spacing creates the
//            * overlapping Figma-style layout.
//            */
//           spaceBetween={-166}
//           loop={slides.length > 1}
//           /*
//            * IMPORTANT:
//            * No mouse/touch dragging.
//            */
//           allowTouchMove={false}
//           simulateTouch={false}
//           grabCursor={false}
//           /*
//            * Automatic horizontal movement.
//            */
//           speed={1000}
//           autoplay={
//             reduce
//               ? false
//               : {
//                   delay: 1800,
//                   disableOnInteraction: false,
//                   pauseOnMouseEnter: false,
//                 }
//           }
//           /*
//            * Update active/center image.
//            */
//           onSwiper={(swiper) => {
//             setActiveIndex(swiper.realIndex);
//           }}
//           onSlideChange={(swiper) => {
//             setActiveIndex(swiper.realIndex);
//           }}
//           className="
//             w-full
//             !pb-8
//             !pt-2
//           ">
//           {slides.map((item, index) => {
//             const imageUrl = getImageUrl(item?.featured_image);

//             return (
//               <SwiperSlide
//                 key={item?.id || item?.slug || index}
//                 className="
//                   !flex
//                   !h-[890px]
//                   !w-[555px]
//                   !items-center
//                   !justify-center
//                 ">
//                 <button
//                   type="button"
//                   aria-label={`Read ${item?.title || 'news'}`}
//                   title={item?.title}
//                   onClick={() => handleNewsClick(item)}
//                   className={`
//                     relative
//                     overflow-hidden
//                     rounded-none
//                     outline-none
//                     transition-all
//                     duration-700
//                     ease-out
//                     focus-visible:ring-2
//                     focus-visible:ring-[#164B99]

//                     ${getCardClass(index)}
//                   `}>
//                   {imageUrl ? (
//                     <img
//                       src={imageUrl}
//                       alt={item?.title || 'News image'}
//                       loading="lazy"
//                       decoding="async"
//                       className="
//                         block
//                         h-full
//                         w-full
//                         object-cover
//                       "
//                       onError={() => {
//                         console.error('Failed to load image:', imageUrl);
//                       }}
//                     />
//                   ) : (
//                     <div
//                       className="
//                         flex
//                         h-full
//                         w-full
//                         items-center
//                         justify-center
//                         bg-neutral-300
//                         text-sm
//                         text-neutral-500
//                       ">
//                       No image
//                     </div>
//                   )}
//                 </button>
//               </SwiperSlide>
//             );
//           })}
//         </Swiper>
//       )}
//     </motion.section>
//   );
// }
