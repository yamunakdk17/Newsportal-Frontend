// import { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   Plus,
//   Search,
//   Pencil,
//   Trash2,
//   X,
//   Newspaper,
//   RefreshCw,
//   LoaderCircle,
//   Image as ImageIcon,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';

// import api from '@/services/api';
// import { getImageUrl } from '@/lib/getImageUrl';
// import AdminSidebar from '@/components/layout/AdminSidebar';
// import AdminNewsForm from '@/components/admin/AdminNewsForm';

// /* ------------------------------------------------------------------
//    CONFIG
// ------------------------------------------------------------------- */
// const MAX_NEWS_IMAGES = 3;
// const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// /*
//  * false -> real PUT request
//  * true  -> POST + _method=PUT
//  */
// const USE_METHOD_SPOOFING = false;

// /* ------------------------------------------------------------------
//    PURE HELPERS
// ------------------------------------------------------------------- */

// const isTrue = (value) => {
//   return value === true || value === 1 || value === '1' || value === 'true';
// };

// const normalizePriority = (value) => {
//   const normalized = String(value ?? '')
//     .trim()
//     .toLowerCase();

//   return ['high', 'medium', 'low'].includes(normalized) ? normalized : 'medium';
// };

// const getBackendError = (error) => {
//   const backendErrors = error.response?.data?.errors;

//   if (backendErrors) {
//     const firstError = Object.values(backendErrors)?.[0]?.[0];

//     if (firstError) {
//       return firstError;
//     }
//   }

//   return (
//     error.response?.data?.message ||
//     error.message ||
//     'Something went wrong. Please try again.'
//   );
// };

// /* Raw image path / URL returned by backend. */
// const getImagePath = (image) => {
//   if (!image) {
//     return '';
//   }

//   if (typeof image === 'string') {
//     return image;
//   }

//   return image?.path || image?.url || image?.image || image?.image_path || '';
// };

// /*
//  * Stable identifier for an existing image.
//  * Backend id is preferred.
//  * Image path is used as fallback.
//  */
// const getImageId = (image) => {
//   if (!image || typeof image !== 'object') {
//     return null;
//   }

//   return image.id ?? image.image_id ?? null;
// };

// const getFeaturedImageId = (article) => {
//   const featuredImage = article?.featured_image;

//   if (!featuredImage || typeof featuredImage !== 'object') {
//     return null;
//   }

//   return featuredImage.id ?? featuredImage.image_id ?? null;
// };

// /*
//  * Compare image paths without considering:
//  * - domain
//  * - leading slash
//  */
// const isSamePath = (a, b) => {
//   const clean = (value) =>
//     String(value || '')
//       .replace(/^https?:\/\/[^/]+/i, '')
//       .replace(/^\/+/, '');

//   return Boolean(clean(a)) && clean(a) === clean(b);
// };

// /* Final image URL used by <img>. */
// const resolveImage = (image) => {
//   const path = getImagePath(image);

//   return path ? getImageUrl(path) : '';
// };

// /*
//  * Featured image first, followed by gallery images.
//  * Duplicate URLs are removed.
//  */
// const getArticleImages = (article) => {
//   const all = [];

//   if (article?.featured_image) {
//     all.push(article.featured_image);
//   }

//   if (Array.isArray(article?.images)) {
//     all.push(...article.images);
//   }

//   return [...new Set(all.map(resolveImage).filter(Boolean))];
// };

// /*
//  * Featured image.
//  * If there is no featured image, first gallery image is used
//  * only for the article list thumbnail.
//  */
// const getFeaturedImage = (article) => {
//   if (!article) {
//     return '';
//   }

//   if (article.featured_image) {
//     return resolveImage(article.featured_image);
//   }

//   if (Array.isArray(article.images) && article.images.length > 0) {
//     return resolveImage(article.images[0]);
//   }

//   return '';
// };

// const getStatus = (article) => {
//   return isTrue(article.is_published) ? 'Published' : 'Draft';
// };

// function AdminNews() {
//   const [news, setNews] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [deleteTarget, setDeleteTarget] = useState(null);

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [formErrors, setFormErrors] = useState({});

//   const [search, setSearch] = useState('');

//   const [showModal, setShowModal] = useState(false);
//   const [editingNews, setEditingNews] = useState(null);

//   const [showGallery, setShowGallery] = useState(false);
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [galleryTitle, setGalleryTitle] = useState('');
//   const [galleryIndex, setGalleryIndex] = useState(0);

//   const [categoryId, setCategoryId] = useState('');
//   const [title, setTitle] = useState('');
//   const [body, setBody] = useState('');
//   const [caption, setCaption] = useState('');
//   const [author, setAuthor] = useState('');
//   const [priority, setPriority] = useState('medium');
//   const [excerpt, setExcerpt] = useState('');
//   const [isPublished, setIsPublished] = useState(false);
//   const [isFeatured, setIsFeatured] = useState(false);

//   /* Newly selected gallery images. */
//   const [images, setImages] = useState([]);

//   /* Newly selected featured image. */
//   const [featuredImage, setFeaturedImage] = useState(null);

//   /* Preview URLs for newly selected images. */
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [featuredPreview, setFeaturedPreview] = useState('');

//   /*
//    * Existing image edit state.
//    *
//    * featuredRemoved:
//    *   true = old featured image must be removed.
//    *
//    * removedImageIds:
//    *   existing gallery images the user removed.
//    */
//   const [featuredRemoved, setFeaturedRemoved] = useState(false);
//   const [removedImageIds, setRemovedImageIds] = useState([]);

//   /* ------------------------------------------------------------------
//      NOTIFICATIONS
//   ------------------------------------------------------------------- */

//   const showErrorNotification = useCallback((message) => {
//     setError(message);
//     setSuccess('');

//     window.setTimeout(() => {
//       setError((current) => (current === message ? '' : current));
//     }, 3500);
//   }, []);

//   const showSuccessNotification = useCallback((message) => {
//     setSuccess(message);
//     setError('');

//     window.setTimeout(() => {
//       setSuccess((current) => (current === message ? '' : current));
//     }, 3500);
//   }, []);

//   /* ------------------------------------------------------------------
//      DERIVED IMAGE STATE
//   ------------------------------------------------------------------- */

//   /*
//    * Existing featured image that is still active.
//    *
//    * If:
//    * - no editing article
//    * - featured image was removed
//    *
//    * then this returns an empty string.
//    */
//   const existingFeaturedImage = useMemo(() => {
//     if (!editingNews || featuredRemoved) {
//       return '';
//     }

//     return getImagePath(editingNews.featured_image);
//   }, [editingNews, featuredRemoved]);

//   /*
//    * Existing gallery images that are still visible.
//    *
//    * The old featured image is hidden from the gallery because
//    * featured_image is displayed separately.
//    */
//   const existingGalleryImages = useMemo(() => {
//     if (!editingNews || !Array.isArray(editingNews.images)) {
//       return [];
//     }

//     const featuredPath = getImagePath(editingNews.featured_image);

//     return editingNews.images.filter((image) => {
//       const imagePath = getImagePath(image);

//       if (!imagePath) {
//         return false;
//       }

//       /*
//        * Do not display the featured image twice.
//        *
//        * This is only UI filtering.
//        * Actual deletion of the old featured image from the
//        * backend is handled by getImageRemoval().
//        */
//       if (featuredPath && isSamePath(imagePath, featuredPath)) {
//         return false;
//       }

