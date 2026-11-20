// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CalendarDays } from 'lucide-react';

// import api from '@/services/api';
// import { getNewsList, isPublishedNews } from '@/lib/news';
// import { getImageUrl } from '@/lib/getImageUrl';
// import { formatNepaliDate } from '@/lib/nepaliDate';

// // Text sizes in one place.
// // About two steps below the Figma values (56 / 40 / 32 px at 1920 wide),
// // scaling up with the screen.
// const SIZE = {
//   sectionTitle: 'text-2xl sm:text-3xl lg:text-4xl 2xl:text-[40px]',
//   mainTitle: 'text-lg sm:text-xl lg:text-2xl 2xl:text-[28px]',
//   sideTitle: 'text-base sm:text-lg xl:text-xl 2xl:text-[22px]',
// };

// function NewsSection({ selectedCategory, newsData, bottomLine = false }) {
//   const navigate = useNavigate();

//   const [news, setNews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (Array.isArray(newsData)) {
//       return;
//     }

//     const fetchNews = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         const response = await api.get('/news', {
//           params: {
//             page: 1,
//             per_page: 8,
//           },
//         });

//         setNews(getNewsList(response).filter(isPublishedNews));
//       } catch (error) {
//         console.error('Unable to load news:', error);
//         setError('Unable to load news.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNews();
//   }, [newsData]);

//   const sourceNews = Array.isArray(newsData) ? newsData : news;

//   const filteredNews = sourceNews.filter((item) => {
//     if (!isPublishedNews(item)) {
//       return false;
//     }

//     if (selectedCategory === 'All') {
//       return true;
//     }

//     const categoryValues = [
//       item.category?.id,
//       item.category_id,
//       item.category?.name,
//       item.category?.slug,
//       item.category_slug,
//     ]
//       .filter((value) => value !== null && value !== undefined)
//       .map((value) => String(value).toLowerCase());

//     const selectedValues = [
//       selectedCategory?.id,
//       selectedCategory?.name,
//       selectedCategory?.slug,
//     ]
//       .filter((value) => value !== null && value !== undefined)
//       .map((value) => String(value).toLowerCase());

//     return selectedValues.some((value) => categoryValues.includes(value));
//   });

//   const getImageurl = (item) => getImageUrl(item?.featured_image || item?.images?.[0]);

//   const goToNews = (item) => {
//     if (item.slug) {
//       navigate(`/news/${item.slug}`);
//     }
//   };

//   // Click and keyboard behaviour shared by the big story and the three small ones.
//   const linkProps = (item) => ({
//     role: item.slug ? 'link' : undefined,
//     tabIndex: item.slug ? 0 : undefined,
//     onClick: () => goToNews(item),
//     onKeyDown: (event) => {
//       if (item.slug && (event.key === 'Enter' || event.key === ' ')) {
//         event.preventDefault();
//         goToNews(item);
//       }
//     },
//   });

//   if (!Array.isArray(newsData) && loading) {
//     return (
//       <section className="py-10 text-center">
//         <p className="text-gray-500">Loading news...</p>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="py-10 text-center">
//         <p className="text-red-500">{error}</p>
//       </section>
//     );
//   }

//   if (filteredNews.length === 0) {
//     return (
//       <section className="py-10 text-center">
//         <p className="text-gray-500">No news available.</p>
//       </section>
//     );
//   }

//   const mainNews = filteredNews[0];
//   const sideNews = filteredNews.slice(1, 4);

//   return (
//     <>
//       {/* News Section */}
//       <section className="mb-10 flex w-full flex-col gap-[10px] border-t border-[#16181A] py-[10px] font-['Mukta',sans-serif] text-[#16181A] sm:mb-14 2xl:mb-[68px]">
//         <h2 className={`font-bold leading-[1.2] tracking-[0.002em] ${SIZE.sectionTitle}`}>
//           {selectedCategory === 'All'
//             ? ' News'
//             : selectedCategory?.name || selectedCategory}
//         </h2>

//         {/* Big story 972 : small stories 683, 24px apart */}
//         <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[972fr_683fr]">
//           {/* LARGE NEWS */}
//           <article
//             {...linkProps(mainNews)}
//             className={`group flex min-w-0 flex-col gap-[10px] border-t border-[#979EA9] py-[10px] ${
//               mainNews.slug ? 'cursor-pointer' : ''
//             }`}>
//             <div className="aspect-[972/600] w-full overflow-hidden bg-[#DDE0E3]">
//               {getImageurl(mainNews) ? (
//                 <img
//                   src={getImageurl(mainNews)}
//                   alt={mainNews.title}
//                   loading="lazy"
//                   className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
//                 />
//               ) : (
//                 <div className="flex h-full w-full items-center justify-center">
//                   <span className="text-sm text-[#979EA9]">No image available</span>
//                 </div>
//               )}
//             </div>

