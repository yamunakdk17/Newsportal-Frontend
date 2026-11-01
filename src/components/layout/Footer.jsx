import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Compact footer.
 *
 * UI/design is unchanged.
 *
 * Fonts required:
 *  - Hind (700) -> logo
 *  - Geist (600) -> headings
 *  - Mukta (400) -> content
 */

/* ---------- social icons ---------- */

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'size-6',
};

const InstagramIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.2" cy="6.8" r="0.7" fill="currentColor" />
  </svg>
);

const TiktokIcon = () => (
  <svg {...iconProps}>
    <path d="M14.5 3v11.2a4.2 4.2 0 1 1-4.2-4.2" />
    <path d="M14.5 3c.3 2.4 1.9 4.2 4.5 4.4" />
  </svg>
);

const FacebookIcon = () => (
  <svg {...iconProps}>
    <path d="M14.2 21.5v-8.3h2.8l.5-3.3h-3.3V7.8c0-1 .5-1.8 1.9-1.8h1.5V3.2A19 19 0 0 0 15.4 3c-2.5 0-4.2 1.5-4.2 4.3v2.6H8.3v3.3h2.9v8.3z" />
  </svg>
);

const XIcon = () => (
  <svg {...iconProps}>
    <path d="M3.5 3.5h4.6l12.4 17h-4.6z" />
    <path d="M3.8 20.5l6.9-7.4M13.4 10.6l6.8-7.1" />
  </svg>
);

const YoutubeIcon = () => (
  <svg {...iconProps}>
    <rect x="1.8" y="4.8" width="20.4" height="14.4" rx="4.5" />
    <path d="M10 9.2l5 2.8-5 2.8z" fill="currentColor" />
  </svg>
);

/* ---------- footer links ---------- */

/*
  These now use your actual category routes.

  Example:
  Politics -> /category/politics
  Sports -> /category/sports
  Technology -> /category/technology
*/

const defaultExplore = [
  {
    label: 'Politics',
    to: '/category/politics',
  },
  {
    label: 'Business',
    to: '/category/business',
  },
  {
    label: 'Sports',
    to: '/category/sports',
  },
  {
    label: 'Technology',
    to: '/category/technology',
  },
];

const defaultCompany = [
  {
    label: 'Advertise',
    to: '#',
  },
  {
    label: 'Support Us',
    to: '#',
  },
  {
    label: 'Contact Us',
    to: '#',
  },
  {
    label: 'Editorial Policy',
    to: '#',
  },
];

const defaultSocials = [
  {
    label: 'Instagram',
    href: '#',
    Icon: InstagramIcon,
  },
  {
    label: 'TikTok',
    href: '#',
    Icon: TiktokIcon,
  },
  {
    label: 'Facebook',
    href: '#',
    Icon: FacebookIcon,
  },
  {
    label: 'X',
    href: '#',
    Icon: XIcon,
  },
  {
    label: 'YouTube',
    href: '#',
    Icon: YoutubeIcon,
  },
];

const headingClass =
  "font-['Geist',sans-serif] text-base font-semibold uppercase leading-[21px] tracking-[0.002em] text-[#DEE5FD] sm:text-lg xl:text-xl";

const linkClass =
  "inline-block font-['Mukta',sans-serif] text-sm font-normal leading-[21px] tracking-[0.002em] text-[#DEE5FD] underline-offset-4 outline-none transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-[#DEE5FD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#164B99] sm:text-base";

/* ---------- link column ---------- */

function LinkColumn({ title, links, className = '', item }) {
  return (
    <motion.div
      variants={item}
      className={`flex flex-col items-start gap-3 sm:gap-4 ${className}`}>
      <h3 className={headingClass}>{title}</h3>

      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <motion.span
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className="inline-block">
              <Link to={link.to} className={linkClass}>
                {link.label}
              </Link>
            </motion.span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ---------- footer ---------- */

export default function Footer({
  logoText = 'मनरा शिस्वा खबर',

  tagline = 'Your trusted voice for local news, community stories, and stories that matter.',

  exploreLinks = defaultExplore,

  companyLinks = defaultCompany,

  socials = defaultSocials,
}) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},

    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
      },
    },
  };

  const item = {
    hidden: {
      opacity: reduce ? 1 : 0,
      y: reduce ? 0 : 16,
    },

    show: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <footer className="w-full bg-[#164B99] px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-16 xl:px-[120px]">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{
          once: true,
          amount: 0.15,
        }}
        className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 sm:gap-8 xl:gap-10">
        {/* Brand + link columns */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {/* Brand */}

          <motion.div
            variants={item}
            className="flex w-full max-w-md flex-col items-start gap-3 sm:gap-4 lg:max-w-[366px]">
            <Link
              to="/"
              className="font-['Hind',sans-serif] text-2xl font-bold leading-tight tracking-[0.002em] text-[#F0F3FE] outline-none focus-visible:ring-2 focus-visible:ring-[#DEE5FD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#164B99] sm:text-3xl xl:text-[32px] xl:leading-[86px]">
              {logoText}
            </Link>

            <p className="font-['Mukta',sans-serif] text-base leading-6 tracking-[0.002em] text-[#DEE5FD] sm:text-lg xl:text-xl">
              {tagline}
            </p>
          </motion.div>

          {/* Explore + Company */}

          <div className="flex w-full flex-row gap-12 sm:gap-20 lg:w-auto lg:justify-end xl:gap-[120px]">
            <LinkColumn
              title="Explore"
              links={exploreLinks}
              item={item}
              className="xl:w-[163px]"
            />

            <LinkColumn
              title="Company"
              links={companyLinks}
              item={item}
              className="xl:w-[217px]"
            />
          </div>
        </div>

        {/* Divider + bottom bar */}

        <motion.div variants={item}>
          <Separator className="bg-[#DEE5FD]" />

          <div className="flex flex-col-reverse items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="font-['Mukta',sans-serif] text-xs uppercase leading-6 tracking-[0.002em] text-[#DEE5FD] sm:text-sm xl:text-base">
              © {new Date().getFullYear()} {logoText}. All rights reserved
            </p>

            <ul className="flex items-center gap-1 sm:gap-3 xl:gap-6">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{
                      duration: 0.2,
                    }}>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-md p-0 text-[#DEE5FD] hover:bg-white/10 hover:text-white xl:size-6">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}>
                        <Icon />
                      </a>
                    </Button>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
