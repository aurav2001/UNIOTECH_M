import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import Skeleton from './Skeleton';

const Testimonials = () => {
    const { getContent, loading } = useContent();
    const { items = [], title, subtitle, isVisible } = getContent('testimonials');

    if (isVisible === false) return null;

    // Helper to resolve image URL
    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `${import.meta.env.VITE_API_URL}${url}`;
    };

    if (!items || items.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary-dark font-bold uppercase tracking-widest text-sm mb-3 block"
                    >
                        Testimonials
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6"
                    >
                        {title || "What Our Clients Say"}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-xl text-gray-500"
                    >
                        {subtitle || "See how we're transforming businesses globally."}
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Skeleton key={j} className="w-4 h-4 rounded-full" />
                                    ))}
                                </div>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-5/6 mb-8" />
                                <div className="flex items-center gap-4 mt-auto">
                                    <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                                    <div className="flex-grow">
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        items.map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
                            >
                                {/* Quote Icon */}
                                <div className="absolute top-8 right-8 text-gray-100 group-hover:text-primary-light/20 transition-colors">
                                    <Quote size={40} className="fill-current" />
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-gray-600 text-lg leading-relaxed mb-8 relative z-10">
                                    "{item.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                        {getAvatarUrl(item.avatar) ? (
                                            <img
                                                src={getAvatarUrl(item.avatar)}
                                                alt={item.author}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-dark text-white font-bold text-lg">
                                                {item.author ? item.author.charAt(0) : '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.author || 'Anonymous'}</h4>
                                        <p className="text-sm text-gray-500 font-medium">{item.role || 'Client'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
