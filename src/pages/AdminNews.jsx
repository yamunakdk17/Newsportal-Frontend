import { useEffect, useMemo, useState } from 'react';
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
import AdminNewsForm from '@/components/admin/AdminNewsForm';

function AdminNews() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [caption, setCaption] = useState('');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState('medium');
  const [excerpt, setExcerpt] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState([]);
  const [featuredImage, setFeaturedImage] = useState(null);

  const [imagePreviews, setImagePreviews] = useState([]);
  const [featuredPreview, setFeaturedPreview] = useState('');

  const showErrorNotification = (message) => {
    setError(message);
    setSuccess('');

    window.setTimeout(() => {
      setError((current) => (current === message ? '' : current));
    }, 3500);
  };

  const showSuccessNotification = (message) => {
    setSuccess(message);
    setError('');

    window.setTimeout(() => {
      setSuccess((current) => (current === message ? '' : current));
    }, 3500);
  };

  const isTrue = (value) => {
    return value === true || value === 1 || value === '1' || value === 'true';
  };

  const normalizePriority = (value) => {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();

    return ['high', 'medium', 'low'].includes(normalized) ? normalized : 'medium';
  };

  const getBackendError = (error) => {
    const backendErrors = error.response?.data?.errors;

    if (backendErrors) {
      const firstError = Object.values(backendErrors)?.[0]?.[0];

      if (firstError) {
        return firstError;
      }
    }

    return (
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    );
  };

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

  const fetchNews = async () => {
    try {
      setLoading(true);

      const response = await api.get('/admin/posts', {
        params: {
          page: 1,
          per_page: 50,
        },
      });

      console.log('Admin news response:', response.data);

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to load news.');
        return;
      }

      const responseData = response.data?.data;

      let posts = [];

      if (Array.isArray(responseData)) {
        posts = responseData;
      } else if (Array.isArray(responseData?.data)) {
        posts = responseData.data;
      }

      setNews(posts);
    } catch (error) {
      console.error('News fetch error:', error);

      showErrorNotification(
        error.response?.data?.message || error.message || 'Unable to load news.',
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await api.get('/admin/categories', {
        params: {
          page: 1,
          per_page: 100,
        },
      });

      console.log('Admin categories response:', response.data);

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to load categories.');
        return;
      }

      const responseData = response.data?.data;

      let categoryList = [];

      if (Array.isArray(responseData)) {
        categoryList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        categoryList = responseData.data;
      }

      setCategories(categoryList);
    } catch (error) {
      console.error('Category fetch error:', error);

      showErrorNotification(
        error.response?.data?.message || error.message || 'Unable to load categories.',
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const resetForm = () => {
    imagePreviews.forEach((preview) => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    });

    if (featuredPreview) {
      URL.revokeObjectURL(featuredPreview);
    }

    setCategoryId('');
    setTitle('');
    setExcerpt('');
    setBody('');
    setCaption('');
    setAuthor('');
    setPriority('medium');

    setIsPublished(false);
    setIsFeatured(false);

    setImages([]);
    setFeaturedImage(null);

    setImagePreviews([]);
    setFeaturedPreview('');

    setFormErrors({});
  };

  const openCreateModal = () => {
    setEditingNews(null);
    resetForm();

    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (article) => {
    setEditingNews(article);

    setCategoryId(
      article.category_id !== null && article.category_id !== undefined
        ? String(article.category_id)
        : '',
    );

    setTitle(article.title || '');
    setExcerpt(article.excerpt || '');
    setBody(article.body || '');
    setCaption(article.caption || '');

    setAuthor(article.author || article.added_by || '');

    setPriority(normalizePriority(article.priority));

    setIsPublished(isTrue(article.is_published));
    setIsFeatured(isTrue(article.is_featured));

    setImages([]);
    setFeaturedImage(null);

    setImagePreviews([]);
    setFeaturedPreview('');

    setFormErrors({});
    setError('');
    setSuccess('');

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingNews(null);

    resetForm();
  };

  const validateForm = () => {
    const errors = {};

    if (!categoryId) {
      errors.categoryId = 'Please select a category.';
    }

    if (!title.trim()) {
      errors.title = 'Title is required.';
    }

    if (!body.trim()) {
      errors.body = 'Body is required.';
    }

    if (!['high', 'medium', 'low'].includes(priority)) {
      errors.priority = 'Please select a priority.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.categoryId) {
        showErrorNotification('Please select a category.');
      } else if (errors.title) {
        showErrorNotification('Please enter a news title.');
      } else if (errors.body) {
        showErrorNotification('Please enter the news body.');
      } else if (errors.priority) {
        showErrorNotification('Please select a priority.');
      }

      return false;
    }

    return true;
  };

  const buildNewsFormData = () => {
    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('excerpt', excerpt.trim());
    formData.append('body', body.trim());
    formData.append('category_id', String(Number(categoryId)));
    formData.append('is_published', isPublished ? '1' : '0');
    formData.append('is_featured', isFeatured ? '1' : '0');
    formData.append('priority', priority);
    formData.append('caption', caption.trim());
    formData.append('author', author.trim());

    images.forEach((file) => {
      formData.append('images[]', file, file.name);
    });

    if (featuredImage instanceof File) {
      formData.append('featured_image', featuredImage, featuredImage.name);
    }

    return formData;
  };

  const handleCreateNews = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const formData = buildNewsFormData();

      const response = await api.post('/admin/posts', formData);

      console.log('Create news response:', response.data);

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to create news.');
        return;
      }

      const message = response.data.message || 'News created successfully.';

      // Close modal
      setShowModal(false);
      setEditingNews(null);

      // Clear form
      resetForm();

      // IMPORTANT:
      // Clear search so the new article is shown in the normal News page.
      setSearch('');

      // Reload news list
      await fetchNews();

      // Show success message
      showSuccessNotification(message);
    } catch (error) {
      console.error('Create news error:', error);

      showErrorNotification(getBackendError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNews = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!editingNews?.id) {
      showErrorNotification('No news post selected for editing.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const formData = buildNewsFormData();

      const response = await api.put(`/admin/posts/${editingNews.id}`, formData);

      console.log('Update news response:', response.data);

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to update news.');
        return;
      }

      const message = response.data.message || 'News updated successfully.';

      setShowModal(false);
      setEditingNews(null);

      resetForm();

      showSuccessNotification(message);

      await fetchNews();
    } catch (error) {
      console.error('Update news error:', error);

      showErrorNotification(getBackendError(error));
    } finally {
      setSaving(false);
    }
  };

  const handlePublishNews = async (postId) => {
    try {
      setError('');
      setSuccess('');

      const response = await api.put(`/admin/posts/${postId}`, {
        is_published: true,
      });

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to publish news.');
        return;
      }

      setNews((currentNews) =>
        currentNews.map((article) =>
          article.id === postId
            ? {
                ...article,
                is_published: true,
                published_at: response.data?.data?.published_at || article.published_at,
              }
            : article,
        ),
      );

      showSuccessNotification(response.data?.message || 'News published successfully.');
    } catch (error) {
      console.error('Publish news error:', error);

      showErrorNotification(getBackendError(error));
    }
  };

  const handleDeleteNews = async (article) => {
    if (!article?.id) {
      showErrorNotification('Invalid news post.');
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

      const response = await api.delete(`/admin/posts/${article.id}`);

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to delete news.');
        return;
      }

      setNews((currentNews) => currentNews.filter((item) => item.id !== article.id));

      showSuccessNotification(response.data.message || 'News deleted successfully.');
    } catch (error) {
      console.error('Delete news error:', error);

      showErrorNotification(getBackendError(error));
    } finally {
      setDeletingId(null);
    }
  };

  const handleImagesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (images.length + selectedFiles.length > 3) {
      showErrorNotification('You can upload a maximum of 3 images.');

      event.target.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    const validFiles = selectedFiles.filter(
      (file) => validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== selectedFiles.length) {
      showErrorNotification(
        'Only JPG, JPEG, PNG and WEBP images up to 5 MB are allowed.',
      );
    }

    setImages((current) => [...current, ...validFiles]);

    setImagePreviews((current) => [
      ...current,
      ...validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    ]);

    event.target.value = '';
  };

  const handleFeaturedImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      showErrorNotification('Only JPG, JPEG, PNG and WEBP images are allowed.');

      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorNotification('Featured image must be 5 MB or less.');

      event.target.value = '';
      return;
    }

    if (featuredPreview) {
      URL.revokeObjectURL(featuredPreview);
    }

    setFeaturedImage(file);
    setFeaturedPreview(URL.createObjectURL(file));
  };

  const removeImage = (index) => {
    const preview = imagePreviews[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));

    setImagePreviews((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const removeFeaturedImage = () => {
    if (featuredPreview) {
      URL.revokeObjectURL(featuredPreview);
    }

    setFeaturedImage(null);
    setFeaturedPreview('');
  };

  const filteredNews = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return news;
    }

    return news.filter((article) => {
      return (
        article.title?.toLowerCase().includes(keyword) ||
        article.slug?.toLowerCase().includes(keyword) ||
        article.category?.name?.toLowerCase().includes(keyword)
      );
    });
  }, [news, search]);

  const getArticleImages = (article) => {
    if (!Array.isArray(article?.images)) {
      return [];
    }

    return article.images
      .map((image) => {
        if (typeof image === 'string') {
          return getImageUrl(image);
        }

        return getImageUrl(
          image?.path || image?.url || image?.image || image?.image_path || '',
        );
      })
      .filter(Boolean);
  };

  const openGallery = (article) => {
    const articleImages = getArticleImages(article);

    if (articleImages.length === 0) {
      showErrorNotification('No images available for this article.');
      return;
    }

    setGalleryImages(articleImages);
    setGalleryTitle(article.title || 'News Images');
    setGalleryIndex(0);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryImages([]);
    setGalleryIndex(0);
    setGalleryTitle('');
  };

  const previousGalleryImage = () => {
    setGalleryIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    );
  };

  const nextGalleryImage = () => {
    setGalleryIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1,
    );
  };

  const getStatus = (article) => {
    return isTrue(article.is_published) ? 'Published' : 'Draft';
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <AdminSidebar />

      <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px]">
            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-[#EEF0F2] pb-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2168CD] sm:flex">
                    <Newspaper className="size-4.5" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold tracking-tight text-[#16181A] sm:text-[26px]">
                      News
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your news articles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2.5 sm:flex-row md:w-auto">
                <div className="relative min-w-0 flex-1 sm:w-[260px] md:w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search articles..."
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#16181A] outline-none transition placeholder:text-slate-400 focus:border-[#2168CD] focus:ring-2 focus:ring-[#2168CD]/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2168CD] px-4 text-sm font-semibold text-white transition hover:bg-[#1958B2]">
                  <Plus className="size-4" />
                  New News
                </button>
              </div>
            </div>

            {/* Notifications */}

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

            {/* Articles */}

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#EEF0F2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <h2 className="text-base font-semibold text-[#16181A]">All Articles</h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {filteredNews.length} article
                    {filteredNews.length === 1 ? '' : 's'} found
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    fetchNews();
                    fetchCategories();
                  }}
                  disabled={loading}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                  <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <LoaderCircle className="size-5 animate-spin" />

                    <span className="text-sm">Loading news...</span>
                  </div>
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100">
                    <Newspaper className="size-6 text-slate-400" />
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-slate-800">
                    No articles found
                  </h3>

                  <p className="mt-1 max-w-md text-xs text-slate-500">
                    {search
                      ? 'Try changing your search keyword.'
                      : 'Create your first news article to get started.'}
                  </p>

                  {!search && (
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="mt-4 flex h-9 items-center gap-1.5 rounded-xl bg-[#2168CD] px-3.5 text-xs font-semibold text-white transition hover:bg-[#1958B2]">
                      <Plus className="size-3.5" />
                      Create Article
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop */}

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[920px]">
                      <thead>
                        <tr className="border-b border-[#EEF0F2] bg-[#F8FAFC] text-left">
                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            Article
                          </th>

                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            Category
                          </th>

                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            Priority
                          </th>

                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
                            Images
                          </th>

                          <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredNews.map((article) => {
                          const articleImages = getArticleImages(article);

                          const published = isTrue(article.is_published);

                          const articlePriority = normalizePriority(article.priority);

                          return (
                            <tr
                              key={article.id}
                              className="transition hover:bg-slate-50/60">
                              <td className="max-w-[420px] px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                    {article.featured_image ? (
                                      <img
                                        src={getImageUrl(article.featured_image)}
                                        alt={article.title || 'News'}
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
                                      {article.title || 'Untitled'}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                      {article.excerpt ||
                                        article.slug ||
                                        'No description'}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-[#2168CD]">
                                  {article.category?.name || 'Uncategorized'}
                                </span>
                              </td>

                              <td className="px-5 py-3.5">
                                <span
                                  className={`text-xs font-semibold capitalize ${
                                    articlePriority === 'high'
                                      ? 'text-red-600'
                                      : articlePriority === 'low'
                                        ? 'text-slate-500'
                                        : 'text-amber-600'
                                  }`}>
                                  {articlePriority}
                                </span>
                              </td>

                              {/* Status + Publish */}

                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                      published
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {getStatus(article)}
                                  </span>

                                  {!published && (
                                    <button
                                      type="button"
                                      onClick={() => handlePublishNews(article.id)}
                                      className="h-7 rounded-lg bg-green-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-green-700">
                                      Publish
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                {articleImages.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => openGallery(article)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-[#2168CD] hover:underline">
                                    <ImageIcon className="size-3.5" />
                                    {articleImages.length} image
                                    {articleImages.length === 1 ? '' : 's'}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    No images
                                  </span>
                                )}
                              </td>

                              {/* Actions */}

                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(article)}
                                    className="flex size-8.5 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2168CD]"
                                    title="Edit">
                                    <Pencil className="size-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNews(article)}
                                    disabled={deletingId === article.id}
                                    className="flex size-8.5 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                    title="Delete">
                                    {deletingId === article.id ? (
                                      <LoaderCircle className="size-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-3.5" />
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

                  {/* Mobile */}

                  <div className="divide-y divide-slate-100 lg:hidden">
                    {filteredNews.map((article) => {
                      const articleImages = getArticleImages(article);

                      const published = isTrue(article.is_published);

                      return (
                        <div key={article.id} className="p-4 sm:p-5">
                          <div className="flex gap-3">
                            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              {article.featured_image ? (
                                <img
                                  src={getImageUrl(article.featured_image)}
                                  alt={article.title || 'News'}
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
                                {article.title || 'Untitled'}
                              </h3>

                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                {article.excerpt || 'No description'}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-[#2168CD]">
                                  {article.category?.name || 'Uncategorized'}
                                </span>

                                <span
                                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                    published
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                  {getStatus(article)}
                                </span>

                                {!published && (
                                  <button
                                    type="button"
                                    onClick={() => handlePublishNews(article.id)}
                                    className="h-7 rounded-lg bg-green-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-green-700">
                                    Publish
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-medium capitalize text-slate-500">
                                Priority: {normalizePriority(article.priority)}
                              </span>

                              {articleImages.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => openGallery(article)}
                                  className="flex items-center gap-1 text-[11px] font-medium text-[#2168CD]">
                                  <ImageIcon className="size-3.5" />

                                  {articleImages.length}
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(article)}
                                className="flex size-8.5 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                title="Edit">
                                <Pencil className="size-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteNews(article)}
                                disabled={deletingId === article.id}
                                className="flex size-8.5 items-center justify-center rounded-lg border border-red-200 text-red-600 disabled:opacity-50"
                                title="Delete">
                                {deletingId === article.id ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                              </button>
                            </div>
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

      {/* FORM */}

      {showModal && (
        <AdminNewsForm
          editingNews={editingNews}
          categories={categories}
          categoriesLoading={categoriesLoading}
          saving={saving}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          title={title}
          setTitle={setTitle}
          excerpt={excerpt}
          setExcerpt={setExcerpt}
          body={body}
          setBody={setBody}
          caption={caption}
          setCaption={setCaption}
          author={author}
          setAuthor={setAuthor}
          priority={priority}
          setPriority={setPriority}
          isPublished={isPublished}
          setIsPublished={setIsPublished}
          isFeatured={isFeatured}
          setIsFeatured={setIsFeatured}
          images={images}
          setImages={setImages}
          featuredImage={featuredImage}
          setFeaturedImage={setFeaturedImage}
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
          featuredPreview={featuredPreview}
          setFeaturedPreview={setFeaturedPreview}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          handleCreateNews={handleCreateNews}
          handleUpdateNews={handleUpdateNews}
          handleImagesChange={handleImagesChange}
          handleFeaturedImageChange={handleFeaturedImageChange}
          removeImage={removeImage}
          removeFeaturedImage={removeFeaturedImage}
          closeModal={closeModal}
          getImageUrl={getImageUrl}
        />
      )}

      {/* GALLERY */}

      {showGallery && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6">
          <button
            type="button"
            onClick={closeGallery}
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close gallery">
            <X className="size-5" />
          </button>

          <div className="flex w-full max-w-5xl flex-col items-center">
            <div className="mb-3 max-w-full px-12 text-center">
              <h2 className="truncate text-base font-semibold text-white sm:text-lg">
                {galleryTitle}
              </h2>

              <p className="mt-1 text-xs text-white/70">
                {galleryIndex + 1} / {galleryImages.length}
              </p>
            </div>

            <div className="relative flex w-full items-center justify-center">
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={previousGalleryImage}
                  className="absolute left-1 z-10 flex size-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl transition hover:bg-slate-100 sm:left-3"
                  aria-label="Previous image">
                  <ChevronLeft className="size-5" />
                </button>
              )}

              <img
                src={galleryImages[galleryIndex]}
                alt={`${galleryTitle} ${galleryIndex + 1}`}
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={nextGalleryImage}
                  className="absolute right-1 z-10 flex size-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl transition hover:bg-slate-100 sm:right-3"
                  aria-label="Next image">
                  <ChevronRight className="size-5" />
                </button>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-3 flex max-w-full gap-1.5 overflow-x-auto px-2 pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setGalleryIndex(index)}
                    className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      galleryIndex === index
                        ? 'border-white'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="size-full object-cover"
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