//       return !removedImageIds.includes(getImageId(image));
//     });
//   }, [editingNews, removedImageIds]);

//   /*
//    * Does the article currently have a featured image?
//    *
//    * New file OR existing saved image.
//    */
//   const hasFeaturedImageNow =
//     featuredImage instanceof File || Boolean(existingFeaturedImage);

//   /*
//    * A news article cannot remain featured when it has no
//    * featured image.
//    */
//   useEffect(() => {
//     if (!hasFeaturedImageNow && isFeatured) {
//       setIsFeatured(false);
//     }
//   }, [hasFeaturedImageNow, isFeatured]);

//   /* ------------------------------------------------------------------
//      FETCH
//   ------------------------------------------------------------------- */

//   const fetchNews = useCallback(async () => {
//     try {
//       const response = await api.get('/admin/posts', {
//         params: {
//           page: 1,
//           per_page: 50,
//         },
//       });

//       if (!response.data?.success) {
//         showErrorNotification(response.data?.message || 'Unable to load news.');
//         return;
//       }

//       const responseData = response.data?.data;

//       let posts = [];

//       if (Array.isArray(responseData)) {
//         posts = responseData;
//       } else if (Array.isArray(responseData?.data)) {
//         posts = responseData.data;
//       }

//       setNews(posts);
//     } catch (error) {
//       console.error('News fetch error:', error);

//       showErrorNotification(
//         error.response?.data?.message || error.message || 'Unable to load news.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [showErrorNotification]);

//   const fetchCategories = useCallback(async () => {
//     try {
//       const response = await api.get('/admin/categories', {
//         params: {
//           page: 1,
//           per_page: 100,
//         },
//       });

//       if (!response.data?.success) {
//         showErrorNotification(response.data?.message || 'Unable to load categories.');
//         return;
//       }

//       const responseData = response.data?.data;

//       let categoryList = [];

//       if (Array.isArray(responseData)) {
//         categoryList = responseData;
//       } else if (Array.isArray(responseData?.data)) {
//         categoryList = responseData.data;
//       }

//       setCategories(categoryList);
//     } catch (error) {
//       console.error('Category fetch error:', error);

//       showErrorNotification(
//         error.response?.data?.message || error.message || 'Unable to load categories.',
//       );
//     } finally {
//       setCategoriesLoading(false);
//     }
//   }, [showErrorNotification]);

//   useEffect(() => {
//     fetchNews();
//     fetchCategories();
//   }, [fetchNews, fetchCategories]);

//   /* ------------------------------------------------------------------
//      FORM RESET / OPEN / CLOSE
//   ------------------------------------------------------------------- */

//   const resetForm = useCallback(() => {
//     imagePreviews.forEach((preview) => {
//       if (preview?.url) {
//         URL.revokeObjectURL(preview.url);
//       }
//     });

//     if (featuredPreview) {
//       URL.revokeObjectURL(featuredPreview);
//     }

//     setCategoryId('');
//     setTitle('');
//     setExcerpt('');
//     setBody('');
//     setCaption('');
//     setAuthor('');
//     setPriority('medium');

//     setIsPublished(false);
//     setIsFeatured(false);

//     setImages([]);
//     setFeaturedImage(null);

//     setImagePreviews([]);
//     setFeaturedPreview('');

//     setFeaturedRemoved(false);
//     setRemovedImageIds([]);

//     setFormErrors({});
//   }, [imagePreviews, featuredPreview]);

//   const openCreateModal = () => {
//     resetForm();

//     setEditingNews(null);

//     setError('');
//     setSuccess('');

//     setShowModal(true);
//   };

//   const openEditModal = (article) => {
//     resetForm();

//     setEditingNews(article);

//     setCategoryId(
//       article.category_id !== null && article.category_id !== undefined
//         ? String(article.category_id)
//         : '',
//     );

//     setTitle(article.title || '');
//     setExcerpt(article.excerpt || '');
//     setBody(article.body || '');
//     setCaption(article.caption || '');
//     setAuthor(article.author || article.added_by || '');
//     setPriority(normalizePriority(article.priority));
//     setIsPublished(isTrue(article.is_published));

//     /*
//      * is_featured can only be true when there is a saved
//      * featured image.
//      */
//     const hasSavedFeaturedImage = Boolean(getImagePath(article.featured_image));

//     setIsFeatured(hasSavedFeaturedImage && isTrue(article.is_featured));

//     setError('');
//     setSuccess('');

//     setShowModal(true);
//   };

//   const closeModal = () => {
//     if (saving) {
//       return;
//     }

//     setShowModal(false);
//     setEditingNews(null);

//     resetForm();
//   };

//   /* ------------------------------------------------------------------
//      VALIDATION
//   ------------------------------------------------------------------- */

//   const validateForm = () => {
//     const errors = {};

//     if (!categoryId) {
//       errors.categoryId = 'Please select a category.';
//     }

//     if (!title.trim()) {
//       errors.title = 'Title is required.';
//     }

//     if (!body.trim()) {
//       errors.body = 'Body is required.';
//     }

//     if (!['high', 'medium', 'low'].includes(priority)) {
//       errors.priority = 'Please select a priority.';
//     }

//     setFormErrors(errors);

//     if (Object.keys(errors).length > 0) {
//       if (errors.categoryId) {
//         showErrorNotification('Please select a category.');
//       } else if (errors.title) {
//         showErrorNotification('Please enter a news title.');
//       } else if (errors.body) {
//         showErrorNotification('Please enter the news body.');
//       } else if (errors.priority) {
//         showErrorNotification('Please select a priority.');
//       }

//       return false;
//     }

//     return true;
//   };

//   /* ------------------------------------------------------------------
//      IMAGE REMOVAL CALCULATION
//   ------------------------------------------------------------------- */

//   /*
//    * Calculates the FINAL saved image state.
//    *
//    * Example:
//    *
//    * Existing:
//    *   image1
//    *   image2
//    *   image3
//    *
//    * User removes image2:
//    *
//    * remainingImages:
//    *   image1
//    *   image3
//    *
//    * User removes everything:
//    *
//    * remainingImages:
//    *   []
//    */
// const getImageRemoval = () => {
//   const savedImages = Array.isArray(editingNews?.images)
//     ? editingNews.images
//     : [];

//   const idsToRemove = new Set();

//   removedImageIds.forEach((imageId) => {
//     if (
//       imageId !== undefined &&
//       imageId !== null &&
//       imageId !== ''
//     ) {
//       idsToRemove.add(imageId);
//     }
//   });

//   if (featuredRemoved) {
//     const oldFeatured = editingNews?.featured_image;
//     const oldFeaturedPath = getImagePath(oldFeatured);

//     const featuredImageId = getFeaturedImageId(editingNews);

//     if (
//       featuredImageId !== undefined &&
//       featuredImageId !== null &&
//       featuredImageId !== ''
//     ) {
//       idsToRemove.add(featuredImageId);
//     }

//     if (oldFeaturedPath) {
//       savedImages.forEach((image) => {
//         const imagePath = getImagePath(image);

//         if (!isSamePath(imagePath, oldFeaturedPath)) {
//           return;
//         }

//         const imageId = getImageId(image);

