import { useEffect, useState } from 'react';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NewsCard from '@/components/news/NewsCard';

import api from '@/services/api';

function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  //for the news section//

  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');

  //category api call section//
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await api.get('/categories?page=1&per_page=10');

      console.log('Categories:', response.data);

      setCategories(response.data.data || []);
    };

    fetchCategories();
  }, []);
  //news api call section//
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError('');

        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 10,
          },
        });

        console.log('News API response:', response.data);

        if (response.data?.success) {
          setNews(response.data.data || []);
        } else {
          setNewsError(response.data?.message || 'Unable to load news.');
        }

        if (response.data?.success) {
          setNews(response.data.data || []);
        } else {
          setNewsError(response.data?.message || 'Unable to load news.');
        }
      } catch (error) {
        console.error('News API error:', error);

        setNewsError(error.response?.data?.message || 'Unable to load news.');
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews =
    selectedCategory === 'All'
      ? news
      : news.filter((item) => {
          const categoryName = item.category?.name || item.category;

          return categoryName?.toLowerCase() === selectedCategory.toLowerCase();
        });

  return (
    <>
      <Header />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10">
        {/* CATEGORY SECTION */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Categories</h2>

            <p className="mt-1 text-sm text-slate-500">Explore news by category</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* ALL BUTTON */}
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600'
              }`}>
              All
            </button>

            {/* CATEGORY BUTTONS */}
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory.toLowerCase() === category.name.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600'
                }`}>
                {category.name}
              </button>
            ))}
          </div>
        </section>
        {/* NEWS SECTION */}

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Latest News</h2>

            <p className="text-sm text-gray-500">Latest news and updates</p>
          </div>

          {newsLoading && (
            <div className="py-10 text-center">
              <p className="text-gray-500">Loading news...</p>
            </div>
          )}

          {!newsLoading && newsError && (
            <div className="py-10 text-center">
              <p className="text-red-500">{newsError}</p>
            </div>
          )}

          {!newsLoading && !newsError && news.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-gray-500">No news available.</p>
            </div>
          )}

          {!newsLoading && !newsError && news.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
