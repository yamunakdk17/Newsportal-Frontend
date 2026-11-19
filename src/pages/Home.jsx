import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/layout/Herosection';
import CategoryBar from '@/components/category/CategoryCard';
import NewsSection from '@/components/news/NewsSection';
import NewsAnotherSection from '@/components/news/NewsAnother';
import DailyNews from '@/components/news/DailyNews';
import TrendingNews from '@/components/news/TrendingNews';
import Banners from '@/components/Banner/Banners';

import api from '@/services/api';
import { getNewsList, isPublishedNews } from '@/lib/news';

const NEWS_PER_PAGE = 8;
const NEWS_PAGES = 5;
const STORIES_PER_CATEGORY = 3;
const CATEGORY_SECTION_LIMIT = 6;
const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

const getArticleTime = (item) => {
  const value = item?.updated_at || item?.published_at || item?.created_at;
  const timestamp = value ? new Date(value).getTime() : 0;

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getPriorityRank = (item) => {
  const priority = item?.priority;

  if (typeof priority === 'number') return priority;

  const value = String(priority ?? '').trim().toLowerCase();
  if (Object.hasOwn(PRIORITY_RANK, value)) return PRIORITY_RANK[value];

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getCategoryValues = (category) => {
  if (typeof category === 'string' || typeof category === 'number') {
    return [String(category).toLowerCase()];
  }

  return [category?.id, category?.name, category?.slug]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).toLowerCase());
};

const getArticleCategory = (item, categories) => {
  const rawCategory = item?.category;
  const categoryId = item?.category_id ?? rawCategory?.id;
  const categoryName =
    (typeof rawCategory === 'object' ? rawCategory?.name : rawCategory) ||
    categories.find((category) => String(category.id) === String(categoryId))?.name;
  const categorySlug =
    (typeof rawCategory === 'object' ? rawCategory?.slug : undefined) || item?.category_slug;
  const key = categoryId ?? categorySlug ?? categoryName;

  if (key === null || key === undefined || !categoryName) return null;

  return { key: String(key), category: { id: categoryId, name: categoryName, slug: categorySlug } };
};

const fetchNewsPage = async (page) => {
  const response = await api.get('/news', {
    params: { page, per_page: NEWS_PER_PAGE },
  });

  if (response.data?.success === false) {
    throw new Error(response.data?.message || 'Unable to load news.');
  }

  return getNewsList(response);
};

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (active) setCategories(getNewsList(response));
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
        const pages = Array.from({ length: NEWS_PAGES }, (_, index) => index + 1);
        const results = await Promise.allSettled(pages.map(fetchNewsPage));

        if (results[0].status === 'rejected') throw results[0].reason;

        const mergedNews = results
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => result.value)
          .filter(isPublishedNews);

        if (active) setNews(mergedNews);
      } catch (error) {
        console.error('Unable to load home news:', error);
        if (active) {
          setNewsError(
            error.response?.data?.message || error.message || 'Unable to load news.',
          );
        }
      } finally {
        if (active) setNewsLoading(false);
      }
    };

    fetchNews();
    return () => {
      active = false;
    };
  }, []);

  const handleHeroSelect = (item) => {
    if (item?.slug) navigate(`/news/${item.slug}`);
  };

  const categorySections = useMemo(() => {
    const uniqueArticles = new Map();

    news.forEach((item, index) => {
      const identity = item?.id ?? item?.slug ?? `article-${index}`;
      if (!uniqueArticles.has(String(identity))) {
        uniqueArticles.set(String(identity), item);
      }
    });

    const groups = new Map();
    [...uniqueArticles.values()].forEach((item) => {
      const categoryInfo = getArticleCategory(item, categories);
      if (!categoryInfo) return;

      if (!groups.has(categoryInfo.key)) {
        groups.set(categoryInfo.key, { ...categoryInfo, items: [] });
      }
      groups.get(categoryInfo.key).items.push(item);
    });

    return [...groups.values()]
      .filter((group) => group.items.length >= STORIES_PER_CATEGORY)
      .map((group) => {
        const sortedByPriority = [...group.items].sort(
          (a, b) => getPriorityRank(b) - getPriorityRank(a) || getArticleTime(b) - getArticleTime(a),
        );
        const lead = sortedByPriority[0];
        const stories = [
          lead,
          ...group.items
            .filter((item) => item !== lead)
            .sort((a, b) => getArticleTime(b) - getArticleTime(a)),
        ].slice(0, STORIES_PER_CATEGORY);

        return {
          ...group,
          items: stories,
          newest: Math.max(...group.items.map(getArticleTime)),
        };
      })
      .sort((a, b) => b.newest - a.newest)
      .slice(0, CATEGORY_SECTION_LIMIT);
  }, [news, categories]);

  const visibleSections = useMemo(() => {
    if (selectedCategory === 'All') return categorySections;
    const selectedValues = getCategoryValues(selectedCategory);

    return categorySections.filter((section) =>
      getCategoryValues(section.category).some((value) => selectedValues.includes(value)),
    );
  }, [categorySections, selectedCategory]);

  return (
    <>
      <Header />
      <HeroBanner
        newsData={news}
        isLoading={newsLoading}
        onSelect={handleHeroSelect}
      />

      <main className="w-full px-6 py-10 md:px-10 lg:px-[120px]">
        <section className="my-16">
          <DailyNews title="Daily Updates" newsData={news} />
        </section>

        <section className="mb-10">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </section>

        {newsLoading && <p className="my-16 text-center">Loading news...</p>}

        {!newsLoading && newsError && (
          <p role="alert" className="my-16 text-center text-red-500">
            {newsError}
          </p>
        )}

        {!newsLoading && !newsError && (
          <>
            {visibleSections.length === 0 && (
              <p className="my-16 text-center text-gray-500">No news available.</p>
            )}

            {visibleSections[0] && (
              <section className="my-16">
                <NewsSection
                  selectedCategory={visibleSections[0].category}
                  newsData={visibleSections[0].items}
                />
              </section>
            )}

            <section className="my-16">
              <TrendingNews
                title="Other News"
                newsData={news}
                onSelect={handleHeroSelect}
              />
            </section>

            <section className="my-18 w-full">
              <Banners />
            </section>

            <section className="my-16">
              <NewsAnotherSection newsData={news} onSelect={handleHeroSelect} />
            </section>

            {selectedCategory === 'All' && visibleSections[1] && (
              <section className="my-16">
                <NewsSection
                  selectedCategory={visibleSections[1].category}
                  newsData={visibleSections[1].items}
                />
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Home;
