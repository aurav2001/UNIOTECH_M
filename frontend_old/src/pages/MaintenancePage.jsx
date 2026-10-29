import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const MaintenancePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6 py-20">
            <SEO
                title="Case Studies | Real-World IT Success Stories"
                description="Discover how Uniotech IT helped businesses improve security, performance, and scalability through tailored IT solutions. Read our success stories."
                keywords="IT Case Studies, Success Stories, IT Projects, Tech Solutions Examples"
                url="https://uniotechit.com/case-studies"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                {/* Animated Icon */}
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                    <Wrench size={48} className="text-primary-medium" />
                </motion.div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Under Maintenance
                </h1>

                {/* Description */}
                <p className="text-gray-500 text-lg mb-8">
                    We're working on something awesome! This page will be updated soon.
                </p>

                {/* Time indicator */}
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-8">
                    <Clock size={16} />
                    <span>Coming Soon</span>
                </div>

                {/* Go Back Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 bg-primary-dark text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-primary-dark/20"
                >
                    <ArrowLeft size={20} />
                    Go Back
                </motion.button>

                {/* Home link */}
                <p className="mt-6 text-gray-400 text-sm">
                    Or go to{' '}
                    <button
                        onClick={() => navigate('/')}
                        className="text-primary-medium hover:underline font-medium"
                    >
                        Home Page
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default MaintenancePage;
