import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NewsCard from '@/components/news/NewsCard';

import api from '@/services/api';
import NewsCategory from '@/components/NewsCardhome';
import CategoryBar from '@/components/category/CategoryCard';

function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await api.get('/categories?page=1&per_page=10');
      setCategories(response.data.data || []);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news', {
          params: {
            page: 1,
            per_page: 10,
          },
        });

        setNews(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        console.error('Unable to load news:', error);
        setNewsError('Unable to load news.');
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (item.is_published !== true) {
      return false;
    }

    if (selectedCategory === 'All') {
      return true;
    }

    const categoryValues = [
      item.category?.id,
      item.category?.name,
      item.category?.slug,
      item.category_slug,
    ]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase());
    const selectedValues = [
      selectedCategory.id,
      selectedCategory.name,
      selectedCategory.slug,
    ]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase());

    return selectedValues.some((value) => categoryValues.includes(value));
  });

  return (
    <>
      <Header />

      <Navbar />
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
        Admin
      </button>

      <main className="w-full px-[120px] py-10">
        {/* CATEGORY SECTION */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-3">
            {/* CATEGORY BUTTONS */}
            <CategoryBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </section>
        {/* NEWS SECTION */}

        {/* <section className="space-y-6">
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

          {!newsLoading && !newsError && filteredNews.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-gray-500">No news available.</p>
            </div>
          )}

          {!newsLoading && !newsError && filteredNews.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((item) => {
                // const imageUrl = item.featured_image || item.images?.[0] || '';
                const imageUrl =
                  'http://192.168.1.118:8000/storage/news/wkhDPZ2NhlFgssR8pVEe8ZGJuHG2xeZHcduWadjO.jpg' ||
                  '';

                return (
                  <article
                    key={item.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/news/${item.slug}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/news/${item.slug}`);
                      }
                    }}
                    className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center bg-gray-100">
                        <span className="text-sm text-gray-400">No image available</span>
                      </div>
                    )}

                    <div className="p-5">
                      {item.category?.name && (
                        <p className="mb-2 text-sm font-semibold text-blue-600">
                          {item.category.name}
                        </p>
                      )}

                      <h3 className="text-xl font-bold">{item.title}</h3>

                      {item.caption && (
                        <p className="mt-2 text-sm text-gray-500">{item.caption}</p>
                      )}

                      {item.author && (
                        <p className="mt-3 text-sm text-gray-500">By {item.author}</p>
                      )}

                      {item.published_at && (
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(item.published_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section> */}

        {/* NEWS SECTION */}
        <NewsCategory
          categoryName={
            selectedCategory === 'All' ? 'Latest News' : selectedCategory.name
          }
          groupByCategory={selectedCategory === 'All'}
          news={filteredNews}
          loading={newsLoading}
          error={newsError}
          getImageUrl={(item) =>
            // const imageUrl = item.featured_image || item.images?.[0] || '';
            'http://192.168.1.118:8000/storage/news/wkhDPZ2NhlFgssR8pVEe8ZGJuHG2xeZHcduWadjO.jpg' ||
            ''
          }
          onSelect={(item) => navigate(`/news/${item.slug}`)}
        />
      </main>

      <Footer />
    </>
  );
}

export default Home;
