// import { Link } from 'react-router-dom';
// import { getNewsImageUrl } from '@/lib/news';

// function NewsCard({ news }) {
//   const image = getNewsImageUrl(news?.featured_image || news?.images?.[0]);
//   const title = news?.title || 'Untitled news';
//   const category = news?.category?.name || 'News';
//   const description = news?.excerpt || news?.description || '';

//   const card = (
//     <article className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
//       {image ? (
//         <img src={image} alt={title} className="h-52 w-full object-cover" />
//       ) : (
//         <div className="flex h-52 w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
//           No image available
//         </div>
//       )}

//       <div className="p-5">
//         <p className="text-sm font-semibold text-blue-600">{category}</p>

//         <h2 className="mt-2 text-xl font-bold">{title}</h2>

//         {description && <p className="mt-2 text-gray-600">{description}</p>}
//       </div>
//     </article>
//   );

//   return news?.slug ? <Link to={`/news/${news.slug}`}>{card}</Link> : card;
// }

// export default NewsCard;
