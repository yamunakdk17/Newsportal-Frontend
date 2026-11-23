// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { motion, useReducedMotion } from 'framer-motion';
// import { ArrowLeft, CalendarDays, X } from 'lucide-react';

// import Header from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';

// import Trending from '@/components/news/TrendingNews';
// import Banner from '@/components/Banner/Banners';

// import api from '@/services/api';

// import { AspectRatio } from '@/components/ui/aspect-ratio';
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { getImageUrl } from '@/lib/getImageUrl';
// import { formatNepaliDate } from '@/lib/nepaliDate';

// const getImages = (item) => {
//   const images = (item?.images || [])
//     .map((img) => getImageUrl(typeof img === 'string' ? img : img?.url || img?.path))
//     .filter(Boolean)
//     .slice(0, 3);

//   return {
//     images,
//     total: images.length,
//   };
// };
// const getParagraphs = (item) => {
//   const raw = item?.content ?? item?.body ?? item?.description ?? '';

//   if (!raw) return [];

//   const content = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

//   if (!content) return [];

//   const containsHtml = /<\/?(p|br)\b/i.test(content);

//   if (containsHtml) {
//     return content
//       .replace(/<br\s*\/?>/gi, '\n')
//       .replace(/<\/p>/gi, '\n')
//       .replace(/<p[^>]*>/gi, '')
//       .replace(/<[^>]+>/g, '')
//       .replace(/&nbsp;/gi, ' ')
//       .replace(/&amp;/gi, '&')
//       .replace(/&lt;/gi, '<')
//       .replace(/&gt;/gi, '>')
//       .split(/\n+/)
//       .map((paragraph) => paragraph.trim())
//       .filter(Boolean);
//   }

//   return content
//     .split(/\n+/)
//     .map((paragraph) => paragraph.trim())
//     .filter(Boolean);
// };

// function NewsDetails() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const reduce = useReducedMotion();

//   const [article, setArticle] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [preview, setPreview] = useState('');

//   useEffect(() => {
//     const fetchNewsDetails = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         const response = await api.get(`/news/${slug}`);

//         if (!response.data?.success) {
//           setError(response.data?.message || 'News not found.');

//           setArticle(null);
//           return;
//         }

//         setArticle(response.data.data || null);

//         if (!response.data.data) {
//           setError('News not found.');
//         }
//       } catch (error) {
//         console.error('News details error:', error);

//         setError(error.response?.data?.message || 'Unable to load news.');

//         setArticle(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (slug) {
//       fetchNewsDetails();
//     }
//   }, [slug]);

//   useEffect(() => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth',
//     });

//     setPreview('');
//   }, [slug]);

//   useEffect(() => {
//     if (!preview) return;

//     const handleKeyDown = (event) => {
//       if (event.key === 'Escape') {
//         setPreview('');
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [preview]);

//   const fadeUp = (delay = 0) => ({
//     initial: reduce
//       ? false
//       : {
//           opacity: 0,
//           y: 20,
//         },

//     animate: {
//       opacity: 1,
//       y: 0,
//     },

//     transition: {
//       duration: 0.5,
//       ease: 'easeOut',
//       delay,
//     },
//   });

//   const { images } = getImages(article);
//   const paragraphs = getParagraphs(article);

//   const publishedDate = formatNepaliDate(article?.published_at);

//   return (
//     <>
//       <Header />

//       <main className="mx-auto w-full max-w-[1920px] px-4 pt-8 pb-10 sm:px-6 sm:pt-10 md:px-10 lg:px-16 xl:px-[180px] xl:pt-12 xl:pb-20">
//         {loading && (
//           <div className="flex flex-col items-center gap-6 pt-6 sm:pt-10">
//             <Skeleton className="h-10 w-40 rounded-none sm:h-14 xl:h-[84px] xl:w-[191px]" />

//             <Skeleton className="aspect-[1560/ 550] w-full rounded-none" />

//             <Skeleton className="h-10 w-3/4 sm:h-14" />

//             <Skeleton className="h-6 w-1/2" />
//           </div>
//         )}

//         {!loading && (error || !article) && (
//           <div className="flex flex-col items-center gap-4 py-20 text-center">
//             <p className="font-['Mukta',sans-serif] text-lg text-red-500 sm:text-xl">
//               {error || 'News not found.'}
//             </p>

//             <Button type="button" variant="outline" onClick={() => navigate('/')}>
//               <ArrowLeft className="size-4" />
//               Back to home
//             </Button>
//           </div>
//         )}

