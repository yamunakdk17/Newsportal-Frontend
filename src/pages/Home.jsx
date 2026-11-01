import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/layout/HeroSection';

import CategoryBar from '@/components/category/CategoryCard';
import NewsSection from '@/components/news/NewsSection';
import NewsAnotherSection from '@/components/news/NewsAnother';
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
      try {
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

        if (active) {
          setNews(getNewsList(response).filter(isPublishedNews));
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

  const handleHeroSelect = (news) => {
    if (!news?.slug) return;

    navigate(`/news/${news.slug}`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      {/* =========================
          HEADER
      ========================== */}
      <Header />

      <HeroBanner newsData={news} isLoading={newsLoading} onSelect={handleHeroSelect} />

      <main className="w-full px-6 py-10 md:px-10 lg:px-[120px]">
        {/* =========================
            CATEGORY BAR
        ========================== */}
        <section className="mb-10">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </section>

        {/* =========================
            MAIN NEWS SECTION
        ========================== */}
        {newsLoading && <p className="my-16 text-center">Loading news...</p>}
        {!newsLoading && newsError && (
          <p role="alert" className="my-16 text-center text-red-500">
            {newsError}
          </p>
        )}

        {!newsLoading && !newsError && (
          <>
            <section className="my-16">
              <NewsSection selectedCategory={selectedCategory} newsData={news} />
            </section>

            <section className="my-16">
              <NewsAnotherSection newsData={news} onSelect={handleHeroSelect} />
            </section>

            <section className="my-16">
              <Banners />
            </section>
          </>
        )}
      </main>

      {/* =========================
          FOOTER
      ========================== */}
      <Footer />
    </>
  );
}

export default Home;
