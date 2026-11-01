import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Fonts required (load once in index.html / CSS):
 *  - Hind (700)               -> logo
 *  - Mukta (400, 600)         -> everything else
 *
 * Text sizes are intentionally one Tailwind step smaller than the Figma values.
 */

/* ---------- social icons (outline style from the design) ---------- */
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'size-full',
};

const InstagramIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
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

/* ---------- default content (override through props) ---------- */
const defaultExplore = [
  { label: 'Politics', to: '#' },
  { label: 'Business', to: '#' },
  { label: 'Sports', to: '#' },
  { label: 'Technology', to: '#' },
];

const defaultCompany = [
  { label: 'Advertise', to: '#' },
  { label: 'Support Us', to: '#' },
  { label: 'Contact Us', to: '#' },
  { label: 'Editorial Policy', to: '#' },
];

const defaultSocials = [
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'TikTok', href: '#', Icon: TiktokIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'X', href: '#', Icon: XIcon },
  { label: 'YouTube', href: '#', Icon: YoutubeIcon },
];

const headingClass =
  "font-['Mukta',sans-serif] text-lg font-semibold uppercase leading-tight tracking-[0.002em] text-[#DEE5FD] sm:text-xl xl:text-2xl";
const linkClass =
  "inline-block font-['Mukta',sans-serif] text-sm font-normal leading-[21px] tracking-[0.002em] text-[#DEE5FD] transition-colors hover:text-white hover:underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#DEE5FD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#164B99]";

function LinkColumn({ title, links, className = '', item }) {
  return (
    <motion.div
      variants={item}
      className={`flex flex-col items-start gap-4 sm:gap-5 xl:gap-6 ${className}`}>
      <h3 className={headingClass}>{title}</h3>
      <ul className="flex flex-col gap-4 xl:gap-6">
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

export default function Footer({
  logoText = 'मनरा शिस्वा खबर',
  description = 'Your Trusted Source for Local News, Community Stories, and Unbiased Journalism. From Manara to the World, We Bring You the Latest Updates, Local Voices, and Stories That Matter. We Don’t Just Report the News; We Connect Communities, Raise Awareness, and Keep You Informed.',
  exploreLinks = defaultExplore,
  companyLinks = defaultCompany,
  socials = defaultSocials,
}) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.12 } },
  };
  const item = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <footer className="w-full bg-[#164B99] px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-16 xl:px-[120px] xl:py-10">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto flex w-full max-w-[1680px] flex-col">
        {/* Brand + link columns */}
        <div className="flex flex-col gap-10 py-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 xl:p-10">
          <motion.div
            variants={item}
            className="flex w-full max-w-md flex-col items-start gap-4 sm:gap-6 lg:max-w-[366px]">
            <Link
              to="/"
              className="font-['Hind',sans-serif] text-3xl font-bold leading-[1.4] tracking-[0.002em] text-[#F0F3FE] outline-none focus-visible:ring-2 focus-visible:ring-[#DEE5FD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#164B99] sm:text-4xl lg:text-5xl">
              {logoText}
            </Link>
            <p className="font-['Mukta',sans-serif] text-sm leading-6 tracking-[0.002em] text-[#DEE5FD] sm:text-base xl:text-lg">
              {description}
            </p>
          </motion.div>

          <div className="flex w-full flex-row gap-10 sm:gap-20 lg:w-auto lg:justify-end xl:gap-[120px]">
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
          <div className="flex flex-col-reverse items-start gap-4 px-0 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 xl:px-4 xl:py-2">
            <p className="font-['Mukta',sans-serif] text-xs uppercase leading-6 tracking-[0.002em] text-[#DEE5FD] sm:text-sm">
              © {new Date().getFullYear()} {logoText}. All rights reserved
            </p>

            <ul className="flex items-center gap-2 sm:gap-4 xl:gap-6">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={buttonVariants({
                        variant: 'ghost',
                        size: 'icon',
                        className:
                          'size-9 rounded-md p-1 text-[#DEE5FD] hover:bg-white/10 hover:text-white sm:size-10',
                      })}>
                      <Icon />
                    </a>
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
