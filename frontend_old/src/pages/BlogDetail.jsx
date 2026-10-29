import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import BlogArticleLayout from '../templates/BlogArticleLayout';
import SEO from '../components/SEO';

const BlogDetail = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog?.title,
                    text: blog?.subtitle,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(getApiUrl(`/api/blogs/${slug}`));
                if (res.ok) {
                    const data = await res.json();
                    setBlog(data);
                } else if (res.status === 404) {
                    setError('Blog post not found');
                    setBlog(null);
                } else {
                    throw new Error('Failed to fetch blog');
                }
            } catch (error) {
                console.error('Failed to fetch blog:', error);
                setError('Failed to load blog post. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchBlog();
    }, [slug]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-medium border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Loading article...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
                <SEO
                    title="Blog Not Found"
                    description="The blog post you are looking for could not be found."
                />
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">??</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
                    <p className="text-gray-500 mb-6">Don't worry, let's get you back on track.</p>
                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-medium text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }

    // 404 state
    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
                <SEO
                    title="Blog Not Found"
                    description="The blog post you are looking for does not exist."
                />
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">??</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog not found</h2>
                    <p className="text-gray-500 mb-6">The article you're looking for doesn't exist.</p>
                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-medium text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }

    // Use the new layout
    return (
        <BlogArticleLayout
            blog={blog}
            slug={slug}
            liked={liked}
            setLiked={setLiked}
            handleShare={handleShare}
            copied={copied}
        />
    );
};

export default BlogDetail;
