import { useEffect, useState } from 'react';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NewsCard from '@/components/news/NewsCard';

import api from '@/services/api';

function Home() {
const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await api.get('/categories?page=1&per_page=10');

      console.log('Categories:', response.data);

      setCategories(response.data.data || []);
    };

    fetchCategories();
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
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {selectedCategory === 'All' ? 'Latest News' : `${selectedCategory} News`}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {filteredNews.length} news article
                {filteredNews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* NEWS CARDS */}
          {filteredNews.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-slate-900">No news found</h2>

              <p className="mt-2 text-sm text-slate-500">
                There are no news articles in the {selectedCategory} category yet.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
