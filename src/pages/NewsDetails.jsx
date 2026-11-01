import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import api from '@/services/api';

function NewsDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/news/${slug}`);

        console.log('News details:', response.data);

        if (!response.data?.success) {
          setError(response.data?.message || 'News not found.');
          return;
        }

        setNews(response.data.data);
      } catch (error) {
        console.error('News details error:', error);

        setError(error.response?.data?.message || 'Unable to load news.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNewsDetails();
    }
  }, [slug]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '';
    }

    let imageUrl = String(imagePath).trim();

    // Backend returns /storage/...
    if (imageUrl.startsWith('/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      const backendUrl = apiUrl.replace(/\/api\/?$/, '');

      return `${backendUrl}${imageUrl}`;
    }

    // Backend may return http://localhost:8000/...
    if (
      imageUrl.startsWith('http://localhost:') ||
      imageUrl.startsWith('https://localhost:')
    ) {
      try {
        const image = new URL(imageUrl);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        const backend = new URL(apiUrl.replace(/\/api\/?$/, ''));

        image.protocol = backend.protocol;
        image.hostname = backend.hostname;
        image.port = backend.port;

        return image.toString();
      } catch {
        return imageUrl;
      }
    }

    return imageUrl;
  };

  // Loading
  if (loading) {
    return (
      <>
        <Header />
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <p className="text-gray-500">Loading news...</p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // Error / not found
  if (error || !news) {
    return (
      <>
        <Header />
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold">News not found</h1>

            <p className="mt-2 text-gray-500">
              {error || 'This news article does not exist.'}
            </p>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">
              Back to Home
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const featuredImage = news.featured_image || news.images?.[0] || '';

  return (
    <>
      <Header />

      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-semibold text-blue-600 hover:text-blue-800">
          ← Back
        </button>

        {/* Category */}
        {news.category?.name && (
          <p className="text-sm font-semibold uppercase text-blue-600">
            {news.category.name}
          </p>
        )}

        {/* Title */}
        <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900">
          {news.title}
        </h1>

        {/* Author / date */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
          {news.author && <span>By {news.author}</span>}

          {news.published_at && (
            <span>{new Date(news.published_at).toLocaleDateString()}</span>
          )}

          {news.added_by && <span>Added by {news.added_by}</span>}
        </div>

        {/* Featured image */}
        {featuredImage && (
          <img
            src={getImageUrl(featuredImage)}
            alt={news.title}
            className="mt-8 max-h-[600px] w-full rounded-xl object-cover"
          />
        )}

        {/* Caption */}
        {news.caption && (
          <p className="mt-3 text-sm italic text-gray-500">{news.caption}</p>
        )}

        {/* Full news body */}
        {news.body && (
          <article className="mt-8">
            <div className="whitespace-pre-wrap text-lg leading-8 text-gray-700">
              {news.body}
            </div>
          </article>
        )}

        {/* Other images */}
        {news.images?.length > 1 && (
          <section className="mt-10">
            <h2 className="mb-5 text-2xl font-bold">Photos</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {news.images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={getImageUrl(image)}
                  alt={`${news.title} ${index + 1}`}
                  className="h-72 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default NewsDetails;
