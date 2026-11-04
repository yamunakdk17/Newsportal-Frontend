import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/api';
import { getImageUrl } from '@/lib/getImageUrl';

/*
 * Convert backend image path into a usable URL.
 */

export default function AdBanner() {
  const reduce = useReducedMotion();

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch banners from backend.
   */
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);

        const response = await api.get('/banners');

        console.log('FULL BANNER RESPONSE:', response.data);
        console.log('BANNER DATA:', response.data?.data);
        const responseData = response.data?.data ?? response.data;

        // Support an array or a single banner object.
        const banners = Array.isArray(responseData)
          ? responseData
          : responseData
            ? [responseData]
            : [];

        // Display the first active banner.
        const activeBanner = banners.find(
          (item) =>
            item.is_active === true ||
            item.is_active === 1 ||
            item.is_active === '1' ||
            item.is_active === undefined,
        );

        setBanner(activeBanner || null);
      } catch (error) {
        console.error('Unable to fetch banners:', error.response?.data || error);

        setBanner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const frame =
    'relative block w-full overflow-hidden aspect-[3/1] sm:aspect-[4/1] md:aspect-[1926/252]';

  if (loading) {
    return (
      <aside className="flex w-full flex-col items-start gap-2.5 bg-[#EAEBED] py-3 sm:py-4 xl:py-6">
        <Skeleton className={`${frame} rounded-none`} />
      </aside>
    );
  }

  // No banner available
  if (!banner) return null;

  const image = getImageUrl(banner.image || banner.image_url || banner.banner_image);

  const href = banner.link_url || banner.url || '';

  if (!image) return null;

  const picture = (
    <img
      src={getImageUrl(banner.image)}
      alt={banner.title || 'Advertisement'}
      className="h-full w-full object-cover"
      onError={(e) => {
        console.error('Banner image failed to load:', e.currentTarget.src);
      }}
    />
  );

  return (
    <aside
      aria-label="Advertisement"
      className="relative left-1/2 w-screen -translate-x-1/2 bg-[#EAEBED]">
      {href ? (
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
