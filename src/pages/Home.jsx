// // import { useEffect, useMemo, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';

// // import Header from '@/components/layout/Header';
// // import Footer from '@/components/layout/Footer';
// // import HeroBanner from '@/components/layout/Herosection';

// // import CategoryBar from '@/components/category/CategoryCard';
// // import NewsSection from '@/components/news/NewsSection';
// // import NewsAnotherSection from '@/components/news/NewsAnother';
// // import DailyNews from '@/components/news/DailyNews';
// // import Banners from '@/components/Banner/Banners';

// // import api from '@/services/api';
// // import { getNewsList, isPublishedNews } from '@/lib/news';

// // const NEWS_PER_PAGE = 8;
// // const NEWS_PAGES = 5;
// // const STORIES_PER_CATEGORY = 3;
// // const MAX_CATEGORY_SECTIONS = 5;

// // const PRIORITY_RANK = {
// //   low: 1,
// //   medium: 2,
// //   high: 3,
// // };

// // const getArticleTime = (item) => {
// //   const value = item?.updated_at || item?.published_at || item?.created_at;

// //   const timestamp = value ? new Date(value).getTime() : 0;

// //   return Number.isFinite(timestamp) ? timestamp : 0;
// // };

// // const getArticleId = (item) => String(item?.id ?? item?.slug);

// // const getPriorityRank = (item) => {
// //   const priority = item?.priority;

// //   if (typeof priority === 'number') {
// //     return priority;
// //   }

// //   const value = String(priority ?? '')
// //     .trim()
// //     .toLowerCase();

// //   if (Object.hasOwn(PRIORITY_RANK, value)) {
// //     return PRIORITY_RANK[value];
// //   }

// //   const numeric = Number(value);

// //   return Number.isFinite(numeric) ? numeric : 0;
// // };

// // const getArticleCategory = (item, categories) => {
// //   const rawCategory = item?.category;

// //   const categoryId =
// //     item?.category_id ?? (typeof rawCategory === 'object' ? rawCategory?.id : undefined);

// //   const categoryName =
// //     (typeof rawCategory === 'object' ? rawCategory?.name : rawCategory) ||
// //     categories.find((category) => String(category.id) === String(categoryId))?.name;

// //   const categorySlug =
// //     (typeof rawCategory === 'object' ? rawCategory?.slug : undefined) ||
// //     item?.category_slug;

// //   const key = categoryId ?? categorySlug ?? categoryName;

// //   if (key === null || key === undefined || !categoryName) {
// //     return null;
// //   }

// //   return {
// //     key: String(key),
// //     category: {
// //       id: categoryId,
// //       name: categoryName,
// //       slug: categorySlug,
// //     },
// //   };
// // };

// // const fetchNewsPage = async (page) => {
// //   const response = await api.get('/news', {
// //     params: {
// //       page,
// //       per_page: NEWS_PER_PAGE,
// //     },
// //   });

// //   if (response.data?.success === false) {
// //     throw new Error(response.data?.message || 'Unable to load news.');
// //   }

// //   return getNewsList(response);
// // };

// // function Home() {
// //   const navigate = useNavigate();

// //   const [categories, setCategories] = useState([]);
// //   const [news, setNews] = useState([]);

// //   const [newsLoading, setNewsLoading] = useState(true);
// //   const [newsError, setNewsError] = useState('');

// //   useEffect(() => {
// //     let active = true;

// //     const fetchCategories = async () => {
// //       try {
// //         const response = await api.get('/categories');

// //         const categoryData = getNewsList(response);

// //         if (active) {
// //           setCategories(categoryData);
// //         }
// //       } catch (error) {
// //         console.error('Unable to load categories:', error);
// //       }
// //     };

// //     fetchCategories();

// //     return () => {
// //       active = false;
// //     };
// //   }, []);

// //   useEffect(() => {
// //     let active = true;

// //     const fetchNews = async () => {
// //       setNewsLoading(true);
// //       setNewsError('');

// //       try {
// //         const pages = Array.from({ length: NEWS_PAGES }, (_, index) => index + 1);

// //         const results = await Promise.allSettled(pages.map(fetchNewsPage));

// //         if (results[0].status === 'rejected') {
// //           throw results[0].reason;
// //         }

// //         const mergedNews = results
// //           .filter((result) => result.status === 'fulfilled')
// //           .flatMap((result) => result.value)
// //           .filter(isPublishedNews);