//             <h3
//               className={`line-clamp-2 font-bold leading-[1.2] tracking-[0.002em] ${SIZE.mainTitle}`}>
//               {mainNews.title}
//             </h3>

//             {/* Date with calendar icon */}
//             <div className="flex items-center gap-2 text-sm font-normal text-[#979EA9]">
//               <CalendarDays
//                 className="h-4 w-4 shrink-0"
//                 strokeWidth={1.8}
//                 aria-hidden="true"
//               />

//               <span>{formatNepaliDate(mainNews.published_at)}</span>
//             </div>
//           </article>

//           {/* SMALL NEWS */}
//           <div className="flex min-w-0 flex-col gap-6">
//             {sideNews.map((item, index) => (
//               <article
//                 key={item.id || item.slug || index}
//                 {...linkProps(item)}
//                 className={`group flex min-w-0 items-start gap-4 border-t border-[#979EA9] py-[10px] sm:gap-6 ${
//                   item.slug ? 'cursor-pointer' : ''
//                 }`}>
//                 {/* Image */}
//                 <div className="aspect-[260/200] w-[38%] shrink-0 overflow-hidden bg-[#DDE0E3]">
//                   {getImageurl(item) ? (
//                     <img
//                       src={getImageurl(item)}
//                       alt={item.title}
//                       loading="lazy"
//                       className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
//                     />
//                   ) : (
//                     <div className="flex h-full w-full items-center justify-center">
//                       <span className="text-xs text-[#979EA9]">No image</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Small news content */}
//                 <div className="min-w-0 flex-1">
//                   <h3
//                     className={`line-clamp-4 font-bold leading-[1.2] tracking-[0.002em] ${SIZE.sideTitle}`}>
//                     {item.title}
//                   </h3>

//                   {/* Date with calendar icon */}
//                   <div className="mt-2 flex items-center gap-2 text-sm font-normal text-[#979EA9]">
//                     <CalendarDays
//                       className="h-4 w-4 shrink-0"
//                       strokeWidth={1.8}
//                       aria-hidden="true"
//                     />

//                     <span>{formatNepaliDate(item.published_at)}</span>
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Closing black line */}
//       {bottomLine && <div aria-hidden="true" className="border-t border-[#16181A]" />}
//     </>
//   );
// }

// export default NewsSection;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

import api from '@/services/api';
import { getNewsList, isPublishedNews } from '@/lib/news';
import { getImageUrl } from '@/lib/getImageUrl';
import { formatNepaliDate } from '@/lib/nepaliDate';

const SIZE = {
  sectionTitle: 'text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl',
  mainTitle: 'text-base sm:text-lg lg:text-xl 2xl:text-2xl',
  mainExcerpt: 'text-sm sm:text-base lg:text-lg',
  sideTitle: 'text-sm sm:text-base xl:text-lg 2xl:text-xl',
  sideExcerpt: 'text-xs sm:text-sm xl:text-base',
  date: 'text-xs sm:text-sm',
};