//         if (
//           imageId !== undefined &&
//           imageId !== null &&
//           imageId !== ''
//         ) {
//           idsToRemove.add(imageId);
//         }
//       });
//     }
//   }

//   const remainingImages = savedImages.filter((image) => {
//     const imageId = getImageId(image);

//     if (
//       imageId !== undefined &&
//       imageId !== null &&
//       imageId !== ''
//     ) {
//       return !idsToRemove.has(imageId);
//     }

//     return true;
//   });

//   return {
//     idsToRemove: [...idsToRemove],
//     remainingImages,
//     remainingImagePaths: remainingImages
//       .map(getImagePath)
//       .filter(Boolean),
//   };
// };

//   /* ------------------------------------------------------------------
//      FORM DATA
//   ------------------------------------------------------------------- */

//   /*
//    * Used for:
//    * - creating news
//    * - updating news when new files are selected
//    */
//  const buildNewsFormData = () => {
//   const formData = new FormData();

//   formData.append('title', title.trim());
//   formData.append('excerpt', excerpt.trim());
//   formData.append('body', body.trim());
//   formData.append('category_id', String(Number(categoryId)));
//   formData.append('is_published', isPublished ? '1' : '0');
//   formData.append('priority', priority);
//   formData.append('caption', caption.trim());
//   formData.append('author', author.trim());

//   const hasActiveFeaturedImage =
//     featuredImage instanceof File || Boolean(existingFeaturedImage);

//   formData.append(
//     'is_featured',
//     hasActiveFeaturedImage && isFeatured ? '1' : '0',
//   );

//   images.forEach((file) => {
//     formData.append('images[]', file, file.name);
//   });

//   if (featuredImage instanceof File) {
//     formData.append(
//       'featured_image',
//       featuredImage,
//       featuredImage.name,
//     );
//   }

//   if (
//     editingNews?.id &&
//     featuredRemoved &&
//     !(featuredImage instanceof File)
//   ) {
//     formData.append('featured_image', '');
//     formData.append('is_featured', '0');
//   }

//   if (editingNews?.id) {
//     const { idsToRemove } = getImageRemoval();

//     idsToRemove.forEach((imageId) => {
//       formData.append('remove_images[]', String(imageId));
//     });
//   }

//   return formData;
// };
//   /*
//    * JSON body for updates where there are NO new files.
//    *
//    * This is extremely important because JSON allows us to send:
//    *
//    * featured_image: null
//    * images: []
//    *
//    * as actual values.
//    */
//  const buildNewsPayload = () => {
//   const { idsToRemove } = getImageRemoval();

//   const hasActiveFeaturedImage =
//     featuredImage instanceof File || Boolean(existingFeaturedImage);

//   const payload = {
//     title: title.trim(),
//     excerpt: excerpt.trim(),
//     body: body.trim(),
//     category_id: Number(categoryId),
//     is_published: isPublished,
//     priority,
//     caption: caption.trim(),
//     author: author.trim(),
//     is_featured: hasActiveFeaturedImage && isFeatured,
//   };

//   if (
//     featuredRemoved &&
//     !(featuredImage instanceof File)
//   ) {
//     payload.featured_image = null;
//     payload.is_featured = false;
//   }

//   if (idsToRemove.length > 0) {
//     payload.remove_images = idsToRemove;
//   }

//   return payload;
// };
//   /* ------------------------------------------------------------------
//      CREATE
//   ------------------------------------------------------------------- */

//   const handleCreateNews = async (event) => {
//     event.preventDefault();

//     setError('');
//     setSuccess('');

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setSaving(true);

//       const formData = buildNewsFormData();

//       const response = await api.post('/admin/posts', formData);

//       if (!response.data?.success) {
//         showErrorNotification(response.data?.message || 'Unable to create news.');
//         return;
//       }

//       const message = response.data.message || 'News created successfully.';

//       setShowModal(false);
//       setEditingNews(null);

//       resetForm();

//       setSearch('');

//       setLoading(true);

//       await fetchNews();

//       showSuccessNotification(message);
//     } catch (error) {
//       console.error('Create news error:', error);

//       showErrorNotification(getBackendError(error));
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ------------------------------------------------------------------
//      UPDATE
//   ------------------------------------------------------------------- */

//   const handleUpdateNews = async (event) => {
//     event.preventDefault();

//     setError('');
//     setSuccess('');

//     if (!editingNews?.id) {
//       showErrorNotification('No news post selected for editing.');
//       return;
//     }

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setSaving(true);

//       /*
//        * New files require FormData.
//        *
//        * No new files use JSON so null and [] are preserved.
//        */
//       const hasNewFiles =
//   images.length > 0 || featuredImage instanceof File;

//      const requestBody = hasNewFiles
//   ? buildNewsFormData()
//   : buildNewsPayload();

//   const response = await api.put(
//   `/admin/posts/${editingNews.id}`,
//   requestBody,
// );

//       console.log(requestBody);

//       if (USE_METHOD_SPOOFING) {
//         if (hasNewFiles) {
//           requestBody.append('_method', 'PUT');
//         } else {
//           requestBody._method = 'PUT';
//         }

//         response = await api.post(`/admin/posts/${editingNews.id}`, requestBody);
//       } else {
//         response = await api.put(`/admin/posts/${editingNews.id}`, requestBody);
//       }

//       if (!response.data?.success) {
//         showErrorNotification(response.data?.message || 'Unable to update news.');
//         return;
//       }

//       const message = response.data.message || 'News updated successfully.';

//       setShowModal(false);
//       setEditingNews(null);

//       resetForm();

//       setLoading(true);

//       await fetchNews();

//       showSuccessNotification(message);
//     } catch (error) {
//       console.error('Update news error:', error);

//       showErrorNotification(getBackendError(error));
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ------------------------------------------------------------------
//      PUBLISH
//   ------------------------------------------------------------------- */

//   const handlePublishNews = async (postId) => {
//     try {
//       setError('');
//       setSuccess('');

//       const response = await api.put(`/admin/posts/${postId}`, {
//         is_published: true,
//       });

//       if (!response.data?.success) {
//         showErrorNotification(response.data?.message || 'Unable to publish news.');
//         return;
//       }

//       setNews((currentNews) =>
//         currentNews.map((article) =>
//           article.id === postId
//             ? {
//                 ...article,
//                 is_published: true,
//                 published_at: response.data?.data?.published_at || article.published_at,
//               }
//             : article,
//         ),
//       );

//       showSuccessNotification(response.data?.message || 'News published successfully.');
//     } catch (error) {
//       console.error('Publish news error:', error);

//       showErrorNotification(getBackendError(error));
//     }
//   };

//   /* ------------------------------------------------------------------
//      DELETE
//   ------------------------------------------------------------------- */

//   const requestDeleteNews = (article) => {
//     if (!article?.id) {
//       showErrorNotification('Invalid news post.');
//       return;
//     }

//     setDeleteTarget(article);
//   };

//   const cancelDeleteNews = () => {
//     if (deletingId) {
//       return;
//     }

//     setDeleteTarget(null);
//   };

//   const handleDeleteNews = async () => {
//     const article = deleteTarget;

//     if (!article?.id) {
//       return;
//     }

//     try {
//       setDeletingId(article.id);

//       setError('');
//       setSuccess('');

//       const response = await api.delete(`/admin/posts/${article.id}`);

