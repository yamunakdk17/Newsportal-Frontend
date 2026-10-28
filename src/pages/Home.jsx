import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsCard from "@/components/news/NewsCard";

import newsData from "@/data/newsData";

function Home() {
  return (
    <>
      <Header />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">
          Latest News
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          {newsData.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
            />
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Home;
