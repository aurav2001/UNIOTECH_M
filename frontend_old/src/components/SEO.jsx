import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { seoData } from '../data/seoData';

const SEO = ({
    title: propTitle,
    description: propDescription,
    keywords: propKeywords = "IT Solutions, Hardware Supply, Software Development, IT Consulting, Cybersecurity, Cloud Services, UnioTech",
    image: propImage = "/logo.png", // Ensure you have a default OG image
    url, // Optional: Override automatic URL
    type = "website",
    publishedTime, // For articles
    modifiedTime, // For articles
    author, // For articles
    noIndex = false, // IGNORED — always index, follow (kept for API compat)
    jsonLd // Optional: custom JSON-LD structured data
}) => {
    const location = useLocation();
    const siteUrl = "https://uniotechit.com";

    // Normalize pathname: remove trailing slash unless it's root
    let pathname = location.pathname;
    if (pathname !== '/' && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }

    // Lookup data in seoData
    const data = seoData[pathname] || {};

    // Use data from seoData if available, otherwise fall back to props or defaults
    const title = data.title || propTitle;
    const description = data.description || propDescription || "UnioTech IT Solutions - Your trusted partner for Hardware, Software, and IT Consulting services.";
    const keywords = propKeywords;
    
    // Ensure image URL is absolute
    let image = propImage || "/logo.png";
    if (image && !image.startsWith('http')) {
        image = `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`;
    }

    const canonicalUrl = url || `${siteUrl}${pathname}`;

    // Build Organization JSON-LD (always present)
    const organizationJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "UnioTech IT Solutions",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`,
        "sameAs": [],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "English"
        }
    };

    // Build WebSite JSON-LD for homepage
    const websiteJsonLd = pathname === '/' ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "UnioTech IT Solutions",
        "url": siteUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/blogs?search={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    } : null;

    // Build BreadcrumbList JSON-LD
    const pathParts = pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl }
    ];
    let currentPath = '';
    pathParts.forEach((part, index) => {
        currentPath += `/${part}`;
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": index + 2,
            "name": part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            "item": `${siteUrl}${currentPath}`
        });
    });
    const breadcrumbJsonLd = pathParts.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
    } : null;

    const fullTitle = title && title.includes("Uniotech") ? title : `${title} | UnioTech IT Solutions`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            
            {/* Robots directive — ALWAYS index, follow to prevent Search Console noindex issues */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="UnioTech IT Solutions" />
            <meta property="og:locale" content="en_US" />
            
            {/* Article-specific tags */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Canonical Link */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Organization JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(organizationJsonLd)}
            </script>

            {/* WebSite JSON-LD (homepage only) */}
            {websiteJsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(websiteJsonLd)}
                </script>
            )}

            {/* Breadcrumb JSON-LD */}
            {breadcrumbJsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbJsonLd)}
                </script>
            )}

            {/* Custom JSON-LD (e.g., Article, BlogPosting) */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
