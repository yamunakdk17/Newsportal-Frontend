import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/layout/HeroSection';

import CategoryBar from '@/components/category/CategoryCard';
import NewsSection from '@/components/news/NewsSection';
import NewsAnotherSection from '@/components/news/NewsAnother';
import DailyNews from '@/components/news/DailyNews';
import Banners from '@/components/Banner/Banners';

import api from '@/services/api';
import { getNewsList, isPublishedNews } from '@/lib/news';

function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);

  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');

  // =========================
  // FETCH CATEGORIES
  // =========================
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

  // =========================
  // FETCH NEWS
  // =========================
  useEffect(() => {
    let active = true;

    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError('');

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 8,
          },
        });

        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Unable to load news.');
        }

        const newsData = getNewsList(response).filter(isPublishedNews);

        if (active) {
          setNews(newsData);
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

  // =========================
  // HERO NEWS CLICK
  // =========================
  const handleHeroSelect = (item) => {
    if (!item?.slug) return;

    navigate(`/news/${item.slug}`);
  };

  // =========================
  // CATEGORY SELECT
  // =========================
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      {/* HEADER */}
      <Header />

      {/* HERO SECTION */}
      <HeroBanner newsData={news} isLoading={newsLoading} onSelect={handleHeroSelect} />

      {/* MAIN CONTENT */}
      <main className="w-full px-6 py-10 md:px-10 lg:px-[120px]">
        {/* CATEGORY BAR */}
        <section className="mb-10">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </section>
        {/* DAILY UPDATES */}

        <section className="my-16">
          <div className="mb-4 text-2xl font-bold"></div>

          <DailyNews title="Daily Updates" />
        </section>

        {/* LOADING */}
        {newsLoading && <p className="my-16 text-center">Loading news...</p>}
        {/* ERROR */}
        {!newsLoading && newsError && (
          <p role="alert" className="my-16 text-center text-red-500">
            {newsError}
          </p>
        )}
        {/* NEWS CONTENT */}
        {!newsLoading && !newsError && (
          <>
            {/* MAIN NEWS SECTION */}
            <section className="my-16">
              <NewsSection selectedCategory={selectedCategory} newsData={news} />
            </section>

            {/* BANNER */}
            <section className="my-18 w-full">
              <Banners />
            </section>

            {/* ANOTHER NEWS SECTION */}
            <section className="my-16">
              <NewsAnotherSection newsData={news} onSelect={handleHeroSelect} />
            </section>

            {/* SECOND BANNER */}
            <section className="my-18 w-full">
              <Banners />
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </>
  );
}

export default Home;
