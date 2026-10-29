import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, Search, User, Sparkles, TrendingUp, Clock, Tag, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { getApiUrl } from '../utils/api';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch(getApiUrl('/api/blogs'));
                if (res.ok) {
                    const data = await res.json();
                    setBlogs(Array.isArray(data) ? data : []);
                } else {
                    setBlogs([]);
                }
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Extract all unique tags
    const allTags = [...new Set(blogs.flatMap(blog => blog.tags || []))];

    // Filter Logic
    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (blog.subtitle && blog.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTag = selectedTag ? blog.tags?.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });

    const featuredBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
    const gridBlogs = filteredBlogs.length > 0 ? filteredBlogs.slice(1) : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium tracking-widest text-sm uppercase">Loading Journal...</p>
                </div>
            </div>
        );
    }

    // Build CollectionPage JSON-LD for blog listing
    const blogListJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "UnioTech Journal | IT Blogs & Technology Insights",
        "description": "Read expert blogs on IT infrastructure, cybersecurity trends, cloud computing, digital transformation, and best practices for modern enterprises.",
        "url": "https://uniotechit.com/blogs",
        "publisher": {
            "@type": "Organization",
            "name": "UnioTech IT Solutions",
            "url": "https://uniotechit.com"
        },
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": filteredBlogs.slice(0, 10).map((blog, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://uniotechit.com/blogs/${blog.slug}`,
                "name": blog.title
            }))
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
            <SEO
                title="UnioTech Journal | Insights & Trends"
                description="Read expert blogs on IT infrastructure, cybersecurity trends, cloud computing, digital transformation, and best practices for modern enterprises."
                keywords="Technology blog, IT insights, digital transformation, cybersecurity trends, software development, cloud computing"
                url="https://uniotechit.com/blogs"
                jsonLd={blogListJsonLd}
            />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group px-4 py-2 rounded-lg hover:bg-white/50"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>

                {/* --- HERO HEADER --- */}
                {/* Header Section */}
                <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2 text-blue-600 font-bold tracking-wider text-sm uppercase mb-6"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>The UnioTech Journal</span>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-6"
                    >
                        Explore the future of <br />
                        <span className="text-blue-600">Technology & Innovation</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12"
                    >
                        Expert perspectives on enterprise IT, cybersecurity, and digital transformation. Stay ahead of the curve.
                    </motion.p>
                </div>
                {/* --- STICKY FILTER BAR --- */}
                <div className="sticky top-20 z-40 mb-16 -mx-4 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg shadow-gray-200/10 p-4 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                        {/* Tags */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${!selectedTag
                                    ? 'bg-black text-white shadow-lg shadow-black/20'
                                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                All Posts
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedTag === tag
                                        ? 'bg-black text-white shadow-lg shadow-black/20'
                                        : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-72 flex-shrink-0">
                            <input
                                type="text"
                                placeholder="Search insights..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold transition-all outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                    </motion.div>
                </div>

                {filteredBlogs.length === 0 ? (
                    <div className="text-center py-40">
                        <div className="inline-block p-4 rounded-full bg-gray-50 mb-4">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No articles found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedTag(null); }}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* --- FEATURED STORY --- */}
                        {featuredBlog && (
                            <motion.section
                                initial={{ opacity: 0, scale: 0.98 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="mb-24"
                            >
                                <Link to={`/blogs/${featuredBlog.slug}`} className="group relative block rounded-[2.5rem] overflow-hidden bg-black aspect-[16/10] md:aspect-[21/9] shadow-2xl">
                                    {/* Image with Darken Overlay */}
                                    <div className="absolute inset-0 opacity-80 group-hover:opacity-60 transition-opacity duration-700">
                                        {featuredBlog.coverImage ? (
                                            <img
                                                src={featuredBlog.coverImage}
                                                alt={featuredBlog.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-900" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                                        <div className="max-w-4xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg">Featured</span>
                                                <span className="text-gray-300 font-medium text-sm flex items-center gap-2">
                                                    <Clock size={14} /> {featuredBlog.readTime} read
                                                </span>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight group-hover:text-blue-200 transition-colors">
                                                {featuredBlog.title}
                                            </h2>
                                            <p className="text-lg md:text-xl text-gray-300 mb-8 line-clamp-2 md:line-clamp-none max-w-2xl">
                                                {featuredBlog.subtitle}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="pl-4 border-l-2 border-blue-500">
                                                    <p className="text-white font-bold">{featuredBlog.author?.name || 'UnioTech Team'}</p>
                                                    <p className="text-gray-400 text-xs uppercase tracking-wide">Author</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.section>
                        )}

                        {/* --- LATEST ARTICLES GRID --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {gridBlogs.map((blog, index) => (
                                <motion.article
                                    key={blog.id || blog._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <Link to={`/blogs/${blog.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                                        {blog.coverImage ? (
                                            <img
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                        {/* Floating Tag */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {blog.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-gray-900 shadow-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </Link>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mb-4">
                                            <Calendar size={14} className="text-blue-500" />
                                            <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <Clock size={14} className="text-blue-500" />
                                            <span>{blog.readTime}</span>
                                        </div>

                                        <Link to={`/blogs/${blog.slug}`} className="block mb-3">
                                            <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                                                {blog.title}
                                            </h3>
                                        </Link>

                                        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                                            {blog.subtitle}
                                        </p>

                                        <div className="mt-auto border-t border-gray-50 pt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {blog.author?.image ? (
                                                    <img src={blog.author.image} alt={blog.author.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User size={14} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="text-xs">
                                                    <p className="font-bold text-gray-900">{blog.author?.name || 'UnioTech'}</p>
                                                    <p className="text-gray-400">Contributor</p>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/blogs/${blog.slug}`}
                                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-300 group-hover:scale-110"
                                            >
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Blogs;
