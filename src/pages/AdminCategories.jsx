import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Folder, RefreshCw } from 'lucide-react';

import api from '@/services/api';
import AdminSidebar from '@/components/layout/AdminSidebar';

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryName, setCategoryName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // GET CATEGORIES

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/categories');

      console.log('Categories:', response.data);

      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load categories.');
      }
    } catch (error) {
      console.error('Get categories error:', error);

      setError(error.response?.data?.message || 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  // LOAD WHEN PAGE OPENS

  useEffect(() => {
    fetchCategories();
  }, []);

  // CREATE MODAL

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // EDIT MODAL

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name || '');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // CLOSE MODAL

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    setCategoryName('');
    setError('');
  };

  // CREATE / UPDATE

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError('Category name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // UPDATE

      // UPDATE

      if (editingCategory) {
        const response = await api.put(`/admin/categories/${editingCategory.id}`, {
          name,
        });

        console.log('Update category:', response.data);

        if (!response.data.success) {
          setError(response.data.message || 'Failed to update category.');

          return;
        }

        // Update only this category in the UI
        const updatedCategory = response.data.data;

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === editingCategory.id
              ? {
                  ...category,
                  ...updatedCategory,
                  name: updatedCategory?.name || name,
                }
              : category,
          ),
        );

        setSuccess(response.data.message || 'Category updated successfully.');
      }
      // CREATE
      else {
        const response = await api.post('/admin/categories', {
          name,
        });

        console.log('Create category:', response.data);

        if (!response.data.success) {
          setError(response.data.message || 'Failed to create category.');

          return;
        }

        // Add the newly created category directly to the UI
        const newCategory = response.data.data;

        setCategories((currentCategories) => [newCategory, ...currentCategories]);

        setSuccess(response.data.message || 'Category created successfully.');
      }

      // Get fresh data from backend

      setShowModal(false);
      setEditingCategory(null);
      setCategoryName('');
    } catch (error) {
      console.error('Save category error:', error);

      setError(error.response?.data?.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  };

  // DELETE

 const handleDelete = async (id) => {
   setShowModal(false);

   const confirmed = window.confirm('Are you sure you want to delete this category?');

   if (!confirmed) return;

   try {
     setDeletingId(id);
     setError('');
     setSuccess('');

     const response = await api.delete(`/admin/categories/${id}`);

     

     console.log('Delete category:', response.data);

     if (!response.data.success) {
       setError(response.data.message || 'Failed to delete category.');
       return;
     }

     // Remove deleted category from the UI
     setCategories((currentCategories) =>
       currentCategories.filter((category) => category.id !== id),
     );

     setSuccess(response.data.message || 'Category deleted successfully.');
   } catch (error) {
     console.error('Delete category error:', error);

     setError(error.response?.data?.message || 'Unable to delete category.');
   } finally {
     setDeletingId(null);
   }
 };

  // SEARCH

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase();

    return (
      category.name?.toLowerCase().includes(searchText) ||
      category.slug?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <AdminSidebar />
      <div className="ml-64">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />

              <span className="text-sm font-medium text-blue-600">
                Content Management
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Categories</h1>

            <p className="mt-1 text-sm text-slate-500">Manage your news categories.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchCategories}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Categories</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {categories.length}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <Folder className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">All Categories</h2>

              <p className="mt-1 text-sm text-slate-500">
                Categories from your backend database.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />

              <span className="ml-3 text-sm text-slate-500">Loading categories...</span>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        ID
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        Name
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        Slug
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                        Created
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          #{category.id}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2">
                              <Folder className="h-4 w-4 text-blue-600" />
                            </div>

                            <span className="font-semibold text-slate-900">
                              {category.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            /{category.slug}
                          </code>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {category.created_at
                            ? new Date(category.created_at).toLocaleDateString()
                            : '-'}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(category)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(category.id)}
                              disabled={deletingId === category.id}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                              {deletingId === category.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <Folder className="h-4 w-4 text-blue-600" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {category.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">/{category.slug}</p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-400">#{category.id}</span>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingId === category.id}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                        {deletingId === category.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && filteredCategories.length === 0 && (
            <div className="p-12 text-center">
              <Folder className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-800">No categories found</h3>

              <p className="mt-1 text-sm text-slate-500">No categories are available.</p>
            </div>
          )}
        </div>

        {/* CREATE / EDIT MODAL */}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingCategory ? 'Edit Category' : 'Create Category'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {editingCategory
                      ? 'Update the category name.'
                      : 'Create a new news category.'}
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category Name
                  </label>

                  <input
                    type="text"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Enter category name"
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    {saving && <RefreshCw className="h-4 w-4 animate-spin" />}

                    {saving
                      ? 'Saving...'
                      : editingCategory
                        ? 'Save Changes'
                        : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCategories;
