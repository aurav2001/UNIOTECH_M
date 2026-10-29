import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const BASE_URL = 'http://localhost:4173';

async function startServer() {
  console.log('Starting preview server...');
  const server = spawn('npm', ['run', 'preview', '--', '--port', '4173'], {
    stdio: 'ignore',
    shell: true,
    cwd: __dirname
  });
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));
  return server;
}

async function crawl() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  // Debug page errors and requests
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
  });
  page.on('response', response => {
    if (response.status() === 403) {
      console.log(`403 FORBIDDEN: ${response.url()}`);
    }
  });

  // Reverted: Do not set artificial Origin/Referer as it causes ERR_BLOCKED_BY_CLIENT on localhost
  // Instead, we will whitelist localhost:4173 in the backend

  const visited = new Set();
  // Static routes + All known service pages for guaranteed crawlability
  const queue = [
    '/', '/about', '/contact', '/join-us', '/pricing', '/case-studies', '/our-clients', '/blogs', '/support', '/client-portal',
    // All service pages (ensures they're prerendered even if API is down)
    '/services/hardware-supply',
    '/services/server-support',
    '/services/networking',
    '/services/amc-support',
    '/services/software-solutions',
    '/services/cybersecurity',
    '/services/cloud-backup',
    '/services/migration-email',
    '/services/managed-it-services',
    '/services/security-audits',
    '/services/cloud',
    '/services/email-solutions',
    '/services/end-point-security',
    '/services/dlp',
    '/services/web-development-services',
    '/services/migration',
    '/services/software',
  ];
  const routes = [];
  let pendingHome = false;

  // Fetch dynamic pages from API
  try {
    console.log('Fetching dynamic pages from API...');
    const response = await fetch('https://api.uniotechit.com/api/pages');
    if (response.ok) {
      const pages = await response.json();
      const pageList = Array.isArray(pages) ? pages : (pages.pages || []);

      pageList.forEach(p => {
        if (p.slug) {
          // All pages use /services prefix for SEO crawlability
          queue.push(`/services/${p.slug}`);
        }
      });
      console.log(`Added ${pageList.length} dynamic pages to queue.`);
    } else {
      console.error('Failed to fetch pages from API:', response.statusText);
    }

    // Fetch blogs from API
    console.log('Fetching blogs from API...');
    const blogResponse = await fetch('https://api.uniotechit.com/api/blogs');
    if (blogResponse.ok) {
      const blogs = await blogResponse.json();
      const blogList = Array.isArray(blogs) ? blogs : (blogs.blogs || []);

      blogList.forEach(b => {
        if (b.slug) {
          queue.push(`/blogs/${b.slug}`);
        }
      });
      console.log(`Added ${blogList.length} blogs to queue.`);
    } else {
      console.error('Failed to fetch blogs from API:', blogResponse.statusText);
    }

  } catch (error) {
    console.error('Error fetching dynamic data:', error);
  }

  // Load pages from CSV
  try {
    const csvPath = path.join(__dirname, 'src', 'assets', 'uniotech_site_data.csv');
    if (fs.existsSync(csvPath)) {
      console.log(`Reading CSV from ${csvPath}`);
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split('\n');
      let addedCount = 0;

      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // Skip header and empty lines

        // CSV format: "URL","Title","Description"
        // Regex to match the first quoted string which is the URL
        const match = line.match(/^"([^"]+)"/);
        if (match && match[1]) {
          let url = match[1];
          // Remove domain to get the path
          const domain = 'https://uniotechit.com';
          if (url.startsWith(domain)) {
            let pathname = url.replace(domain, '');
            // Normalize: remove trailing slash unless root
            if (pathname !== '/' && pathname.endsWith('/')) {
              pathname = pathname.slice(0, -1);
            }
            if (!queue.includes(pathname)) {
              queue.push(pathname);
              addedCount++;
            }
          }
        }
      });
      console.log(`Added ${addedCount} pages from CSV to queue.`);
    } else {
      console.warn(`CSV file not found at ${csvPath}`);
    }
  } catch (error) {
    console.error('Error reading CSV:', error);
  }

  // Helper function to render a single route
  const renderRoute = async (routePath) => {
    // Normalize route
    const normalizedRoute = routePath.endsWith('/') && routePath !== '/' ? routePath.slice(0, -1) : routePath;

    if (visited.has(normalizedRoute)) return;
    visited.add(normalizedRoute);

    const isBlogDetail = normalizedRoute.startsWith('/blogs/') && normalizedRoute !== '/blogs';
    const isServicePage = normalizedRoute.startsWith('/services/');
    console.log(`Prerendering: ${normalizedRoute}${isBlogDetail ? ' [BLOG]' : ''}`);

    // Retry logic for blog and service pages (API-dependent content)
    const MAX_RETRIES = isBlogDetail || isServicePage ? 2 : 0;
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`Retry ${attempt}/${MAX_RETRIES} for ${normalizedRoute}...`);
        await new Promise(r => setTimeout(r, 3000)); // Wait before retry
      }

    try {
      const response = await page.goto(`${BASE_URL}${normalizedRoute}`, { waitUntil: 'networkidle0', timeout: 45000 });

      if (response.status() !== 200) {
        console.error(`Error: Status ${response.status()} for ${normalizedRoute}`);
        return;
      }

      try {
        await page.waitForSelector('nav', { timeout: 8000 });

        // For blog detail pages, wait for full article content + SEO meta to load
        if (isBlogDetail) {
          console.log(`Waiting for blog content to fully load for ${normalizedRoute}...`);
          try {
            // Wait for the article content to appear (indicates data has loaded from API)
            await page.waitForSelector('article.prose, .prose', { timeout: 15000 });
            // Wait for h1 (blog title) to appear - confirms content rendered
            await page.waitForSelector('h1', { timeout: 10000 });
            // Wait for canonical link to be set by Helmet with correct blog URL
            await page.waitForFunction(
              (route) => {
                const canonical = document.querySelector('link[rel="canonical"]');
                return canonical && canonical.href && canonical.href.includes('/blogs/') && canonical.href.includes(route.split('/').pop());
              },
              { timeout: 12000 },
              normalizedRoute
            );
            // Extra wait to ensure JSON-LD structured data and all meta tags are in place
            await new Promise(r => setTimeout(r, 3000));
          } catch (e) {
            console.warn(`Blog content wait timeout for ${normalizedRoute}: ${e.message}`);
            // Still wait a bit for partial content
            await new Promise(r => setTimeout(r, 3000));
          }
        }

        // CRITICAL FIX: For Service pages, wait for content to load to avoid "Soft 404"
        if (isServicePage) {
          console.log(`Waiting for service content to fully load for ${normalizedRoute}...`);
          try {
            // Wait for h1 (service title) to appear - confirms content rendered
            await page.waitForSelector('h1', { timeout: 15000 });
            // Extra wait for Framer Motion animations and meta tags
            await new Promise(r => setTimeout(r, 3000));
          } catch (e) {
            console.warn(`Service content wait timeout for ${normalizedRoute}: ${e.message}`);
          }
        }

        // For blog listing page, wait for blog cards to render (links matter for crawlability)
        if (normalizedRoute === '/blogs') {
          console.log('Waiting for blog listing cards to load...');
          try {
            await page.waitForSelector('article', { timeout: 12000 });
            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {
            console.warn('Blog listing timeout, capturing anyway...');
          }
        }

        // Wait for Helmet to update the head
        await new Promise(r => setTimeout(r, 2500));

        // Ensure title is present
        const title = await page.title();
        console.log(`Page Title for ${normalizedRoute}: ${title}`);

      } catch (e) {
        console.warn(`Timeout waiting for selector on ${normalizedRoute}, capturing anyway...`);
      }

      let content = await page.content();

      // CRITICAL: Detect soft 404 pages - pages that rendered error/not-found states
      const isSoft404 = await page.evaluate(() => {
        const body = document.body;
        const bodyText = body ? body.innerText : '';

        // Detect common soft 404 indicators
        const soft404Indicators = [
          'Page Not Found',
          'Blog not found',
          'Blog Not Found',
          'Plan Not Found',
          'Service Not Found',
          'not found'
        ];

        // Check if it's a thin page (very little text content)  
        const isThinPage = bodyText.replace(/\s+/g, ' ').trim().length < 200;

        // Check for soft 404 signals
        const hasSoft404Text = soft404Indicators.some(indicator => bodyText.includes(indicator));

        // Only trigger if it has the error text AND is a thin page
        // We removed hasNoIndex to prevent loops where a previous fail poisons the next run
        // We removed hasOnlySpinner because we should wait longer instead of assuming 404
        return (hasSoft404Text && isThinPage);
      });

      if (isSoft404) {
        // For pages with retry capability, try again instead of giving up
        if (attempt < MAX_RETRIES) {
          console.log(`SOFT 404 DETECTED: ${normalizedRoute} — will retry (attempt ${attempt + 1}/${MAX_RETRIES})`);
          continue; // Try again in the retry loop
        }
        // After all retries, still write the file but ensure it has index,follow
        // This way the page is always indexable in Search Console
        console.log(`SOFT 404 DETECTED: ${normalizedRoute} — writing file anyway with index,follow (no noindex)`);
      }

      // CRITICAL: Fix canonical URL - remove any hardcoded canonical pointing to wrong URL
      const canonicalUrl = `https://uniotechit.com${normalizedRoute}`;

      // Remove the inline script that sets canonical dynamically (it was for SPA fallback only)
      content = content.replace(/<script>\s*\(function\(\)\{[\s\S]*?var c = document\.createElement[\s\S]*?\}\)\(\);\s*<\/script>/g, '');

      // Remove any existing canonical that points to wrong URL
      content = content.replace(/<link[^>]*rel=["']canonical["'][^>]*>/g, '');
      // Inject the correct canonical for THIS specific page
      content = content.replace(
        '</head>',
        `<link rel="canonical" href="${canonicalUrl}" data-rh="true">\n</head>`
      );

      // ALWAYS strip any noindex and force index,follow on EVERY page
      content = content.replace(
        /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/gi, ''
      );
      content = content.replace(
        /<meta[^>]*name=["']googlebot["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/gi, ''
      );

      // Remove any existing robots/googlebot meta to avoid duplicates, then inject fresh
      content = content.replace(
        /<meta[^>]*name=["']robots["'][^>]*>/gi, ''
      );
      content = content.replace(
        /<meta[^>]*name=["']googlebot["'][^>]*>/gi, ''
      );
      content = content.replace(
        '</head>',
        `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" data-rh="true">\n<meta name="googlebot" content="index, follow" data-rh="true">\n</head>`
      );

      // Inject og:url for THIS page (remove wrong og:url first)
      content = content.replace(/<meta[^>]*property=["']og:url["'][^>]*>/g, '');
      content = content.replace(
        '</head>',
        `<meta property="og:url" content="${canonicalUrl}" data-rh="true">\n</head>`
      );

      // Inject twitter:url if missing
      if (!content.includes('name="twitter:url"') && !content.includes('property="twitter:url"')) {
        content = content.replace(
          '</head>',
          `<meta name="twitter:url" content="${canonicalUrl}" data-rh="true">\n</head>`
        );
      }

      // Always add to sitemap routes — every page should be indexable
      routes.push(normalizedRoute);

      // Calculate file path
      let filePath;
      if (normalizedRoute === '/') {
        filePath = path.join(DIST_DIR, 'index.html');
      } else {
        const routePathStr = normalizedRoute.substring(1);
        filePath = path.join(DIST_DIR, routePathStr, 'index.html');
      }

      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      console.log(`Writing file to: ${filePath}`);
      fs.writeFileSync(filePath, content);
      console.log(`Successfully wrote ${filePath}`);

      // Crawl for links only if NOT home page (to avoid re-adding circulars unnecessarily, though visited set handles it)
      // Actually we do want to crawl home links, but we only process home last.
      // If we are here, we are processing the route.

      const hrefs = await page.$$eval('a', as => as.map(a => a.getAttribute('href')));
      for (const href of hrefs) {
        if (!href) continue;
        let target = href;
        if (target.startsWith(BASE_URL)) {
          target = target.replace(BASE_URL, '');
        }
        if (target.startsWith('/') && !target.startsWith('//')) {
          target = target.split('#')[0].split('?')[0];
          if (target && !visited.has(target) && !queue.includes(target) && !target.includes('.')) {
            queue.push(target);
          }
        }
      }
      lastError = null;
      break; // Success — exit retry loop
    } catch (e) {
      lastError = e;
      console.error(`Failed to render ${normalizedRoute} (attempt ${attempt + 1}):`, e.message);
    }
    } // end retry loop

    if (lastError) {
      console.error(`All attempts failed for ${normalizedRoute}: ${lastError.message}`);
    }
  };

  while (queue.length > 0) {
    const route = queue.shift();
    if (route === '/' || route === '') {
      pendingHome = true;
      continue;
    }
    await renderRoute(route);
  }

  // Process Home Page Last
  if (pendingHome) {
    console.log('Processing Home Page (deferred)...');
    await renderRoute('/');
  }

  await browser.close();
  return routes;
}

function generateSitemap(routes) {
  // Read the user's static sitemap as the base
  const staticSitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  let existingSlugs = new Set();
  let staticEntries = '';

  if (fs.existsSync(staticSitemapPath)) {
    const staticContent = fs.readFileSync(staticSitemapPath, 'utf8');
    // Extract all existing <loc> URLs from the static sitemap
    const locMatches = staticContent.match(/<loc>[^<]+<\/loc>/g) || [];
    locMatches.forEach(match => {
      const url = match.replace(/<\/?loc>/g, '').replace('https://uniotechit.com', '').replace(/\/+$/, '') || '/';
      existingSlugs.add(url);
    });
    // Extract all <url>...</url> blocks from the static sitemap
    // Strip trailing slashes from <loc> URLs to ensure consistency (no trailing slash = canonical)
    const urlBlocks = staticContent.match(/<url>[\s\S]*?<\/url>/g) || [];
    staticEntries = urlBlocks.map(block => {
      return block.replace(/<loc>(https:\/\/uniotechit\.com\/.+?)\/<\/loc>/, '<loc>$1</loc>');
    }).join('\n');
  }

  // Add any crawled routes that aren't already in the static sitemap  
  const newEntries = routes
    .filter(route => {
      const normalized = route.replace(/\/+$/, '') || '/';
      return !existingSlugs.has(normalized);
    })
    .map(route => `  <url>
    <loc>https://uniotechit.com${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route.startsWith('/blogs/') ? 'monthly' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.00' : route.startsWith('/blogs/') ? '0.70' : '0.80'}</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticEntries}
${newEntries}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
  console.log('Sitemap generated at dist/sitemap.xml (merged static + dynamic routes)');
}

(async () => {
  let server;
  try {
    server = await startServer();
    const routes = await crawl();
    console.log(`Crawled ${routes.length} pages.`);
    generateSitemap(routes);
    console.log('Prerendering complete!');
  } catch (e) {
    console.error('Prerendering failed:', e);
    process.exit(1);
  } finally {
    if (server) {
      // Kill the npm run preview process. 
      // On Windows spawning 'npm' spawns a shell, so killing the 'server' object might kill the shell but not the node process.
      // But we can try default kill.
      server.kill();
      // Also force exit to ensure we don't hang
      process.exit(0);
    }
  }
})();
