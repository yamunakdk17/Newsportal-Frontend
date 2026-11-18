import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/700.css';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
