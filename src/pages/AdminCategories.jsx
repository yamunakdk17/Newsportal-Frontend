import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2, Plus, Search, Pencil, Trash2, X, LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

import AdminSidebar from '@/components/layout/AdminSidebar';
import api from '@/services/api';

const getPostList = (payload) => {
  const data = payload?.data;

  return [data, data?.data, data?.posts].find(Array.isArray) || [];
};

const getPostsLastPage = (payload) => {
  const lastPage = Number(
    payload?.meta?.last_page ??
      payload?.last_page ??
      payload?.data?.meta?.last_page ??
      payload?.data?.last_page,
  );

  return Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1;
};

const getPostCategoryId = (post) => {
  const id = post?.category_id ?? post?.category?.id;

  return id === null || id === undefined ? '' : String(id);
};

export default function Categories() {
  const reduce = useReducedMotion();

  const [categories, setCategories] = useState([]);
  const [postCounts, setPostCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsFailed, setCountsFailed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [pageError, setPageError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [query, setQuery] = useState('');

  const [editingCategory, setEditingCategory] = useState(null);

  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');

  const [deleteCategory, setDeleteCategory] = useState(null);

  const loadCategories = async () => {
    try {
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

  // Counts the real news of every category from /admin/posts (all pages),
  // so the number does not depend on a backend articles_count field.
  const loadPostCounts = async () => {
    try {
      const fetchPage = (page) =>
        api.get('/admin/posts', { params: { page, per_page: 100 } });

      const firstResponse = await fetchPage(1);

      if (firstResponse.data?.success === false) {
        throw new Error(firstResponse.data?.message || 'Unable to load news.');
      }

      const lastPage = getPostsLastPage(firstResponse.data);

      const otherResponses = await Promise.all(
        Array.from({ length: Math.max(0, lastPage - 1) }, (_, index) =>
          fetchPage(index + 2),
        ),
      );

      const uniquePosts = new Map();

      [firstResponse, ...otherResponses]
        .flatMap((response) => getPostList(response.data))
        .forEach((post, index) => {
          if (post?.deleted_at) return;

          const key = String(post?.id ?? post?.post_id ?? post?.slug ?? `post-${index}`);

          if (!uniquePosts.has(key)) {
            uniquePosts.set(key, post);
          }
        });

      const counts = {};

      uniquePosts.forEach((post) => {
        const categoryKey = getPostCategoryId(post);

        if (categoryKey) {
          counts[categoryKey] = (counts[categoryKey] || 0) + 1;
        }
      });

      setPostCounts(counts);
      setCountsFailed(false);
    } catch (error) {
      console.error('Get category news counts error:', error);

      setCountsFailed(true);
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadCategories);
    Promise.resolve().then(loadPostCounts);
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess('');
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  const startEdit = (category) => {
    setEditingCategory(category);
    setName(category?.name || '');
    setFieldError('');
    setPageError('');
    setSuccess('');
    setDeleteError('');
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

        const updatedCategory =
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
              ...(updatedCategory || {}),
              name: updatedCategory?.name || value,
            };
          }),
        );

        setSuccess(response.data?.message || 'Category updated successfully.');

        setEditingCategory(null);
        setName('');
        setFieldError('');

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
    setDeleteError('');

    setDeleteCategory(category);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;

    setDeleteCategory(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteCategory) return;

    const category = deleteCategory;

    try {
      setDeletingId(category.id);
      setDeleteError('');

      setPageError('');
      setSuccess('');

      const response = await api.delete(`/admin/categories/${category.id}`);

      console.log('Delete category response:', response.data);

      if (!response.data?.success) {
        setDeleteError(response.data?.message || 'Failed to delete category.');
        return;
      }

      setCategories((current) => current.filter((item) => item.id !== category.id));

      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setName('');
      }

      setDeleteCategory(null);
      setDeleteError('');

      setSuccess(response.data?.message || 'Category deleted successfully.');
    } catch (error) {
      console.error('Delete category error:', error);

      setDeleteError(
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
                  className="h-11 rounded-xl border border-[#E2E5E8] bg-[#F8F9FA] pl-10 text-sm text-[#16181A] shadow-none placeholder:text-[#A7ADB5] focus-visible:ring-2 focus-visible:ring-[#2168CD]/20 sm:h-10"
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
                                News:{' '}
                                {countsLoading
                                  ? '...'
                                  : countsFailed
                                    ? (category.articles_count ??
                                      category.news_count ??
                                      '-')
                                    : (postCounts[String(category.id)] ?? 0)}
                              </span>
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
                      Add Category
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#8B9199]">
                      Create a new category for your news.
                    </p>
                  </div>
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
                      className="h-11 w-full rounded-xl border border-[#E2E5E8] bg-[#F8F9FA] px-3 text-sm text-[#16181A] shadow-none placeholder:text-[#AEB4BC] focus-visible:border-[#2168CD] focus-visible:ring-[#2168CD]/20 sm:h-10"
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
                      className="h-11 w-full gap-1.5 rounded-xl bg-[#2168CD] px-4 text-sm font-medium text-white shadow-none hover:bg-[#1B58B0] sm:h-10 sm:w-auto sm:flex-1 sm:text-xs">
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
                        className="h-11 w-full rounded-xl px-4 text-sm font-medium text-[#4A4E54] sm:h-10 sm:w-auto sm:text-xs">
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
                          ?
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

                    {/* <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                    </div> */}

                    <div className="mt-5">
                      <AnimatePresence>
                        {deleteError && (
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
                              y: -4,
                            }}
                            className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium leading-5 text-[#981733]">
                            {deleteError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {editingCategory && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget && !saving) {
                    cancelEdit();
                  }
                }}>
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="edit-category-title"
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
                  className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2168CD]">
                        <Pencil className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2
                          id="edit-category-title"
                          className="text-base font-semibold leading-5 text-[#16181A]">
                          Edit Category
                        </h2>

                        <p className="mt-1.5 text-xs leading-5 text-[#737982]">
                          Update the category name below.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="size-8 shrink-0 rounded-lg text-[#737982] hover:bg-slate-100"
                        aria-label="Close edit dialog">
                        <X className="size-4" />
                      </Button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="mt-5 flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor="edit-category-name"
                          className="text-xs font-medium leading-4 text-[#363B42]">
                          Category Name
                        </Label>

                        <Input
                          id="edit-category-name"
                          value={name}
                          onChange={(event) => {
                            setName(event.target.value);

                            if (fieldError) {
                              setFieldError('');
                            }
                          }}
                          placeholder="e.g. Sports"
                          aria-invalid={Boolean(fieldError)}
                          aria-describedby={
                            fieldError ? 'edit-category-name-error' : undefined
                          }
                          disabled={saving}
                          autoFocus
                          className="h-11 w-full rounded-xl border border-[#E2E5E8] bg-[#F8F9FA] px-3 text-sm text-[#16181A] shadow-none placeholder:text-[#AEB4BC] focus-visible:border-[#2168CD] focus-visible:ring-[#2168CD]/20"
                        />

                        <AnimatePresence>
                          {fieldError && (
                            <motion.p
                              id="edit-category-name-error"
                              role="alert"
                              initial={reduce ? false : { opacity: 0, y: -3 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-[11px] font-medium leading-4 text-[#981733]">
                              {fieldError}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="h-10 w-full rounded-xl px-4 text-xs font-medium text-[#4A4E54] sm:w-auto">
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          disabled={saving}
                          className="h-10 w-full gap-1.5 rounded-xl bg-[#2168CD] px-4 text-xs font-medium text-white shadow-none hover:bg-[#1B58B0] sm:w-auto">
                          {saving ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Pencil className="size-3.5" />
                              Update Category
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
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
