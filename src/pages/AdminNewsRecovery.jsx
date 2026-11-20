import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  LoaderCircle,
  Newspaper,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '@/services/api';
import { getImageUrl } from '@/lib/getImageUrl';
import AdminSidebar from '@/components/layout/AdminSidebar';

const getImagePath = (image) => {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image?.path || image?.url || image?.image || image?.image_path || '';
};

const resolveImage = (image) => {
  const path = getImagePath(image);

  return path ? getImageUrl(path) : '';
};

const getFeaturedImage = (news) => {
  if (!news) {
    return '';
  }

  if (news.featured_image) {
    return resolveImage(news.featured_image);
  }

  if (Array.isArray(news.images) && news.images.length > 0) {
    return resolveImage(news.images[0]);
  }

  return '';
};

const getDeletedNewsList = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

function AdminNewsRecovery() {
  const navigate = useNavigate();

  const [deletedNews, setDeletedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showErrorNotification = useCallback((message) => {
    setError(message);
    setSuccess('');

    window.setTimeout(() => {
      setError((current) => (current === message ? '' : current));
    }, 3500);
  }, []);

  const showSuccessNotification = useCallback((message) => {
    setSuccess(message);
    setError('');

    window.setTimeout(() => {
      setSuccess((current) => (current === message ? '' : current));
    }, 3500);
  }, []);

  const fetchDeletedNews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/posts/deleted', {
        params: {
          page: 1,
          per_page: 100,
        },
      });

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to load deleted news.');
        return;
      }

      const posts = getDeletedNewsList(response.data?.data);

      setDeletedNews(posts);
    } catch (error) {
      console.error('Deleted news fetch error:', error);

      showErrorNotification(
        error.response?.data?.message || error.message || 'Unable to load deleted news.',
      );
    } finally {
      setLoading(false);
    }
  }, [showErrorNotification]);

  useEffect(() => {
    fetchDeletedNews();
  }, [fetchDeletedNews]);

  const handleRestoreNews = async (newsId) => {
    if (!newsId || restoringId) {
      return;
    }

    try {
      setRestoringId(newsId);
      setError('');
      setSuccess('');

      const response = await api.put(`/admin/posts/${newsId}/restore`);

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to restore news.');
        return;
      }

      showSuccessNotification(response.data?.message || 'News restored successfully.');

      await fetchDeletedNews();
    } catch (error) {
      console.error('Restore news error:', error);

      showErrorNotification(
        error.response?.data?.message || error.message || 'Unable to restore news.',
      );
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <AdminSidebar />

      <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px]">
            <div className="flex flex-col gap-4 border-b border-[#EEF0F2] pb-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/news')}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Back to news">
                  <ArrowLeft className="size-4" />
                </button>

                <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2168CD] sm:flex">
                  <RotateCcw className="size-4.5" />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-[#16181A] sm:text-[26px]">
                    News Recovery
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Recover news that has been deleted.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDeletedNews}
                disabled={loading}
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError('')}
                  aria-label="Close error"
                  className="shrink-0">
                  <X className="size-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-700">
                <span>{success}</span>

                <button
                  type="button"
                  onClick={() => setSuccess('')}
                  aria-label="Close success message"
                  className="shrink-0">
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#EEF0F2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <h2 className="text-base font-semibold text-[#16181A]">Deleted News</h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {deletedNews.length} deleted news
                    {deletedNews.length === 1 ? '' : ' items'} found
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <LoaderCircle className="size-5 animate-spin" />
                    <span className="text-sm">Loading deleted news...</span>
                  </div>
                </div>
              ) : deletedNews.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100">
                    <RotateCcw className="size-6 text-slate-400" />
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-slate-800">
                    No deleted news
                  </h3>

                  <p className="mt-1 max-w-md text-xs text-slate-500">
                    Deleted news will appear here and can be recovered.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/news')}
                    className="mt-4 flex h-9 items-center gap-1.5 rounded-xl bg-[#2168CD] px-3.5 text-xs font-semibold text-white transition hover:bg-[#1958B2]">
                    <ArrowLeft className="size-3.5" />
                    Back to News
                  </button>
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b border-[#EEF0F2] bg-[#F8FAFC] text-left">
                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            News
                          </th>

                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            Category
                          </th>

                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            Deleted
                          </th>

                          <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {deletedNews.map((news) => {
                          const imageSrc = getFeaturedImage(news);

                          return (
                            <tr key={news.id} className="transition hover:bg-slate-50/60">
                              <td className="max-w-[450px] px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                    {imageSrc ? (
                                      <img
                                        src={imageSrc}
                                        alt={news.title || 'News'}
                                        className="size-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex size-full items-center justify-center text-slate-400">
                                        <ImageIcon className="size-4.5" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#16181A]">
                                      {news.title || 'Untitled'}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                      {news.excerpt || 'No description'}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-[#2168CD]">
                                  {news.category?.name || 'Uncategorized'}
                                </span>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className="text-xs text-slate-500">
                                  {news.deleted_at
                                    ? new Date(news.deleted_at).toLocaleString()
                                    : 'Deleted'}
                                </span>
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreNews(news.id)}
                                    disabled={restoringId === news.id}
                                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#2168CD] px-3.5 text-xs font-semibold text-white transition hover:bg-[#1958B2] disabled:cursor-not-allowed disabled:opacity-60">
                                    {restoringId === news.id ? (
                                      <>
                                        <LoaderCircle className="size-3.5 animate-spin" />
                                        Recovering...
                                      </>
                                    ) : (
                                      <>
                                        <RotateCcw className="size-3.5" />
                                        Recover
                                      </>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-slate-100 lg:hidden">
                    {deletedNews.map((news) => {
                      const imageSrc = getFeaturedImage(news);

                      return (
                        <div key={news.id} className="p-4 sm:p-5">
                          <div className="flex gap-3">
                            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={news.title || 'News'}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-slate-400">
                                  <ImageIcon className="size-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-sm font-semibold text-[#16181A]">
                                {news.title || 'Untitled'}
                              </h3>

                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                {news.excerpt || 'No description'}
                              </p>

                              <div className="mt-2">
                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-[#2168CD]">
                                  {news.category?.name || 'Uncategorized'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <span className="text-[11px] text-slate-500">
                              {news.deleted_at
                                ? new Date(news.deleted_at).toLocaleString()
                                : 'Deleted'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRestoreNews(news.id)}
                              disabled={restoringId === news.id}
                              className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#2168CD] px-3 text-[11px] font-semibold text-white transition hover:bg-[#1958B2] disabled:cursor-not-allowed disabled:opacity-60">
                              {restoringId === news.id ? (
                                <>
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                  Recovering...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="size-3.5" />
                                  Recover
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminNewsRecovery;
