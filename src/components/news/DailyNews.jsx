import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Font required: Mukta (600) -> load once in index.html / CSS.
 *
 * Props:
 *  - title:       section heading (default "Daily Updates")
 *  - news:        array of stories. news[0] = centre, then left/right alternate outwards
 *                 (news[1] left, news[2] right, news[3] left, ...). Up to 7 are used.
 *  - loading:     show a skeleton
 *  - getImageUrl: (item) => image url
 *  - onSelect:    (item) => void
 */

// Figma sizes, from the centre card outwards (px on the 1680 x 890 canvas)
const LEVELS = [
  { w: 555, h: 890, visible: 555, overlay: 0.1 }, // centre
  { w: 457, h: 790, visible: 291, overlay: 0.3 },
  { w: 353, h: 690, visible: 187, overlay: 0.5 },
  { w: 250, h: 590, visible: 84, overlay: 0.6 },
];
const CANVAS_H = 890;

/** how many cards each side of the centre fit the screen: base 1, sm 2, lg 3 */
function useMaxSideLevels() {
  const read = () => {
    if (typeof window === 'undefined') return 3;
    if (window.matchMedia('(min-width: 1024px)').matches) return 3;
    if (window.matchMedia('(min-width: 640px)').matches) return 2;
    return 1;
  };

  const [levels, setLevels] = useState(read);

  useEffect(() => {
    const update = () => setLevels(read());
    const queries = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 640px)'),
    ];
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);

  return levels;
}

/** builds the absolutely-positioned cards (percentages of the canvas) for k levels per side */
function buildLayout(k) {
  const sideVisible = LEVELS.slice(1, k + 1).reduce((sum, l) => sum + l.visible, 0);
  const total = LEVELS[0].visible + sideVisible * 2;

  const cards = [{ level: 0, side: 'center', left: sideVisible, ...LEVELS[0] }];

  for (let j = 1; j <= k; j += 1) {
    const startOfVisible = LEVELS.slice(j + 1, k + 1).reduce(
      (sum, l) => sum + l.visible,
      0,
    );
    cards.push({ level: j, side: 'left', left: startOfVisible, ...LEVELS[j] });
    cards.push({
      level: j,
      side: 'right',
      left: total - startOfVisible - LEVELS[j].w,
      ...LEVELS[j],
    });
  }

  return { total, cards };
}

export default function DailyUpdates({
  title = 'Daily Updates',
  news = [],
  loading = false,
  getImageUrl,
  onSelect,
}) {
  const reduce = useReducedMotion();
  const maxLevels = useMaxSideLevels();

  // never use more side cards than we have stories for
  const k = Math.min(maxLevels, Math.floor((news.length - 1) / 2));
  const { total, cards } = buildLayout(Math.max(k, 0));

  // order stories: centre, left1, right1, left2, right2, ...
  const storyFor = (card) => {
    if (card.level === 0) return news[0];
    return news[card.level * 2 - (card.side === 'left' ? 1 : 0)];
  };

  if (!loading && news.length === 0) return null;

  return (
    <section
      aria-labelledby="daily-updates-heading"
      className="mx-auto flex w-full max-w-[1920px] flex-col items-start gap-3 px-4 sm:gap-4 sm:px-6 md:px-10 lg:px-16 xl:px-[120px]">
      <h2
        id="daily-updates-heading"
        className="font-['Mukta',sans-serif] text-2xl font-semibold leading-[1.2] tracking-[0.002em] text-[#16181A] sm:text-3xl md:text-4xl xl:text-5xl 2xl:text-[56px] 2xl:leading-[67px]">
        {title}
      </h2>

      <div
        className="relative mx-auto w-full max-w-[1680px] overflow-hidden"
        style={{ aspectRatio: `${total} / ${CANVAS_H}` }}>
        {loading ? (
          <Skeleton className="absolute inset-0 rounded-none" />
        ) : (
          cards.map((card) => {
            const story = storyFor(card);
            if (!story) return null;
            const src = getImageUrl(story);
            const zIndex = 10 - card.level; // inner cards sit on top of outer ones

            return (
              <motion.button
                key={`${card.side}-${card.level}`}
                type="button"
                aria-label={story.title}
                title={story.title}
                onClick={() => onSelect(story)}
                initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: reduce ? 0 : card.level * 0.12,
                }}
                className="group absolute cursor-pointer overflow-hidden bg-neutral-300 outline-none focus-visible:ring-2 focus-visible:ring-[#164B99] focus-visible:ring-offset-2"
                style={{
                  left: `${(card.left / total) * 100}%`,
                  width: `${(card.w / total) * 100}%`,
                  height: `${(card.h / CANVAS_H) * 100}%`,
                  top: `${((CANVAS_H - card.h) / 2 / CANVAS_H) * 100}%`,
                  zIndex,
                }}>
                {src ? (
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-300 text-xs text-neutral-500">
                    No image
                  </div>
                )}

                {/* dark overlay from the design, lightens on hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                  style={{ backgroundColor: `rgba(0, 0, 0, ${card.overlay})` }}
                />
              </motion.button>
            );
          })
        )}
      </div>
    </section>
  );
}
