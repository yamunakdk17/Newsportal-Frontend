import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import api from '@/services/api';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import Trending from '@/components/news/TrendingNews';
import NewsDateFilter from '@/components/news/NewsDateFilter';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

import { getImageUrl } from '@/lib/getImageUrl';
import { formatNepaliDate } from '@/lib/nepaliDate';

const PER_PAGE = 10;

const categoryNewsCache = new Map();
const CATEGORY_CACHE_TTL = 60 * 1000;

const formatNepaliNumber = (value) => new Intl.NumberFormat('ne-NP').format(value);

const getPageItems = (current, total) => {
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

  const pages = [...keep]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items = [];

  pages.forEach((page, index) => {
    const previous = pages[index - 1];

    if (previous && page - previous === 2) {
      items.push(previous + 1);
    } else if (previous && page - previous > 2) {
      items.push(`ellipsis-${page}`);
    }

    items.push(page);
  });

  return items;
};

const pageLinkClass =
  "size-8 shrink-0 rounded-lg border-0 bg-transparent p-0 font-['Mukta',sans-serif] text-base font-normal leading-6 text-[#16181A] shadow-none hover:bg-[#C7CBD1]/40 hover:text-[#16181A]";

const activeLinkClass =
  'bg-[#C7CBD1] text-[#F9F9FA] hover:bg-[#C7CBD1] hover:text-[#F9F9FA]';

