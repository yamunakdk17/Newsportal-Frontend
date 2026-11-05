import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CategoryBar({
  categories = [],
  selectedCategory = 'All',
  showAll = true,
  onCategorySelect,
}) {
  const navigate = useNavigate();

  /*
   * Show ALL categories.
   */
  const visibleCategories = categories;

  const selectedValues =
    selectedCategory === 'All'
      ? []
      : [selectedCategory?.id, selectedCategory?.name, selectedCategory?.slug]
          .filter((value) => value !== null && value !== undefined)
          .map((value) => String(value).toLowerCase());

  const toValues = (category) =>
    [category?.id, category?.name, category?.slug]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase());

  const buttonClass = (active) =>
    [
      'h-auto shrink-0 rounded-none px-3 py-1.5 sm:px-3.5 sm:py-2',
      "font-['Geist',sans-serif] text-sm font-semibold leading-normal tracking-[-0.002em] whitespace-nowrap",
      'sm:text-base md:text-lg xl:text-lg',
      'text-[#F9F9FA] transition-colors hover:text-[#F9F9FA]',
      active
        ? 'bg-[#0D3573] ring-2 ring-[#164B99] ring-offset-2 hover:bg-[#0D3573]'
        : 'bg-[#164B99] hover:bg-[#0F3D7F]',
    ].join(' ');

  const handleSelect = (event, category) => {
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });

    /*
     * ALL CATEGORIES
     */
    if (category === 'All') {
      navigate('/category/all');
      return;
    }

    /*
     * CATEGORY
     *
     * Keep sending the complete object to the parent
     * when onCategorySelect is provided.
     */
    if (category?.id !== null && category?.id !== undefined) {
      if (onCategorySelect) {
        onCategorySelect(category);
        return;
      }

      /*
       * IMPORTANT:
       *
       * Use category.id in the URL.
       *
       * Example:
       * category = {
       *   id: 5,
       *   name: "Sports",
       *   slug: "sports"
       * }
       *
       * URL:
       * /category/5
       *
       * Category.jsx then calls:
       * /category/5/news
       *
       * Pass the category name through router state
       * so it can be displayed even when the API returns
       * zero news articles.
       */
      navigate(`/category/${category.id}`, {
        state: {
          categoryName: category.name || 'Category',
          categorySlug: category.slug || '',
        },
      });
    }
  };

  const list = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const pill = {
    hidden: {
      opacity: 0,
      y: 8,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
  };

  return (
    <nav aria-label="News categories" className="flex w-full flex-col items-center">
      <div className="w-full bg-[#F9F9FA]">
        <div
          className="
            overflow-x-auto
            px-0 py-3
            sm:px-2 sm:py-3
            md:px-4
            lg:px-6
            xl:px-8 xl:py-4
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          ">
          <motion.ul
            variants={list}
            initial="hidden"
            animate="show"
            className="flex w-max items-center gap-2 sm:gap-3 xl:gap-4">
            {/* ALL */}
            {showAll && (
              <motion.li variants={pill}>
                <Button
                  type="button"
                  aria-pressed={selectedCategory === 'All'}
                  onClick={(event) => handleSelect(event, 'All')}
                  className={buttonClass(selectedCategory === 'All')}>
                  All
                </Button>
              </motion.li>
            )}

            {/* ALL CATEGORIES */}
            {visibleCategories.map((category) => {
              const isSelected = toValues(category).some((value) =>
                selectedValues.includes(value),
              );

              return (
                <motion.li key={category.id} variants={pill}>
                  <Button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={(event) => handleSelect(event, category)}
                    className={buttonClass(isSelected)}>
                    {category?.name || 'Category'}
                  </Button>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </nav>
  );
}