function NewsSection({ selectedCategory, newsData, bottomLine = false }) {
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Array.isArray(newsData)) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        setNews(getNewsList(response).filter(isPublishedNews));
      } catch (error) {
        console.error('Unable to load news:', error);
        setError('Unable to load news.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsData]);

  const sourceNews = Array.isArray(newsData) ? newsData : news;

  // const filteredNews = sourceNews.filter((item) => {
  //   if (!isPublishedNews(item)) {
  //     return false;
  //   }

  //   if (selectedCategory === 'All') {
  //     return true;
  //   }

  //   const categoryValues = [
  //     item.category?.id,
  //     item.category_id,
  //     item.category?.name,
  //     item.category?.slug,
  //     item.category_slug,
  //   ]
  //     .filter((value) => value !== null && value !== undefined)
  //     .map((value) => String(value).toLowerCase());

  //   const selectedValues = [
  //     selectedCategory?.id,
  //     selectedCategory?.name,
  //     selectedCategory?.slug,
  //   ]
  //     .filter((value) => value !== null && value !== undefined)
  //     .map((value) => String(value).toLowerCase());

  //   return selectedValues.some((value) => categoryValues.includes(value));
  // });

  const filteredNews = sourceNews
    .filter((item) => {
      if (!isPublishedNews(item)) {
        return false;
      }

      if (selectedCategory === 'All') {
        return true;
      }

      const categoryValues = [
        item.category?.id,
        item.category_id,
        item.category?.name,
        item.category?.slug,
        item.category_slug,
      ]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value).toLowerCase());

      const selectedValues = [
        selectedCategory?.id,
        selectedCategory?.name,
        selectedCategory?.slug,
      ]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value).toLowerCase());

      return selectedValues.some((value) => categoryValues.includes(value));
    })
    .sort((a, b) => {
      const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3,
      };

      const priorityA = priorityOrder[String(a.priority || '').toLowerCase()] || 4;

      const priorityB = priorityOrder[String(b.priority || '').toLowerCase()] || 4;

      return priorityA - priorityB;
    })
    .slice(0, 4);

  const getItemImage = (item) => getImageUrl(item?.featured_image || item?.images?.[0]);

  const goToNews = (item) => {
    if (item.slug) {
      navigate(`/news/${item.slug}`);
    }
  };

  const linkProps = (item) => ({
    role: item.slug ? 'link' : undefined,
    tabIndex: item.slug ? 0 : undefined,
    onClick: () => goToNews(item),
    onKeyDown: (event) => {
      if (item.slug && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        goToNews(item);
      }
    },
  });

  if (!Array.isArray(newsData) && loading) {
    return (
      <section className="py-6 text-center">
        <p className="text-gray-500">Loading news...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6 text-center">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (filteredNews.length === 0) {
    return (
      <section className="py-6 text-center">
        <p className="text-gray-500">No news available.</p>
      </section>
    );
  }

  const mainNews = filteredNews[0];
  const sideNews = filteredNews.slice(1, 4);

  return (
    <>
      <section className="flex w-full flex-col gap-2 border-t border-[#16181A] py-2 font-['Mukta',sans-serif] text-[#16181A]">
        <h2 className={`font-bold leading-[1.2] tracking-[0.002em] ${SIZE.sectionTitle}`}>
          {selectedCategory === 'All'
            ? 'News'
            : selectedCategory?.name || selectedCategory}
        </h2>

        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[972fr_683fr] lg:gap-6">
          <article
            {...linkProps(mainNews)}
            className={`group flex min-w-0 flex-col border-t border-[#979EA9] pt-2 ${
              mainNews.slug ? 'cursor-pointer' : ''
            }`}>
            <div className="aspect-[972/540] w-full overflow-hidden bg-[#DDE0E3]">
              {getItemImage(mainNews) ? (
                <img
                  src={getItemImage(mainNews)}
                  alt={mainNews.title || ''}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-sm text-[#979EA9]">No image available</span>
                </div>
              )}
            </div>

            <h3
              className={`mt-2 line-clamp-2 font-bold leading-[1.2] tracking-[0.002em] ${SIZE.mainTitle}`}>
              {mainNews.title}
            </h3>

            {mainNews.excerpt && (
              <p
                className={`mt-1.5 line-clamp-2 overflow-hidden font-normal leading-[1.5] text-[#4A4E54] ${SIZE.mainExcerpt}`}>
                {mainNews.excerpt}
              </p>
            )}

            <div
              className={`mt-2 flex items-center gap-1.5 font-normal text-[#979EA9] ${SIZE.date}`}>
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span>
                {formatNepaliDate(mainNews.published_at || mainNews.created_at)}
              </span>
            </div>
          </article>

          <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
            {sideNews.map((item, index) => (
              <article
                key={item.id || item.slug || index}
                {...linkProps(item)}
                className={`group flex min-w-0 items-start gap-3 border-t border-[#979EA9] pt-2 sm:gap-4 ${
                  item.slug ? 'cursor-pointer' : ''
                }`}>
                <div className="aspect-[260/200] w-[38%] shrink-0 overflow-hidden bg-[#DDE0E3]">
                  {getItemImage(item) ? (
                    <img
                      src={getItemImage(item)}
                      alt={item.title || ''}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-xs text-[#979EA9]">No image</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`line-clamp-2 font-bold leading-[1.2] tracking-[0.002em] ${SIZE.sideTitle}`}>
                    {item.title}
                  </h3>

                  {item.excerpt && (
                    <p
                      className={`mt-1.5 line-clamp-2 overflow-hidden font-normal leading-[1.45] text-[#4A4E54] ${SIZE.sideExcerpt}`}>
                      {item.excerpt}
                    </p>
                  )}

                  <div
                    className={`mt-2 flex items-center gap-1.5 font-normal text-[#979EA9] ${SIZE.date}`}>
                    <CalendarDays
                      className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <span>{formatNepaliDate(item.published_at || item.created_at)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {bottomLine && <div aria-hidden="true" className="border-t border-[#16181A]" />}
    </>
  );
}

export default NewsSection;
