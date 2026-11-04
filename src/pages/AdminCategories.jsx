import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2, Plus, Search, Pencil, Trash2, X, LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

import AdminSidebar from '@/components/layout/AdminSidebar';
import api from '@/services/api';

const formatDate = (value) => {
  if (!value) return '';

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return '';

  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

export default function Categories() {
  const reduce = useReducedMotion();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState('');
  const [success, setSuccess] = useState('');

  const [query, setQuery] = useState('');

  const [editingCategory, setEditingCategory] = useState(null);

  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');

  const [deleteCategory, setDeleteCategory] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setPageError('');

      const response = await api.get('/admin/categories');

      console.log('Categories backend response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to load categories.');
      }

      const list = response.data?.data ?? [];

      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Get categories error:', error);

      setPageError(
        error.response?.data?.message || error.message || 'Unable to load categories.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess('');
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  const startCreate = () => {
    setEditingCategory(null);
    setName('');
    setFieldError('');
    setPageError('');
    setSuccess('');
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setName(category?.name || '');
    setFieldError('');
    setPageError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  const cancelEdit = () => {
    if (saving) return;

    setEditingCategory(null);
    setName('');
    setFieldError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = name.trim();

    if (!value) {
      setFieldError('Category name is required.');
      return;
    }

    try {
      setSaving(true);
      setFieldError('');
      setPageError('');
      setSuccess('');

      if (editingCategory) {
        const response = await api.put(`/admin/categories/${editingCategory.id}`, {
          name: value,
        });

        console.log('Update category response:', response.data);

        if (!response.data?.success) {
          setFieldError(response.data?.message || 'Failed to update category.');

          return;
        }

        const returnedCategory =
          response.data?.data && !Array.isArray(response.data.data)
            ? response.data.data
            : null;

        setCategories((current) =>
          current.map((category) => {
            if (category.id !== editingCategory.id) {
              return category;
            }

            return {
              ...category,
              ...(returnedCategory || {}),
              name: returnedCategory?.name || value,
            };
          }),
        );

        setSuccess(response.data?.message || 'Category updated successfully.');

        setEditingCategory(null);
        setName('');

        return;
      }

      const response = await api.post('/admin/categories', {
        name: value,
      });

      console.log('Create category response:', response.data);

      if (!response.data?.success) {
        setFieldError(response.data?.message || 'Failed to create category.');

        return;
      }

      const createdCategory =
        response.data?.data && !Array.isArray(response.data.data)
          ? response.data.data
          : null;

      if (createdCategory) {
        setCategories((current) => [createdCategory, ...current]);
      } else {
        setCategories((current) => [
          {
            id: `temporary-${Date.now()}`,
            name: value,
            slug: value.toLowerCase().replace(/\s+/g, '-'),
            articles_count: 0,
            created_at: new Date().toISOString(),
          },
          ...current,
        ]);
      }

      setSuccess(response.data?.message || 'Category created successfully.');

      setName('');
      setEditingCategory(null);
    } catch (error) {
      console.error('Save category error:', error);

      setFieldError(
        error.response?.data?.errors?.name?.[0] ||
          error.response?.data?.message ||
          'Unable to save category.',
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (category) => {
    if (deletingId) return;

    setPageError('');
    setSuccess('');
    setDeleteCategory(category);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;

    setDeleteCategory(null);
  };

  const confirmDelete = async () => {
    if (!deleteCategory) return;

    const category = deleteCategory;

    try {
      setDeletingId(category.id);
      setPageError('');
      setSuccess('');

      const response = await api.delete(`/admin/categories/${category.id}`);

      console.log('Delete category response:', response.data);

      if (!response.data?.success) {
        setPageError(response.data?.message || 'Failed to delete category.');

        return;
      }

      setCategories((current) => current.filter((item) => item.id !== category.id));

      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setName('');
      }

      setDeleteCategory(null);

      setSuccess(response.data?.message || 'Category deleted successfully.');
    } catch (error) {
      console.error('Delete category error:', error);

      setPageError(
        error.response?.data?.message || error.message || 'Unable to delete category.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return categories;

    return categories.filter((category) => {
      return (
        category.name?.toLowerCase().includes(q) ||
        category.slug?.toLowerCase().includes(q)
      );
    });
  }, [categories, query]);

  return (
    <div className="min-h-screen w-full bg-[#F6F8FA]">
      <AdminSidebar />

      <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
        <div className="min-h-screen font-geist">
          <header className="border-b border-[#EEF0F2] bg-white">
            <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 xl:px-8 xl:py-7">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-[#16181A] sm:text-[26px]">
                  Categories
                </h1>

                <p className="mt-1 text-sm leading-5 text-[#68707A]">
                  Organize articles into relevant categories.
                </p>
              </div>

              <div className="relative w-full lg:max-w-[360px]">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9AA1AA]"
                />

                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search categories"
                  aria-label="Search categories"
                  className="h-10 rounded-xl border border-[#E2E5E8] bg-[#F8F9FA] pl-10 text-sm text-[#16181A] shadow-none placeholder:text-[#A7ADB5] focus-visible:ring-2 focus-visible:ring-[#2168CD]/20"
                />
              </div>
            </div>
          </header>

          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
            <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-6">
              <section
                aria-labelledby="categories-total"
                className="min-w-0 rounded-2xl border border-[#EEF0F2] bg-white p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-1">
                  <h2
                    id="categories-total"
                    className="text-base font-semibold leading-5 tracking-[-0.01em] text-[#16181A]">
                    Total Categories:{' '}
                    <span className="font-medium text-[#737982]">
                      {categories.length}
                    </span>
                  </h2>

                  <p className="text-xs leading-5 text-[#8B9199]">
                    Manage the categories used across your news content.
                  </p>
                </div>

                <AnimatePresence>
                  {pageError && (
                    <motion.p
                      role="alert"
                      initial={
                        reduce
                          ? false
                          : {
                              opacity: 0,
                              y: -4,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium leading-5 text-[#981733]">
                      {pageError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {success && (
                    <motion.p
                      role="status"
                      initial={
                        reduce
                          ? false
                          : {
                              opacity: 0,
                              y: -4,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="mt-4 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 text-xs font-medium leading-5 text-green-700">
                      {success}
                    </motion.p>
                  )}
                </AnimatePresence>

                {loading ? (
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({
                      length: 6,
                    }).map((_, index) => (
                      <Skeleton key={index} className="h-[72px] rounded-xl" />
                    ))}
                  </div>
                ) : visible.length === 0 ? (
                  <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[#D9DDE2] bg-[#F8F9FA] px-5 text-center">
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white">
                      <LayoutGrid className="size-5 text-[#A7ADB5]" />
                    </div>

                    <p className="text-sm font-medium text-[#4A4E54]">
                      {query ? 'No categories match your search.' : 'No categories yet.'}
                    </p>

                    <p className="mt-1 text-xs text-[#9AA0A8]">
                      {query
                        ? 'Try another search term.'
                        : 'Add your first category using the form.'}
                    </p>
                  </div>
                ) : (
                  <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AnimatePresence initial={!reduce} mode="popLayout">
                      {visible.map((category) => (
                        <motion.li
                          key={category.id}
                          layout={!reduce}
                          initial={
                            reduce
                              ? false
                              : {
                                  opacity: 0,
                                  scale: 0.98,
                                }
                          }
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.96,
                          }}
                          transition={{
                            duration: 0.2,
                            ease: 'easeOut',
                          }}
                          className="group flex min-h-[72px] items-center justify-between gap-3 rounded-xl border border-[#E5E8EC] bg-[#FAFBFC] px-3.5 py-3 transition-colors hover:border-[#D4DAE2] hover:bg-white">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold leading-5 text-[#202328]">
                              {category.name}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-4 text-[#969CA5]">
                              <span>
                                Articles:{' '}
                                {category.articles_count ?? category.news_count ?? 0}
                              </span>

                              {category.created_at && (
                                <span>{formatDate(category.created_at)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(category)}
                              aria-label={`Edit ${category.name}`}
                              className="size-8 rounded-lg text-[#656C75] hover:bg-blue-50 hover:text-[#2168CD]">
                              <Pencil className="size-3.5" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteModal(category)}
                              disabled={deletingId === category.id}
                              aria-label={`Delete ${category.name}`}
                              className="size-8 rounded-lg text-[#656C75] hover:bg-red-50 hover:text-[#B42318]">
                              {deletingId === category.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </section>

              <section
                aria-labelledby="category-form-title"
                className="rounded-2xl border border-[#EEF0F2] bg-white p-4 sm:p-5 lg:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      id="category-form-title"
                      className="text-base font-semibold leading-5 tracking-[-0.01em] text-[#16181A]">
                      {editingCategory ? 'Edit Category' : 'Add Category'}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#8B9199]">
                      {editingCategory
                        ? 'Update the selected category.'
                        : 'Create a new category for your news.'}
                    </p>
                  </div>

                  {editingCategory && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="size-8 rounded-lg text-[#737982] hover:bg-slate-100"
                      aria-label="Cancel editing">
                      <X className="size-4" />
                    </Button>
                  )}
                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="category-name"
                      className="text-xs font-medium leading-4 text-[#363B42]">
                      Category Name
                    </Label>

                    <Input
                      id="category-name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);

                        if (fieldError) {
                          setFieldError('');
                        }
                      }}
                      placeholder="e.g. Sports"
                      aria-invalid={Boolean(fieldError)}
                      aria-describedby={fieldError ? 'category-name-error' : undefined}
                      disabled={saving}
                      className="h-10 rounded-xl border border-[#E2E5E8] bg-[#F8F9FA] px-3 text-sm text-[#16181A] shadow-none placeholder:text-[#AEB4BC] focus-visible:border-[#2168CD] focus-visible:ring-[#2168CD]/20"
                    />

                    <AnimatePresence>
                      {fieldError && (
                        <motion.p
                          id="category-name-error"
                          role="alert"
                          initial={
                            reduce
                              ? false
                              : {
                                  opacity: 0,
                                  y: -3,
                                }
                          }
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          className="text-[11px] font-medium leading-4 text-[#981733]">
                          {fieldError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="h-10 flex-1 gap-1.5 rounded-xl bg-[#2168CD] px-4 text-xs font-medium text-white shadow-none hover:bg-[#1B58B0]">
                      {saving ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}

                      {saving
                        ? 'Saving...'
                        : editingCategory
                          ? 'Save Changes'
                          : 'Add Category'}
                    </Button>

                    {editingCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="h-10 rounded-xl px-4 text-xs font-medium text-[#4A4E54]">
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </section>
            </div>
          </div>

          <AnimatePresence>
            {deleteCategory && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
                initial={
                  reduce
                    ? false
                    : {
                        opacity: 0,
                      }
                }
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    closeDeleteModal();
                  }
                }}>
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-category-title"
                  initial={
                    reduce
                      ? false
                      : {
                          opacity: 0,
                          scale: 0.97,
                          y: 8,
                        }
                  }
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
                    y: 8,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeOut',
                  }}
                  className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#B42318]">
                        <Trash2 className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2
                          id="delete-category-title"
                          className="text-base font-semibold leading-5 text-[#16181A]">
                          Delete category?
                        </h2>

                        <p className="mt-1.5 text-xs leading-5 text-[#737982]">
                          Are you sure you want to delete{' '}
                          <span className="font-medium text-[#363B42]">
                            "{deleteCategory.name}"
                          </span>
                          ? This action cannot be undone.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={closeDeleteModal}
                        disabled={Boolean(deletingId)}
                        className="size-8 shrink-0 rounded-lg text-[#737982] hover:bg-slate-100"
                        aria-label="Close delete confirmation">
                        <X className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeDeleteModal}
                        disabled={Boolean(deletingId)}
                        className="h-10 rounded-xl px-4 text-xs font-medium text-[#4A4E54]">
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        onClick={confirmDelete}
                        disabled={Boolean(deletingId)}
                        className="h-10 rounded-xl bg-[#B42318] px-4 text-xs font-medium text-white hover:bg-[#981B12]">
                        {deletingId ? (
                          <>
                            <Loader2 className="mr-2 size-3.5 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 size-3.5" />
                            Delete Category
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
