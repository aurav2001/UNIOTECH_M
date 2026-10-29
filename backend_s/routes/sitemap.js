const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Page = require('../models/Page');

// Static pages with their priorities and lastmod dates
const STATIC_URLS = [
    { loc: '/', priority: '1.00', lastmod: '2026-02-16T10:19:09+00:00' },
    { loc: '/about/', priority: '0.80', lastmod: '2026-02-16T10:17:10+00:00' },
    { loc: '/contact/', priority: '0.80', lastmod: '2026-02-16T10:17:14+00:00' },
    { loc: '/blogs/', priority: '0.80', lastmod: '2026-02-16T10:17:30+00:00' },
    { loc: '/join-us/', priority: '0.80', lastmod: '2026-02-16T10:17:17+00:00' },
    { loc: '/services/hardware-supply/', priority: '0.80', lastmod: '2026-02-16T10:17:33+00:00' },
    { loc: '/services/server-support/', priority: '0.80', lastmod: '2026-02-16T10:17:37+00:00' },
    { loc: '/services/networking/', priority: '0.80', lastmod: '2026-02-16T10:17:40+00:00' },
    { loc: '/services/amc-support/', priority: '0.80', lastmod: '2026-02-16T10:17:43+00:00' },
    { loc: '/services/software-solutions/', priority: '0.80', lastmod: '2026-02-16T10:17:46+00:00' },
    { loc: '/services/cybersecurity/', priority: '0.80', lastmod: '2026-02-16T10:17:49+00:00' },
    { loc: '/services/cloud-backup/', priority: '0.80', lastmod: '2026-02-16T10:17:53+00:00' },
    { loc: '/services/migration-email/', priority: '0.80', lastmod: '2026-02-16T10:17:56+00:00' },
    { loc: '/services/managed-it-services/', priority: '0.80', lastmod: '2026-02-16T10:17:59+00:00' },
    { loc: '/pricing/', priority: '0.80', lastmod: '2026-02-16T10:17:20+00:00' },
    { loc: '/case-studies/', priority: '0.80', lastmod: '2026-02-16T10:17:24+00:00' },
    { loc: '/our-clients/', priority: '0.80', lastmod: '2026-02-16T10:17:27+00:00' },
    { loc: '/services/security-audits/', priority: '0.80', lastmod: '2026-02-16T10:18:02+00:00' },
    { loc: '/services/cloud/', priority: '0.80', lastmod: '2026-02-16T10:18:05+00:00' },
    { loc: '/services/email-solutions/', priority: '0.80', lastmod: '2026-02-16T10:18:08+00:00' },
    { loc: '/services/end-point-security/', priority: '0.80', lastmod: '2026-02-16T10:18:11+00:00' },
    { loc: '/services/dlp/', priority: '0.80', lastmod: '2026-02-16T10:18:14+00:00' },
    { loc: '/services/web-development-services/', priority: '0.80', lastmod: '2026-02-16T10:18:17+00:00' },
];

const SITE_URL = 'https://uniotechit.com';

/**
 * @desc    Generate dynamic sitemap.xml including all published blogs
 * @route   GET /api/sitemap.xml
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        // Fetch all published blogs from database
        const blogs = await Blog.findAll({
            where: { isPublished: true },
            attributes: ['slug', 'updatedAt', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        // Also fetch dynamic pages
        let dynamicPages = [];
        try {
            dynamicPages = await Page.findAll({
                attributes: ['slug', 'updatedAt', 'createdAt']
            });
        } catch (e) {
            console.warn('Could not fetch dynamic pages for sitemap:', e.message);
        }

        // Build XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

        // Track added slugs to avoid duplicates
        const addedSlugs = new Set();

        // Add static pages
        for (const page of STATIC_URLS) {
            addedSlugs.add(page.loc.replace(/\/+$/, '') || '/');
            xml += `<url>
  <loc>${SITE_URL}${page.loc}</loc>
  <lastmod>${page.lastmod}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>${page.priority}</priority>
</url>
`;
        }

        // Add dynamic service pages (from Page model)
        for (const page of dynamicPages) {
            const slug = `/services/${page.slug}`;
            if (!addedSlugs.has(slug)) {
                addedSlugs.add(slug);
                const lastmod = (page.updatedAt || page.createdAt || new Date()).toISOString();
                xml += `<url>
  <loc>${SITE_URL}${slug}/</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.80</priority>
</url>
`;
            }
        }

        // Add dynamic blog pages — these are the main URLs Google should index
        for (const blog of blogs) {
            const lastmod = (blog.updatedAt || blog.createdAt || new Date()).toISOString();
            xml += `<url>
  <loc>${SITE_URL}/blogs/${blog.slug}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.70</priority>
</url>
`;
        }

        xml += `</urlset>`;

        // Set proper headers for XML sitemap
        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour
        res.set('X-Robots-Tag', 'noindex'); // Sitemaps themselves should not be indexed
        res.status(200).send(xml);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

module.exports = router;
