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
   * First 6 categories are displayed directly
   * on the Home page.
   */
  const visibleCategories = categories;

  /*
   * Remaining categories are available through
   * the See All button.
   */
  const remainingCategories = categories.slice(6);

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
      'h-auto shrink-0 rounded-none px-3 py-1.5 sm:px-4 sm:py-2',
      "font-['Geist',sans-serif] text-base font-semibold leading-normal tracking-[-0.002em] whitespace-nowrap",
      'sm:text-lg md:text-xl xl:text-xl xl:leading-[38px]',
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
     * SEE ALL
     */
    if (category === 'See All') {
      navigate('/category/all');
      return;
    }

    /*
     * ALL
     */
    if (category === 'All') {
      navigate('/category/all');
      return;
    }

    /*
     * First 6 categories on Home.
     *
     * Instead of changing the URL, tell Home
     * which category was selected.
     */
    if (category?.slug) {
      if (onCategorySelect) {
        onCategorySelect(category);
        return;
      }

      /*
       * Fallback if CategoryBar is used somewhere
       * without onCategorySelect.
       */
      navigate(`/category/${category.id}`);
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
            px-4 py-3
            sm:px-6 sm:py-4
            md:px-10
            lg:px-16
            xl:px-[120px] xl:py-6
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          ">
          <motion.ul
            variants={list}
            initial="hidden"
            animate="show"
            className="flex w-max items-center gap-3 sm:gap-4 xl:gap-6">
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

            {/* FIRST 6 CATEGORIES */}
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
                    {category.name}
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
