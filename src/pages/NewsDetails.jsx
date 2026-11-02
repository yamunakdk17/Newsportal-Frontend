import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import Trending from '@/components/news/TrendingNews';
import Banner from '@/components/Banner/Banners';

import api from '@/services/api';

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

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  let imageUrl = String(imagePath).trim();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const backendUrl = apiUrl.replace(/\/api\/?$/, '');

  /*
   * Backend returns:
   * /storage/news/image.jpg
   */
  if (imageUrl.startsWith('/')) {
    return `${backendUrl}${imageUrl}`;
  }

  /*
   * Backend may return:
   * http://localhost:8000/storage/news/image.jpg
   *
   * Change localhost to the actual backend host.
   */
  if (
    imageUrl.startsWith('http://localhost:') ||
    imageUrl.startsWith('https://localhost:')
  ) {
    try {
      const image = new URL(imageUrl);
      const backend = new URL(backendUrl);

      image.protocol = backend.protocol;
      image.hostname = backend.hostname;
      image.port = backend.port;

      return image.toString();
    } catch {
      return imageUrl;
    }
  }

  /*
   * Already a complete URL.
   */
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  /*
   * Relative path.
   */
  return `${backendUrl}/${imageUrl}`;
};
const getImages = (item) => {
  const all = (item?.images || [])
    .map((img) => getImageUrl(typeof img === 'string' ? img : img?.url || img?.path))
    .filter(Boolean);

  const main = getImageUrl(item?.featured_image) || all[0] || '';

  return {
    main,
    gallery: all.filter((url) => url !== main),
  };
};

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

  return String(raw)
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
};

/*
 * Format published date.
 */
const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('ne-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

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

        const response = await api.get(`/news/${slug}`);

        console.log('News details:', response.data);

        /*
         * Check backend success response.
         */
        if (!response.data?.success) {
          setError(response.data?.message || 'News not found.');

          setArticle(null);

          return;
        }

        /*
         * Store complete news object.
         */
        setArticle(response.data.data || null);

        if (!response.data.data) {
          setError('News not found.');
        }
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
  const { main: image, gallery } = getImages(article);
  /*
   * News body paragraphs.
   */
  const paragraphs = getParagraphs(article);

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-[1920px] px-4 pt-8 pb-10 sm:px-6 sm:pt-10 md:px-10 lg:px-16 xl:px-[180px] xl:pt-12 xl:pb-20">
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
          <article className="flex w-full flex-col items-center gap-8 font-['Mukta',sans-serif] sm:gap-10 lg:gap-12 xl:gap-14">
            {/* =====================
                  CATEGORY
              ====================== */}
            {article.category?.name && (
              <motion.div
                {...fadeUp(0)}
                className="flex items-center gap-3 rounded-sm bg-[linear-gradient(90deg,#2168CD_0%,#164B99_100%)] px-4 py-2 shadow-sm sm:px-5 sm:py-2.5">
                <span className="text-2xl font-bold leading-[1.2] tracking-[0.002em] text-[#F0F3FE] sm:text-4xl md:text-5xl xl:text-[56px] xl:leading-[67px]">
                  {article.category.name}
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
                  className="flex w-full items-center justify-between border-b border-[#E5E7EB] pb-3 text-sm leading-6 tracking-[0.002em] text-[#6B7280] sm:text-base">
                  <span>{article.author}</span>

                  <span>{formatDate(article.published_at)}</span>
                </motion.div>

                <div className="flex w-full flex-col items-start gap-6">
                  {/* Featured Image */}
                  {image && (
                    <motion.div {...fadeUp(0.15)} className="w-full">
                      <AspectRatio
                        ratio={1560 / 514}
                        className="w-full overflow-hidden bg-neutral-200">
                        <img
                          src={image}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                    </motion.div>
                  )}
                  {gallery.length > 0 && (
                    <motion.ul
                      {...fadeUp(0.2)}
                      className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      {gallery.map((url) => (
                        <li key={url}>
                          <button
                            type="button"
                            onClick={() => setPreview(url)}
                            aria-label="View image"
                            className="group block w-full cursor-zoom-in">
                            <AspectRatio
                              ratio={768 / 450}
                              className="w-full overflow-hidden">
                              <img
                                src={url}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              />
                            </AspectRatio>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}

                  {/* Title */}
                  <motion.h1
                    {...fadeUp(0.2)}
                    className="w-full text-center text-2xl font-bold leading-[1.3] tracking-[-0.01em] text-[#16181A] sm:text-3xl md:text-4xl lg:text-5xl xl:text-[52px] xl:leading-[1.2]">
                    {article.title}
                  </motion.h1>

                  {/* Caption */}
                  {article.caption && (
                    <motion.p
                      {...fadeUp(0.25)}
                      className="w-full text-center text-base font-normal leading-[1.6] tracking-[0.002em] text-[#6B7280] sm:text-lg md:text-xl xl:text-2xl xl:leading-[1.5]">
                      {article.caption}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* =====================
                    BODY*/}
              {paragraphs.length > 0 && (
                <motion.div
                  {...fadeUp(0.3)}
                  className="flex w-full justify-center px-4 pt-0 pb-4 sm:px-6 sm:pt-1 sm:pb-5 md:px-10 lg:px-16 lg:pt-2 lg:pb-6 xl:px-[180px] xl:pt-2 xl:pb-8">
                  <div className="flex w-full max-w-[1200px] flex-col gap-4 sm:gap-5 lg:gap-6">
                    {paragraphs.map((text, index) => (
                      <p
                        key={index}
                        className="w-full text-[18px] font-normal leading-[1.7] tracking-normal text-[#333333] sm:text-[19px] md:text-[20px] lg:text-[21px] xl:text-[22px]">
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
      <Banner />

      <Trending />
      <Footer />
    </>
  );
}

export default NewsDetails;
