const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

const SITE_URL = 'https://uniotechit.com';

/**
 * @desc    Serve SEO-friendly HTML for blog posts (for crawlers that hit the API domain)
 *          Also serves as a fallback when the frontend prerender is missing
 * @route   GET /api/blogs/seo/:slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            where: { slug: req.params.slug, isPublished: true } 
        });

        if (!blog) {
            return res.status(404).send('<html><head><title>Blog Not Found</title><meta name="robots" content="noindex"></head><body><h1>Blog not found</h1></body></html>');
        }

        const canonicalUrl = `${SITE_URL}/blogs/${blog.slug}`;
        const title = blog.seo?.title || blog.title;
        const description = blog.seo?.description || blog.subtitle || '';
        const keywords = blog.seo?.keywords || (blog.tags || []).join(', ');
        const authorName = blog.author?.name || 'UnioTech Team';
        const coverImage = blog.coverImage || `${SITE_URL}/logo.png`;
        const publishedDate = blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString();
        const modifiedDate = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : publishedDate;

        // Strip HTML tags for plain text excerpt
        const plainContent = (blog.content || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500);

        // Build JSON-LD BlogPosting
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
            "headline": title,
            "description": description,
            "image": coverImage,
            "author": { "@type": "Person", "name": authorName },
            "publisher": {
                "@type": "Organization",
                "name": "UnioTech IT Solutions",
                "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` }
            },
            "datePublished": publishedDate,
            "dateModified": modifiedDate,
            "keywords": keywords,
            "url": canonicalUrl
        };

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | UnioTech IT Solutions</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
    
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${escapeHtml(title)} | UnioTech IT Solutions">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(coverImage)}">
    <meta property="og:site_name" content="UnioTech IT Solutions">
    <meta property="article:published_time" content="${publishedDate}">
    <meta property="article:modified_time" content="${modifiedDate}">
    <meta property="article:author" content="${escapeHtml(authorName)}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${canonicalUrl}">
    <meta name="twitter:title" content="${escapeHtml(title)} | UnioTech IT Solutions">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(coverImage)}">
    
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    
    <!-- Redirect users (not bots) to the actual frontend page -->
    <script>
        if (!/googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(navigator.userAgent)) {
            window.location.replace("${canonicalUrl}");
        }
    </script>
</head>
<body>
    <article>
        <h1>${escapeHtml(blog.title)}</h1>
        ${blog.subtitle ? `<p><em>${escapeHtml(blog.subtitle)}</em></p>` : ''}
        <p>By ${escapeHtml(authorName)} | ${new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | ${blog.readTime || '5 min read'}</p>
        ${coverImage ? `<img src="${escapeHtml(coverImage)}" alt="${escapeHtml(blog.title)}" width="800" height="450">` : ''}
        <div>${blog.content || ''}</div>
        ${blog.tags && blog.tags.length > 0 ? `<p>Tags: ${blog.tags.map(t => escapeHtml(t)).join(', ')}</p>` : ''}
    </article>
    <nav>
        <a href="${SITE_URL}/blogs">Back to All Blogs</a> |
        <a href="${SITE_URL}">UnioTech IT Solutions Home</a>
    </nav>
</body>
</html>`;

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
        res.set('X-Robots-Tag', 'index, follow');
        res.status(200).send(html);

    } catch (error) {
        console.error('Error serving blog SEO page:', error);
        res.status(500).send('<html><head><meta name="robots" content="noindex"></head><body>Server error</body></html>');
    }
});

/**
 * @desc    Serve SEO-friendly HTML for blogs listing page
 * @route   GET /api/blogs/seo (root of blog-seo router)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: { isPublished: true },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "UnioTech Journal | IT Blogs & Technology Insights",
            "description": "Read expert blogs on IT infrastructure, cybersecurity trends, cloud computing, digital transformation, and best practices.",
            "url": `${SITE_URL}/blogs`,
            "publisher": { "@type": "Organization", "name": "UnioTech IT Solutions" },
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": blogs.map((b, i) => ({
                    "@type": "ListItem",
                    "position": i + 1,
                    "url": `${SITE_URL}/blogs/${b.slug}`,
                    "name": b.title
                }))
            }
        };

        const blogListHtml = blogs.map(b => 
            `<li><a href="${SITE_URL}/blogs/${escapeHtml(b.slug)}">${escapeHtml(b.title)}</a> - ${escapeHtml(b.subtitle || '')}</li>`
        ).join('\n');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IT Blogs & Technology Insights | UnioTech IT Solutions</title>
    <meta name="description" content="Read expert blogs on IT infrastructure, cybersecurity trends, cloud computing, digital transformation, and best practices for modern enterprises.">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    <link rel="canonical" href="${SITE_URL}/blogs">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE_URL}/blogs">
    <meta property="og:title" content="IT Blogs & Technology Insights | UnioTech IT Solutions">
    <meta property="og:description" content="Read expert blogs on IT infrastructure, cybersecurity, and digital transformation.">
    <meta property="og:site_name" content="UnioTech IT Solutions">
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script>
        if (!/googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(navigator.userAgent)) {
            window.location.replace("${SITE_URL}/blogs");
        }
    </script>
</head>
<body>
    <h1>UnioTech Journal - IT Blogs & Technology Insights</h1>
    <p>Expert perspectives on enterprise IT, cybersecurity, and digital transformation.</p>
    <ul>
${blogListHtml}
    </ul>
    <nav>
        <a href="${SITE_URL}">UnioTech IT Solutions Home</a>
    </nav>
</body>
</html>`;

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=1800');
        res.set('X-Robots-Tag', 'index, follow');
        res.status(200).send(html);

    } catch (error) {
        console.error('Error serving blogs listing SEO:', error);
        res.status(500).send('<html><head><meta name="robots" content="noindex"></head><body>Server error</body></html>');
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = router;
