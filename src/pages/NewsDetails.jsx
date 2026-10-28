import { useParams } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import newsData from '@/data/newsData';

function NewsDetails() {
  // Get slug from URL
  const { slug } = useParams();

  // Find news that has the same slug
  const news = newsData.find((item) => item.slug === slug);

  // If slug does not match any news
  if (!news) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">News not found</h1>
      </div>
    );
  }

  // Show the matching news
  return (
    <>
      <Header />

      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Category */}
        <p className="text-sm font-semibold text-blue-600">{news.category}</p>

        {/* Title */}
        <h1 className="mt-2 text-4xl font-bold">{news.title}</h1>

        {/* Image */}
        <img
          src={news.image}
          alt={news.title}
          className="mt-6 h-96 w-full rounded-xl object-cover"
        />

        {/* Description */}
        <p className="mt-6 text-lg text-gray-600">{news.description}</p>

        {/* Full Content */}
        <div className="mt-6 leading-8">{news.content}</div>
      </main>

      <Footer />
    </>
  );
}

export default NewsDetails;
