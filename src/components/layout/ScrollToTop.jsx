import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Always start the new route at the top.
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
