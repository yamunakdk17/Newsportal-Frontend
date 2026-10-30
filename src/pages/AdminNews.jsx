import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Newspaper,
  RefreshCw,
  LoaderCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import api from '@/services/api';
import AdminSidebar from '@/components/layout/AdminSidebar';

function AdminNews() {
  // DATA

  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);

  // LOADING

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // MESSAGES

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // SEARCH

  const [search, setSearch] = useState('');

  // CREATE / EDIT MODAL

  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  // IMAGE GALLERY MODAL

  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);

  // FORM

  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [caption, setCaption] = useState('');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState(5);

  // NEW IMAGE FILES

  const [images, setImages] = useState([]);
  const [featuredImage, setFeaturedImage] = useState(null);

  // IMAGE PREVIEWS

  const [imagePreviews, setImagePreviews] = useState([]);
  const [featuredPreview, setFeaturedPreview] = useState('');

  // IMAGE URL

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const apiUrl = import.meta.env.VITE_API_URL || '';

    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

    return `${baseUrl}/storage/${String(imagePath).replace(/^\/+/, '')}`;
  };

  // FETCH NEWS

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/posts');

      console.log('Admin news response:', response.data);

      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to load news posts.');

        return;
      }

      setNews(response.data.data || []);
    } catch (error) {
      console.error('News fetch error:', error);

      setError(error.response?.data?.message || 'Unable to load news posts.');
    } finally {
      setLoading(false);
    }
  };

  // FETCH CATEGORIES

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await api.get('/admin/categories');

      console.log('Admin categories response:', response.data);

      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to load categories.');

        return;
      }

      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Category fetch error:', error);

      setError(error.response?.data?.message || 'Unable to load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // INITIAL LOAD

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  // RESET FORM

  const resetForm = () => {
    setCategoryId('');
    setTitle('');
    setBody('');
    setCaption('');
    setAuthor('');
    setPriority(5);

    setImages([]);
    setFeaturedImage(null);

    setImagePreviews([]);
    setFeaturedPreview('');
  };

  // OPEN CREATE MODAL

  const openCreateModal = () => {
    setEditingNews(null);

    resetForm();

    setError('');
    setSuccess('');

    setShowModal(true);
  };

  // OPEN EDIT MODAL

  const openEditModal = (article) => {
    setEditingNews(article);

    setCategoryId(
      article.category_id !== null && article.category_id !== undefined
        ? String(article.category_id)
        : '',
    );

    setTitle(article.title || '');
    setBody(article.body || '');
    setCaption(article.caption || '');
    setAuthor(article.author || '');
    setPriority(article.priority ?? 5);

    // New files start empty.
    setImages([]);
    setFeaturedImage(null);
    setImagePreviews([]);
    setFeaturedPreview('');

    setError('');
    setSuccess('');

    setShowModal(true);
  };

  // CLOSE MODAL

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingNews(null);

    resetForm();
  };

  // VALIDATE FORM

  const validateForm = () => {
    const errors = {};

    if (!categoryId) errors.categoryId = 'Please select a category.';
    if (!title.trim()) errors.title = 'Title is required.';
    if (!body.trim()) errors.body = 'Body is required.';

    if (priority === '' || priority === null || priority === undefined) {
      errors.priority = 'Priority is required.';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };
  // CREATE NEWS

  const handleCreateNews = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('body', body.trim());
      formData.append('category_id', Number(categoryId));
      formData.append('is_published', true);
      formData.append('priority', Number(priority));

      if (caption.trim()) formData.append('caption', caption.trim());
      if (author.trim()) formData.append('author', author.trim());

      images.forEach((file) => {
        formData.append('images[]', file, file.name);
      });

      if (featuredImage instanceof File) {
        formData.append('featured_image', featuredImage, featuredImage.name);
      }

      // debug: shows what is actually being sent
      for (const [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? `File(${value.name})` : value);
      }

      const response = await api.post('/admin/posts', formData);

      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to create news.');
        return;
      }

      setSuccess(response.data.message || 'News created successfully.');
      setShowModal(false);
      setEditingNews(null);
      resetForm();
      await fetchNews();
    } catch (error) {
      console.error('Create news error:', error);
      setError(getBackendError(error));
    } finally {
      setSaving(false);
    }
  };

  // UPDATE NEWS

  const handleUpdateNews = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!editingNews?.id) {
      setError('No news post selected for editing.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('body', body.trim());
      formData.append('category_id', Number(categoryId));
      formData.append('priority', Number(priority));

      formData.append('caption', caption.trim());
      formData.append('author', author.trim());

      // Send multiple images
      images.forEach((file) => {
        formData.append('images[]', file);
      });

      // Send featured image
      if (featuredImage) {
        formData.append('featured_image', featuredImage);
      }

      const response = await api.put(`/admin/posts/${editingNews.id}`, formData);

      console.log('Update news response:', response.data);

      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to update news.');

        return;
      }

      setSuccess(response.data.message || 'News updated successfully.');

      setShowModal(false);
      setEditingNews(null);

      resetForm();

      // Fetch fresh backend data.
      await fetchNews();
    } catch (error) {
      console.error('Update news error:', error);

      setError(getBackendError(error));
    } finally {
      setSaving(false);
    }
  };

  // DELETE NEWS

  const handleDeleteNews = async (article) => {
    if (!article?.id) {
      setError('Invalid news post.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${article.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(article.id);
      setError('');
      setSuccess('');

      console.log(`Deleting news ${article.id}`);

      const response = await api.delete(`/admin/posts/${article.id}`);

      console.log('Delete news response:', response.data);

      if (!response.data?.success) {
        setError(response.data?.message || 'Unable to delete news.');

        return;
      }

      // Immediately remove from UI.
      setNews((currentNews) => currentNews.filter((item) => item.id !== article.id));

      setSuccess(response.data.message || 'News deleted successfully.');
    } catch (error) {
      console.error('Delete news error:', error);

      setError(getBackendError(error));
    } finally {
      setDeletingId(null);
    }
  };

  // BACKEND ERROR HELPER

  const getBackendError = (error) => {
    const backendErrors = error.response?.data?.errors;

    if (backendErrors) {
      const firstError = Object.values(backendErrors)?.[0]?.[0];

      if (firstError) {
        return firstError;
      }
    }

    return error.response?.data?.message || 'Something went wrong. Please try again.';
  };

  // MULTIPLE IMAGE FILE SELECT

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (images.length + selectedFiles.length > 3) {
      setError('You can upload a maximum of 3 images.');
      e.target.value = '';
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
    });

    if (validFiles.length !== selectedFiles.length) {
      setError('Only JPG, JPEG, PNG and WEBP images up to 5 MB are allowed.');
    } else {
      setError('');
    }

    setImages((current) => [...current, ...validFiles]);

    setImagePreviews((current) => [
      ...current,
      ...validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    ]);

    e.target.value = '';
  };

  // FEATURED IMAGE SELECT

  const handleFeaturedImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    setFeaturedImage(file);

    if (file) {
      setFeaturedPreview(URL.createObjectURL(file));
    } else {
      setFeaturedPreview('');
    }
  };

  // OPEN IMAGE GALLERY

  const openGallery = (article) => {
    const backendImages = [];

    // Featured image first.
    if (article.featured_image) {
      backendImages.push(article.featured_image);
    }

    // Add all multiple images.
    if (Array.isArray(article.images)) {
      article.images.forEach((image) => {
        if (image && !backendImages.includes(image)) {
          backendImages.push(image);
        }
      });
    }

    if (backendImages.length === 0) {
      return;
    }

    setGalleryImages(backendImages);
    setGalleryTitle(article.title || 'News Images');
    setGalleryIndex(0);
    setShowGallery(true);
  };

  // CLOSE GALLERY

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryImages([]);
    setGalleryTitle('');
    setGalleryIndex(0);
  };

  // NEXT IMAGE

  const nextGalleryImage = () => {
    if (!galleryImages.length) {
      return;
    }

    setGalleryIndex((currentIndex) => (currentIndex + 1) % galleryImages.length);
  };

  // PREVIOUS IMAGE

  const previousGalleryImage = () => {
    if (!galleryImages.length) {
      return;
    }

    setGalleryIndex(
      (currentIndex) => (currentIndex - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  // SEARCH

  const filteredNews = news.filter((article) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    const titleText = article.title?.toLowerCase() || '';

    const categoryText = article.category?.name?.toLowerCase() || '';

    const authorText =
      article.author?.toLowerCase() || article.added_by?.toLowerCase() || '';

    const bodyText = article.body?.toLowerCase() || '';

    return (
      titleText.includes(searchText) ||
      categoryText.includes(searchText) ||
      authorText.includes(searchText) ||
      bodyText.includes(searchText)
    );
  });

  // CATEGORY NAME

  const getCategoryName = (article) => {
    // Backend relationship is the first source.
    if (article.category?.name) {
      return article.category.name;
    }

    // Fallback to backend-loaded categories.
    const category = categories.find(
      (item) => Number(item.id) === Number(article.category_id),
    );

    return category?.name || 'No Category';
  };

  // DATE

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString();
  };

  // GET ALL BACKEND IMAGES

  const getArticleImages = (article) => {
    const result = [];

    if (article.featured_image) {
      result.push(article.featured_image);
    }

    if (Array.isArray(article.images)) {
      article.images.forEach((image) => {
        if (image && !result.includes(image)) {
          result.push(image);
        }
      });
    }

    return result;
  };

  // RENDER

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="ml-64 min-h-screen">
        {/*
            HEADER
         */}

        <div className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Newspaper className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">News Posts</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create and manage news articles.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create News
            </button>
          </div>
        </div>

        {/*
            CONTENT
         */}

        <div className="p-8">
          {/* SUCCESS */}

          {success && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess('')}
                className="text-green-500 hover:text-green-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/*
              SEARCH / REFRESH
           */}

          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search news..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* ===================================================
              TABLE
          =================================================== */}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Loading news...
                </div>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <Newspaper className="mb-4 h-10 w-10 text-slate-300" />

                <h2 className="text-lg font-semibold text-slate-900">
                  No news posts found
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create your first news article.
                </p>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create News
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        News
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Images
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Author
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredNews.map((article) => {
                      const articleImages = getArticleImages(article);

                      return (
                        <tr
                          key={article.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          {/* NEWS */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                {article.featured_image ? (
                                  <img
                                    src={getImageUrl(article.featured_image)}
                                    alt={article.title || 'News'}
                                    className="h-full w-full object-cover"
                                  />
                                ) : article.images?.length > 0 ? (
                                  <img
                                    src={getImageUrl(article.images[0])}
                                    alt={article.title || 'News'}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-slate-400" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="line-clamp-2 font-semibold text-slate-900">
                                  {article.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  ID: {article.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* MULTIPLE IMAGES */}

                          <td className="px-6 py-5">
                            {articleImages.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => openGallery(article)}
                                className="group flex items-center gap-2"
                                title="View all images">
                                <div className="flex -space-x-2">
                                  {articleImages.slice(0, 3).map((image, index) => (
                                    <img
                                      key={`${image}-${index}`}
                                      src={getImageUrl(image)}
                                      alt=""
                                      className="h-9 w-9 rounded-lg border-2 border-white object-cover"
                                    />
                                  ))}
                                </div>

                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 group-hover:bg-blue-100">
                                  {articleImages.length}{' '}
                                  {articleImages.length === 1 ? 'image' : 'images'}
                                </span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">No images</span>
                            )}
                          </td>

                          {/* CATEGORY */}

                          <td className="px-6 py-5">
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {getCategoryName(article)}
                            </span>
                          </td>

                          {/* AUTHOR */}

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {article.author || article.added_by || 'Admin'}
                          </td>

                          {/* PRIORITY */}

                          <td className="px-6 py-5">
                            <span className="font-semibold text-slate-700">
                              {article.priority ?? '-'}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">
                            {article.is_published ? (
                              <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                                Draft
                              </span>
                            )}
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(article.created_at)}
                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() => openEditModal(article)}
                                disabled={deletingId === article.id}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Edit news">
                                <Pencil className="h-4 w-4" />
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() => handleDeleteNews(article)}
                                disabled={deletingId === article.id}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete news">
                                {deletingId === article.id ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
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
            )}
          </div>

          {/* COUNT */}

          {!loading && (
            <div className="mt-4 text-sm text-slate-500">
              Showing {filteredNews.length} of {news.length} news post
              {news.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </main>

      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingNews ? 'Edit News' : 'Create News'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingNews ? 'Update this news article.' : 'Add a new news article.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={editingNews ? handleUpdateNews : handleCreateNews}
              className="space-y-6 p-6">
              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>

                <select
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setFormErrors((prev) => ({ ...prev, categoryId: '' }));
                  }}
                  disabled={categoriesLoading || saving}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50">
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {formErrors.categoryId && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.categoryId}</p>
                )}

                <p className="mt-1.5 text-xs text-slate-400">
                  Categories are loaded from the backend.
                </p>
              </div>

              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Title <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setFormErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="Enter news title"
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />

                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>
                )}
              </div>

              {/* BODY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Body <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={body}
                  onChange={(event) => {
                    setBody(event.target.value);
                    setFormErrors((prev) => ({ ...prev, body: '' }));
                  }}
                  placeholder="Write the full news article..."
                  rows={8}
                  disabled={saving}
                  className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />

                {formErrors.body && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.body}</p>
                )}
              </div>

              {/* CAPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Caption
                </label>

                <input
                  type="text"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Enter caption"
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* AUTHOR */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Author Name
                </label>

                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="Enter author name"
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* PRIORITY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Priority <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priority}
                  onChange={(event) => {
                    setPriority(event.target.value);
                    setFormErrors((prev) => ({ ...prev, priority: '' }));
                  }}
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />

                {formErrors.priority && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.priority}</p>
                )}
              </div>

              {/* EXISTING BACKEND IMAGES */}
              {editingNews && getArticleImages(editingNews).length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Existing Images
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Images currently stored by the backend.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {getArticleImages(editingNews).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => openGallery(editingNews)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img
                          src={getImageUrl(image)}
                          alt={`${editingNews.title} ${index + 1}`}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />

                        {index === 0 && editingNews.featured_image && (
                          <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
                            Featured
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MULTIPLE NEW IMAGES */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <ImageIcon className="h-5 w-5 text-slate-500" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">News Images</h3>

                    <p className="text-xs text-slate-500">
                      Select multiple images (maximum 3).
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={handleImagesChange}
                  disabled={saving}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />

                {imagePreviews.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''}{' '}
                      selected
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`${preview.file.name}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <img
                            src={preview.url}
                            alt={preview.file.name}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => {
                              URL.revokeObjectURL(preview.url);

                              setImages((current) =>
                                current.filter((_, imageIndex) => imageIndex !== index),
                              );

                              setImagePreviews((current) =>
                                current.filter((_, imageIndex) => imageIndex !== index),
                              );
                            }}
                            className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow hover:bg-red-700">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* FEATURED IMAGE */}
              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Featured Image
                    </h3>

                    <p className="text-xs text-slate-500">Select one featured image.</p>
                  </div>
                </div>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFeaturedImageChange}
                  disabled={saving}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-200"
                />

                {featuredPreview && (
                  <div className="mt-4">
                    <div className="relative aspect-video max-w-sm overflow-hidden rounded-xl border border-blue-100 bg-white">
                      <img
                        src={featuredPreview}
                        alt="Selected featured"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          URL.revokeObjectURL(featuredPreview);
                          setFeaturedImage(null);
                          setFeaturedPreview('');
                        }}
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow hover:bg-red-700">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || categoriesLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}

                  {saving ? 'Saving...' : editingNews ? 'Update News' : 'Create News'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          IMAGE GALLERY MODAL
      ======================================================= */}

      {showGallery && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col">
            {/* GALLERY HEADER */}

            <div className="mb-4 flex items-center justify-between text-white">
              <div>
                <h2 className="text-lg font-semibold">{galleryTitle}</h2>

                <p className="text-sm text-white/70">
                  Image {galleryIndex + 1} of {galleryImages.length}
                </p>
              </div>

              <button
                type="button"
                onClick={closeGallery}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MAIN IMAGE */}

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <img
                src={getImageUrl(galleryImages[galleryIndex])}
                alt={galleryTitle}
                className="max-h-full max-w-full rounded-xl object-contain"
              />

              {/* PREVIOUS */}

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={previousGalleryImage}
                  className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white sm:left-6">
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* NEXT */}

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={nextGalleryImage}
                  className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white sm:right-6">
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* THUMBNAILS */}

            {galleryImages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setGalleryIndex(index)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                      galleryIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}>
                    <img
                      src={getImageUrl(image)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNews;