//         {!loading && !error && article && (
//           <article className="flex w-full flex-col items-center gap-6 font-['Mukta',sans-serif] sm:gap-7 lg:gap-8 xl:gap-9">
//             {article.category?.name && (
//               <motion.div
//                 {...fadeUp(0)}
//                 className="flex items-center gap-3 rounded-sm bg-[linear-gradient(90deg,#2168CD_0%,#164B99_100%)] px-4 py-2 shadow-sm sm:px-5 sm:py-2.5">
//                 <span className="text-lg font-bold leading-[1.3] tracking-[0.002em] text-[#F0F3FE] sm:text-xl md:text-2xl xl:text-3xl">
//                   {article.category.name}
//                 </span>
//               </motion.div>
//             )}

//             <div className="flex w-full flex-col items-center gap-6 sm:gap-8 xl:gap-6">
//               <div className="flex w-full flex-col items-center gap-2">
//                 <motion.div
//                   {...fadeUp(0.1)}
//                   className="flex w-full items-center justify-between gap-6 border-b border-[#E5E7EB] pb-2 text-xs leading-5 tracking-[0.002em] text-[#6B7280] sm:text-sm">
//                   <div className="flex min-w-0 items-center gap-2">
//                     <CalendarDays
//                       className="h-4 w-4 shrink-0"
//                       strokeWidth={1.8}
//                       aria-hidden="true"
//                     />

//                     <span className="whitespace-nowrap">{publishedDate}</span>
//                   </div>

//                   {article.author && (
//                     <span className="min-w-0 truncate text-right">{article.author}</span>
//                   )}
//                 </motion.div>

//                 <div className="flex w-full max-w-[1200px] flex-col items-start gap-4 sm:gap-5">
//                   {images.length > 0 && (
//                     <motion.div
//                       {...fadeUp(0.15)}
//                       className="w-full min-w-0 ">
//                       <button
//                         type="button"
//                         onClick={() => setPreview(images[0])}
//                         aria-label="View main image"
//                         className="group block w-full min-w-0 cursor-zoom-in">
//                         <AspectRatio
//                           ratio={1560 / 550}
//                           className="w-full overflow-hidden bg-[#DDE0E3]">
//                           <img
//                             src={images[0]}
//                             alt={`${article.title || 'News'} main image`}
//                             loading="eager"
//                             className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
//                             onError={(event) => {
//                               console.error('Failed to load main news image:', images[0]);
//                               event.currentTarget.style.display = 'none';
//                             }}
//                           />
//                         </AspectRatio>
//                       </button>

//                       {images.length > 1 && (
//                         <div
//                           className={`grid w-full min-w-0 gap-3 sm:gap-4 ${
//                             images.length === 2 ? 'grid-cols-1' : 'grid-cols-2'
//                           }`}>
//                           {images.slice(1).map((url, index) => (
//                             <button
//                               key={`${url}-${index + 1}`}
//                               type="button"
//                               onClick={() => setPreview(url)}
//                               aria-label={`View image ${index + 2}`}
//                               className="group block w-full min-w-0 cursor-zoom-in">
//                               <AspectRatio
//                                 ratio={768 / 450}
//                                 className="w-full overflow-hidden bg-[#DDE0E3]">
//                                 <img
//                                   src={url}
//                                   alt={`${article.title || 'News'} image ${index + 2}`}
//                                   loading="lazy"
//                                   className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
//                                   onError={(event) => {
//                                     console.error(
//                                       `Failed to load news image ${index + 2}:`,
//                                       url,
//                                     );
//                                     event.currentTarget.style.display = 'none';
//                                   }}
//                                 />
//                               </AspectRatio>
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </motion.div>
//                   )}

//                   {article.caption && (
//                     <motion.p
//                       {...fadeUp(0.25)}
//                       className="w-full text-start text-sm font-normal leading-[1.6] tracking-[0.002em] text-[#6B7280] sm:text-base md:text-lg xl:text-xl">
//                       {article.caption}
//                     </motion.p>
//                   )}

//                   <motion.h1
//                     {...fadeUp(0.2)}
//                     className="w-full text-left text-xl font-bold leading-[1.35] tracking-[-0.01em] text-[#16181A] sm:text-2xl md:text-3xl lg:text-4xl xl:text-[40px] xl:leading-[1.25]">
//                     {article.title}
//                   </motion.h1>
//                 </div>
//               </div>