// //         if (active) {
// //           setNews(mergedNews);
// //         }
// //       } catch (error) {
// //         console.error('Unable to load home news:', error);

// //         if (active) {
// //           setNewsError(
// //             error.response?.data?.message || error.message || 'Unable to load news.',
// //           );
// //         }
// //       } finally {
// //         if (active) {
// //           setNewsLoading(false);
// //         }
// //       }
// //     };

// //     fetchNews();

// //     return () => {
// //       active = false;
// //     };
// //   }, []);

// //   const handleHeroSelect = (item) => {
// //     if (!item?.slug) {
// //       return;
// //     }

// //     navigate(`/news/${item.slug}`);
// //   };

// //   const handleCategorySelect = (category) => {
// //     const categoryRouteValue = category?.id ?? category?.slug;

// //     if (categoryRouteValue === null || categoryRouteValue === undefined) {
// //       return;
// //     }

// //     navigate(`/category/${categoryRouteValue}`, {
// //       state: {
// //         categoryName: category.name || 'Category',
// //         categorySlug: category.slug || '',
// //       },
// //     });
// //   };

// //   const categorySections = useMemo(() => {
// //     const uniqueArticles = new Map();

// //     news.forEach((item, index) => {
// //       const identity = item?.id ?? item?.slug ?? `article-${index}`;

// //       const identityKey = String(identity);

// //       if (!uniqueArticles.has(identityKey)) {
// //         uniqueArticles.set(identityKey, item);
// //       }
// //     });

// //     const groups = new Map();

// //     [...uniqueArticles.values()].forEach((item) => {
// //       const categoryInfo = getArticleCategory(item, categories);

// //       if (!categoryInfo) {
// //         return;
// //       }

// //       if (!groups.has(categoryInfo.key)) {
// //         groups.set(categoryInfo.key, {
// //           ...categoryInfo,
// //           items: [],
// //         });
// //       }

// //       groups.get(categoryInfo.key).items.push(item);
// //     });

// //     return [...groups.values()]
// //       .map((group) => {
// //         const sortedByPriority = [...group.items].sort(
// //           (a, b) =>
// //             getPriorityRank(b) - getPriorityRank(a) ||
// //             getArticleTime(b) - getArticleTime(a),
// //         );

// //         const lead = sortedByPriority[0];

// //         const remaining = group.items
// //           .filter((item) => item !== lead)
// //           .sort((a, b) => getArticleTime(b) - getArticleTime(a));

// //         const stories = [lead, ...remaining].slice(0, STORIES_PER_CATEGORY);

// //         return {
// //           ...group,
// //           items: stories,
// //           newest: Math.max(...group.items.map(getArticleTime)),
// //         };
// //       })
// //       .sort((a, b) => b.newest - a.newest);
// //   }, [news, categories]);

// //   const visibleSections = categorySections.slice(0, MAX_CATEGORY_SECTIONS);

// //   // Articles not already shown in a category section, newest first.
// //   // Falls back to all news if nothing is left over.
// //   const anotherNews = useMemo(() => {
// //     const shownIds = new Set(
// //       visibleSections.flatMap((section) => section.items.map(getArticleId)),
// //     );

// //     const remaining = news
// //       .filter((item) => !shownIds.has(getArticleId(item)))
// //       .sort((a, b) => getArticleTime(b) - getArticleTime(a));

// //     return remaining.length > 0 ? remaining : news;
// //   }, [news, visibleSections]);

// //   return (
// //     <>
// //       <Header />

// //       <HeroBanner newsData={news} isLoading={newsLoading} onSelect={handleHeroSelect} />

// //       <main className="w-full px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-20">
// //         <section className="mb-6">
// //           <CategoryBar
// //             categories={categories}
// //             selectedCategory="All"
// //             onCategorySelect={handleCategorySelect}
// //           />
// //         </section>

// //         <section className="my-8">
// //           <DailyNews title="Daily Updates" newsData={news} />
// //         </section>

// //         {newsLoading && (
// //           <p className="my-8 text-center text-sm text-gray-500 sm:text-base">
// //             Loading news...
// //           </p>
// //         )}

// //         {!newsLoading && newsError && (
// //           <p role="alert" className="my-8 text-center text-sm text-red-500 sm:text-base">
// //             {newsError}
// //           </p>
// //         )}

