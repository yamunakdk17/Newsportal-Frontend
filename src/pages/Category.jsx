import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import api from '@/services/api';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

const PER_PAGE = 6;

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (item) => {
  const imagePath = item?.featured_image || item?.images?.[0] || '';

  if (!imagePath) {
    return '';
  }

  const imageUrl = String(imagePath).trim();

  /*
   * Already a complete URL
   */
  if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
    /*
     * Backend may return localhost.
     * Replace it with Cloudflare.
     */
    if (
      imageUrl.startsWith('http://localhost:8000') ||
      imageUrl.startsWith('https://localhost:8000')
    ) {
      return imageUrl.replace(
        /^https?:\/\/localhost:8000/,
        'https://cables-babies-eliminate-dozens.trycloudflare.com',
      );
    }

    return imageUrl;
  }

  /*
   * Cloudflare API URL
   */
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    'https://cables-babies-eliminate-dozens.trycloudflare.com/api';

  const backendUrl = apiUrl.replace(/\/api\/?$/, '');

  /*
   * Example:
   * /storage/news/image.jpg
   */
  if (imageUrl.startsWith('/')) {
    return `${backendUrl}${imageUrl}`;
  }

  /*
   * Example:
   * storage/news/image.jpg
   */
  return `${backendUrl}/${imageUrl}`;
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('ne-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

/* =========================================================
   PAGINATION
========================================================= */

const toNepaliNumber = (n) => Number(n).toLocaleString('ne-NP');

function getPageItems(current, total) {
  const keep = new Set([
    1,
    2,
    3,
    total - 2,
    total - 1,
    total,
    current - 1,
    current,
    current + 1,
  ]);

  const pages = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const items = [];

  pages.forEach((page, index) => {
    const prev = pages[index - 1];

    if (prev && page - prev === 2) {
      items.push(prev + 1);
    } else if (prev && page - prev > 2) {
      items.push(`ellipsis-${page}`);
    }

    items.push(page);
  });

  return items;
}

/* =========================================================
   STORY ROW
========================================================= */

function StoryRow({ story, index, variants, onSelect }) {
  const src = getImageUrl(story);

  const date = formatDate(story.published_at);

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
      className={`group grid cursor-pointer grid-cols-1 items-start gap-4 py-6 outline-none focus-visible:ring-2 focus-visible:ring-[#16181A] focus-visible:ring-offset-2 sm:gap-6 sm:py-8 md:grid-cols-[504fr_989fr] xl:py-10 ${
        index > 0 ? 'border-t border-[#DDE0E3]' : ''
      }`}>
      {/* IMAGE */}

      <AspectRatio ratio={504 / 400} className="w-full overflow-hidden bg-neutral-200">
        {src ? (
          <img
            src={src}
            alt={story.title || 'News image'}
            loading="lazy"
            onError={(event) => {
              console.error('Category image failed:', src);

              event.currentTarget.style.display = 'none';
            }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
            No image available
          </div>
        )}
      </AspectRatio>

      {/* CONTENT */}

      <div className="flex min-w-0 flex-col items-start gap-3 font-['Mukta',sans-serif] tracking-[0.002em] sm:gap-4 xl:gap-6">
        <div className="flex w-full flex-col items-start gap-2">
          <h2 className="line-clamp-3 w-full text-2xl font-bold leading-[1.2] text-[#16181A] transition-colors group-hover:text-[#164B99] sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-[56px] 2xl:leading-[67px]">
            {story.title}
          </h2>

          {date && (
            <p className="text-base leading-[1.6] text-[#16181A] sm:text-lg xl:text-2xl xl:leading-[38px]">
              {date}
            </p>
          )}

          {story.author && (
            <p className="text-base leading-[1.6] text-[#16181A] sm:text-lg xl:text-2xl xl:leading-[38px]">
              {story.author}
            </p>
          )}
        </div>

        {story.caption && (
          <p className="line-clamp-3 w-full text-sm leading-7 text-[#4A4E54] sm:text-base xl:text-lg xl:leading-[38px]">
            {story.caption}
          </p>
        )}
      </div>
    </motion.article>
  );
}

/* =========================================================
   PAGINATION COMPONENT
========================================================= */

const pageLinkClass =
  "size-8 shrink-0 rounded-lg border-0 bg-transparent p-0 font-['Mukta',sans-serif] text-xl font-normal leading-6 text-[#16181A] shadow-none hover:bg-[#C7CBD1]/40 hover:text-[#16181A]";

const activeLinkClass =
  'bg-[#C7CBD1] text-[#F9F9FA] hover:bg-[#C7CBD1] hover:text-[#F9F9FA]';

function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const go = (event, target) => {
    event.preventDefault();

    if (target >= 1 && target <= totalPages && target !== page) {
      onChange(target);
    }
  };

  return (
    <div className="flex w-full justify-center sm:justify-end">
      <Pagination className="mx-0 w-auto">
        <PaginationContent className="flex-wrap justify-center gap-2">
          {/* PREVIOUS */}

          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="अघिल्लो"
              onClick={(e) => go(e, page - 1)}
              className={`group w-auto gap-2 ${pageLinkClass} text-[#4A4E54] hover:bg-transparent hover:text-[#16181A] ${
                page === 1 ? 'pointer-events-none opacity-50' : ''
              }`}>
              <ArrowLeft className="size-5 shrink-0 transition-transform group-hover:-translate-x-0.5" />

              <span className="hidden sm:inline">अघिल्लो</span>
            </PaginationLink>
          </PaginationItem>

          {/* PAGE NUMBERS */}

          {getPageItems(page, totalPages).map((item) =>
            typeof item === 'string' ? (
              <PaginationItem key={item}>
                <PaginationEllipsis className="size-8 text-[#16181A]" />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  aria-label={`Page ${item}`}
                  onClick={(e) => go(e, item)}
                  className={`${pageLinkClass} ${item === page ? activeLinkClass : ''}`}>
                  {toNepaliNumber(item)}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          {/* NEXT */}

          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="अर्को"
              onClick={(e) => go(e, page + 1)}
              className={`group w-auto gap-2 ${pageLinkClass} hover:bg-transparent ${
                page === totalPages ? 'pointer-events-none opacity-50' : ''
              }`}>
              <span className="hidden sm:inline">अर्को</span>

              <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

/* =========================================================
   CATEGORY PAGE
========================================================= */

function Category() {
  const { slug = 'all' } = useParams();

  const navigate = useNavigate();

  const reduce = useReducedMotion();

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [news, setNews] = useState([]);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  /* =====================================================
     FETCH NEWS
  ===================================================== */

  useEffect(() => {
    let active = true;

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page,
          per_page: PER_PAGE,
        };

        /*
         * If a real category is selected,
         * convert the category slug into its integer ID.
         */
        if (slug && slug.toLowerCase() !== 'all') {
          console.log('CATEGORY SLUG:', slug);

          // Get all categories
          const categoryResponse = await api.get('/categories');

          console.log('CATEGORIES RESPONSE:', categoryResponse.data);

          const categories = Array.isArray(categoryResponse.data?.data)
            ? categoryResponse.data.data
            : [];

          /*
           * Find category using the slug from the URL.
           *
           * Example:
           * URL: /category/sports
           * slug: "sports"
           *
           * Category:
           * {
           *   id: 3,
           *   name: "Sports",
           *   slug: "sports"
           * }
           */
          const selectedCategory = categories.find(
            (category) =>
              String(category?.slug).toLowerCase() === String(slug).toLowerCase(),
          );

          console.log('SELECTED CATEGORY:', selectedCategory);

          /*
           * Category was not found.
           */
          if (!selectedCategory) {
            throw new Error(`Category "${slug}" was not found.`);
          }

          /*
           * Backend requires integer category ID.
           */
          const categoryId = Number(selectedCategory.id);

          if (!Number.isInteger(categoryId)) {
            throw new Error('Invalid category ID received from backend.');
          }

          params.category = categoryId;
        }

        console.log('CATEGORY API PARAMS:', params);

        /*
         * Fetch news.
         */
        const response = await api.get('/news', {
          params,
        });

        console.log('CATEGORY API RESPONSE:', response.data);

        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Unable to load news.');
        }

        const data = response.data?.data;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        /*
         * Keep only published news.
         */
        const publishedNews = list.filter((item) => {
          const value = item?.is_published;

          return value === true || value === 1 || value === '1' || value === 'true';
        });

        if (!active) {
          return;
        }

        setNews(publishedNews);

        /*
         * Laravel-style pagination.
         */
        const lastPage = Number(
          response.data?.meta?.last_page ?? response.data?.last_page ?? 1,
        );

        setTotalPages(Math.max(1, lastPage));
      } catch (requestError) {
        console.error(
          'Unable to load category news:',
          requestError.response?.data || requestError,
        );

        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            'Unable to load news.',
        );

        setNews([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      active = false;
    };
  }, [slug, page]);

  /* =====================================================
     CHANGE PAGE
  ===================================================== */

  const changePage = (target) => {
    if (target < 1 || target > totalPages) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    if (target === 1) {
      params.delete('page');
    } else {
      params.set('page', String(target));
    }

    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =====================================================
     CATEGORY NAME
  ===================================================== */

  const categoryName = news[0]?.category?.name || (slug === 'all' ? 'All News' : slug);

  /* =====================================================
     ANIMATION
  ===================================================== */

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
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

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      <Header />

      <main className="mx-auto flex w-full max-w-[1920px] flex-col items-start gap-6 px-4 pb-10 sm:gap-10 sm:px-6 md:px-10 lg:px-16 xl:gap-20 xl:px-[120px] xl:pb-20">
        {/* CATEGORY BADGE */}

        <motion.div
          initial={
            reduce
              ? false
              : {
                  opacity: 0,
                  y: -10,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            ease: 'easeOut',
          }}
          className="flex items-center gap-4 bg-[linear-gradient(90deg,rgba(33,104,205,0.2)_2.48%,rgba(17,52,103,0.2)_100%),#2168CD] px-3 py-1.5 sm:px-4 sm:py-2">
          <h1 className="font-['Mukta',sans-serif] text-xl font-bold leading-[1.2] tracking-[0.002em] text-[#F0F3FE] sm:text-2xl xl:text-[32px] xl:leading-[38px]">
            {categoryName}
          </h1>
        </motion.div>

        <div className="flex w-full flex-col gap-6 xl:gap-6">
          {/* LOADING */}

          {loading &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-4 py-6 sm:gap-6 md:grid-cols-[504fr_989fr]">
                <Skeleton className="aspect-[504/400] w-full rounded-none" />

                <div className="flex flex-col gap-3">
                  <Skeleton className="h-10 w-3/4" />

                  <Skeleton className="h-6 w-40" />

                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}

          {/* ERROR */}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="font-['Mukta',sans-serif] text-lg text-red-500">{error}</p>

              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="size-4" />
                Back to home
              </Button>
            </div>
          )}

          {/* EMPTY */}

          {!loading && !error && news.length === 0 && (
            <p className="py-16 text-center font-['Mukta',sans-serif] text-lg text-gray-500">
              No news available.
            </p>
          )}

          {/* NEWS LIST */}

          {!loading && !error && news.length > 0 && (
            <motion.div
              key={`${slug}-${page}`}
              variants={container}
              initial="hidden"
              animate="show"
              className="flex w-full flex-col">
              {news.map((story, index) => (
                <StoryRow
                  key={story.id || story.slug || index}
                  story={story}
                  index={index}
                  variants={item}
                  onSelect={(selected) => navigate(`/news/${selected.slug}`)}
                />
              ))}
            </motion.div>
          )}

          {/* PAGINATION */}

          {!loading && !error && (
            <Pager page={page} totalPages={totalPages} onChange={changePage} />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Category;
