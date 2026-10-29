const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

import { useEffect, useState } from 'react';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NewsCard from '@/components/news/NewsCard';

import api from '@/services/api';
function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/categories');

        console.log('User categories:', response.data);

        if (response.data.success) {
          setCategories(response.data.data || []);
        } else {
          setError(response.data.message || 'Failed to load categories.');
        }
      } catch (error) {
        console.error('Get user categories error:', error);

        setError(error.response?.data?.message || 'Unable to load categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Latest News</h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
