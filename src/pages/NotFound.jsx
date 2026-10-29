import { Link, useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        {/* Big 404 — the 0 is replaced by a compass so the whole thing scales together */}
        <div
          className="flex items-center justify-center gap-1 text-[6.5rem] font-black leading-none tracking-tighter text-slate-900 sm:gap-2 sm:text-[10rem] md:text-[13rem]"
          role="img"
          aria-label="Error 404">
          <span>4</span>

          <span className="relative flex h-[0.8em] w-[0.8em] items-center justify-center rounded-full bg-blue-600 shadow-xl shadow-blue-600/30">
            <span className="absolute inset-[0.06em] rounded-full border-[0.02em] border-white/30" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[0.42em] w-[0.42em] text-white motion-safe:animate-pulse"
              aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill="currentColor" />
            </svg>
          </span>

          <span>4</span>
        </div>

        <h1 className="mt-8 text-2xl font-bold text-slate-900 sm:text-4xl">
          This page could not be found
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
          The link may be broken, or the page may have been moved or removed. Check the
          address, or head back to somewhere familiar.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            Go to home
          </Link>

          {/* <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-7 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            Go back
          </button> */}
        </div>
      </div>
    </main>
  );
}

export default NotFound;
