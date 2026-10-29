import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, Heart } from "lucide-react";
import SEO from "../components/SEO";
import DOMPurify from "dompurify";

const BlogArticleLayout = ({
  blog,
  slug,
  liked,
  setLiked,
  handleShare,
  copied,
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const sanitizeContent = (content) => {
    if (!content) return "";

    // Comprehensive removal of invisible/break-inducing characters from database/server content
    const cleaned = content
      // Remove Soft Hyphens (both HTML entity and Unicode)
      .replace(/&shy;/g, "")
      .replace(/\u00AD/g, "")
      // Remove Zero Width characters that can cause unwanted line splitting
      .replace(/\u200B/g, "") // zero-width space
      .replace(/\u200C/g, "") // zero-width non-joiner
      .replace(/\u200D/g, "") // zero-width joiner
      .replace(/\uFEFF/g, "") // byte order mark
      // Remove Word Break Opportunity tag
      .replace(/<wbr\s*\/?>/gi, "")
      // Normalize non-breaking spaces to allow standard line wrapping if necessary
      .replace(/&nbsp;/g, " ")
      .replace(/\u00A0/g, " ");

    return DOMPurify.sanitize(cleaned);
  };

  const siteUrl = "https://uniotechit.com";
  const canonicalUrl = `${siteUrl}/blogs/${slug}`;

  // Ensure cover image is absolute URL
  let coverImageUrl = blog.coverImage || blog.image || `${siteUrl}/logo.png`;
  if (coverImageUrl && !coverImageUrl.startsWith('http')) {
    coverImageUrl = `${siteUrl}${coverImageUrl.startsWith('/') ? '' : '/'}${coverImageUrl}`;
  }

  // Build BlogPosting JSON-LD for rich results in Google
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": blog.seo?.title || blog.title,
    "description": blog.seo?.description || blog.subtitle || "",
    "image": coverImageUrl,
    "author": {
      "@type": "Person",
      "name": blog.author?.name || "UnioTech Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "UnioTech IT Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "datePublished": blog.createdAt || new Date().toISOString(),
    "dateModified": blog.updatedAt || blog.createdAt || new Date().toISOString(),
    "keywords": blog.seo?.keywords || blog.tags?.join(", ") || "",
    "articleSection": blog.tags?.[0] || "Technology",
    "url": canonicalUrl
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary-light/20 selection:text-primary-dark overflow-x-hidden"
    >
      <SEO
        title={blog.seo?.title || blog.title}
        description={blog.seo?.description || blog.subtitle}
        keywords={blog.seo?.keywords || blog.tags?.join(", ")}
        image={coverImageUrl}
        url={canonicalUrl}
        type="article"
        publishedTime={blog.createdAt}
        modifiedTime={blog.updatedAt}
        author={blog.author?.name}
        jsonLd={blogJsonLd}
      />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-medium z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Copied Toast */}
      {copied && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
          Link copied!
        </div>
      )}

      {/* Back Link */}
      <div className="container mx-auto max-w-4xl px-6 pt-8">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-medium transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to All Articles</span>
        </Link>
      </div>

      {/* Content Section */}
      <main className="py-16 md:py-24 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          {/* Featured Image */}
          {(blog.coverImage || blog.image) && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-3xl overflow-hidden shadow-2xl mb-12 bg-white ring-1 ring-gray-100"
            >
              <img
                src={blog.coverImage || blog.image}
                alt={blog.title}
                className="w-full h-auto"
              />
            </motion.div>
          )}

          {/* Title and Meta */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            {/* Category */}
            {blog.tags?.[0] && (
              <span className="text-primary-medium font-bold tracking-widest uppercase text-sm mb-4 block">
                {blog.tags[0]}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              {blog.title}
            </h1>

            {/* Subtitle */}
            {blog.subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed mb-6">
                {blog.subtitle}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                  <img
                    src={
                      blog.author?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='40'%3E?%3C/text%3E%3C/svg%3E"
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-gray-900">
                  {blog.author?.name || "UnioTech Team"}
                </span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-primary-medium" />
                <span>{blog.date || new Date().toLocaleDateString()}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-primary-medium" />
                <span>{blog.readTime || "5 min read"}</span>
              </div>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.article
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                                [&_p]:mb-8 [&_p]:leading-[1.8] [&_p]:text-lg
                                [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:text-gray-900 [&_h1]:mt-16 [&_h1]:mb-6
                                [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-12 [&_h2]:mb-5
                                [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-10 [&_h3]:mb-4
                                [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-8 [&_h4]:mb-3
                                [&_strong]:font-bold [&_strong]:text-gray-900
                                [&_a]:text-primary-medium [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a]:transition-all hover:[&_a]:text-primary-dark hover:[&_a]:decoration-primary-dark
                                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-8 [&_ul]:space-y-3
                                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-8 [&_ol]:space-y-3
                                [&_li]:text-gray-700
                                [&_blockquote]:border-l-4 [&_blockquote]:border-primary-medium [&_blockquote]:pl-8 [&_blockquote]:py-4 [&_blockquote]:my-10 [&_blockquote]:italic [&_blockquote]:bg-gray-50 [&_blockquote]:rounded-r-2xl [&_blockquote]:text-xl [&_blockquote]:text-gray-800
                                [&_img]:rounded-2xl [&_img]:shadow-xl [&_img]:my-12 [&_img]:mx-auto [&_img]:border [&_img]:border-gray-100
                                [&_pre]:bg-[#1a2b3c] [&_pre]:text-gray-100 [&_pre]:p-8 [&_pre]:rounded-2xl [&_pre]:overflow-x-auto [&_pre]:my-10 [&_pre]:shadow-2xl [&_pre]:text-sm [&_pre]:font-mono
                                [&_code]:bg-gray-100 [&_code]:text-primary-dark [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[0.9em] [&_code]:font-mono
                                [&_table]:w-full [&_table]:my-10 [&_table]:border-collapse [&_td]:border-b [&_td]:border-gray-200 [&_td]:p-4 [&_th]:border-b-2 [&_th]:border-gray-300 [&_th]:p-4 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-bold [&_th]:text-gray-900
                                [&_*]:overflow-visible"
              style={{
                wordBreak: "normal !important",
                overflowWrap: "normal !important",
                hyphens: "none !important",
                WebkitHyphens: "none !important",
                textAlign: "left !important",
                display: "block",
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeContent(blog.content),
              }}
            />
          </motion.article>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-12 border-t border-gray-100 mt-16">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-xs mr-2">
                Tags:
              </span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-100 hover:border-primary-light hover:bg-primary-light/10 hover:text-primary-medium transition-all duration-300 cursor-pointer shadow-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Actions */}
          <div className="flex flex-wrap items-center gap-6 mt-10 py-8 border-y border-gray-100">
            <span className="text-gray-900 font-bold">
              Enjoyed this article?
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm group"
              >
                <Share2
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-semibold">Share Article</span>
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 shadow-sm group ${
                  liked
                    ? "bg-red-50 border-red-100 text-red-500 scale-105 shadow-red-100/50"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-red-50/30 hover:border-red-100 hover:text-red-400"
                }`}
              >
                <Heart
                  size={18}
                  className={`${liked ? "fill-current" : ""} group-hover:scale-110 transition-transform`}
                />
                <span className="text-sm font-semibold">
                  {liked ? "Saved!" : "Save & Like"}
                </span>
              </button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F2854] via-[#1C4D8D] to-[#213448]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-medium/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="relative p-10 md:p-16 text-center z-10">
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
                Ready to scale your IT infrastructure?
              </h3>
              <p className="text-blue-100/80 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Join hundreds of businesses that trust Uniotech IT for secure,
                scalable, and high-performance technology solutions.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/contact"
                  className="px-10 py-4 bg-white text-primary-dark rounded-2xl font-bold hover:bg-primary-light hover:text-primary-dark transition-all duration-300 shadow-xl shadow-black/20 text-lg"
                >
                  Get Free Consultation
                </Link>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-12">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-medium transition-colors group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="font-medium">Back to All Articles</span>
            </Link>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default BlogArticleLayout;
