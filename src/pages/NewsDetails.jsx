import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Trending from '@/components/news/TrendingNews';

import api from '@/services/api';
import { getNewsImageUrl, isTrue } from '@/lib/news';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Route:
 * /news/:slug
 *
 * Backend:
 * GET /api/news/{slug}
 */

/*
 * Convert backend image path into
 * a frontend-accessible image URL.
 */
/*
 * Convert news body into paragraphs.
 *
 * Backend normally returns:
 * body: "paragraph one\nparagraph two"
 *
 * This also supports an array if the backend
 * ever returns body/content as an array.
 */
const getParagraphs = (item) => {
  const raw = item?.content ?? item?.body ?? item?.description ?? '';

  const list = Array.isArray(raw) ? raw : String(raw).split(/\n+/);

  return list.map((paragraph) => String(paragraph).trim()).filter(Boolean);
};

/*
 * Format published date.
 */
const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ne-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

function NewsDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /*
   * Fetch news details from backend.
   */
  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/news/${encodeURIComponent(slug)}`);

        console.log('News details:', response.data);

        /*
         * Check backend success response.
         */
        if (response.data?.success === false) {
          setError(response.data?.message || 'News not found.');

          setArticle(null);

          return;
        }

        const newsArticle = response.data?.data ?? response.data ?? null;

        if (!newsArticle || !isTrue(newsArticle.is_published)) {
          setError('News not found.');
          setArticle(null);
          return;
        }

        setArticle(newsArticle);
      } catch (error) {
        console.error('News details error:', error);

        setError(error.response?.data?.message || 'Unable to load news.');

        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    /*
     * Only call API when slug exists.
     */
    if (slug) {
      fetchNewsDetails();
    }
  }, [slug]);

  /*
   * Scroll to top when opening
   * another news article.
   */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [slug]);

  /*
   * Animation helper.
   */
  const fadeUp = (delay = 0) => ({
    initial: reduce
      ? false
      : {
          opacity: 0,
          y: 20,
        },

    animate: {
      opacity: 1,
      y: 0,
    },

    transition: {
      duration: 0.5,
      ease: 'easeOut',
      delay,
    },
  });

  /*
   * Image from backend.
   */
  const image = getNewsImageUrl(article?.featured_image || article?.images?.[0]);

  /*
   * News body paragraphs.
   */
  const paragraphs = getParagraphs(article);

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-[1920px] px-4 pb-10 sm:px-6 md:px-10 lg:px-16 xl:px-[180px] xl:pb-20">
        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="flex flex-col items-center gap-6 pt-6 sm:pt-10">
            <Skeleton className="h-10 w-40 rounded-none sm:h-14 xl:h-[84px] xl:w-[191px]" />

            <Skeleton className="aspect-[1560/900] w-full rounded-none" />

            <Skeleton className="h-10 w-3/4 sm:h-14" />

            <Skeleton className="h-6 w-1/2" />
          </div>
        )}

        {/* =========================
            ERROR / NOT FOUND
        ========================== */}
        {!loading && (error || !article) && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="font-['Mukta',sans-serif] text-lg text-red-500 sm:text-xl">
              {error || 'News not found.'}
            </p>

            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="size-4" />
              Back to home
            </Button>
          </div>
        )}

        {/* =========================
            ARTICLE
        ========================== */}
        {!loading && !error && article && (
          <article className="flex w-full flex-col items-center gap-8 font-['Mukta',sans-serif] sm:gap-12 lg:gap-16 xl:gap-20">
            {/* =====================
                  CATEGORY
              ====================== */}
            {(article.category?.name || article.category_slug) && (
              <motion.div
                {...fadeUp(0)}
                className="flex items-center gap-4 bg-[linear-gradient(90deg,rgba(33,104,205,0.2)_2.48%,rgba(17,52,103,0.2)_100%),#2168CD] px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="text-2xl font-bold leading-[1.2] tracking-[0.002em] text-[#F0F3FE] sm:text-4xl md:text-5xl xl:text-[56px] xl:leading-[67px]">
                  {article.category?.name || article.category_slug}
                </span>
              </motion.div>
            )}

            <div className="flex w-full flex-col items-center gap-6 sm:gap-8 xl:gap-6">
              {/* =====================
                    HERO BLOCK
                ====================== */}
              <div className="flex w-full flex-col items-center gap-2">
                {/* Author + Date */}
                <motion.div
                  {...fadeUp(0.1)}
                  className="flex w-full items-center justify-between gap-4 text-sm leading-6 tracking-[0.002em] text-[#16181A] sm:text-base">
                  <span>{article.author || article.added_by || 'Admin'}</span>

                  <span>{formatDate(article.published_at)}</span>
                </motion.div>

                <div className="flex w-full flex-col items-start gap-4 sm:gap-6">
                  {/* Featured Image */}
                  {image && (
                    <motion.div {...fadeUp(0.15)} className="w-full">
                      <AspectRatio
                        ratio={1560 / 900}
                        className="overflow-hidden bg-neutral-200">
                        <img
                          src={image}
                          alt={article.title || 'News article'}
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                    </motion.div>
                  )}

                  {/* Title */}
                  <motion.h1
                    {...fadeUp(0.2)}
                    className="w-full text-center text-3xl font-semibold leading-[1.2] tracking-[0.002em] text-[#16181A] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] xl:leading-[86px]">
                    {article.title || 'Untitled news'}
                  </motion.h1>

                  {/* Caption */}
                  {article.caption && (
                    <motion.p
                      {...fadeUp(0.25)}
                      className="w-full text-center text-lg font-normal leading-[1.3] tracking-[0.002em] text-[#4A4E54] sm:text-xl md:text-2xl xl:text-[32px] xl:leading-[38px]">
                      {article.caption}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* =====================
                    BODY
                ====================== */}
              {paragraphs.length > 0 && (
                <motion.div
                  {...fadeUp(0.3)}
                  className="flex w-full justify-center px-0 py-6 sm:px-4 sm:py-10 md:px-10 lg:px-24 lg:py-14 xl:px-[180px] xl:py-20">
                  <div className="flex w-full max-w-[1200px] flex-col gap-5 sm:gap-8 xl:gap-12">
                    {paragraphs.map((text, index) => (
                      <p
                        key={index}
                        className="text-lg font-semibold leading-[1.6] tracking-[0.002em] text-[#16181A] sm:text-xl md:text-2xl lg:text-3xl lg:leading-[1.5] xl:text-[40px] xl:leading-[48px]">
                        {text}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </article>
        )}
      </main>
      <Trending
        onSelect={(news) => {
          if (news?.slug) {
            navigate(`/news/${news.slug}`);
          }
        }}
      />

      <Footer />
    </>
  );
}

export default NewsDetails;
