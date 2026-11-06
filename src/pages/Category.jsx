import { useEffect, useState } from 'react';

import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import api from '@/services/api';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Trending from '@/components/news/TrendingNews';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

const PER_PAGE = 10;

// Cache each category/page response for 60 seconds.
const categoryNewsCache = new Map();
const CATEGORY_CACHE_TTL = 60 * 1000;

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (item) => {
  const imagePath = item?.featured_image || item?.images?.[0] || '';

  if (!imagePath) {
    return '';
  }

  const imageUrl = String(imagePath).trim();

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    'https://cables-babies-eliminate-dozens.trycloudflare.com/api';

  const backendUrl = apiUrl.replace(/\/api\/?$/, '');

  if (
    imageUrl.startsWith('http://localhost:8000') ||
    imageUrl.startsWith('https://localhost:8000')
  ) {
    return imageUrl.replace(/^https?:\/\/localhost:8000/, backendUrl);
  }

  if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${backendUrl}${imageUrl}`;
  }

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
   PAGINATION HELPERS
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

  const [imageFailed, setImageFailed] = useState(false);

  const date = formatDate(story.published_at || story.created_at);

  const description = story.excerpt || story.caption;

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
      className={`group grid cursor-pointer grid-cols-1 items-start gap-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-[#16181A] focus-visible:ring-offset-4 sm:gap-6 sm:py-7 md:grid-cols-[38%_62%] lg:gap-7 lg:py-8 xl:gap-8 xl:py-9 ${
        index > 0 ? 'border-t border-[#DDE0E3]' : ''
      }`}>
      {/* IMAGE */}

      <AspectRatio
        ratio={16 / 9}
        className="w-full overflow-hidden rounded-none bg-neutral-200">
        {src && !imageFailed ? (
          <img
            src={src}
            alt={story.title || 'News image'}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-neutral-500">
            No image available
          </div>
        )}
      </AspectRatio>

      {/* CONTENT */}

      <div className="flex min-w-0 flex-col items-start gap-4 font-['Mukta',sans-serif] tracking-[0.002em] sm:gap-5 lg:gap-6">
        <div className="flex w-full flex-col items-start gap-2.5 sm:gap-3">
          {/* NEWS TITLE */}

          <h2
            className="
              line-clamp-3
              w-full
              text-lg
              font-bold
              leading-[1.35]
              text-[#16181A]
              transition-colors
              group-hover:text-[#164B99]
              sm:text-xl
              md:text-[22px]
              lg:text-[24px]
              xl:text-[26px]
            ">
            {story.title}
          </h2>

          {/* DATE */}

          {date && (
            <p className="text-sm leading-6 text-[#555B63] sm:text-[15px] lg:text-base">
              {date}
            </p>
          )}

          {/* AUTHOR */}

          {story.author && (
            <p className="text-sm leading-6 text-[#555B63] sm:text-[15px] lg:text-base">
              {story.author}
            </p>
          )}
        </div>

        {/* NEWS DESCRIPTION */}

        {description && (
          <p
            className="
              line-clamp-3
              w-full
              text-sm
              leading-6
              text-[#4A4E54]
              sm:text-[15px]
              sm:leading-7
              lg:text-base
              lg:leading-7
              xl:text-[17px]
            ">
            {description}
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
  "size-8 shrink-0 rounded-lg border-0 bg-transparent p-0 font-['Mukta',sans-serif] text-base font-normal leading-6 text-[#16181A] shadow-none hover:bg-[#C7CBD1]/40 hover:text-[#16181A]";

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
    <div className="flex w-full justify-center border-t border-[#E1E4E8] pt-8 sm:justify-end sm:pt-10">
      <Pagination className="mx-0 w-auto">
        <PaginationContent className="flex-wrap justify-center gap-1.5 sm:gap-2">
          {/* PREVIOUS */}

          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="अघिल्लो"
              onClick={(e) => go(e, page - 1)}
              className={`group w-auto gap-1.5 ${pageLinkClass} text-[#4A4E54] hover:bg-transparent hover:text-[#16181A] ${
                page === 1 ? 'pointer-events-none opacity-50' : ''
              }`}>
              <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />

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
              className={`group w-auto gap-1.5 ${pageLinkClass} hover:bg-transparent ${
                page === totalPages ? 'pointer-events-none opacity-50' : ''
              }`}>
              <span className="hidden sm:inline">अर्को</span>

              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
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
  const { categoryId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const reduce = useReducedMotion();

  const [searchParams, setSearchParams] = useSearchParams();

  /*
   * IMPORTANT:
   *
   * CategoryBar sends:
   *
   * navigate(`/category/${category.id}`, {
   *   state: {
   *     categoryName: category.name,
   *     categorySlug: category.slug,
   *   },
   * });
   *
   * Therefore we can immediately know the real
   * category name before the API response arrives.
   */
  const categoryNameFromNavigation = location.state?.categoryName || '';

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [news, setNews] = useState([]);

  /*
   * NEVER use:
   *
   * `Category ${categoryId}`
   *
   * The category ID is only for the API.
   * The UI should show the real category name.
   */
  const [categoryName, setCategoryName] = useState(categoryNameFromNavigation);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  /* =====================================================
     FETCH CATEGORY NEWS
  ===================================================== */

  useEffect(() => {
    if (!categoryId) {
      setNews([]);
      setCategoryName(categoryNameFromNavigation);
      setLoading(false);
      setError('Category not found.');
      return;
    }

    /*
     * "all" is not a numeric category ID.
     * Keep the existing route behavior.
     */
    if (categoryId === 'all') {
      setCategoryName(categoryNameFromNavigation || 'All News');
      setNews([]);
      setLoading(false);
      setError('');
      return;
    }

    const cacheKey = `${categoryId}-${page}`;

    const cached = categoryNewsCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < CATEGORY_CACHE_TTL) {
      setNews(cached.news);

      setCategoryName(cached.categoryName || categoryNameFromNavigation || '');

      setTotalPages(cached.totalPages);
      setError('');
      setLoading(false);

      return;
    }

    const controller = new AbortController();

    let active = true;

    const fetchNews = async () => {
      const startedAt = performance.now();

      try {
        setLoading(true);
        setError('');

        /*
         * CATEGORY ID IS USED ONLY HERE.
         *
         * Example:
         *
         * categoryId = 22
         *
         * API:
         *
         * /category/22/news
         */
        const response = await api.get(`/category/${categoryId}/news`, {
          params: {
            page,
            per_page: PER_PAGE,
          },
          signal: controller.signal,
        });

        console.log(
          `Category ${categoryId} API time: ${Math.round(
            performance.now() - startedAt,
          )}ms`,
        );

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Unable to load category news.');
        }

        const newsData = Array.isArray(response.data.data) ? response.data.data : [];

        /*
         * Priority:
         *
         * 1. Name returned by backend
         * 2. Name passed from CategoryBar
         * 3. Empty string
         *
         * NEVER:
         *
         * Category 22
         */
        const name = newsData[0]?.category?.name || categoryNameFromNavigation || '';

        const lastPage = Number(
          response.data.meta?.last_page || response.data.last_page || 1,
        );

        const result = {
          news: newsData,
          categoryName: name,
          totalPages: Math.max(1, lastPage),
          savedAt: Date.now(),
        };

        if (!active) {
          return;
        }

        categoryNewsCache.set(cacheKey, result);

        setNews(result.news);
        setCategoryName(result.categoryName);
        setTotalPages(result.totalPages);
      } catch (requestError) {
        if (
          requestError?.name === 'CanceledError' ||
          requestError?.code === 'ERR_CANCELED' ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error(
          'Unable to load category news:',
          requestError?.response?.data || requestError,
        );

        if (!active) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            'Unable to load news.',
        );

        setNews([]);
      } finally {
        if (active && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      active = false;
      controller.abort();
    };
  }, [categoryId, page, categoryNameFromNavigation]);

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

      <main className="mx-auto flex w-full max-w-[1920px] flex-col items-start px-4 pb-12 sm:px-6 sm:pb-14 md:px-10 lg:px-16 xl:px-[120px] xl:pb-20">
        {/* CATEGORY HEADING */}

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
          className="
            mt-6
            flex
            w-fit
            items-center
            border-l-[5px]
            border-[#164B99]
            bg-[linear-gradient(90deg,rgba(33,104,205,0.14)_2.48%,rgba(17,52,103,0.08)_100%)]
            px-4
            py-2
            sm:mt-8
            sm:px-5
            sm:py-2.5
            xl:mt-10
            xl:px-6
            xl:py-3
          ">
          <h1
            className="
              font-['Mukta',sans-serif]
              text-lg
              font-bold
              leading-tight
              tracking-[0.002em]
              text-[#164B99]
              sm:text-xl
              md:text-2xl
              xl:text-[28px]
            ">
            {categoryName || 'Loading category...'}
          </h1>
        </motion.div>

        {/* NEWS AREA */}

        <div className="mt-8 flex w-full flex-col gap-8 sm:mt-10 sm:gap-10 md:mt-12 xl:mt-14 xl:gap-12">
          {/* LOADING */}

          {loading &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-5 border-b border-[#E1E4E8] py-6 sm:gap-6 sm:py-8 md:grid-cols-[38%_62%] lg:gap-7">
                <Skeleton className="aspect-[16/9] w-full rounded-none" />

                <div className="flex flex-col gap-3 sm:gap-4">
                  <Skeleton className="h-7 w-3/4 sm:h-8" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              </div>
            ))}

          {/* ERROR */}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="font-['Mukta',sans-serif] text-base text-red-500 sm:text-lg">
                {error}
              </p>

              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="size-4" />
                Back to home
              </Button>
            </div>
          )}

          {/* EMPTY */}

          {!loading && !error && news.length === 0 && (
            <p className="py-16 text-center font-['Mukta',sans-serif] text-base text-gray-500 sm:text-lg">
              No news available in{' '}
              <span className="font-semibold text-[#16181A]">
                {categoryName || 'this category'}
              </span>
              .
            </p>
          )}

          {/* NEWS LIST */}

          {!loading && !error && news.length > 0 && (
            <motion.div
              key={`${categoryId}-${page}`}
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

      {/* TRENDING */}

      <section className="mt-4 border-t border-[#E1E4E8] pt-10 sm:mt-6 sm:pt-12 xl:mt-8 xl:pt-16">
        <Trending />
      </section>

      <Footer />
    </>
  );
}

export default Category;
