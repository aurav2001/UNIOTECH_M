import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { useNavigate, Link } from 'react-router-dom';
import { Handshake, ArrowLeft, ExternalLink, Monitor } from 'lucide-react';
import SEO from '../components/SEO';

// Dynamically import all partner logos from local assets as fallback
const partnerLogos = import.meta.glob('../assets/partners/*.png', { eager: true });

// Partner name to Simple Icons slug and official Brand Color mapping
const BRAND_MAP = {
    'Cisco': { slug: 'cisco', color: '1BA0D7' },
    'Dell': { slug: 'dell', color: '007DB8' },
    'Fortinet': { slug: 'fortinet', color: 'EE3124' },
    'Fujitsu': { slug: 'fujitsu', color: 'FF0000' },
    'Google': { slug: 'google', color: '4285F4' },
    'HP': { slug: 'hp', color: '0096D6' },
    'Kaspersky': { slug: 'kaspersky', color: '006D5C' },
    'Lenovo': { slug: 'lenovo', color: 'E2231A' },
    'McAfee': { slug: 'mcafee', color: 'C01212' },
    'MongoDB': { slug: 'mongodb', color: '47A248' },
    'Red Hat': { slug: 'redhat', color: 'EE0000' },
    'SUSE': { slug: 'suse', color: '0C322C' },
    'SonicWall': { slug: 'sonicwall', color: 'FF6600' },
    'TeamViewer': { slug: 'teamviewer', color: '0080FF' },
    'Trend Micro': { slug: 'trendmicro', color: 'D9151B' },
    'Ubiquiti': { slug: 'ubiquiti', color: '0559C9' },
    'VMware': { slug: 'vmware', color: '607078' },
    'Veeam': { slug: 'veeam', color: '00B336' }
};

// Transform imported modules into a partners array for fallback
const staticPartners = Object.entries(partnerLogos).map(([path, module]) => {
    const fileName = path.split('/').pop().replace('.png', '');
    const name = fileName.replace(/_/g, ' ');
    return { name, logo: module.default };
});

const OurPartnersPage = () => {
    const { getContent, loading } = useContent();
    const navigate = useNavigate();
    const partnersData = getContent('partners') || {};

    const title = partnersData.title || 'Our Trusted Technology Partners';
    const isVisible = partnersData.isVisible !== false;

    // Use API partners if available, otherwise fall back to static imports
    const apiPartners = partnersData.items || [];
    const partners = apiPartners.length > 0 ? apiPartners : staticPartners;

    // Local state to track which logos failed and current source for each partner
    const [failedLogos, setFailedLogos] = React.useState(new Set());
    const [logoSources, setLogoSources] = React.useState({});

    const getLogoUrl = (partner) => {
        if (logoSources[partner.name]) return logoSources[partner.name];
        const brand = BRAND_MAP[partner.name];
        if (brand) {
            return `https://cdn.simpleicons.org/${brand.slug}/${brand.color}`;
        }
        return partner.logo;
    };

    const handleImageError = (partner) => {
        if (!logoSources[partner.name] && BRAND_MAP[partner.name]) {
            setLogoSources(prev => ({ ...prev, [partner.name]: partner.logo }));
        } else {
            setFailedLogos(prev => new Set([...prev, partner.name]));
        }
    };

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
            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
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
                title="Our Technology Partners | Uniotech IT Solutions"
                description="Explore Uniotech IT's trusted technology partnerships with industry leaders like Cisco, Dell, HP, Fortinet, VMware, and more for enterprise-grade IT solutions."
                keywords="Uniotech Partners, Technology Partners, IT Partnerships, Cisco Partner, Dell Partner, HP Partner, Enterprise IT"
                url="https://uniotechit.com/our-partners"
            />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-light rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-medium rounded-full blur-3xl"></div>
                </div>
                {/* Subtle Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    }}
                />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6"
                        >
                            <Handshake size={16} className="text-primary-light" />
                            <span className="text-primary-light text-sm font-medium tracking-wide">Technology Partnerships</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            {title}
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            We partner with the world's leading technology brands to deliver enterprise-grade solutions for your business.
                        </p>

                        {/* Partner Count Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3"
                        >
                            <span className="text-3xl font-bold text-white">{partners.length}+</span>
                            <span className="text-gray-400 text-sm text-left leading-tight">Trusted Technology<br />Partners</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Partners Grid */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    {partners.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                        >
                            {partners.map((partner, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="group relative bg-white border border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-xl hover:shadow-primary-dark/5 hover:border-primary-medium/20 hover:-translate-y-1 transition-all duration-300 cursor-default"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/0 to-primary-medium/0 group-hover:from-primary-light/5 group-hover:to-primary-medium/5 transition-all duration-300" />

                                    <div className="relative z-10">
                                        <div className="aspect-[3/2] flex items-center justify-center mb-3">
                                            {failedLogos.has(partner.name) ? (
                                                <div className="flex flex-col items-center text-gray-300">
                                                    <Monitor size={32} strokeWidth={1.5} />
                                                </div>
                                            ) : (
                                                <img
                                                    src={getLogoUrl(partner)}
                                                    alt={partner.name}
                                                    className="max-h-14 md:max-h-16 w-auto object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                    onError={() => handleImageError(partner)}
                                                />
                                            )}
                                        </div>
                                        <p className="text-center text-gray-500 group-hover:text-gray-800 text-xs md:text-sm font-semibold tracking-wide transition-colors duration-300 truncate">
                                            {partner.name}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Handshake size={64} className="mx-auto text-gray-300 mb-6" />
                            <h3 className="text-2xl font-bold text-[#0a192f] mb-3">Coming Soon</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We're currently updating our partner showcase. Check back soon to see the amazing brands we work with!
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

            {/* CTA Section */}
            {partners.length > 0 && (
                <section className="py-16 px-4 bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f]">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Powered by the Best in Tech
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                                Our partnerships with {partners.length}+ industry leaders ensure you get access to cutting-edge technology with certified expertise and priority support.
                            </p>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-white">{partners.length}+</p>
                                    <p className="text-gray-400 text-sm mt-1">Technology Partners</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-white">100%</p>
                                    <p className="text-gray-400 text-sm mt-1">Certified Expertise</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-white">24/7</p>
                                    <p className="text-gray-400 text-sm mt-1">Priority Support</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                    <p className="text-3xl font-bold text-white">50+</p>
                                    <p className="text-gray-400 text-sm mt-1">Solutions Delivered</p>
                                </div>
                            </div>

                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-dark text-white rounded-xl hover:bg-primary-medium transition-all duration-300 font-semibold text-lg shadow-lg shadow-primary-dark/30"
                            >
                                Get in Touch
                                <ExternalLink size={18} />
                            </Link>
                        </motion.div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default OurPartnersPage;