//               {paragraphs.length > 0 && (
//                 <motion.div
//                   {...fadeUp(0.3)}
//                   className="flex w-full justify-center pt-0 pb-3 sm:pt-1 sm:pb-4 lg:pt-1 lg:pb-5 xl:pt-1 xl:pb-6">
//                   <div className="flex w-full max-w-[1200px] flex-col gap-5 sm:gap-6 lg:gap-7">
//                     {paragraphs.map((text, index) => (
//                       <p
//                         key={index}
//                         className="w-full min-w-0 break-words whitespace-pre-wrap text-left text-base font-normal leading-[1.85] tracking-normal text-[#333333] [overflow-wrap:anywhere] sm:text-[17px] md:text-lg lg:text-lg xl:text-[19px]">
//                         {text}
//                       </p>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}
//             </div>
//           </article>
//         )}
//       </main>

//       {preview && (
//         <div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
//           onClick={() => setPreview('')}>
//           <button
//             type="button"
//             aria-label="Close image preview"
//             onClick={() => setPreview('')}
//             className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20">
//             <X className="size-6" />
//           </button>

//           <img
//             src={preview}
//             alt="Gallery preview"
//             onClick={(event) => event.stopPropagation()}
//             className="max-h-[90vh] max-w-full object-contain"
//           />
//         </div>
//       )}

//       <Banner />

//       <Trending />

//       <Footer />
//     </>
//   );
// }

// export default NewsDetails;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, CalendarDays, X } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import Trending from '@/components/news/TrendingNews';
import Banner from '@/components/Banner/Banners';

import api from '@/services/api';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/getImageUrl';
import { formatNepaliDate } from '@/lib/nepaliDate';

const getImages = (item) => {
  const images = (item?.images || [])
    .map((img) => getImageUrl(typeof img === 'string' ? img : img?.url || img?.path))
    .filter(Boolean)
    .slice(0, 3);

  return {
    images,
    total: images.length,
  };
};

