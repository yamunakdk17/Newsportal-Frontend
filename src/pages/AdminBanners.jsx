import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2, Plus, Search } from 'lucide-react';

import AdminSidebar from '@/components/layout/AdminSidebar';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import { getImageUrl } from '@/lib/getImageUrl';
import api from '@/services/api';

const SORT_ORDERS = [1, 2, 3, 4, 5];
const FIELD =
  'h-10 w-full rounded-xl border border-[#D7DBE0] bg-[#F8F9FA] px-3 text-sm font-normal text-[#16181A] shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-[#A7ADB5] focus-visible:ring-2 focus-visible:ring-[#2168CD]/20 sm:h-10';

export default function Banners() {
  const reduce = useReducedMotion();
  const fileRef = useRef(null);

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [query, setQuery] = useState('');

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [link, setLink] = useState('');

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    try {
      const response = await api.get('/admin/banners');

      console.log('Banners response:', response.data);

      const list = response.data?.data?.data ?? response.data?.data ?? [];

      setBanners(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load banners:', error);

      setPageError(
        error.response?.data?.message || error.message || 'Unable to load banners.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadBanners);
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFile(selectedFile);

    setErrors((current) => ({
      ...current,
      image: undefined,
      form: undefined,
    }));

    event.target.value = '';
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSortOrder('');
    setLink('');
    setErrors({});

    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!file) {
      nextErrors.image = 'Please choose an image.';
    }

    if (!title.trim()) {
      nextErrors.title = 'Title is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const data = new FormData();

    data.append('image', file);
    data.append('title', title.trim());

    if (sortOrder) {
      data.append('sort_order', sortOrder);
    }

    if (link.trim()) {
      data.append('link', link.trim());
    }

    try {
      setSaving(true);
      setErrors({});
      setPageError('');

      const response = await api.post('/admin/banners', data);

      console.log('Create banner response:', response.data);

      resetForm();

      setLoading(true);
      await loadBanners();
    } catch (error) {
      console.error('Create banner error:', error);

      setErrors({
        form: error.response?.data?.message || error.message || 'Unable to add banner.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner, checked) => {
    const previousValue = Boolean(banner.is_active ?? banner.active);

    setBanners((current) =>
      current.map((item) =>
        item.id === banner.id
          ? {
              ...item,
              is_active: checked,
            }
          : item,
      ),
    );

    try {
      await api.put(`/admin/banners/${banner.id}`, {
        is_active: checked,
      });
    } catch (error) {
      console.error('Update banner error:', error);

      setBanners((current) =>
        current.map((item) =>
          item.id === banner.id
            ? {
                ...item,
                is_active: previousValue,
              }
            : item,
        ),
      );

      setPageError(
        error.response?.data?.message || error.message || 'Unable to update banner.',
      );
    }
  };

  const handleDelete = async (banner) => {
    const confirmed = window.confirm(`Delete "${banner.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setPageError('');

      await api.delete(`/admin/banners/${banner.id}`);

      setBanners((current) => current.filter((item) => item.id !== banner.id));
    } catch (error) {
      console.error('Delete banner error:', error);

      setPageError(
        error.response?.data?.message || error.message || 'Unable to delete banner.',
      );
    }
  };

  const visibleBanners = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return banners;
    }

    return banners.filter((banner) => banner.title?.toLowerCase().includes(search));
  }, [banners, query]);

  return (
    <>
      <AdminSidebar />

      <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
        <div className="min-h-screen bg-[#F6F8FA] font-geist">
          {/* HEADER */}
          <header className="border-b border-[#EEF0F2] bg-white">
            <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 xl:px-8 xl:py-7">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-[#16181A] sm:text-[26px]">
                  Banner
                </h1>

                <p className="mt-1 text-sm font-normal leading-5 text-[#68707A]">
                  Manage your website banners and promotions.
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
                  placeholder="Search banners"
                  aria-label="Search banners"
                  className="h-10 rounded-xl border border-[#E2E5E8] bg-[#F8F9FA] pl-10 text-sm font-normal text-[#16181A] shadow-none placeholder:text-[#A7ADB5] focus-visible:ring-2 focus-visible:ring-[#2168CD]/20"
                />
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="flex min-w-0 flex-col gap-5 p-4 sm:gap-6 sm:p-6 xl:p-8">
            {/* ADD BANNER FORM */}
            <motion.form
              onSubmit={handleAdd}
              noValidate
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0,
                      y: 8,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              className="rounded-2xl border border-[#EEF0F2] bg-white p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[180px_minmax(180px,1.2fr)_160px_minmax(180px,1fr)_80px] xl:items-center">
                {/* IMAGE */}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={saving}
                    aria-label="Choose banner image"
                    className="flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-[#C7CBD1] bg-[#F8F9FA] px-3 text-sm font-medium text-[#7C838C] transition-colors hover:bg-[#F1F3F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2168CD]/30 disabled:cursor-not-allowed disabled:opacity-60">
                    <Plus aria-hidden="true" className="size-4 shrink-0" />

                    <span className={`truncate ${file ? 'text-[#16181A]' : ''}`}>
                      {file ? file.name : 'Choose image'}
                    </span>
                  </button>
                </div>

                {/* TITLE */}
                <Input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);

                    setErrors((current) => ({
                      ...current,
                      title: undefined,
                      form: undefined,
                    }));
                  }}
                  placeholder="Banner title"
                  aria-label="Banner title"
                  aria-invalid={Boolean(errors.title)}
                  disabled={saving}
                  className={`${FIELD} ${errors.title ? 'border-red-400' : ''}`}
                />

                {/* PRIORITY */}
                <Select value={sortOrder} onValueChange={setSortOrder} disabled={saving}>
                  <SelectTrigger
                    aria-label="Sort order"
                    className="h-10 w-full rounded-xl border border-[#D7DBE0] bg-[#F8F9FA] px-3 text-sm font-normal text-[#16181A] shadow-none data-[placeholder]:text-[#A7ADB5] focus:ring-2 focus:ring-[#2168CD]/20">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>

                  <SelectContent>
                    {SORT_ORDERS.map((item) => (
                      <SelectItem key={item} value={String(item)} className="text-sm">
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* LINK */}
                <Input
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="Link (optional)"
                  aria-label="Link (optional)"
                  disabled={saving}
                  className={FIELD}
                />

                {/* ADD BUTTON */}
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 gap-1.5 rounded-xl bg-[#2168CD] px-4 text-sm font-medium text-white shadow-none hover:bg-[#1B58B0] sm:col-span-2 xl:col-span-1">
                  {saving && (
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  )}
                  Add
                </Button>
              </div>

              <AnimatePresence>
                {(errors.image || errors.title || errors.form) && (
                  <motion.p
                    role="alert"
                    initial={{
                      opacity: 0,
                      y: -3,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="mt-2.5 text-xs font-medium text-[#981733]">
                    {errors.image || errors.title || errors.form}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.form>

            {/* PAGE ERROR */}
            {pageError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-[#981733]">
                {pageError}
              </div>
            )}

            {/* BANNERS */}
            <section className="flex flex-col gap-3">
              {/* LOADING */}
              {loading ? (
                <>
                  <Skeleton className="h-[220px] w-full rounded-2xl" />
                  <Skeleton className="h-[220px] w-full rounded-2xl" />
                </>
              ) : visibleBanners.length === 0 ? (
                /* EMPTY */
                <div className="rounded-2xl border border-[#EEF0F2] bg-white px-5 py-12 text-center">
                  <p className="text-sm font-medium text-[#4A4E54]">
                    {query
                      ? 'No banners match your search.'
                      : 'No banners yet. Add your first one.'}
                  </p>
                </div>
              ) : (
                /* BANNER LIST */
                <AnimatePresence initial={!reduce} mode="popLayout">
                  {visibleBanners.map((banner) => {
                    const src = getImageUrl(banner.image || banner.image_path);

                    const active = Boolean(banner.is_active ?? banner.active);

                    return (
                      <motion.article
                        key={banner.id}
                        layout={!reduce}
                        initial={
                          reduce
                            ? false
                            : {
                                opacity: 0,
                                y: 8,
                              }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.98,
                        }}
                        transition={{
                          duration: 0.22,
                          ease: 'easeOut',
                        }}
                        className="overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white p-3.5 sm:p-4">
                        {/* IMAGE */}
                        <div className="h-[150px] w-full overflow-hidden rounded-xl bg-[#EEF1F4] sm:h-[175px] lg:h-[190px]">
                          {src ? (
                            <img
                              src={src}
                              alt={banner.title || 'Banner'}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-normal text-[#9AA1AA]">
                              No image
                            </div>
                          )}
                        </div>

                        {/* DETAILS */}
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold leading-5 text-[#16181A] sm:text-[17px]">
                              {banner.title}
                            </h2>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs font-medium text-[#68707A]">
                                Active
                              </span>

                              <Switch
                                checked={active}
                                onCheckedChange={(checked) =>
                                  handleToggle(banner, checked)
                                }
                                aria-label={`Toggle ${banner.title}`}
                                className="h-4 w-[29px] border border-[#C7CBD1] bg-transparent px-0.5 data-[state=checked]:border-[#2168CD] data-[state=checked]:bg-[#2168CD] [&>span]:size-2.5 [&>span]:bg-[#C7CBD1] data-[state=checked]:[&>span]:bg-white"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={() => handleDelete(banner)}
                            className="h-9 shrink-0 rounded-xl bg-[#F5365C] px-4 text-xs font-medium text-white shadow-none hover:bg-[#DC2A4F]">
                            Delete
                          </Button>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
