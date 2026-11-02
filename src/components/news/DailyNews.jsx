import { motion, useReducedMotion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

export default function DailyUpdatesCarousel({
  title = 'Daily Updates',
  news = [],
  loading = false,
  getImageUrl,
}) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  // Do not repeat news items
  const slides = news;

  if (!loading && news.length === 0) return null;

  const handleNewsClick = (item, isActive) => {
    // Only the centre image opens NewsDetails
    if (!isActive) return;

    if (!item?.slug) {
      console.error('News slug is missing:', item);
      return;
    }

    navigate(`/news/${item.slug}`);
  };

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
          centeredSlides
          slidesPerView="auto"
          spaceBetween={-100}
          loop={slides.length > 2}
          slideToClickedSlide
          allowTouchMove
          grabCursor
          autoplay={
            reduce
              ? false
              : {
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 150,
            modifier: 1.5,
            slideShadows: true,
          }}
          className="w-full !pb-8 !pt-2.5">
          {slides.map((item, index) => {
            const imageUrl = getImageUrl ? getImageUrl(item) : item.featured_image;

            return (
              <SwiperSlide
                key={item.id || item.slug || index}
                className="!h-[300px] !w-[180px] brightness-[.65] transition-all duration-500 [&.swiper-slide-active]:brightness-100 sm:!h-[380px] sm:!w-[230px] md:!h-[450px] md:!w-[280px]">
                {({ isActive }) => (
                  <button
                    type="button"
                    aria-label={`Read ${item.title}`}
                    title={item.title}
                    onClick={() => handleNewsClick(item, isActive)}
                    className={`block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-[#164B99] ${
                      isActive ? 'cursor-pointer' : 'cursor-grab'
                    }`}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title || 'News image'}
                        loading="lazy"
                        decoding="async"
                        className="block h-full w-full rounded-[2px] object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', imageUrl);
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-300 text-sm text-neutral-500">
                        No image
                      </div>
                    )}
                  </button>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </motion.section>
  );
}
