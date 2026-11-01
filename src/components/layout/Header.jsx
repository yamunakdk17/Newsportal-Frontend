import { useId, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { adToBs, getBsMonthName } from 'bikram-sambat-ts';

function WeatherIcon({ className = '' }) {
  const uid = useId();
  const sun = `sun-${uid}`;
  const blue = `blue-${uid}`;
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient
          id={sun}
          x1="6"
          y1="4"
          x2="18"
          y2="14"
          gradientUnits="userSpaceOnUse">
          <stop offset="0.11" stopColor="#FFE580" />
          <stop offset="0.34" stopColor="#FFBF70" />
          <stop offset="0.58" stopColor="#FFA342" />
          <stop offset="0.9" stopColor="#FA6673" />
        </linearGradient>

        <linearGradient
          id={blue}
          x1="2"
          y1="0"
          x2="22"
          y2="0"
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#0FAFFF" />
          <stop offset="1" stopColor="#0094F0" />
        </linearGradient>
      </defs>

      <motion.g
        style={{ transformOrigin: '12px 13.5px' }}
        animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M6.5 13.5a5.5 5.5 0 0 1 11 0Z" fill={`url(#${sun})`} />

        <g stroke={`url(#${sun})`} strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2.5v2.5" />
          <path d="M4.9 5.4l1.8 1.8" />
          <path d="M19.1 5.4l-1.8 1.8" />
        </g>
      </motion.g>

      <g stroke={`url(#${blue})`} strokeWidth="1.5" strokeLinecap="round">
        <path d="M2.75 14.5h18.5" />
        <path d="M6.75 17.25h10.5" />
        <path d="M10.75 20h2.5" />
      </g>
    </svg>
  );
}

export default function Header({ location = 'Mahottari', logoText = 'मनरा शिस्वा खबर' }) {
  const reduce = useReducedMotion();

  // Dynamic English and Nepali dates
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const updateDate = () => setToday(new Date());

    const interval = setInterval(updateDate, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const bs = adToBs(today);

  const nepaliDate = `${bs.day} ${getBsMonthName(bs.month).toUpperCase()} ${bs.year}`;

  // Dynamic weather
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`,
        );

        if (!geoResponse.ok) {
          throw new Error('Location request failed');
        }

        const geoData = await geoResponse.json();
        const place = geoData.results?.[0];

        if (!place) {
          throw new Error('Location not found');
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`,
        );

        if (!response.ok) {
          throw new Error('Weather request failed');
        }

        const data = await response.json();

        setWeather({
          temperature: data.current.temperature_2m,
          code: data.current.weather_code,
        });
      } catch (error) {
        console.error('Weather error:', error);
      }
    };

    fetchWeather();

    const interval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [location]);

  const weatherCondition = (code) => {
    if (code === 0) return 'Clear';
    if ([1, 2, 3].includes(code)) return 'Cloudy';
    if ([45, 48].includes(code)) return 'Foggy';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rainy';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy';
    if ([95, 96, 99].includes(code)) return 'Thunderstorm';

    return 'Weather';
  };

  return (
    <header className="w-full">
      {/* Top info bar */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex min-h-10 w-full items-center justify-between gap-3 bg-[#0C336B] px-4 py-1.5 font-['Mukta',sans-serif] font-bold tracking-[0.002em] text-[#F0F3FE] sm:gap-6 sm:py-2 md:gap-10 xl:py-2">
        <p className="text-xs leading-4 sm:text-sm sm:leading-6 xl:text-base">
          {nepaliDate}
        </p>

        <div className="flex shrink-0 items-center justify-center gap-1.5 text-xs leading-4 sm:gap-2.5 sm:text-sm sm:leading-6 xl:text-base">
          <WeatherIcon className="size-5 sm:size-6" />

          <span>
            {weather
              ? `${weather.temperature}°C ${weatherCondition(weather.code)} | ${location}`
              : `Loading weather... | ${location}`}
          </span>
        </div>
      </motion.div>

      {/* Logo bar */}
      <div className="flex w-full items-center justify-center gap-2.5 bg-[#164B99] p-3 sm:p-3">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="text-center font-['Hind',sans-serif] text-[40px] font-bold leading-[1.1] tracking-[0.002em] text-[#F0F3FE] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[60px] xl:leading-[72px]">
          <Link
            to="/"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#F0F3FE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#164B99]">
            {logoText}
          </Link>
        </motion.h1>
      </div>
    </header>
  );
}
