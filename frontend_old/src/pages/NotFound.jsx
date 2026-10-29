import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
            <SEO
                title="Page Not Found"
                description="The page you are looking for does not exist or has been moved. Browse our IT services, blogs, and solutions."
            />

            <div className="text-center max-w-lg">
                {/* 404 Visual */}
                <div className="mb-8">
                    <h1 className="text-8xl md:text-9xl font-black text-gray-200 select-none">404</h1>
                </div>

                {/* Message */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Page Not Found
                </h2>
                <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                {/* Navigation Links */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-dark text-white rounded-full font-medium hover:bg-primary-medium transition-colors shadow-lg"
                    >
                        <Home size={18} />
                        Go to Homepage
                    </Link>
                    <Link
                        to="/blogs"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-medium hover:border-gray-400 transition-colors"
                    >
                        <BookOpen size={18} />
                        Read Our Blog
                    </Link>
                </div>

                {/* Helpful Links for Crawlers */}
                <div className="border-t border-gray-200 pt-8">
                    <p className="text-sm text-gray-400 mb-4">Popular pages you might be looking for:</p>
                    <nav className="flex flex-wrap items-center justify-center gap-3 text-sm">
                        <Link to="/about" className="text-primary-medium hover:text-primary-dark hover:underline transition-colors">About Us</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/pricing" className="text-primary-medium hover:text-primary-dark hover:underline transition-colors">Pricing</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/contact" className="text-primary-medium hover:text-primary-dark hover:underline transition-colors">Contact</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/services/cybersecurity" className="text-primary-medium hover:text-primary-dark hover:underline transition-colors">Cybersecurity</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/services/cloud" className="text-primary-medium hover:text-primary-dark hover:underline transition-colors">Cloud Solutions</Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/services/web-development-services" className="text-primary-medium hover:text-primary-dark hover:underline transition-colors">Web Development</Link>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