//       if (!response.data?.success) {
//         showErrorNotification(response.data?.message || 'Unable to delete news.');
//         return;
//       }

//       setNews((currentNews) => currentNews.filter((item) => item.id !== article.id));

//       showSuccessNotification(response.data.message || 'News deleted successfully.');
//     } catch (error) {
//       console.error('Delete news error:', error);

//       showErrorNotification(getBackendError(error));
//     } finally {
//       setDeletingId(null);
//       setDeleteTarget(null);
//     }
//   };

//   /* ------------------------------------------------------------------
//      IMAGE HANDLERS
//   ------------------------------------------------------------------- */

//   /*
//    * Add new gallery images.
//    *
//    * Active saved images + newly selected images <= 3.
//    */
//   const handleImagesChange = (event) => {
//     const selectedFiles = Array.from(event.target.files || []);

//     if (selectedFiles.length === 0) {
//       return;
//     }

//     const availableSlots = MAX_NEWS_IMAGES - existingGalleryImages.length - images.length;

//     if (availableSlots <= 0) {
//       showErrorNotification(`You can upload a maximum of ${MAX_NEWS_IMAGES} images.`);

//       event.target.value = '';
//       return;
//     }

//     const validFiles = selectedFiles.filter(
//       (file) => VALID_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE,
//     );

//     const acceptedFiles = validFiles.slice(0, availableSlots);

//     if (validFiles.length !== selectedFiles.length) {
//       showErrorNotification('Only JPG, PNG and WEBP images up to 5 MB are allowed.');
//     } else if (validFiles.length > availableSlots) {
//       showErrorNotification(
//         `You can add only ${availableSlots} more image${
//           availableSlots === 1 ? '' : 's'
//         }.`,
//       );
//     }

//     if (acceptedFiles.length === 0) {
//       event.target.value = '';
//       return;
//     }

//     setImages((current) => [...current, ...acceptedFiles]);

//     setImagePreviews((current) => [
//       ...current,
//       ...acceptedFiles.map((file) => ({
//         file,
//         url: URL.createObjectURL(file),
//       })),
//     ]);

//     event.target.value = '';
//   };

//   /*
//    * Select / replace featured image.
//    *
//    * IMPORTANT:
//    * When editing an existing article and selecting a new
//    * featured image, the old featured image must be considered
//    * removed.
//    */
//   const handleFeaturedImageChange = (event) => {
//     const file = event.target.files?.[0];

//     if (!file) {
//       return;
//     }

//     if (!VALID_IMAGE_TYPES.includes(file.type)) {
//       setFormErrors((prev) => ({
//         ...prev,
//         featuredImage: 'Only JPG, PNG and WEBP images are allowed.',
//       }));

//       event.target.value = '';
//       return;
//     }

//     if (file.size > MAX_IMAGE_SIZE) {
//       setFormErrors((prev) => ({
//         ...prev,
//         featuredImage: 'Featured image must be 5 MB or less.',
//       }));

//       event.target.value = '';
//       return;
//     }

//     /*
//      * Release previous new-file preview.
//      */
//     if (featuredPreview) {
//       URL.revokeObjectURL(featuredPreview);
//     }

//     /*
//      * IMPORTANT:
//      *
//      * Existing featured image:
//      *     old.jpg
//      *
//      * User selects:
//      *     new.jpg
//      *
//      * Mark old.jpg as removed so it cannot remain
//      * in the backend.
//      */
//     if (editingNews?.id) {
//       setFeaturedRemoved(true);
//     }

//     setFeaturedImage(file);
//     setFeaturedPreview(URL.createObjectURL(file));

//     setFormErrors((prev) => ({
//       ...prev,
//       featuredImage: '',
//     }));

//     event.target.value = '';
//   };

//   /* Remove newly selected gallery image. */
//   const removeImage = (index) => {
//     const preview = imagePreviews[index];

//     if (preview?.url) {
//       URL.revokeObjectURL(preview.url);
//     }

//     setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));

//     setImagePreviews((current) =>
//       current.filter((_, imageIndex) => imageIndex !== index),
//     );
//   };

//   /*
//    * Remove newly selected featured image.
//    */
//   const removeFeaturedImage = () => {
//     if (featuredPreview) {
//       URL.revokeObjectURL(featuredPreview);
//     }

//     setFeaturedImage(null);
//     setFeaturedPreview('');

//     setFormErrors((prev) => ({
//       ...prev,
//       featuredImage: '',
//     }));
//   };

//   /*
//    * Remove EXISTING saved featured image.
//    *
//    * This means:
//    *
//    * featured_image = null
//    * is_featured = false
//    */
// const removeExistingFeaturedImage = () => {
//   setFeaturedRemoved(true);
//   setIsFeatured(false);

//   setFormErrors((prev) => ({
//     ...prev,
//     featuredImage: '',
//   }));
// };
//     /*
//      * Immediately uncheck Featured News.
//      */
//     setIsFeatured(false);

//     setFormErrors((prev) => ({
//       ...prev,
//       featuredImage: '',
//     }));
//   };

//   /*
//    * Remove an existing saved gallery image.
//    */
//   const removeExistingImage = (image) => {
//   const imageId = getImageId(image);

//   if (
//     imageId === undefined ||
//     imageId === null ||
//     imageId === ''
//   ) {
//     return;
//   }

//   setRemovedImageIds((current) =>
//     current.includes(imageId)
//       ? current
//       : [...current, imageId],
//   );
// };
//   /* ------------------------------------------------------------------
//      SEARCH
//   ------------------------------------------------------------------- */

//   const filteredNews = useMemo(() => {
//     const keyword = search.trim().toLowerCase();

//     if (!keyword) {
//       return news;
//     }

//     return news.filter((article) => {
//       return (
//         article.title?.toLowerCase().includes(keyword) ||
//         article.slug?.toLowerCase().includes(keyword) ||
//         article.category?.name?.toLowerCase().includes(keyword)
//       );
//     });
//   }, [news, search]);

//   /* ------------------------------------------------------------------
//      GALLERY
//   ------------------------------------------------------------------- */

//   const openGallery = (article) => {
//     const articleImages = getArticleImages(article);

//     if (articleImages.length === 0) {
//       showErrorNotification('No images available for this article.');
//       return;
//     }

//     setGalleryImages(articleImages);
//     setGalleryTitle(article.title || 'News Images');
//     setGalleryIndex(0);
//     setShowGallery(true);
//   };

//   const closeGallery = () => {
//     setShowGallery(false);
//     setGalleryImages([]);
//     setGalleryIndex(0);
//     setGalleryTitle('');
//   };

//   const previousGalleryImage = () => {
//     setGalleryIndex((current) =>
//       current === 0 ? galleryImages.length - 1 : current - 1,
//     );
//   };

//   const nextGalleryImage = () => {
//     setGalleryIndex((current) =>
//       current === galleryImages.length - 1 ? 0 : current + 1,
//     );
//   };

//   return (
//     <div className="min-h-screen bg-[#F6F8FA]">
//       <AdminSidebar />

//       <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
//         <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
//           <div className="mx-auto w-full max-w-[1500px]">
//             {/* Header */}
//             <div className="flex flex-col gap-4 border-b border-[#EEF0F2] pb-5 md:flex-row md:items-center md:justify-between">
//               <div className="min-w-0">
//                 <div className="flex items-center gap-3">
//                   <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2168CD] sm:flex">
//                     <Newspaper className="size-4.5" />
//                   </div>

