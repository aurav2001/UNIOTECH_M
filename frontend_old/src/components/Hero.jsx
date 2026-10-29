import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import Skeleton from './Skeleton';
import { Link } from 'react-router-dom';


const Hero = () => {
    const { getContent, loading } = useContent();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // Dynamic Background Logic
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backgroundImages = getContent('hero', 'backgroundImages', []);
    const fallbackImage = getContent('hero', 'backgroundImage', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');

    // List of images to cycle through
    const images = (Array.isArray(backgroundImages) && backgroundImages.length > 0)
        ? backgroundImages
        : [fallbackImage];

    // Initialize with a random image on mount (Change on Refresh)
    useEffect(() => {
        if (images.length > 1) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setCurrentImageIndex(randomIndex);
        }
    }, [images.length]);

    // Auto-rotate background every 30 seconds
    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    const title = getContent('hero', 'title', 'Empowering Your Business with Intelligent IT');
    const description = getContent('hero', 'description', 'We safeguard your digital assets and optimize infrastructure with cutting-edge hardware, software, and cybersecurity solutions.');
    const backgroundImage = getContent('hero', 'backgroundImage', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');
    const ctaText = getContent('hero', 'ctaText', 'Get Started');
    const ctaLink = getContent('hero', 'ctaLink', '/contact');
    const { isVisible } = getContent('hero') || {};

    // Email validation
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleGetStarted = (e) => {
        e.preventDefault();

        // If email is empty, just navigate to contact
        if (!email.trim()) {
            navigate(ctaLink);
            return;
        }

        // Validate email
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Clear any error and redirect with email
        setEmailError('');
        navigate(`${ctaLink}?email=${encodeURIComponent(email)}`);
    };

    if (isVisible === false) return null;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gray-900 select-none flex flex-col justify-center">
            {/* Background Image Container with Fade-in */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    {!loading && (
                        <motion.div
                            key={images[currentImageIndex]}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute inset-0 bg-cover bg-center md:bg-fixed scale-105"
                            style={{
                                backgroundImage: `url('${images[currentImageIndex]}')`,
                            }}
                        />
                    )}
                </AnimatePresence>
                {/* Overlay Gradient - Darker for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
            </div>

            {/* Content Container - Centered */}
            <div className="relative z-20 container mx-auto px-6 flex flex-col justify-center items-center text-center flex-grow pt-20">
                <div className="max-w-4xl space-y-8 flex flex-col items-center">
                    {loading ? (
                        <>
                            <Skeleton className="h-16 w-3/4 md:w-full bg-white/10 backdrop-blur-sm" />
                            <Skeleton className="h-16 w-1/2 md:w-3/4 bg-white/10 backdrop-blur-sm" />
                            <Skeleton className="h-24 w-full bg-white/10 mt-6 backdrop-blur-sm" />
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mt-8">
                                <Skeleton className="h-14 w-full rounded-full bg-white/10 backdrop-blur-sm" />
                                <Skeleton className="h-14 w-40 rounded-full bg-white/20 backdrop-blur-sm" />
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-8 flex flex-col items-center"
                        >
                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
                                {title}
                            </h1>

                            {/* Subtext */}
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                                {description}
                            </p>

                            {/* CTA Section */}
                            <form onSubmit={handleGetStarted} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mt-4">
                                <div className="relative flex-grow group text-left">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-light transition-colors" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setEmailError('');
                                        }}
                                        placeholder="Enter your work email"
                                        className={`w-full h-14 pl-12 pr-4 bg-white/5 border ${emailError ? 'border-red-500' : 'border-white/10'} rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-primary-light/50 focus:bg-white/10 transition-all backdrop-blur-sm`}
                                    />
                                    {emailError && (
                                        <p className="absolute left-4 -bottom-6 text-red-400 text-xs">{emailError}</p>
                                    )}
                                </div>
                                <button type="submit" className="h-14 px-8 rounded-full bg-primary-dark text-white font-bold text-lg hover:bg-primary-medium transition-all shadow-lg shadow-primary-dark/20 flex items-center justify-center gap-2 group whitespace-nowrap">
                                    {ctaText}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Trust Badge - Links to Partners Page */}
            <div className="relative z-20 pb-12 w-full">
                <div className="container mx-auto px-6 text-center">
                    <Link
                        to="/our-partners"
                        className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 group"
                    >
                        <span className="text-sm font-medium uppercase tracking-wider">Trusted by 37+ Industry Leaders</span>
                        <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