// //         {!newsLoading && !newsError && (
// //           <>
// //             {visibleSections.length === 0 && (
// //               <p className="my-8 text-center text-sm text-gray-500 sm:text-base">
// //                 No news available.
// //               </p>
// //             )}

// //             {visibleSections.map((section) => (
// //               <section key={section.key} className="my-8">
// //                 <NewsSection
// //                   selectedCategory={section.category}
// //                   newsData={section.items}
// //                 />
// //               </section>
// //             ))}

// //             {visibleSections.length > 0 && (
// //               <>
// //                 <section className="my-8 w-full">
// //                   <Banners />
// //                 </section>

// //                 <section className="my-8">
// //                   <NewsAnotherSection
// //                     newsData={anotherNews}
// //                     onSelect={handleHeroSelect}
// //                   />
// //                 </section>
// //               </>
// //             )}
// //           </>
// //         )}
// //       </main>

// //       <Footer />
// //     </>
// //   );
// // }

// // export default Home;
// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Header from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';
// import HeroBanner from '@/components/layout/Herosection';

// import CategoryBar from '@/components/category/CategoryCard';
// import NewsSection from '@/components/news/NewsSection';
// import NewsAnotherSection from '@/components/news/NewsAnother';
// import DailyNews from '@/components/news/DailyNews';
// import Banners from '@/components/Banner/Banners';

// import api from '@/services/api';
// import { getNewsList, isPublishedNews } from '@/lib/news';

// const NEWS_PER_PAGE = 8;
// const NEWS_PAGES = 5;
// const STORIES_PER_CATEGORY = 4;
// const MAX_CATEGORY_SECTIONS = 5;

// const PRIORITY_RANK = {
//   low: 1,
//   medium: 2,
//   high: 3,
// };

// const getArticleTime = (item) => {
//   const value = item?.updated_at || item?.published_at || item?.created_at;

//   const timestamp = value ? new Date(value).getTime() : 0;

//   return Number.isFinite(timestamp) ? timestamp : 0;
// };

// const getArticleId = (item) => String(item?.id ?? item?.slug);

// const getPriorityRank = (item) => {
//   const priority = item?.priority;

//   if (typeof priority === 'number') {
//     return priority;
//   }

//   const value = String(priority ?? '')
//     .trim()
//     .toLowerCase();

//   if (Object.hasOwn(PRIORITY_RANK, value)) {
//     return PRIORITY_RANK[value];
//   }

//   const numeric = Number(value);

//   return Number.isFinite(numeric) ? numeric : 0;
// };

// const getCategoryValues = (category) => {
//   if (typeof category === 'string' || typeof category === 'number') {
//     return [String(category).toLowerCase()];
//   }

//   return [category?.id, category?.name, category?.slug]
//     .filter((value) => value !== null && value !== undefined)
//     .map((value) => String(value).toLowerCase());
// };

// const getArticleCategory = (item, categories) => {
//   const rawCategory = item?.category;

//   const categoryId =
//     item?.category_id ?? (typeof rawCategory === 'object' ? rawCategory?.id : undefined);

//   const categoryName =
//     (typeof rawCategory === 'object' ? rawCategory?.name : rawCategory) ||
//     categories.find((category) => String(category.id) === String(categoryId))?.name;

//   const categorySlug =
//     (typeof rawCategory === 'object' ? rawCategory?.slug : undefined) ||
//     item?.category_slug;

//   const key = categoryId ?? categorySlug ?? categoryName;

//   if (key === null || key === undefined || !categoryName) {
//     return null;
//   }

//   return {
//     key: String(key),
//     category: {
//       id: categoryId,
//       name: categoryName,
//       slug: categorySlug,
//     },
//   };
// };

// const fetchNewsPage = async (page) => {
//   const response = await api.get('/news', {
//     params: {
//       page,
//       per_page: NEWS_PER_PAGE,
//     },
//   });

//   if (response.data?.success === false) {
//     throw new Error(response.data?.message || 'Unable to load news.');
//   }

//   return getNewsList(response);
// };

// function Home() {
//   const navigate = useNavigate();

//   const [categories, setCategories] = useState([]);
//   const [news, setNews] = useState([]);

//   const [newsLoading, setNewsLoading] = useState(true);
//   const [newsError, setNewsError] = useState('');

//   const [selectedCategory, setSelectedCategory] = useState('All');

//   useEffect(() => {
//     let active = true;

//     const fetchCategories = async () => {
//       try {
//         const response = await api.get('/categories');

