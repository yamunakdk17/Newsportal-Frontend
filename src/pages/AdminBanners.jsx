import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  RefreshCw,
  LoaderCircle,
  ExternalLink,
  Eye,
} from 'lucide-react';

import api from '@/services/api';
import AdminSidebar from '@/components/layout/AdminSidebar';

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

function getBackendError(error) {
  const response = error?.response?.data;

  if (response?.errors) {
    const firstError = Object.values(response.errors).flat()[0];

    if (firstError) return firstError;
  }

  return response?.message || error?.message || 'Something went wrong. Please try again.';
}

// Replace localhost with LAN IP in backend image URLs
function getImageUrl(image) {
  if (!image) return '';

  return image.replace(/^https?:\/\/localhost:8000/i, 'http://192.168.1.118:8000');
}

function isBannerActive(value) {
  return value === true || value === 1 || value === '1';
}

function formatDate(date) {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '-';

  return parsedDate.toLocaleDateString();
}

// --------------------------------------------------
// ADMIN BANNERS
// --------------------------------------------------

function AdminBanners() {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewBanner, setPreviewBanner] = useState(null);

  // --------------------------------------------------
  // FORM STATES
  // --------------------------------------------------

  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [link, setLink] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [formErrors, setFormErrors] = useState({});

  // --------------------------------------------------
  // FETCH BANNERS
  // --------------------------------------------------

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/banners');

      const bannerData = response.data?.data;

      setBanners(Array.isArray(bannerData) ? bannerData : []);
    } catch (error) {
      console.error('Fetch banners error:', error);
      setError(getBackendError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setTitle('');
    setImageFile(null);
    setImagePreview('');
    setLink('');
    setSortOrder(1);
    setIsActive(true);

    setFormErrors({});
    setEditingBanner(null);
  };

  // --------------------------------------------------
  // OPEN CREATE MODAL
  // --------------------------------------------------

  const openCreateModal = () => {
    resetForm();

    setError('');
    setSuccess('');

    setShowModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (banner) => {
    setEditingBanner(banner);

    setTitle(banner.title || '');
    setImageFile(null);

    setImagePreview(getImageUrl(banner.image));

    setLink(banner.link_url || banner.link || '');

    setSortOrder(
      banner.sort_order !== undefined && banner.sort_order !== null
        ? banner.sort_order
        : 1,
    );

    setIsActive(isBannerActive(banner.is_active));

    setFormErrors({});
    setError('');
    setSuccess('');

    setShowModal(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // --------------------------------------------------
  // IMAGE CHANGE
  // --------------------------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors((current) => ({
        ...current,
        image: 'Please select a valid image file.',
      }));

      setImageFile(null);
      return;
    }

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);

    setFormErrors((current) => ({
      ...current,
      image: '',
    }));

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required.';
    }

    if (!editingBanner && !imageFile) {
      errors.image = 'Image is required.';
    }

    if (imageFile && !imageFile.type.startsWith('image/')) {
      errors.image = 'Please select a valid image file.';
    }

    if (link.trim()) {
      try {
        new URL(link.trim());
      } catch {
        errors.link = 'Enter a valid URL.';
      }
    }

    if (
      sortOrder === '' ||
      sortOrder === null ||
      Number.isNaN(Number(sortOrder)) ||
      Number(sortOrder) < 1
    ) {
      errors.sortOrder = 'Enter a valid sort order.';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // --------------------------------------------------
  // CREATE / UPDATE BANNER
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append('title', title.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      formData.append('link_url', link.trim());

      formData.append('sort_order', String(Number(sortOrder)));

      formData.append('is_active', isActive ? '1' : '0');

      if (editingBanner) {
        const response = await api.put(`/admin/banners/${editingBanner.id}`, formData);

        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Failed to update banner.');
        }

        setSuccess('Banner updated successfully.');
      } else {
        const response = await api.post('/admin/banners', formData);

        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Failed to create banner.');
        }

        setSuccess('Banner created successfully.');
      }

      setShowModal(false);
      resetForm();

      await fetchBanners();
    } catch (error) {
      console.error('Save banner error:', error);

      const backendErrors = error?.response?.data?.errors;

      if (backendErrors) {
        const mappedErrors = {};

        if (backendErrors.title) {
          mappedErrors.title = backendErrors.title[0];
        }

        if (backendErrors.image) {
          mappedErrors.image = backendErrors.image[0];
        }

        if (backendErrors.link_url) {
          mappedErrors.link = backendErrors.link_url[0];
        }

        if (backendErrors.sort_order) {
          mappedErrors.sortOrder = backendErrors.sort_order[0];
        }

        if (backendErrors.is_active) {
          mappedErrors.isActive = backendErrors.is_active[0];
        }

        setFormErrors(mappedErrors);
      }

      setError(getBackendError(error));
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE BANNER
  // --------------------------------------------------

  const handleDelete = async (banner) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${banner.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(banner.id);
      setError('');
      setSuccess('');

      const response = await api.delete(`/admin/banners/${banner.id}`);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to delete banner.');
      }

      setBanners((current) => current.filter((item) => item.id !== banner.id));

      setSuccess('Banner deleted successfully.');
    } catch (error) {
      console.error('Delete banner error:', error);
      setError(getBackendError(error));
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // TOGGLE ACTIVE STATUS
  // --------------------------------------------------

  const handleToggleActive = async (banner) => {
    const newStatus = !isBannerActive(banner.is_active);

    try {
      setError('');
      setSuccess('');

      await api.put(`/admin/banners/${banner.id}`, {
        is_active: newStatus,
      });

      setBanners((current) =>
        current.map((item) =>
          item.id === banner.id ? { ...item, is_active: newStatus } : item,
        ),
      );

      setSuccess(
        newStatus ? 'Banner activated successfully.' : 'Banner deactivated successfully.',
      );
    } catch (error) {
      console.error('Toggle banner error:', error);
      setError(getBackendError(error));
    }
  };

  // --------------------------------------------------
  // PREVIEW
  // --------------------------------------------------

  const openPreview = (banner) => {
    setPreviewBanner(banner);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewBanner(null);
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredBanners = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return banners;

    return banners.filter((banner) => {
      return (
        banner.title?.toLowerCase().includes(keyword) ||
        banner.image?.toLowerCase().includes(keyword) ||
        banner.link_url?.toLowerCase().includes(keyword)
      );
    });
  }, [banners, search]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-64 min-h-screen">
        {/* HEADER */}

        <div className="border-b bg-white px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Banners</h1>

              <p className="mt-1 text-sm text-gray-500">
                Create, edit and manage website banners.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Plus size={18} />
              Add Banner
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="p-8">
          {/* ALERTS */}

          {error && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button type="button" onClick={() => setError('')}>
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <span>{success}</span>

              <button type="button" onClick={() => setSuccess('')}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* SEARCH + REFRESH */}

          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative max-w-md flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search banners..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={fetchBanners}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* TABLE */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <LoaderCircle size={32} className="animate-spin text-blue-600" />
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <ImageIcon size={30} className="text-gray-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900">No banners found</h3>

                <p className="mt-1 max-w-md text-sm text-gray-500">
                  {search
                    ? 'No banners match your search.'
                    : "You haven't created any banners yet."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    <Plus size={17} />
                    Create Banner
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      {[
                        'Banner',
                        'Image',
                        'Link',
                        'Order',
                        'Status',
                        'Date',
                        'Actions',
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredBanners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-gray-50">
                        {/* BANNER */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={getImageUrl(banner.image)}
                                alt={banner.title}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {banner.title}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                ID: {banner.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* IMAGE */}

                        <td className="max-w-[220px] px-6 py-4">
                          <span className="text-sm text-gray-500">Uploaded image</span>
                        </td>

                        {/* LINK */}

                        <td className="max-w-[180px] px-6 py-4">
                          {banner.link_url ? (
                            <a
                              href={banner.link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-full items-center gap-1 text-sm text-blue-600 hover:underline"
                              title={banner.link_url}>
                              <span className="truncate">{banner.link_url}</span>

                              <ExternalLink size={14} className="shrink-0" />
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">No link</span>
                          )}
                        </td>

                        {/* SORT ORDER */}

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {banner.sort_order ?? '-'}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(banner)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isBannerActive(banner.is_active)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {isBannerActive(banner.is_active) ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* DATE */}

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(banner.created_at || banner.updated_at)}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openPreview(banner)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                              title="Preview">
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(banner)}
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                              title="Edit">
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(banner)}
                              disabled={deletingId === banner.id}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              title="Delete">
                              {deletingId === banner.id ? (
                                <LoaderCircle size={17} className="animate-spin" />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TOTAL */}

          {!loading && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredBanners.length} of {banners.length} banners
            </div>
          )}
        </div>
      </main>

      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBanner ? 'Edit Banner' : 'Create Banner'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingBanner
                    ? 'Update the banner details.'
                    : 'Add a new banner to your website.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Banner Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter banner title"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                    formErrors.title ? 'border-red-400' : 'border-gray-200'
                  }`}
                />

                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>

              {/* IMAGE UPLOAD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Banner Image
                </label>

                <div
                  className={`rounded-xl border-2 border-dashed p-4 ${
                    formErrors.image
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                  <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Select an image from your computer. JPG, JPEG, PNG, WEBP, etc.
                  </p>
                </div>

                {formErrors.image && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.image}</p>
                )}

                {/* IMAGE PREVIEW */}

                {imagePreview && (
                  <div className="mt-4 overflow-hidden rounded-xl border bg-gray-50">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                      <p className="text-xs font-semibold text-gray-600">Image Preview</p>

                      {imageFile && (
                        <span className="text-xs text-gray-500">{imageFile.name}</span>
                      )}
                    </div>

                    <div className="flex min-h-[180px] items-center justify-center p-4">
                      <img
                        src={
                          imagePreview.startsWith('blob:')
                            ? imagePreview
                            : getImageUrl(imagePreview)
                        }
                        alt="Banner preview"
                        className="max-h-64 max-w-full rounded-lg object-contain"
                      />
                    </div>
                  </div>
                )}

                {editingBanner && !imageFile && imagePreview && (
                  <p className="mt-2 text-xs text-gray-500">
                    Current image is being used. Select a new image above if you want to
                    replace it.
                  </p>
                )}
              </div>

              {/* LINK */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Link
                  <span className="ml-1 font-normal text-gray-400">(optional)</span>
                </label>

                <input
                  type="url"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="https://example.com"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                    formErrors.link ? 'border-red-400' : 'border-gray-200'
                  }`}
                />

                {formErrors.link && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.link}</p>
                )}
              </div>

              {/* SORT ORDER */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  placeholder="1"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                    formErrors.sortOrder ? 'border-red-400' : 'border-gray-200'
                  }`}
                />

                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first.</p>

                {formErrors.sortOrder && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.sortOrder}</p>
                )}
              </div>

              {/* ACTIVE */}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">Active Banner</p>

                    <p className="text-xs text-gray-500">
                      Make this banner visible on the public website.
                    </p>
                  </div>
                </label>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving && <LoaderCircle size={17} className="animate-spin" />}

                  {saving
                    ? editingBanner
                      ? 'Updating...'
                      : 'Creating...'
                    : editingBanner
                      ? 'Update Banner'
                      : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          PREVIEW MODAL
      ================================================== */}

      {showPreview && previewBanner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80">
              <X size={20} />
            </button>

            <div className="bg-gray-100">
              <img
                src={getImageUrl(previewBanner.image)}
                alt={previewBanner.title}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">{previewBanner.title}</h3>

              {previewBanner.link_url && (
                <a
                  href={previewBanner.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  Open banner link
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBanners;
