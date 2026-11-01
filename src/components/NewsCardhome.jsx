import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

/**
 * Fonts required (add once, e.g. in index.html / layout):
 *  - Geist (600)                 -> category heading
 *  - Newsreader (700, opsz axis) -> headlines
 */

const headlineFont =
  "font-['Newsreader',serif] font-bold tracking-[-0.002em] text-[#16181A]";
const focusRing =
  'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#16181A] focus-visible:ring-offset-2';

/** Design shows 1 main + 3 side stories; longer lists repeat the layout so every story is shown. */
const PER_BLOCK = 4;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function Heading({ children, id }) {
  return (
    <h2
      id={id}
      className="font-['Geist',sans-serif] text-[28px] font-semibold leading-[1.45] tracking-[-0.005em] text-[#16181A] sm:text-[32px] xl:text-[40px]">
      {children}
    </h2>
  );
}

function Thumb({ src, ratio }) {
  return (
    <AspectRatio ratio={ratio} className="overflow-hidden bg-neutral-200">
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500 sm:text-sm">
          No image available
        </div>
      )}
    </AspectRatio>
  );
}

function CategoryBlock({ title, news, getImageUrl, onSelect }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
  };
  const item = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const activate = (story) => ({
    role: 'link',
    tabIndex: 0,
    onClick: () => onSelect(story),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(story);
      }
    },
  });

  return (
    <section
      aria-label={title}
      className="mx-auto flex w-full max-w-[1680px] flex-col items-start gap-2.5 border-t border-[#16181A] py-2.5">
      <Heading>{title}</Heading>

      <div className="flex w-full flex-col gap-6">
        {chunk(news, PER_BLOCK).map((group, i) => {
          const [main, ...side] = group;
          return (
            <motion.div
              key={main.id ?? i}
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[972fr_683fr]">
              {/* Main story */}
              <motion.article
                variants={item}
                {...activate(main)}
                aria-label={main.title}
                className={`group flex flex-col items-start gap-2.5 border-t border-[#979EA9] py-2.5 ${focusRing}`}>
                <div className="w-full">
                  <Thumb src={getImageUrl(main)} ratio={972 / 600} />
                </div>
                <h3
                  className={`${headlineFont} text-xl leading-[1.45] sm:text-2xl md:text-[28px] xl:text-[32px]`}
                  style={{ fontVariationSettings: "'opsz' 0" }}>
                  {main.title}
                  <ArrowUpRight
                    aria-hidden
                    className="ml-1 inline size-5 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 xl:size-6"
                  />
                </h3>
              </motion.article>

              {/* Side stories */}
              {side.length > 0 && (
                <div className="flex flex-col gap-6">
                  {side.map((story) => (
                    <motion.article
                      key={story.id}
                      variants={item}
                      {...activate(story)}
                      aria-label={story.title}
                      className={`group flex flex-row items-start gap-4 border-t border-[#979EA9] py-2.5 sm:gap-6 ${focusRing}`}>
                      <div className="w-[120px] shrink-0 sm:w-[200px] md:w-[260px] lg:w-[180px] xl:w-[260px]">
                        <Thumb src={getImageUrl(story)} ratio={260 / 200} />
                      </div>
                      <h3
                        className={`${headlineFont} min-w-0 flex-1 text-base leading-[1.5] sm:text-xl md:text-2xl lg:text-lg xl:text-2xl xl:leading-[38px]`}
                        style={{ fontVariationSettings: "'opsz' 0" }}>
                        {story.title}
                      </h3>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default function NewsCategory({
  categoryName,
  news,
  groupByCategory = false,
  loading = false,
  error = '',
  getImageUrl,
  onSelect,
}) {
  // Status states (same messages as before)
  if (loading || error || news.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1680px] border-t border-[#16181A] py-2.5">
        <Heading>{categoryName}</Heading>
        <div className="py-10 text-center">
          {loading && <p className="text-gray-500">Loading news...</p>}
          {!loading && error && <p className="text-red-500">{error}</p>}
          {!loading && !error && <p className="text-gray-500">No news available.</p>}
        </div>
      </section>
    );
  }

  // One block per category, in order of first appearance
  const groups = groupByCategory
    ? Array.from(
        news
          .reduce((map, n) => {
            const name = n.category?.name || 'Uncategorized';
            map.set(name, [...(map.get(name) ?? []), n]);
            return map;
          }, new Map())
          .entries(),
      ).map(([title, items]) => ({ title, items }))
    : [{ title: categoryName, items: news }];

  return (
    <div className="flex w-full flex-col gap-10 xl:gap-16">
      {groups.map((g) => (
        <CategoryBlock
          key={g.title}
          title={g.title}
          news={g.items}
          getImageUrl={getImageUrl}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