//         const categoryData = getNewsList(response);

//         if (active) {
//           setCategories(categoryData);
//         }
//       } catch (error) {
//         console.error('Unable to load categories:', error);
//       }
//     };

//     fetchCategories();

//     return () => {
//       active = false;
//     };
//   }, []);

//   useEffect(() => {
//     let active = true;

//     const fetchNews = async () => {
//       setNewsLoading(true);
//       setNewsError('');

//       try {
//         const pages = Array.from({ length: NEWS_PAGES }, (_, index) => index + 1);

//         const results = await Promise.allSettled(pages.map(fetchNewsPage));

//         if (results[0].status === 'rejected') {
//           throw results[0].reason;
//         }

//         const mergedNews = results
//           .filter((result) => result.status === 'fulfilled')
//           .flatMap((result) => result.value)
//           .filter(isPublishedNews);

//         if (active) {
//           setNews(mergedNews);
//         }
//       } catch (error) {
//         console.error('Unable to load home news:', error);

//         if (active) {
//           setNewsError(
//             error.response?.data?.message || error.message || 'Unable to load news.',
//           );
//         }
//       } finally {
//         if (active) {
//           setNewsLoading(false);
//         }
//       }
//     };

//     fetchNews();

//     return () => {
//       active = false;
//     };
//   }, []);

//   const handleHeroSelect = (item) => {
//     if (!item?.slug) {
//       return;
//     }

//     navigate(`/news/${item.slug}`);
//   };

//   const categorySections = useMemo(() => {
//     const uniqueArticles = new Map();

//     news.forEach((item, index) => {
//       const identity = item?.id ?? item?.slug ?? `article-${index}`;

//       const identityKey = String(identity);

//       if (!uniqueArticles.has(identityKey)) {
//         uniqueArticles.set(identityKey, item);
//       }
//     });

//     const groups = new Map();

//     [...uniqueArticles.values()].forEach((item) => {
//       const categoryInfo = getArticleCategory(item, categories);

//       if (!categoryInfo) {
//         return;
//       }

//       if (!groups.has(categoryInfo.key)) {
//         groups.set(categoryInfo.key, {
//           ...categoryInfo,
//           items: [],
//         });
//       }

//       groups.get(categoryInfo.key).items.push(item);
//     });

//     return [...groups.values()]
//       .map((group) => {
//         const sortedByPriority = [...group.items].sort(
//           (a, b) =>
//             getPriorityRank(b) - getPriorityRank(a) ||
//             getArticleTime(b) - getArticleTime(a),
//         );

//         const lead = sortedByPriority[0];

//         const remaining = group.items
//           .filter((item) => item !== lead)
//           .sort((a, b) => getArticleTime(b) - getArticleTime(a));

//         const stories = [lead, ...remaining].slice(0, STORIES_PER_CATEGORY);

//         return {
//           ...group,
//           items: stories,
//           newest: Math.max(...group.items.map(getArticleTime)),
//         };
//       })
//       .sort((a, b) => b.newest - a.newest);
//   }, [news, categories]);

//   const visibleSections = useMemo(() => {
//     if (selectedCategory === 'All') {
//       return categorySections.slice(0, MAX_CATEGORY_SECTIONS);
//     }

//     const selectedValues = getCategoryValues(selectedCategory);

//     return categorySections.filter((section) =>
//       getCategoryValues(section.category).some((value) => selectedValues.includes(value)),
//     );
//   }, [categorySections, selectedCategory]);

//   // Articles not already shown in a category section, newest first.
//   // Falls back to all news if nothing is left over.
//   const anotherNews = useMemo(() => {
//     const shownIds = new Set(
//       visibleSections.flatMap((section) => section.items.map(getArticleId)),
//     );

//     const remaining = news
//       .filter((item) => !shownIds.has(getArticleId(item)))
//       .sort((a, b) => getArticleTime(b) - getArticleTime(a));

//     return remaining.length > 0 ? remaining : news;
//   }, [news, visibleSections]);

//   return (
//     <>
//       <Header />

//       <HeroBanner newsData={news} isLoading={newsLoading} onSelect={handleHeroSelect} />

//       <main className="w-full px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-20">
//         <section className="mb-6">
//           <CategoryBar
//             categories={categories}
//             selectedCategory={selectedCategory}
//             onCategorySelect={setSelectedCategory}
//           />
//         </section>

//         <section className="my-8">
//           <DailyNews title="Daily Updates" newsData={news} />
//         </section>