//                   <div className="min-w-0">
//                     <h1 className="truncate text-2xl font-bold tracking-tight text-[#16181A] sm:text-[26px]">
//                       News
//                     </h1>

//                     <p className="mt-1 text-sm text-slate-500">
//                       Manage your news articles.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex w-full flex-col gap-2.5 sm:flex-row md:w-auto">
//                 <div className="relative min-w-0 flex-1 sm:w-[260px] md:w-[280px]">
//                   <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(event) => setSearch(event.target.value)}
//                     placeholder="Search articles..."
//                     className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-[#16181A] outline-none transition placeholder:text-slate-400 focus:border-[#2168CD] focus:ring-2 focus:ring-[#2168CD]/10"
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={openCreateModal}
//                   className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2168CD] px-4 text-sm font-semibold text-white transition hover:bg-[#1958B2]">
//                   <Plus className="size-4" />
//                   New News
//                 </button>
//               </div>
//             </div>

//             {/* Notifications */}
//             {error && (
//               <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
//                 <span>{error}</span>

//                 <button
//                   type="button"
//                   onClick={() => setError('')}
//                   aria-label="Close error"
//                   className="shrink-0">
//                   <X className="size-4" />
//                 </button>
//               </div>
//             )}

//             {success && (
//               <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm font-medium text-green-700">
//                 <span>{success}</span>

//                 <button
//                   type="button"
//                   onClick={() => setSuccess('')}
//                   aria-label="Close success message"
//                   className="shrink-0">
//                   <X className="size-4" />
//                 </button>
//               </div>
//             )}

//             {/* Articles */}
//             <div className="mt-5 overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white shadow-sm">
//               <div className="flex flex-col gap-3 border-b border-[#EEF0F2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
//                 <div>
//                   <h2 className="text-base font-semibold text-[#16181A]">All Articles</h2>

//                   <p className="mt-0.5 text-xs text-slate-500">
//                     {filteredNews.length} article
//                     {filteredNews.length === 1 ? '' : 's'} found
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setLoading(true);
//                     setCategoriesLoading(true);

//                     fetchNews();
//                     fetchCategories();
//                   }}
//                   disabled={loading}
//                   className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
//                   <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
//                   Refresh
//                 </button>
//               </div>

//               {loading ? (
//                 <div className="flex min-h-[300px] items-center justify-center">
//                   <div className="flex items-center gap-2.5 text-slate-500">
//                     <LoaderCircle className="size-5 animate-spin" />
//                     <span className="text-sm">Loading news...</span>
//                   </div>
//                 </div>
//               ) : filteredNews.length === 0 ? (
//                 <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
//                   <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100">
//                     <Newspaper className="size-6 text-slate-400" />
//                   </div>

//                   <h3 className="mt-3 text-base font-semibold text-slate-800">
//                     No articles found
//                   </h3>

//                   <p className="mt-1 max-w-md text-xs text-slate-500">
//                     {search
//                       ? 'Try changing your search keyword.'
//                       : 'Create your first news article to get started.'}
//                   </p>

//                   {!search && (
//                     <button
//                       type="button"
//                       onClick={openCreateModal}
//                       className="mt-4 flex h-9 items-center gap-1.5 rounded-xl bg-[#2168CD] px-3.5 text-xs font-semibold text-white transition hover:bg-[#1958B2]">
//                       <Plus className="size-3.5" />
//                       Create Article
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 <>
//                   {/* Desktop */}
//                   <div className="hidden overflow-x-auto lg:block">
//                     <table className="w-full min-w-[920px]">
//                       <thead>
//                         <tr className="border-b border-[#EEF0F2] bg-[#F8FAFC] text-left">
//                           <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
//                             Article
//                           </th>

//                           <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
//                             Category
//                           </th>

//                           <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
//                             Priority
//                           </th>

//                           <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
//                             Status
//                           </th>

//                           <th className="px-5 py-2.5 text-xs font-semibold text-slate-500">
//                             Images
//                           </th>

//                           <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>

//                       <tbody className="divide-y divide-slate-100">
//                         {filteredNews.map((article) => {
//                           const articleImages = getArticleImages(article);

//                           const featuredSrc = getFeaturedImage(article);

//                           const published = isTrue(article.is_published);

//                           const articlePriority = normalizePriority(article.priority);

//                           return (
//                             <tr
//                               key={article.id}
//                               className="transition hover:bg-slate-50/60">
//                               <td className="max-w-[420px] px-5 py-3.5">
//                                 <div className="flex items-center gap-3">
//                                   <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
//                                     {featuredSrc ? (
//                                       <img
//                                         src={featuredSrc}
//                                         alt={article.title || 'News'}
//                                         className="size-full object-cover"
//                                       />
//                                     ) : (
//                                       <div className="flex size-full items-center justify-center text-slate-400">
//                                         <ImageIcon className="size-4.5" />
//                                       </div>
//                                     )}
//                                   </div>

//                                   <div className="min-w-0">
//                                     <p className="truncate text-sm font-semibold text-[#16181A]">
//                                       {article.title || 'Untitled'}
//                                     </p>

//                                     <p className="mt-0.5 truncate text-xs text-slate-500">
//                                       {article.excerpt ||
//                                         article.slug ||
//                                         'No description'}
//                                     </p>
//                                   </div>
//                                 </div>
//                               </td>

//                               <td className="px-5 py-3.5">
//                                 <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-[#2168CD]">
//                                   {article.category?.name || 'Uncategorized'}
//                                 </span>
//                               </td>

//                               <td className="px-5 py-3.5">
//                                 <span
//                                   className={`text-xs font-semibold capitalize ${
//                                     articlePriority === 'high'
//                                       ? 'text-red-600'
//                                       : articlePriority === 'low'
//                                         ? 'text-slate-500'
//                                         : 'text-amber-600'
//                                   }`}>
//                                   {articlePriority}
//                                 </span>
//                               </td>

//                               <td className="px-5 py-3.5">
//                                 <div className="flex items-center gap-2">
//                                   <span
//                                     className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
//                                       published
//                                         ? 'bg-green-50 text-green-700'
//                                         : 'bg-slate-100 text-slate-600'
//                                     }`}>
//                                     {getStatus(article)}
//                                   </span>

//                                   {!published && (
//                                     <button
//                                       type="button"
//                                       onClick={() => handlePublishNews(article.id)}
//                                       className="h-7 rounded-lg bg-green-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-green-700">
//                                       Publish
//                                     </button>
//                                   )}
//                                 </div>
//                               </td>

//                               <td className="px-5 py-3.5">
//                                 {articleImages.length > 0 ? (
//                                   <button
//                                     type="button"
//                                     onClick={() => openGallery(article)}
//                                     className="flex items-center gap-1.5 text-xs font-medium text-[#2168CD] hover:underline">
//                                     <ImageIcon className="size-3.5" />
//                                     {articleImages.length} image
//                                     {articleImages.length === 1 ? '' : 's'}
//                                   </button>
//                                 ) : (
//                                   <span className="text-xs text-slate-400">
//                                     No images
//                                   </span>
//                                 )}
//                               </td>