const getParagraphs = (item) => {
  const raw = item?.content ?? item?.body ?? item?.description ?? '';

  if (!raw) return [];

  const content = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (!content) return [];

  const containsHtml = /<\/?(p|br)\b/i.test(content);

  if (containsHtml) {
    return content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

function NewsDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/news/${slug}`);

        if (!response.data?.success) {
          setError(response.data?.message || 'News not found.');

          setArticle(null);
          return;
        }

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

    if (slug) {
      fetchNewsDetails();
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setPreview('');
  }, [slug]);

  useEffect(() => {
    if (!preview) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPreview('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [preview]);

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

  const { images } = getImages(article);
  const paragraphs = getParagraphs(article);

  const publishedDate = formatNepaliDate(article?.published_at);

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-[1920px] px-4 pt-8 pb-10 sm:px-6 sm:pt-10 md:px-10 lg:px-16 xl:px-[180px] xl:pt-12 xl:pb-20">
        {loading && (
          <div className="flex flex-col items-center gap-6 pt-6 sm:pt-10">
            <Skeleton className="h-10 w-40 rounded-none sm:h-14 xl:h-[84px] xl:w-[191px]" />

            <Skeleton className="aspect-[1560/ 550] w-full rounded-none" />

            <Skeleton className="h-10 w-3/4 sm:h-14" />

            <Skeleton className="h-6 w-1/2" />
          </div>
        )}

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

        {!loading && !error && article && (
          <article className="flex w-full flex-col items-center gap-6 font-['Mukta',sans-serif] sm:gap-7 lg:gap-8 xl:gap-9">
            {article.category?.name && (
              <motion.div
                {...fadeUp(0)}
                className="flex items-center gap-3 rounded-sm bg-[linear-gradient(90deg,#2168CD_0%,#164B99_100%)] px-4 py-2 shadow-sm sm:px-5 sm:py-2.5">
                <span className="text-lg font-bold leading-[1.3] tracking-[0.002em] text-[#F0F3FE] sm:text-xl md:text-2xl xl:text-3xl">
                  {article.category.name}
                </span>
              </motion.div>
            )}

            <div className="flex w-full flex-col items-center gap-6 sm:gap-8 xl:gap-6">
              <div className="flex w-full flex-col items-center gap-2">
                <motion.div
                  {...fadeUp(0.1)}
                  className="flex w-full items-center justify-between gap-6 border-b border-[#E5E7EB] pb-2 text-xs leading-5 tracking-[0.002em] text-[#6B7280] sm:text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <CalendarDays
                      className="h-4 w-4 shrink-0"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <span className="whitespace-nowrap">{publishedDate}</span>
                  </div>

                  {article.author && (
                    <span className="min-w-0 truncate text-right">{article.author}</span>
                  )}
                </motion.div>

                <div className="flex w-full max-w-[1200px] flex-col items-start gap-4 sm:gap-5">
                  {images.length > 0 && (
                    <motion.div {...fadeUp(0.15)} className="w-full min-w-0">
                      {images.length === 1 && (
                        <button
                          type="button"
                          onClick={() => setPreview(images[0])}
                          aria-label="View main image"
                          className="group block w-full min-w-0 cursor-zoom-in">
                          <AspectRatio
                            ratio={1560 / 550}
                            className="w-full overflow-hidden bg-[#DDE0E3]">
                            <img
                              src={images[0]}
                              alt={`${article.title || 'News'} main image`}
                              loading="eager"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                              onError={(event) => {
                                console.error(
                                  'Failed to load main news image:',
                                  images[0],
                                );
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          </AspectRatio>
                        </button>
                      )}

                      {images.length === 2 && (
                        <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4">
                          {images.map((url, index) => (
                            <button
                              key={`${url}-${index}`}
                              type="button"
                              onClick={() => setPreview(url)}
                              aria-label={`View image ${index + 1}`}
                              className="group block w-full min-w-0 cursor-zoom-in">
                              <AspectRatio
                                ratio={768 / 450}
                                className="w-full overflow-hidden bg-[#DDE0E3]">
                                <img
                                  src={url}
                                  alt={`${article.title || 'News'} image ${index + 1}`}
                                  loading={index === 0 ? 'eager' : 'lazy'}
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                  onError={(event) => {
                                    console.error(
                                      `Failed to load news image ${index + 1}:`,
                                      url,
                                    );
                                    event.currentTarget.style.display = 'none';
                                  }}
                                />
                              </AspectRatio>
                            </button>
                          ))}
                        </div>
                      )}

                      {images.length === 3 && (
                        <div className="w-full min-w-0 space-y-3 sm:space-y-4">
                          <button
                            type="button"
                            onClick={() => setPreview(images[0])}
                            aria-label="View main image"
                            className="group block w-full min-w-0 cursor-zoom-in">
                            <AspectRatio
                              ratio={1560 / 550}
                              className="w-full overflow-hidden bg-[#DDE0E3]">
                              <img
                                src={images[0]}
                                alt={`${article.title || 'News'} main image`}
                                loading="eager"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                onError={(event) => {
                                  console.error(
                                    'Failed to load main news image:',
                                    images[0],
                                  );
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            </AspectRatio>
                          </button>

                          <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4">
                            {images.slice(1).map((url, index) => (
                              <button
                                key={`${url}-${index + 1}`}
                                type="button"
                                onClick={() => setPreview(url)}
                                aria-label={`View image ${index + 2}`}
                                className="group block w-full min-w-0 cursor-zoom-in">
                                <AspectRatio
                                  ratio={768 / 450}
                                  className="w-full overflow-hidden bg-[#DDE0E3]">
                                  <img
                                    src={url}
                                    alt={`${article.title || 'News'} image ${index + 2}`}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                    onError={(event) => {
                                      console.error(
                                        `Failed to load news image ${index + 2}:`,
                                        url,
                                      );
                                      event.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </AspectRatio>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {article.caption && (
                    <motion.p
                      {...fadeUp(0.25)}
                      className="w-full text-start text-sm font-normal leading-[1.6] tracking-[0.002em] text-[#6B7280] sm:text-base md:text-lg xl:text-xl">
                      {article.caption}
                    </motion.p>
                  )}

                  <motion.h1
                    {...fadeUp(0.2)}
                    className="w-full text-left text-xl font-bold leading-[1.35] tracking-[-0.01em] text-[#16181A] sm:text-2xl md:text-3xl lg:text-4xl xl:text-[40px] xl:leading-[1.25]">
                    {article.title}
                  </motion.h1>
                </div>
              </div>

              {paragraphs.length > 0 && (
                <motion.div
                  {...fadeUp(0.3)}
                  className="flex w-full justify-center pt-0 pb-3 sm:pt-1 sm:pb-4 lg:pt-1 lg:pb-5 xl:pt-1 xl:pb-6">
                  <div className="flex w-full max-w-[1200px] flex-col gap-5 sm:gap-6 lg:gap-7">
                    {paragraphs.map((text, index) => (
                      <p
                        key={index}
                        className="w-full min-w-0 break-words whitespace-pre-wrap text-left text-base font-normal leading-[1.85] tracking-normal text-[#333333] [overflow-wrap:anywhere] sm:text-[17px] md:text-lg lg:text-lg xl:text-[19px]">
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

      {preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreview('')}>
          <button
            type="button"
            aria-label="Close image preview"
            onClick={() => setPreview('')}
            className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20">
            <X className="size-6" />
          </button>

          <img
            src={preview}
            alt="Gallery preview"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>
      )}

      <Banner />

      <Trending />

      <Footer />
    </>
  );
}

export default NewsDetails;