//         {newsLoading && (
//           <p className="my-8 text-center text-sm text-gray-500 sm:text-base">
//             Loading news...
//           </p>
//         )}

//         {!newsLoading && newsError && (
//           <p role="alert" className="my-8 text-center text-sm text-red-500 sm:text-base">
//             {newsError}
//           </p>
//         )}

//         {!newsLoading && !newsError && (
//           <>
//             {visibleSections.length === 0 && (
//               <p className="my-8 text-center text-sm text-gray-500 sm:text-base">
//                 No news available.
//               </p>
//             )}

//             {visibleSections.map((section) => (
//               <section key={section.key} className="my-8">
//                 <NewsSection
//                   selectedCategory={section.category}
//                   newsData={section.items}
//                 />
//               </section>
//             ))}

//             {visibleSections.length > 0 && (
//               <>
//                 <section className="my-8 w-full">
//                   <Banners />
//                 </section>

//                 <section className="my-8">
//                   <NewsAnotherSection
//                     newsData={anotherNews}
//                     onSelect={handleHeroSelect}
//                   />
//                 </section>
//               </>
//             )}
//           </>
//         )}
//       </main>

//       <Footer />
//     </>
//   );
// }

// export default Home;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/layout/Herosection';

import CategoryBar from '@/components/category/CategoryCard';
import NewsSection from '@/components/news/NewsSection';
import NewsAnotherSection from '@/components/news/NewsAnother';
import DailyNews from '@/components/news/DailyNews';
import Banners from '@/components/Banner/Banners';

import api from '@/services/api';
import {
  getNewsList,
  getNewsTime,
  isFeaturedNews,
  isPublishedNews,
  sortByPriorityThenNewest,
} from '@/lib/news';

const NEWS_PER_PAGE = 8;
const STORIES_PER_CATEGORY = 4;
const MAX_CATEGORY_SECTIONS = 5;

const getArticleCategory = (item, categories) => {
  const rawCategory = item?.category;

  const categoryId =
    item?.category_id ?? (typeof rawCategory === 'object' ? rawCategory?.id : undefined);

  const categoryName =
    (typeof rawCategory === 'object' ? rawCategory?.name : rawCategory) ||
    categories.find((category) => String(category.id) === String(categoryId))?.name;

  const categorySlug =
    (typeof rawCategory === 'object' ? rawCategory?.slug : undefined) ||
    item?.category_slug;

  const key = categoryId ?? categorySlug ?? categoryName;

  if (key === null || key === undefined || !categoryName) {
    return null;
  }

  return {
    key: String(key),
    category: {
      id: categoryId,
      name: categoryName,
      slug: categorySlug,
    },
  };
};

const fetchNewsPage = async (page) => {
  const response = await api.get('/news', {
    params: {
      page,
      per_page: NEWS_PER_PAGE,
    },
  });

  if (response.data?.success === false) {
    throw new Error(response.data?.message || 'Unable to load news.');
  }

  const payload = response.data?.data;
  const meta = payload?.meta || response.data?.meta;

  return {
    items: getNewsList(response),
    lastPage: Number(meta?.last_page) || 1,
  };
};