//                               <td className="px-5 py-3.5">
//                                 <div className="flex items-center justify-end gap-1.5">
//                                   <button
//                                     type="button"
//                                     onClick={() => openEditModal(article)}
//                                     className="flex size-8.5 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2168CD]"
//                                     title="Edit">
//                                     <Pencil className="size-3.5" />
//                                   </button>

//                                   <button
//                                     type="button"
//                                     onClick={() => requestDeleteNews(article)}
//                                     disabled={deletingId === article.id}
//                                     className="flex size-8.5 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
//                                     title="Delete">
//                                     {deletingId === article.id ? (
//                                       <LoaderCircle className="size-3.5 animate-spin" />
//                                     ) : (
//                                       <Trash2 className="size-3.5" />
//                                     )}
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Mobile */}
//                   <div className="divide-y divide-slate-100 lg:hidden">
//                     {filteredNews.map((article) => {
//                       const articleImages = getArticleImages(article);

//                       const featuredSrc = getFeaturedImage(article);

//                       const published = isTrue(article.is_published);

//                       return (
//                         <div key={article.id} className="p-4 sm:p-5">
//                           <div className="flex gap-3">
//                             <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
//                               {featuredSrc ? (
//                                 <img
//                                   src={featuredSrc}
//                                   alt={article.title || 'News'}
//                                   className="size-full object-cover"
//                                 />
//                               ) : (
//                                 <div className="flex size-full items-center justify-center text-slate-400">
//                                   <ImageIcon className="size-5" />
//                                 </div>
//                               )}
//                             </div>

//                             <div className="min-w-0 flex-1">
//                               <h3 className="line-clamp-2 text-sm font-semibold text-[#16181A]">
//                                 {article.title || 'Untitled'}
//                               </h3>

//                               <p className="mt-1 line-clamp-2 text-xs text-slate-500">
//                                 {article.excerpt || 'No description'}
//                               </p>

//                               <div className="mt-2 flex flex-wrap items-center gap-1.5">
//                                 <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-[#2168CD]">
//                                   {article.category?.name || 'Uncategorized'}
//                                 </span>

//                                 <span
//                                   className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
//                                     published
//                                       ? 'bg-green-50 text-green-700'
//                                       : 'bg-slate-100 text-slate-600'
//                                   }`}>
//                                   {getStatus(article)}
//                                 </span>

//                                 {!published && (
//                                   <button
//                                     type="button"
//                                     onClick={() => handlePublishNews(article.id)}
//                                     className="h-7 rounded-lg bg-green-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-green-700">
//                                     Publish
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
//                             <div className="flex items-center gap-3">
//                               <span className="text-[11px] font-medium capitalize text-slate-500">
//                                 Priority: {normalizePriority(article.priority)}
//                               </span>

//                               {articleImages.length > 0 && (
//                                 <button
//                                   type="button"
//                                   onClick={() => openGallery(article)}
//                                   className="flex items-center gap-1 text-[11px] font-medium text-[#2168CD]">
//                                   <ImageIcon className="size-3.5" />
//                                   {articleImages.length}
//                                 </button>
//                               )}
//                             </div>

//                             <div className="flex items-center gap-1.5">
//                               <button
//                                 type="button"
//                                 onClick={() => openEditModal(article)}
//                                 className="flex size-8.5 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
//                                 title="Edit">
//                                 <Pencil className="size-3.5" />
//                               </button>

//                               <button
//                                 type="button"
//                                 onClick={() => requestDeleteNews(article)}
//                                 disabled={deletingId === article.id}
//                                 className="flex size-8.5 items-center justify-center rounded-lg border border-red-200 text-red-600 disabled:opacity-50"
//                                 title="Delete">
//                                 {deletingId === article.id ? (
//                                   <LoaderCircle className="size-3.5 animate-spin" />
//                                 ) : (
//                                   <Trash2 className="size-3.5" />
//                                 )}
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* FORM */}
//       {showModal && (
//         <AdminNewsForm
//           editingNews={editingNews}
//           categories={categories}
//           categoriesLoading={categoriesLoading}
//           saving={saving}
//           categoryId={categoryId}
//           setCategoryId={setCategoryId}
//           title={title}
//           setTitle={setTitle}
//           excerpt={excerpt}
//           setExcerpt={setExcerpt}
//           body={body}
//           setBody={setBody}
//           caption={caption}
//           setCaption={setCaption}
//           author={author}
//           setAuthor={setAuthor}
//           priority={priority}
//           setPriority={setPriority}
//           isPublished={isPublished}
//           setIsPublished={setIsPublished}
//           isFeatured={isFeatured}
//           setIsFeatured={setIsFeatured}
//           images={images}
//           featuredImage={featuredImage}
//           imagePreviews={imagePreviews}
//           featuredPreview={featuredPreview}
//           existingFeaturedImage={existingFeaturedImage}
//           existingImages={existingGalleryImages}
//           removeExistingFeaturedImage={removeExistingFeaturedImage}
//           removeExistingImage={removeExistingImage}
//           formErrors={formErrors}
//           setFormErrors={setFormErrors}
//           handleCreateNews={handleCreateNews}
//           handleUpdateNews={handleUpdateNews}
//           handleImagesChange={handleImagesChange}
//           handleFeaturedImageChange={handleFeaturedImageChange}
//           removeImage={removeImage}
//           removeFeaturedImage={removeFeaturedImage}
//           closeModal={closeModal}
//           getImageUrl={getImageUrl}
//         />
//       )}

//       {/* DELETE CONFIRMATION */}
//       {deleteTarget && (
//         <div
//           className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
//           onClick={cancelDeleteNews}>
//           <div
//             role="alertdialog"
//             aria-modal="true"
//             aria-labelledby="delete-news-title"
//             onClick={(event) => event.stopPropagation()}
//             className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
//             <div className="flex items-start gap-3">
//               <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
//                 <Trash2 className="size-5" />
//               </div>

//               <div className="min-w-0">
//                 <h2
//                   id="delete-news-title"
//                   className="text-base font-semibold text-[#16181A]">
//                   Delete news?
//                 </h2>

//                 <p className="mt-1 break-words text-sm text-slate-500">
//                   Are you sure you want to delete &quot;
//                   {deleteTarget.title}&quot;? This cannot be undone.
//                 </p>
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={cancelDeleteNews}
//                 disabled={Boolean(deletingId)}
//                 className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleDeleteNews}
//                 disabled={Boolean(deletingId)}
//                 className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
//                 {deletingId ? (
//                   <>
//                     <LoaderCircle className="size-4 animate-spin" />
//                     Deleting...
//                   </>
//                 ) : (
//                   'Delete'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* GALLERY */}
//       {showGallery && galleryImages.length > 0 && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6">
//           <button
//             type="button"
//             onClick={closeGallery}
//             className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
//             aria-label="Close gallery">
//             <X className="size-5" />
//           </button>

//           <div className="flex w-full max-w-5xl flex-col items-center">
//             <div className="mb-3 max-w-full px-12 text-center">
//               <h2 className="truncate text-base font-semibold text-white sm:text-lg">
//                 {galleryTitle}
//               </h2>

//               <p className="mt-1 text-xs text-white/70">
//                 {galleryIndex + 1} / {galleryImages.length}
//               </p>
//             </div>

