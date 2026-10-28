import { Link } from "react-router-dom";

function NewsCard({ news }) {
  return (
    <Link to={`/news/${news.slug}`}>
      <article className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
        <img
          src={news.image}
          alt={news.title}
          className="h-52 w-full object-cover"
        />

        <div className="p-5">
          <p className="text-sm font-semibold text-blue-600">
            {news.category}
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {news.title}
          </h2>

          <p className="mt-2 text-gray-600">
            {news.description}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default NewsCard;