function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);

  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');

        const categoryData = getNewsList(response);

        if (active) {
          setCategories(categoryData);
        }
      } catch (error) {
        console.error('Unable to load categories:', error);
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError('');

      try {
        const firstPage = await fetchNewsPage(1);
        const otherPages = await Promise.all(
          Array.from({ length: Math.max(0, firstPage.lastPage - 1) }, (_, index) =>
            fetchNewsPage(index + 2),
          ),
        );
        const uniqueNews = new Map();
        [firstPage, ...otherPages]
          .flatMap((page) => page.items)
          .forEach((item) => {
            if (item?.slug && !uniqueNews.has(String(item.slug))) {
              uniqueNews.set(String(item.slug), item);
            }
          });
        const mergedNews = [...uniqueNews.values()].filter(isPublishedNews);

        if (active) {
          setNews(mergedNews);
        }
      } catch (error) {
        console.error('Unable to load home news:', error);

        if (active) {
          setNewsError(
            error.response?.data?.message || error.message || 'Unable to load news.',
          );
        }
      } finally {
        if (active) {
          setNewsLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      active = false;
    };
  }, []);

  const handleHeroSelect = (item) => {
    if (!item?.slug) {
      return;
    }

    navigate(`/news/${item.slug}`);
  };

  const handleCategorySelect = (category) => {
    const categoryRouteValue = category?.id ?? category?.slug;

    if (categoryRouteValue === null || categoryRouteValue === undefined) {
      return;
    }

    navigate(`/category/${categoryRouteValue}`, {
      state: {
        categoryName: category.name || 'Category',
        categorySlug: category.slug || '',
      },
    });
  };

  const heroNews = useMemo(
    () => sortByPriorityThenNewest(news.filter(isFeaturedNews))[0] || null,
    [news],
  );
  const homeSectionNews = useMemo(
    () => news.filter((item) => item?.slug !== heroNews?.slug),
    [news, heroNews],
  );

  const categorySections = useMemo(() => {
    const uniqueArticles = new Map();

    homeSectionNews.forEach((item) => {
      const identityKey = String(item?.slug);

      if (!uniqueArticles.has(identityKey)) {
        uniqueArticles.set(identityKey, item);
      }
    });

    const groups = new Map();

    [...uniqueArticles.values()].forEach((item) => {
      const categoryInfo = getArticleCategory(item, categories);

      if (!categoryInfo) {
        return;
      }

      if (!groups.has(categoryInfo.key)) {
        groups.set(categoryInfo.key, {
          ...categoryInfo,
          items: [],
        });
      }

      groups.get(categoryInfo.key).items.push(item);
    });

    return [...groups.values()]
      .map((group) => {
        const sortedStories = sortByPriorityThenNewest(group.items);
        const stories = sortedStories.slice(0, STORIES_PER_CATEGORY);

        return {
          ...group,
          items: stories,
          newest: Math.max(...group.items.map(getNewsTime)),
        };
      })
      .sort((a, b) => b.newest - a.newest);
  }, [homeSectionNews, categories]);

  const visibleSections = useMemo(
    () => categorySections.slice(0, MAX_CATEGORY_SECTIONS),
    [categorySections],
  );

  // Stories not already shown in a visible category section.
  const anotherNews = useMemo(() => {
    const candidates = homeSectionNews;
    const shownIds = new Set(
      visibleSections.flatMap((section) =>
        section.items.map((item) => String(item.slug)),
      ),
    );
    const remaining = sortByPriorityThenNewest(
      candidates.filter((item) => !shownIds.has(String(item.slug))),
    );

    return (
      remaining.length > 0 ? remaining : sortByPriorityThenNewest(candidates)
    ).slice(0, 3);
  }, [homeSectionNews, visibleSections]);

  return (
    <>
      <Header />

      <HeroBanner newsData={news} isLoading={newsLoading} onSelect={handleHeroSelect} />

      <main className="w-full px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <section className="mb-6">
          <CategoryBar
            categories={categories}
            selectedCategory="All"
            onCategorySelect={handleCategorySelect}
          />
        </section>

        <section className="my-8">
          <DailyNews title="Daily Updates" newsData={homeSectionNews} />
        </section>

        {newsLoading && (
          <p className="my-8 text-center text-sm text-gray-500 sm:text-base">
            Loading news...
          </p>
        )}

        {!newsLoading && newsError && (
          <p role="alert" className="my-8 text-center text-sm text-red-500 sm:text-base">
            {newsError}
          </p>
        )}

        {!newsLoading && !newsError && (
          <>
            {visibleSections.length === 0 && (
              <p className="my-8 text-center text-sm text-gray-500 sm:text-base">
                No news available.
              </p>
            )}

            {visibleSections.map((section, index) => (
              <div key={section.key}>
                <section className="my-8">
                  <NewsSection
                    selectedCategory={section.category}
                    newsData={section.items}
                  />
                </section>

                {index === 1 && (
                  <section className="my-8 w-full">
                    <Banners />
                  </section>
                )}

                {index === 4 && (
                  <section className="my-8 w-full">
                    <Banners />
                  </section>
                )}
              </div>
            ))}

            {visibleSections.length > 0 && (
              <section className="my-8">
                <NewsAnotherSection newsData={anotherNews} onSelect={handleHeroSelect} />
              </section>
            )}

            {/* {visibleSections.length > 0 && (
              <>
                <section className="my-8 w-full">
                  <Banners />
                </section>

                <section className="my-8">
                  <NewsAnotherSection
                    newsData={anotherNews}
                    onSelect={handleHeroSelect}
                  />
                </section>
              </>
            )} */}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Home;
