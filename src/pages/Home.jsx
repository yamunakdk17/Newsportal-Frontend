import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/layout/HeroSection';

import CategoryBar from '@/components/category/CategoryCard';
import NewsSection from '@/components/news/NewsSection';
import NewsAnotherSection from '@/components/news/NewsAnother';

import api from '@/services/api';

function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories', {
          params: {
            page: 1,
            per_page: 10,
          },
        });

        setCategories(response.data?.data || []);
      } catch (error) {
        console.error('Unable to load categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Header />

      {/* HERO */}
      <HeroBanner
        onSelect={(news) => {
          if (news?.slug) {
            navigate(`/news/${news.slug}`);
          }
        }}
      />

      <main className="w-full px-[120px] py-10">
        {/* CATEGORY SECTION */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-3">
            <CategoryBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </section>

        <section className="my-16">
          <NewsSection selectedCategory={selectedCategory} />
        </section>

        <section className="my-16">
          <NewsAnotherSection />
        </section>

        <section className="my-16">
          <NewsSection selectedCategory={selectedCategory} />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
