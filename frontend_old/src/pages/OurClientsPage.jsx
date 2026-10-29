import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const OurClientsPage = () => {
    const { getContent, loading } = useContent();
    const navigate = useNavigate();
    const clientsData = getContent('clients') || {};

    const {
        title = 'Our Valued Clients',
        subtitle = 'Trusted by leading organizations worldwide',
        isVisible = true,
        items = []
    } = clientsData;

    // Redirect if page is hidden
    React.useEffect(() => {
        if (!loading && isVisible === false) {
            navigate('/');
        }
    }, [isVisible, loading, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#0a192f] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="Our Clients | Trusted IT Solutions Partner"
                description="Explore Uniotech IT’s client portfolio across industries, delivering scalable IT infrastructure, cybersecurity, and managed services with proven results."
                keywords="Uniotech Clients, Client Portfolio, Trusted IT Partner, Customer Success"
                url="https://uniotechit.com/our-clients"
            />

            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.h4
                            className="text-[#0a192f] font-bold uppercase tracking-[0.2em] text-sm mb-4"
                        >
                            Our Clients
                        </motion.h4>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0a192f] mb-6 leading-tight">
                            {title}
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Clients Grid */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    {items.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
                        >
                            {items.map((client, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="group relative bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:shadow-lg hover:border-[#0a192f]/20 transition-all duration-300"
                                >
                                    <div className="aspect-[3/2] flex items-center justify-center">
                                        <img
                                            src={client.logo}
                                            alt={client.name}
                                            className="max-h-16 md:max-h-20 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                        />
                                    </div>
                                    <p className="text-center text-gray-500 text-sm mt-4 font-medium">
                                        {client.name}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Users size={64} className="mx-auto text-gray-300 mb-6" />
                            <h3 className="text-2xl font-bold text-[#0a192f] mb-3">Coming Soon</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We're currently updating our client showcase. Check back soon to see the amazing organizations we work with!
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#0a192f] text-white rounded-xl hover:bg-[#112240] transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Home
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            {items.length > 0 && (
                <section className="py-16 px-4 bg-[#0a192f]">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                        >
                            <div>
                                <p className="text-4xl font-bold text-white">{items.length}+</p>
                                <p className="text-gray-400 text-sm mt-1">Happy Clients</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-white">100%</p>
                                <p className="text-gray-400 text-sm mt-1">Client Satisfaction</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-white">50+</p>
                                <p className="text-gray-400 text-sm mt-1">Projects Delivered</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-white">24/7</p>
                                <p className="text-gray-400 text-sm mt-1">Support Available</p>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default OurClientsPage;