//             <div className="relative flex w-full items-center justify-center">
//               {galleryImages.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={previousGalleryImage}
//                   className="absolute left-1 z-10 flex size-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl transition hover:bg-slate-100 sm:left-3"
//                   aria-label="Previous image">
//                   <ChevronLeft className="size-5" />
//                 </button>
//               )}

//               <img
//                 src={galleryImages[galleryIndex]}
//                 alt={`${galleryTitle} ${galleryIndex + 1}`}
//                 className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
//               />

//               {galleryImages.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={nextGalleryImage}
//                   className="absolute right-1 z-10 flex size-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl transition hover:bg-slate-100 sm:right-3"
//                   aria-label="Next image">
//                   <ChevronRight className="size-5" />
//                 </button>
//               )}
//             </div>

//             {galleryImages.length > 1 && (
//               <div className="mt-3 flex max-w-full gap-1.5 overflow-x-auto px-2 pb-2">
//                 {galleryImages.map((image, index) => (
//                   <button
//                     key={`${image}-${index}`}
//                     type="button"
//                     onClick={() => setGalleryIndex(index)}
//                     className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
//                       galleryIndex === index
//                         ? 'border-white'
//                         : 'border-transparent opacity-60 hover:opacity-100'
//                     }`}>
//                     <img
//                       src={image}
//                       alt={`Thumbnail ${index + 1}`}
//                       className="size-full object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AdminNews;

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getImageUrl } from '@/lib/getImageUrl';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminNewsForm from '@/components/admin/AdminNewsForm';

const MAX_NEWS_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const USE_METHOD_SPOOFING = false;

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

const getImagePath = (image) => {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image?.path || image?.url || image?.image || image?.image_path || '';
};

const getImageId = (image) => {
  if (!image || typeof image !== 'object') {
    return null;
  }

  return image.id ?? image.image_id ?? null;
};

const getFeaturedImageId = (article) => {
  const featuredImage = article?.featured_image;

  if (!featuredImage || typeof featuredImage !== 'object') {
    return null;
  }

  return featuredImage.id ?? featuredImage.image_id ?? null;
};

const isSamePath = (a, b) => {
  const clean = (value) =>
    String(value || '')
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/+/, '');

  return Boolean(clean(a)) && clean(a) === clean(b);
};

const resolveImage = (image) => {
  const path = getImagePath(image);

  return path ? getImageUrl(path) : '';
};

const getArticleImages = (article) => {
  const all = [];

  if (article?.featured_image) {
    all.push(article.featured_image);
  }

  if (Array.isArray(article?.images)) {
    all.push(...article.images);
  }

  return [...new Set(all.map(resolveImage).filter(Boolean))];
};

const getFeaturedImage = (article) => {
  if (!article) {
    return '';
  }

  if (article.featured_image) {
    return resolveImage(article.featured_image);
  }

  if (Array.isArray(article.images) && article.images.length > 0) {
    return resolveImage(article.images[0]);
  }

  return '';
};

const getStatus = (article) => {
  return isTrue(article.is_published) ? 'Published' : 'Draft';
};

