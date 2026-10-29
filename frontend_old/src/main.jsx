import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root');

// Always use createRoot — clears prerendered HTML and renders fresh.
// Prerendered static HTML already serves SEO crawlers (they read HTML without JS).
// Using hydrateRoot caused duplicate content when the prerendered fallback (homepage)
// didn't match the current route, showing the homepage + actual page stacked.
rootElement.innerHTML = '';
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
