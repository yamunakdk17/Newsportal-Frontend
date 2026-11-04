import { useEffect, useRef } from 'react';
import { ChevronDown, Image as ImageIcon, LoaderCircle, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

function AdminNewsForm({
  editingNews,
  categories,
  categoriesLoading,
  saving,

  categoryId,
  setCategoryId,
  title,
  setTitle,
  excerpt,
  setExcerpt,
  body,
  setBody,
  caption,
  setCaption,
  author,
  setAuthor,
  priority,
  setPriority,
  isPublished,
  setIsPublished,
  isFeatured,
  setIsFeatured,

  images,
  setImages,
  featuredImage,
  setFeaturedImage,
  imagePreviews,
  setImagePreviews,
  featuredPreview,
  setFeaturedPreview,

  formErrors,
  setFormErrors,

  handleCreateNews,
  handleUpdateNews,
  handleImagesChange,
  handleFeaturedImageChange,
  removeImage,
  removeFeaturedImage,

  closeModal,
  getImageUrl,
}) {
  const imageInputRef = useRef(null);
  const featuredInputRef = useRef(null);

  const LABEL = 'text-base font-medium leading-[1.3] text-[#16181A]';

  const FIELD =
    'rounded-xl border border-[#D4D8DE] bg-slate-50 px-3.5 text-base text-[#16181A] placeholder:text-[#8A9098] outline-none transition focus:border-[#2168CD] focus:ring-2 focus:ring-[#2168CD]/15 disabled:cursor-not-allowed disabled:opacity-60';

  const SIDE_LABEL = 'text-base font-medium leading-[1.3] text-[#16181A]';

  const SIDE_FIELD =
    'h-11 w-full rounded-xl border border-[#D4D8DE] bg-slate-50 px-3.5 text-base text-[#16181A] shadow-sm outline-none placeholder:text-[#A0A5AC] focus:border-[#2168CD] focus:ring-2 focus:ring-[#2168CD]/15 disabled:cursor-not-allowed disabled:opacity-60';

  const UPLOAD =
    'flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#2168CD] bg-blue-50/40 text-base font-medium text-[#2168CD] transition hover:bg-blue-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2168CD]/30';

  const ERROR = 'text-sm font-medium leading-[1.5] text-[#981733]';

  const REMOVE =
    'absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-md outline-none transition hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-[#2168CD] disabled:opacity-60';

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
      });

      if (featuredPreview) {
        URL.revokeObjectURL(featuredPreview);
      }
    };
  }, []);

  const handleRemoveImage = (index) => {
    const preview = imagePreviews[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));

    setImagePreviews((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const handleRemoveFeaturedImage = () => {
    if (featuredPreview) {
      URL.revokeObjectURL(featuredPreview);
    }

    setFeaturedImage(null);
    setFeaturedPreview('');

    if (featuredInputRef.current) {
      featuredInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:p-4 lg:left-[250px] xl:left-[270px]">
      <div className="flex h-full max-h-screen w-full flex-col overflow-hidden rounded-none bg-white shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-[#16181A] sm:text-2xl">
              {editingNews ? 'Edit News' : 'Create News'}
            </h2>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              {editingNews
                ? 'Update the news article information.'
                : 'Create and publish a new news article.'}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={saving}
            className="ml-3 flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50">
            <X className="size-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <form
            onSubmit={editingNews ? handleUpdateNews : handleCreateNews}
            noValidate
            className="grid grid-cols-1 gap-5 p-4 pb-8 sm:gap-6 sm:p-6 sm:pb-8 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-7">
            {/* =====================================================
                MAIN FORM
            ====================================================== */}
            <section className="order-1 flex min-w-0 flex-col gap-5 xl:order-1">
              {/* TITLE */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="news-title" className={LABEL}>
                  Title
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <Input
                  id="news-title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);

                    setFormErrors((prev) => ({
                      ...prev,
                      title: '',
                    }));
                  }}
                  placeholder="Enter news title"
                  disabled={saving}
                  aria-invalid={Boolean(formErrors.title)}
                  className={`${FIELD} h-11`}
                />

                {formErrors.title && <p className={ERROR}>{formErrors.title}</p>}
              </div>

              {/* CATEGORY */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="news-category" className={LABEL}>
                  Category
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    id="news-category"
                    value={categoryId}
                    onChange={(event) => {
                      setCategoryId(event.target.value);

                      setFormErrors((prev) => ({
                        ...prev,
                        categoryId: '',
                      }));
                    }}
                    disabled={categoriesLoading || saving}
                    aria-invalid={Boolean(formErrors.categoryId)}
                    className={`${FIELD} h-11 w-full appearance-none pr-10 ${
                      categoryId ? '' : 'text-[#9CA1A8]'
                    }`}>
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="text-[#16181A]">
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                </div>

                {formErrors.categoryId && (
                  <p className={ERROR}>{formErrors.categoryId}</p>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="news-excerpt" className={LABEL}>
                  Description
                </label>

                <Textarea
                  id="news-excerpt"
                  value={excerpt}
                  onChange={(event) => {
                    setExcerpt(event.target.value);
                  }}
                  placeholder="Write a short description of the news..."
                  disabled={saving}
                  rows={4}
                  className={`${FIELD} min-h-[105px] resize-y py-3`}
                />
              </div>

              {/* BODY */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="news-body" className={LABEL}>
                  Body
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <Textarea
                  id="news-body"
                  value={body}
                  onChange={(event) => {
                    setBody(event.target.value);

                    setFormErrors((prev) => ({
                      ...prev,
                      body: '',
                    }));
                  }}
                  placeholder="Write the complete news article..."
                  disabled={saving}
                  aria-invalid={Boolean(formErrors.body)}
                  rows={12}
                  className={`${FIELD} min-h-[260px] resize-y py-3`}
                />

                {formErrors.body && <p className={ERROR}>{formErrors.body}</p>}
              </div>

              {/* IMAGE CAPTION */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="news-caption" className={LABEL}>
                  Image Caption
                </label>

                <Input
                  id="news-caption"
                  type="text"
                  value={caption}
                  onChange={(event) => {
                    setCaption(event.target.value);
                  }}
                  placeholder="Enter image caption"
                  disabled={saving}
                  className={`${FIELD} h-11`}
                />
              </div>

              {/* FEATURED IMAGE */}
              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Featured Image</label>

                <label className={UPLOAD}>
                  <ImageIcon className="size-5" />

                  <span>
                    {featuredImage ? 'Change Featured Image' : 'Choose Featured Image'}
                  </span>

                  <input
                    ref={featuredInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFeaturedImageChange}
                    disabled={saving}
                    className="sr-only"
                  />
                </label>

                <p className="text-sm text-slate-500">JPG, PNG or WEBP. Maximum 5 MB.</p>

                {featuredPreview && (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={featuredPreview}
                      alt="Featured preview"
                      className="h-52 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveFeaturedImage}
                      disabled={saving}
                      className={REMOVE}
                      aria-label="Remove featured image">
                      <X className="size-4" />
                    </button>
                  </div>
                )}

                {editingNews?.featured_image && !featuredPreview && (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={getImageUrl(editingNews.featured_image)}
                      alt={editingNews.title || 'Featured image'}
                      className="h-52 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* EXISTING BACKEND IMAGES */}
              {editingNews && (
                <div className="flex flex-col gap-2">
                  <label className={LABEL}>Existing Backend Images</label>

                  {Array.isArray(editingNews.images) && editingNews.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {editingNews.images.map((image, index) => {
                        const imagePath =
                          typeof image === 'string'
                            ? image
                            : image?.path ||
                              image?.url ||
                              image?.image ||
                              image?.image_path ||
                              '';

                        return (
                          <div
                            key={image?.id || `${imagePath}-${index}`}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {imagePath ? (
                              <img
                                src={getImageUrl(imagePath)}
                                alt={`Existing news image ${index + 1}`}
                                className="h-32 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-32 items-center justify-center text-sm text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                      No existing backend images.
                    </div>
                  )}
                </div>
              )}

              {/* NEWS IMAGES */}
              <div className="flex flex-col gap-1.5">
                <label className={LABEL}>News Images</label>

                <label className={UPLOAD}>
                  <ImageIcon className="size-5" />

                  <span>Add Images ({images.length}/3)</span>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImagesChange}
                    disabled={saving || images.length >= 3}
                    className="sr-only"
                  />
                </label>

                <p className="text-sm text-slate-500">
                  Maximum 3 images. Each image must be 5 MB or less.
                </p>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={`${preview.url}-${index}`}
                        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={preview.url}
                          alt={`News preview ${index + 1}`}
                          className="h-36 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          disabled={saving}
                          className={REMOVE}
                          aria-label={`Remove image ${index + 1}`}>
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* =====================================================
                SETTINGS
            ====================================================== */}
            <aside className="order-2 h-fit rounded-2xl border border-blue-100 bg-blue-50/30 p-4 shadow-sm sm:p-5 xl:sticky xl:top-0 xl:bg-white">
              <div className="flex flex-col gap-5">
                {/* PRIORITY */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="news-priority" className={SIDE_LABEL}>
                    Priority
                  </label>

                  <div className="relative">
                    <select
                      id="news-priority"
                      value={priority}
                      onChange={(event) => {
                        setPriority(event.target.value);

                        setFormErrors((prev) => ({
                          ...prev,
                          priority: '',
                        }));
                      }}
                      disabled={saving}
                      className={`${SIDE_FIELD} appearance-none pr-10`}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  </div>

                  {formErrors.priority && <p className={ERROR}>{formErrors.priority}</p>}
                </div>

                {/* AUTHOR */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="news-author" className={SIDE_LABEL}>
                    Author
                  </label>

                  <Input
                    id="news-author"
                    type="text"
                    value={author}
                    onChange={(event) => {
                      setAuthor(event.target.value);
                    }}
                    placeholder="Enter author name"
                    disabled={saving}
                    className={SIDE_FIELD}
                  />
                </div>

                {/* PUBLISHING */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-semibold text-[#16181A]">Publishing</h3>

                  <div className="mt-4 flex flex-col gap-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={isFeatured}
                        onCheckedChange={(checked) => {
                          setIsFeatured(Boolean(checked));
                        }}
                        disabled={saving}
                        className="mt-0.5"
                      />

                      <span>
                        <span className="block text-base font-medium text-[#16181A]">
                          Featured News
                        </span>

                        <span className="mt-0.5 block text-sm leading-5 text-slate-500">
                          Show this article as featured news.
                        </span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={isPublished}
                        onCheckedChange={(checked) => {
                          setIsPublished(Boolean(checked));
                        }}
                        disabled={saving}
                        className="mt-0.5"
                      />

                      <span>
                        <span className="block text-base font-medium text-[#16181A]">
                          Publish Now
                        </span>

                        <span className="mt-0.5 block text-sm leading-5 text-slate-500">
                          Make this article visible immediately.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* BUTTONS */}
                {/* BUTTONS */}
                <div className="border-t border-slate-200 pt-5">
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={saving}
                      className="
        h-12 w-full
        rounded-xl
        border border-slate-300
        bg-white
        px-4
        text-sm font-medium
        text-slate-700
        transition
        hover:bg-slate-50
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-50
      ">
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="
        flex h-12 w-full
        items-center justify-center
        gap-2
        rounded-xl
        bg-[#2168CD]
        px-5
        text-sm font-semibold
        text-white
        shadow-sm
        transition-all
        hover:bg-[#1958B2]
        hover:shadow-md
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-60
      ">
                      {saving ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin" />
                          {editingNews ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>{editingNews ? 'Update News' : 'Create News'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminNewsForm;