function AdminNews() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const [featuredRemoved, setFeaturedRemoved] = useState(false);
  const [removedImageIds, setRemovedImageIds] = useState([]);

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

  const existingFeaturedImage = useMemo(() => {
    if (!editingNews || featuredRemoved) {
      return '';
    }

    return getImagePath(editingNews.featured_image);
  }, [editingNews, featuredRemoved]);

  const existingGalleryImages = useMemo(() => {
    if (!editingNews || !Array.isArray(editingNews.images)) {
      return [];
    }

    const featuredPath = getImagePath(editingNews.featured_image);

    return editingNews.images.filter((image) => {
      const imagePath = getImagePath(image);

      if (!imagePath) {
        return false;
      }

      if (featuredPath && isSamePath(imagePath, featuredPath)) {
        return false;
      }

      const imageId = getImageId(image);

      if (
        imageId !== null &&
        imageId !== undefined &&
        removedImageIds.includes(imageId)
      ) {
        return false;
      }

      return true;
    });
  }, [editingNews, removedImageIds]);

  const hasFeaturedImageNow =
    featuredImage instanceof File || Boolean(existingFeaturedImage);

  useEffect(() => {
    if (!hasFeaturedImageNow && isFeatured) {
      setIsFeatured(false);
    }
  }, [hasFeaturedImageNow, isFeatured]);

  const fetchNews = useCallback(async () => {
    try {
      const response = await api.get('/admin/posts', {
        params: {
          page: 1,
          per_page: 50,
        },
      });

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
  }, [showErrorNotification]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/admin/categories', {
        params: {
          page: 1,
          per_page: 100,
        },
      });

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
  }, [showErrorNotification]);

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [fetchNews, fetchCategories]);

  const resetForm = useCallback(() => {
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

    setFeaturedRemoved(false);
    setRemovedImageIds([]);

    setFormErrors({});
  }, [imagePreviews, featuredPreview]);

  const openCreateModal = () => {
    resetForm();

    setEditingNews(null);

    setError('');
    setSuccess('');

    setShowModal(true);
  };

  const openEditModal = (article) => {
    resetForm();

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

    const hasSavedFeaturedImage = Boolean(getImagePath(article.featured_image));

    setIsFeatured(hasSavedFeaturedImage && isTrue(article.is_featured));

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

  const getImageRemoval = useCallback(() => {
    const savedImages = Array.isArray(editingNews?.images) ? editingNews.images : [];

    const idsToRemove = new Set();

    removedImageIds.forEach((imageId) => {
      if (imageId !== undefined && imageId !== null && imageId !== '') {
        idsToRemove.add(imageId);
      }
    });

    if (featuredRemoved) {
      const oldFeatured = editingNews?.featured_image;
      const oldFeaturedPath = getImagePath(oldFeatured);

      const featuredImageId = getFeaturedImageId(editingNews);

      if (
        featuredImageId !== undefined &&
        featuredImageId !== null &&
        featuredImageId !== ''
      ) {
        idsToRemove.add(featuredImageId);
      }

      if (oldFeaturedPath) {
        savedImages.forEach((image) => {
          const imagePath = getImagePath(image);

          if (!isSamePath(imagePath, oldFeaturedPath)) {
            return;
          }

          const imageId = getImageId(image);

          if (imageId !== undefined && imageId !== null && imageId !== '') {
            idsToRemove.add(imageId);
          }
        });
      }
    }

    const remainingImages = savedImages.filter((image) => {
      const imageId = getImageId(image);

      if (imageId !== undefined && imageId !== null && imageId !== '') {
        return !idsToRemove.has(imageId);
      }

      return true;
    });

    return {
      idsToRemove: [...idsToRemove],
      remainingImages,
      remainingImagePaths: remainingImages.map(getImagePath).filter(Boolean),
    };
  }, [editingNews, featuredRemoved, removedImageIds]);

  const buildNewsFormData = () => {
    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('excerpt', excerpt.trim());
    formData.append('body', body.trim());
    formData.append('category_id', String(Number(categoryId)));
    formData.append('is_published', isPublished ? '1' : '0');
    formData.append('priority', priority);
    formData.append('caption', caption.trim());
    formData.append('author', author.trim());

    const hasActiveFeaturedImage =
      featuredImage instanceof File || Boolean(existingFeaturedImage);

    formData.append('is_featured', hasActiveFeaturedImage && isFeatured ? '1' : '0');

    images.forEach((file) => {
      formData.append('images[]', file, file.name);
    });

    if (featuredImage instanceof File) {
      formData.append('featured_image', featuredImage, featuredImage.name);
    }

    if (editingNews?.id && featuredRemoved && !(featuredImage instanceof File)) {
      formData.append('featured_image', '');
      formData.append('is_featured', '0');
    }

    if (editingNews?.id) {
      const { idsToRemove } = getImageRemoval();

      idsToRemove.forEach((imageId) => {
        formData.append('remove_images[]', String(imageId));
      });
    }

    return formData;
  };

  const buildNewsPayload = () => {
    const { idsToRemove } = getImageRemoval();

    const hasActiveFeaturedImage =
      featuredImage instanceof File || Boolean(existingFeaturedImage);

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      body: body.trim(),
      category_id: Number(categoryId),
      is_published: isPublished,
      priority,
      caption: caption.trim(),
      author: author.trim(),
      is_featured: hasActiveFeaturedImage && isFeatured,
    };

    if (featuredRemoved && !(featuredImage instanceof File)) {
      payload.featured_image = null;
      payload.is_featured = false;
    }

    if (idsToRemove.length > 0) {
      payload.remove_images = idsToRemove;
    }

    return payload;
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

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to create news.');
        return;
      }

      const message = response.data.message || 'News created successfully.';

      setShowModal(false);
      setEditingNews(null);

      resetForm();

      setSearch('');

      setLoading(true);

      await fetchNews();

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

      const hasNewFiles = images.length > 0 || featuredImage instanceof File;

      const requestBody = hasNewFiles ? buildNewsFormData() : buildNewsPayload();

      let response;

      if (USE_METHOD_SPOOFING) {
        if (hasNewFiles) {
          requestBody.append('_method', 'PUT');

          response = await api.post(`/admin/posts/${editingNews.id}`, requestBody);
        } else {
          response = await api.post(`/admin/posts/${editingNews.id}`, {
            ...requestBody,
            _method: 'PUT',
          });
        }
      } else {
        response = await api.put(`/admin/posts/${editingNews.id}`, requestBody);
      }

      if (!response.data?.success) {
        showErrorNotification(response.data?.message || 'Unable to update news.');
        return;
      }

      const message = response.data.message || 'News updated successfully.';

      setShowModal(false);
      setEditingNews(null);

      resetForm();

      setLoading(true);

      await fetchNews();

      showSuccessNotification(message);
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

  const requestDeleteNews = (article) => {
    if (!article?.id) {
      showErrorNotification('Invalid news post.');
      return;
    }

    setDeleteTarget(article);
  };

  const cancelDeleteNews = () => {
    if (deletingId) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleDeleteNews = async () => {
    const article = deleteTarget;

    if (!article?.id) {
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
      setDeleteTarget(null);
    }
  };

  const handleImagesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const availableSlots = MAX_NEWS_IMAGES - existingGalleryImages.length - images.length;

    if (availableSlots <= 0) {
      showErrorNotification(`You can upload a maximum of ${MAX_NEWS_IMAGES} images.`);

      event.target.value = '';
      return;
    }

    const validFiles = selectedFiles.filter(
      (file) => VALID_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE,
    );

    const acceptedFiles = validFiles.slice(0, availableSlots);

    if (validFiles.length !== selectedFiles.length) {
      showErrorNotification('Only JPG, PNG and WEBP images up to 5 MB are allowed.');
    } else if (validFiles.length > availableSlots) {
      showErrorNotification(
        `You can add only ${availableSlots} more image${
          availableSlots === 1 ? '' : 's'
        }.`,
      );
    }

    if (acceptedFiles.length === 0) {
      event.target.value = '';
      return;
    }

    setImages((current) => [...current, ...acceptedFiles]);

    setImagePreviews((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    ]);

    event.target.value = '';
  };

  const handleFeaturedImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setFormErrors((prev) => ({
        ...prev,
        featuredImage: 'Only JPG, PNG and WEBP images are allowed.',
      }));

      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormErrors((prev) => ({
        ...prev,
        featuredImage: 'Featured image must be 5 MB or less.',
      }));

      event.target.value = '';
      return;
    }

    if (featuredPreview) {
      URL.revokeObjectURL(featuredPreview);
    }

    if (editingNews?.id) {
      setFeaturedRemoved(true);
    }

    setFeaturedImage(file);
    setFeaturedPreview(URL.createObjectURL(file));

    setFormErrors((prev) => ({
      ...prev,
      featuredImage: '',
    }));

    event.target.value = '';
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

    setFormErrors((prev) => ({
      ...prev,
      featuredImage: '',
    }));
  };

  const removeExistingFeaturedImage = () => {
    setFeaturedRemoved(true);
    setIsFeatured(false);

    setFormErrors((prev) => ({
      ...prev,
      featuredImage: '',
    }));
  };

  const removeExistingImage = (image) => {
    const imageId = getImageId(image);

    if (imageId === undefined || imageId === null || imageId === '') {
      return;
    }

    setRemovedImageIds((current) =>
      current.includes(imageId) ? current : [...current, imageId],
    );
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

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <AdminSidebar />

      <main className="min-h-screen min-w-0 xl:ml-[250px] 2xl:ml-[270px]">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px]">
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
                  <h2 className="text-base font-semibold text-[#16181A]">All Articles</h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {filteredNews.length} article
                    {filteredNews.length === 1 ? '' : 's'} found
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setCategoriesLoading(true);

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

                          const featuredSrc = getFeaturedImage(article);

                          const published = isTrue(article.is_published);

                          const articlePriority = normalizePriority(article.priority);

                          return (
                            <tr
                              key={article.id}
                              className="transition hover:bg-slate-50/60">
                              <td className="max-w-[420px] px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                    {featuredSrc ? (
                                      <img
                                        src={featuredSrc}
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
                                    onClick={() => requestDeleteNews(article)}
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

                  <div className="divide-y divide-slate-100 lg:hidden">
                    {filteredNews.map((article) => {
                      const articleImages = getArticleImages(article);

                      const featuredSrc = getFeaturedImage(article);

                      const published = isTrue(article.is_published);

                      return (
                        <div key={article.id} className="p-4 sm:p-5">
                          <div className="flex gap-3">
                            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              {featuredSrc ? (
                                <img
                                  src={featuredSrc}
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
                                onClick={() => requestDeleteNews(article)}
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
          featuredImage={featuredImage}
          imagePreviews={imagePreviews}
          featuredPreview={featuredPreview}
          existingFeaturedImage={existingFeaturedImage}
          existingImages={existingGalleryImages}
          removeExistingFeaturedImage={removeExistingFeaturedImage}
          removeExistingImage={removeExistingImage}
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

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onClick={cancelDeleteNews}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-news-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 className="size-5" />
              </div>

              <div className="min-w-0">
                <h2
                  id="delete-news-title"
                  className="text-base font-semibold text-[#16181A]">
                  Delete news?
                </h2>

                <p className="mt-1 break-words text-sm text-slate-500">
                  Are you sure you want to delete &quot;
                  {deleteTarget.title}&quot;? This cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDeleteNews}
                disabled={Boolean(deletingId)}
                className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteNews}
                disabled={Boolean(deletingId)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                {deletingId ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
