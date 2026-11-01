import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Full-width advertisement banner.
 *
 * Props:
 *  - image:   banner image url (design source is 6800x1100)
 *  - alt:     alt text for the ad
 *  - href:    optional, makes the whole banner a link (opens in a new tab)
 *  - loading: show a skeleton while the ad is being fetched
 */
export default function AdBanner({
  image = '',
  alt = 'Advertisement',
  href = '',
  loading = false,
}) {
  const reduce = useReducedMotion();

  // base/sm keep the ad tall enough to read; md+ uses the design ratio (1926 x 252)
  const frame =
    'relative block w-full overflow-hidden aspect-[3/1] sm:aspect-[4/1] md:aspect-[1926/252]';

  if (!loading && !image) return null;

  const picture = loading ? (
    <Skeleton className={`${frame} rounded-none`} />
  ) : (
    <motion.img
      src={image}
      alt={alt}
      loading="lazy"
      initial={reduce ? false : { opacity: 0, scale: 1.03 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );

  return (
    <aside
      aria-label="Advertisement"
      className="flex w-full flex-col items-start gap-2.5 bg-[#EAEBED] py-3 sm:py-4 xl:py-6">
      {href && !loading ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`${frame} outline-none focus-visible:ring-2 focus-visible:ring-[#164B99] focus-visible:ring-offset-2`}>
          {picture}
        </a>
      ) : (
        <div className={frame}>{picture}</div>
      )}
    </aside>
  );
}