function StoryRow({ story, index, variants, onSelect }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageValue =
    story?.featured_image || story?.images?.[0] || story?.image || story?.image_url || '';

  const imagePath =
    typeof imageValue === 'string'
      ? imageValue
      : imageValue?.url || imageValue?.path || '';

  const src = getImageUrl(imagePath);

  const date = formatNepaliDate(story?.published_at || story?.created_at);

  const description = story?.excerpt || '';
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
      className={`
        group
        grid
        cursor-pointer
        grid-cols-1
        items-start
        gap-5
        py-6
        outline-none
        focus-visible:ring-2
        focus-visible:ring-[#16181A]
        focus-visible:ring-offset-4
        sm:gap-6
        sm:py-7
        md:grid-cols-[38%_62%]
        lg:gap-7
        lg:py-8
        xl:gap-8
        xl:py-9
        ${index > 0 ? 'border-t border-[#DDE0E3]' : ''}
      `}>
      <AspectRatio
        ratio={16 / 9}
        className="w-full overflow-hidden rounded-none bg-neutral-200">
        {src && !imageFailed ? (
          <img
            src={src}
            alt={story.title || 'समाचार तस्वीर'}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 font-['Mukta',sans-serif] text-sm text-neutral-500">
            तस्वीर उपलब्ध छैन
          </div>
        )}
      </AspectRatio>

      <div className="flex min-w-0 flex-col items-start gap-4 font-['Mukta',sans-serif] tracking-[0.002em] sm:gap-5 lg:gap-6">
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

        {description && (
          <p
            className="
        line-clamp-4
        w-full
        overflow-hidden
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

        {date && (
          <div className="flex items-center gap-1.5 text-sm leading-6 text-[#555B63] sm:text-[15px] lg:text-base">
            <CalendarDays className="size-4 shrink-0 text-[#164B99]" />
            <span>{date}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

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
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="अघिल्लो"
              onClick={(event) => go(event, page - 1)}
              className={`group w-auto gap-1.5 ${pageLinkClass} text-[#4A4E54] hover:bg-transparent hover:text-[#16181A] ${
                page === 1 ? 'pointer-events-none opacity-50' : ''
              }`}>
              <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />

              <span className="hidden sm:inline">अघिल्लो</span>
            </PaginationLink>
          </PaginationItem>

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
                  aria-label={`पृष्ठ ${formatNepaliNumber(item)}`}
                  onClick={(event) => go(event, item)}
                  className={`${pageLinkClass} ${item === page ? activeLinkClass : ''}`}>
                  {formatNepaliNumber(item)}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="अर्को"
              onClick={(event) => go(event, page + 1)}
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

function Category() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();

  const [searchParams, setSearchParams] = useSearchParams();

  const categoryNameFromNavigation = location.state?.categoryName || '';

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const dateFromUrl = searchParams.get('date') || '';

  const [news, setNews] = useState([]);
  const [categoryName, setCategoryName] = useState(categoryNameFromNavigation);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(dateFromUrl);

  useEffect(() => {
    setSelectedDate(dateFromUrl);
  }, [dateFromUrl]);

  useEffect(() => {
    if (!categoryId) {
      setNews([]);
      setCategoryName(categoryNameFromNavigation);
      setLoading(false);
      setError('Category not found.');
      return;
    }

    if (categoryId === 'all') {
      setCategoryName(categoryNameFromNavigation || 'सबै समाचार');
      setNews([]);
      setLoading(false);
      setError('');
      return;
    }

    const cacheKey = `${categoryId}-${page}-${selectedDate || 'all'}`;

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
      try {
        setLoading(true);
        setError('');

        const params = {
          page,
          per_page: PER_PAGE,
        };

        if (selectedDate) {
          params.date = selectedDate;
        }

        const response = await api.get(`/category/${categoryId}/news`, {
          params,
          signal: controller.signal,
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Unable to load category news.');
        }

        const newsData = Array.isArray(response.data.data) ? response.data.data : [];

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
  }, [categoryId, page, categoryNameFromNavigation, selectedDate]);

  const changeDate = (date) => {
    const nextDate = date || '';

    const params = new URLSearchParams(searchParams);

    params.delete('page');

    if (nextDate) {
      params.set('date', nextDate);
    } else {
      params.delete('date');
    }

    setSelectedDate(nextDate);
    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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

  return (
    <>
      <Header />

      <main className="mx-auto flex w-full max-w-[1920px] flex-col items-start px-4 pb-12 sm:px-6 sm:pb-14 md:px-10 lg:px-16 xl:px-[120px] xl:pb-20">
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
            w-full
            items-center
            justify-between
            gap-4
            sm:mt-8
            xl:mt-10
          ">
          <div
            className="
              flex
              w-fit
              items-center
              border-l-[5px]
              border-[#164B99]
              bg-[linear-gradient(90deg,rgba(33,104,205,0.14)_2.48%,rgba(17,52,103,0.08)_100%)]
              px-4
              py-2
              sm:px-5
              sm:py-2.5
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
              {categoryName || 'समाचार'}
            </h1>
          </div>

          <NewsDateFilter value={selectedDate} onChange={changeDate} />
        </motion.div>

        {selectedDate && (
          <div className="mt-4 flex items-center gap-2 font-['Mukta',sans-serif] text-sm text-[#555B63] sm:text-base">
            <CalendarDays className="size-4 text-[#164B99]" />

            <span>{formatNepaliDate(selectedDate)} का समाचार</span>
          </div>
        )}

        <div className="mt-8 flex w-full flex-col gap-8 sm:mt-10 sm:gap-10 md:mt-12 xl:mt-14 xl:gap-12">
          {loading &&
            [0, 1, 2].map((index) => (
              <div
                key={index}
                className="
                  grid
                  grid-cols-1
                  gap-5
                  border-b
                  border-[#E1E4E8]
                  py-6
                  sm:gap-6
                  sm:py-8
                  md:grid-cols-[38%_62%]
                  lg:gap-7
                ">
                <Skeleton className="aspect-[16/9] w-full rounded-none" />

                <div className="flex flex-col gap-3 sm:gap-4">
                  <Skeleton className="h-7 w-3/4 sm:h-8" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="font-['Mukta',sans-serif] text-base text-red-500 sm:text-lg">
                {error}
              </p>

              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="size-4" />
                गृहपृष्ठमा फर्कनुहोस्
              </Button>
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <CalendarDays className="mb-3 size-8 text-[#164B99]" />

              <p className="font-['Mukta',sans-serif] text-base text-gray-500 sm:text-lg">
                {selectedDate
                  ? `${formatNepaliDate(selectedDate)} मा ${
                      categoryName || 'यस'
                    } श्रेणीमा कुनै समाचार उपलब्ध छैन।`
                  : `${categoryName || 'यस श्रेणीमा'} कुनै समाचार उपलब्ध छैन।`}
              </p>
            </div>
          )}

          {!loading && !error && news.length > 0 && (
            <motion.div
              key={`${categoryId}-${page}-${selectedDate || 'all'}`}
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

          {!loading && !error && (
            <Pager page={page} totalPages={totalPages} onChange={changePage} />
          )}
        </div>
      </main>

      <section className="mt-4 border-t border-[#E1E4E8] pt-10 sm:mt-6 sm:pt-12 xl:mt-8 xl:pt-16">
        <Trending />
      </section>

      <Footer />
    </>
  );
}

export default Category;
