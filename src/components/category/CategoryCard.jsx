import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * Fonts: Geist (600) must be loaded in your app (index.html / CSS).
 *
 * Props:
 *  - categories: array of { id, name, slug }
 *  - selectedCategory: 'All' or a category object
 *  - onSelect: (categoryOrAll) => void
 *  - showAll: render the "All" button first (default true)
 */

const toValues = (category) =>
  [category?.id, category?.name, category?.slug]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).toLowerCase());

export default function CategoryBar({
  categories = [],
  selectedCategory = 'All',
  onSelect,
  showAll = true,
}) {
  const selectedValues = selectedCategory === 'All' ? [] : toValues(selectedCategory);

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

  const handleSelect = (event, value) => {
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });

    onSelect?.(value);
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
      {/* Category buttons */}
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
            {/* All */}
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

            {/* Categories */}
            {categories.map((category) => {
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
