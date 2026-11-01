import { motion, useReducedMotion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

// import { Skeleton } from '@/components/ui/skeleton';

/**
 * Coverflow image carousel (Swiper) styled only with Tailwind.
 * No ImageCarousel.css and no `body { margin: 0 }` needed (Tailwind preflight does that).
 *
 * Props:
 *  - title:       section heading (default "Daily Updates")
 *  - news:        array of stories
 *  - loading:     show a skeleton
 *  - getImageUrl: (item) => image url
 *  - onSelect:    (item) => void   (clicking the centre slide opens the story;
 *                                   clicking a side slide moves it to the centre)
 */

const MIN_SLIDES = 8; // loop mode needs enough slides, so short lists are repeated

export default function DailyUpdatesCarousel({
  title = 'Daily Updates',
  news = [],
  loading = false,
  getImageUrl,
  onSelect,
}) {
  const reduce = useReducedMotion();

  const slides =
    news.length === 0 || news.length >= MIN_SLIDES
      ? news
      : Array.from(
          { length: Math.ceil(MIN_SLIDES / news.length) * news.length },
          (_, i) => news[i % news.length],
        );

  if (!loading && news.length === 0) return null;

  return (
    <motion.section
      aria-labelledby="daily-updates-heading"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-full max-w-[1920px] overflow-hidden px-4 py-5 sm:px-6 md:px-10 lg:px-16 xl:px-[120px]">
      <h2
        id="daily-updates-heading"
        className="mb-4 font-['Mukta',sans-serif] text-2xl font-semibold leading-[1.2] tracking-[0.002em] text-[#16181A] sm:mb-6 sm:text-3xl md:text-4xl xl:text-5xl 2xl:text-[56px] 2xl:leading-[67px]">
        {title}
      </h2>

      {loading ? (
        <div className="mx-auto h-[350px] w-full max-w-[1680px] animate-pulse bg-gray-200 md:h-[510px]" />
      ) : (
        <Swiper
          modules={[EffectCoverflow, Autoplay]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          spaceBetween={-140}
          breakpoints={{ 768: { spaceBetween: -130 } }}
          loop
          slideToClickedSlide
          autoplay={
            reduce
              ? false
              : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
          }
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 150,
            modifier: 1.5,
            slideShadows: true,
          }}
          className="w-full !pb-8 !pt-2.5">
          {slides.map((item, index) => (
            <SwiperSlide
              key={`${item.id}-${index}`}
              className="!h-[300px] !w-[180px] brightness-[.65] transition-all duration-500 [&.swiper-slide-active]:brightness-100 sm:!h-[380px] sm:!w-[230px] md:!h-[450px] md:!w-[280px]">
              {({ isActive }) => {
                const src = getImageUrl(item);

                return (
                  <button
                    type="button"
                    aria-label={item.title}
                    title={item.title}
                    onClick={() => isActive && onSelect?.(item)}
                    className="block h-full w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#164B99]">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="block h-full w-full rounded-[2px] object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-300 text-sm text-neutral-500">
                        No image
                      </div>
                    )}
                  </button>
                );
              }}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </motion.section>
  );
}
