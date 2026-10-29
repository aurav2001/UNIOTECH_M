import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Check, ChevronRight, Star, Shield, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import SubServiceLayout from '../templates/SubServiceLayout';
import UnioTechLayout from '../templates/UnioTechLayout';
import { getApiUrl } from '../utils/api';

const serviceMetadata = {
    "amc-support": {
        title: "AMC IT Support Services | Annual Maintenance Contract – Uniotech",
        keywords: "Reliable AMC IT support with preventive maintenance, rapid issue resolution, system optimization, and SLA-driven technical support for businesses.",
        description: "Secure your business operations with Uniotech's AMC IT Support. We provide annual maintenance contracts, preventive care, and rapid resolutions.",
        url: "https://uniotechit.com/services/amc-support"
    },
    "managed-services": {
        title: "Managed IT Services Provider | 24/7 Monitoring & Support",
        keywords: "End-to-end managed IT services including infrastructure monitoring, helpdesk support, patch management, and performance optimization.",
        description: "Proactive Managed IT Services by Uniotech. We offer 24/7 monitoring, helpdesk support, and infrastructure management to keep your business running.",
        url: "https://uniotechit.com/services/managed-services"
    },
    "cybersecurity": {
        title: "Cybersecurity Services | Network, Endpoint & Data Protection",
        keywords: "Advanced cybersecurity solutions including threat detection, firewall management, endpoint security, compliance, and risk mitigation services.",
        description: "Protect your digital assets with Uniotech's Cybersecurity Services. Comprehensive solutions for network security, data protection, and threat mitigation.",
        url: "https://uniotechit.com/services/cybersecurity"
    },
    "software-solutions": {
        title: "Custom Software Solutions | Business Application Development",
        keywords: "Scalable software solutions including custom applications, system integration, automation, and enterprise software development for growth.",
        description: "Accelerate growth with Custom Software Solutions from Uniotech. We build scalable business applications, automation tools, and integrated systems.",
        url: "https://uniotechit.com/services/software-solutions"
    },
    "networking": {
        title: "Networking Solutions | Secure & Scalable IT Networks",
        keywords: "Professional networking services covering LAN, WAN, Wi-Fi, firewall setup, network optimization, and secure enterprise connectivity.",
        description: "Build a robust foundation with Uniotech's Networking Solutions. Expert services for LAN, WAN, Wi-Fi, and secure enterprise network infrastructure.",
        url: "https://uniotechit.com/services/networking"
    },
    "cloud-backup": {
        title: "Cloud Backup & Disaster Recovery Services",
        keywords: "Secure cloud backup solutions with automated data protection, rapid recovery, encryption, and business continuity planning.",
        description: "Ensure business continuity with Uniotech's Cloud Backup & Disaster Recovery. Secure, automated data protection and rapid recovery solutions.",
        url: "https://uniotechit.com/services/cloud-backup"
    },
    "migration-email": {
        title: "Email Migration Services | Secure & Zero Downtime",
        keywords: "email migration service, office 366 migration, g suite migration, exchange migration, secure data transfer, zero downtime migration",
        description: "Seamless email migration services ensuring data integrity, minimal downtime, secure transfer, and compatibility across platforms.",
        url: "https://uniotechit.com/services/migration-email"
    },
    "security-audits": {
        title: "IT Security Audits & Compliance Services | Uniotech",
        keywords: "IT security audit, compliance services, risk assessment, vulnerability assessment, cybersecurity audit",
        description: "Comprehensive IT security audits, risk assessments, and compliance services to safeguard your business infrastructure.",
        url: "https://uniotechit.com/services/security-audits"
    },
    "software": {
        title: "Custom Software Development Services | Uniotech",
        keywords: "custom software, software development, business applications, enterprise software, app development",
        description: "Tailored software development solutions to streamline business processes, enhance productivity, and drive innovation.",
        url: "https://uniotechit.com/services/software"
    },
    "migration": {
        title: "System & Data Migration Services | Uniotech",
        keywords: "system migration, data migration, server migration, cloud migration, digital transformation",
        description: "Expert system and data migration services ensuring seamless transitions with minimal downtime and data integrity.",
        url: "https://uniotechit.com/services/migration"
    },
    "cloud": {
        title: "Cloud Computing & Solutions | Uniotech",
        keywords: "cloud computing, cloud solutions, aws, azure, google cloud, cloud migration, cloud management",
        description: "Scalable cloud computing solutions including migration, management, and optimization for modern businesses.",
        url: "https://uniotechit.com/services/cloud"
    },
    "end-point-security": {
        title: "Endpoint Security Solutions | Uniotech",
        keywords: "endpoint security, antivirus, malware protection, ransomware protection, device management",
        description: "Robust endpoint security solutions to protect your network devices from cyber threats and unauthorized access.",
        url: "https://uniotechit.com/services/end-point-security"
    },
    "managed-it-services": {
        title: "Comprehensive Managed IT Services | Uniotech",
        keywords: "managed it services, it support, network monitoring, helpdesk, it infrastructure management",
        description: "Full-spectrum managed IT services including support, monitoring, and strategic planning for your IT infrastructure.",
        url: "https://uniotechit.com/services/managed-it-services"
    },
    "email-solutions": {
        title: "Enterprise Email Solutions | Uniotech",
        keywords: "enterprise email, business email, exchange server, email hosting, secure email",
        description: "Secure and reliable enterprise email solutions to enhance communication and collaboration within your organization.",
        url: "https://uniotechit.com/services/email-solutions"
    },
    "dlp": {
        title: "Data Loss Prevention (DLP) Services | Uniotech",
        keywords: "data loss prevention, dlp, data protection, information security, data leak prevention",
        description: "Advanced Data Loss Prevention services to monitor, detect, and prevent unauthorized data breaches and exfiltration.",
        url: "https://uniotechit.com/services/dlp"
    },
    "hardware-supply": {
        title: "IT Hardware Supply | Servers, Systems & Accessories",
        keywords: "Reliable IT hardware supply including servers, desktops, networking devices, and enterprise-grade equipment with end-to-end support.",
        description: "Source top-tier IT Hardware with Uniotech. We supply servers, workstations, and networking gear with full warranty and support.",
        url: "https://uniotechit.com/services/hardware-supply"
    },
    "it-strategy": {
        title: "IT Strategy & Consulting Services | Digital Transformation",
        keywords: "Strategic IT consulting to align technology with business goals, optimize infrastructure, reduce costs, and enable digital transformation.",
        description: "Align technology with business goals using Uniotech's IT Strategy & Consulting. We drive digital transformation and infrastructure optimization.",
        url: "https://uniotechit.com/services/it-strategy"
    },
    "server-support": {
        title: "Server Support & Management Services",
        keywords: "Proactive server support services covering monitoring, performance tuning, security updates, virtualization, and uptime management.",
        description: "Maximize uptime with Uniotech's Server Support. We provide 24/7 monitoring, maintenance, and security management for your server infrastructure.",
        url: "https://uniotechit.com/services/server-support"
    },
    "web-development-services": {
        title: "Web Development Services | Custom Websites & Web Apps",
        keywords: "Professional web development services, custom website design, e-commerce solutions, CMS development, and web application maintenance.",
        description: "Create a powerful online presence with Uniotech's Web Development Services. We build custom, responsive, and high-performance websites and web apps.",
        url: "https://uniotechit.com/services/web-development-services"
    },
    "secure-dms": {
        title: "Secure Document Management System (DMS) | UnioTech IT",
        keywords: "document management system, secure dms, enterprise dms, paperless workflow, cloud dms, docvault",
        description: "Enterprise-grade Cloud-based Document Management System (DMS) solutions by UnioTech IT to eliminate paper dependency and secure digital workflows.",
        url: "https://uniotechit.com/services/secure-dms"
    }
};

import { webDevelopmentData } from '../data/webDevelopmentData';

const DynamicPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                // TEMPORARY: Mock Data for Testing UnioTech Layout
                if (slug === 'test-uniotech-layout') {
                    // ... (Mock data logic remains the same if needed, or can be moved to a separate file, but for now I will just use the API fetch primarily)
                }

                const res = await fetch(getApiUrl(`/api/pages/${slug}`));

                if (res.ok) {
                    const data = await res.json();
                    setPage(data);
                } else {
                    // Fallback Logic for Web Development Services
                    if (slug === 'web-development-services') {
                        console.warn('API returned error, falling back to local data for web-development-services');
                        setPage(webDevelopmentData);
                        setLoading(false);
                        return;
                    }

                    if (res.status === 404) {
                        throw new Error('Page not found');
                    }
                    throw new Error('Failed to fetch page');
                }
            } catch (err) {
                // Double check fallback if error occurred during fetch (e.g. network error)
                if (slug === 'web-development-services') {
                    setPage(webDevelopmentData);
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    if (loading) {
        const meta = serviceMetadata[slug];
        return (
            <>
                {meta && (
                    <SEO
                        title={meta.title}
                        description={meta.description}
                        keywords={meta.keywords}
                        url={meta.url}
                    />
                )}
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <Loader2 className="animate-spin text-primary-dark" size={48} />
                </div>
            </>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
                <SEO
                    title="Service Not Found"
                    description="The service page you are looking for does not exist."
                />
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">404</h2>
                    <p className="text-gray-600 mb-8 text-lg">Page not found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center gap-2 bg-primary-dark text-white px-6 py-3 rounded-xl hover:bg-primary-medium transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <ArrowLeft size={18} />
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const isService = page.type === 'service';

    if (page.layout === 'uniotech_modern') {
        return <UnioTechLayout page={page} />;
    }

    if (page.layout === 'sub_service_satyam' || !page.layout || page.layout === 'default') {
        return <SubServiceLayout page={page} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50"
        >
            <SEO
                title={serviceMetadata[slug]?.title || page.seo?.title || page.title}
                description={serviceMetadata[slug]?.description || page.seo?.description || page.subtitle || "Uniotech IT Solutions Service Page"}
                keywords={serviceMetadata[slug]?.keywords || page.seo?.keywords || `Discover our ${page.title} solutions.`}
                url={serviceMetadata[slug]?.url || page.seo?.url}
            />

            {/* Premium Hero Section */}
            <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    {page.heroImage ? (
                        <div className="relative w-full h-full">
                            <img
                                src={page.heroImage}
                                alt={page.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                    )}
                </div>

                <div className="relative z-10 container mx-auto px-6 pt-20">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center gap-2 mb-6"
                        >
                            <span className="w-12 h-1 bg-blue-500 rounded-full"></span>
                            <span className="text-blue-400 font-bold tracking-wider uppercase text-sm">
                                {isService ? 'Premium Service' : 'Success Story'}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            {page.title}
                        </motion.h1>

                        {page.subtitle && (
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed border-l-4 border-blue-500/30 pl-6"
                            >
                                {page.subtitle}
                            </motion.p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="container mx-auto px-6 py-20 relative z-20 -mt-10">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Main Content */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="lg:w-2/3"
                    >


                        {/* Features Grid (Inside Main Content col but separate block) */}
                        {page.features && page.features.length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <Zap className="text-yellow-500 fill-yellow-500" />
                                    Key Benefits
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {page.features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group duration-300"
                                        >
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                <Check size={24} strokeWidth={3} />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right: Sidebar / Quick Actions */}
                    <div className="lg:w-1/3 space-y-8">
                        {/* Contact Card */}
                        <div className="bg-primary-dark text-white rounded-3xl p-8 shadow-xl shadow-primary-dark/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <h3 className="text-2xl font-bold mb-4 relative z-10">Interested in {page.title}?</h3>
                            <p className="text-gray-300 mb-8 relative z-10">
                                Get a custom quote tailored to your specific requirements. Our team is ready to help using our {page.title} expertise.
                            </p>

                            <button
                                onClick={() => navigate('/contact')}
                                className="w-full bg-white text-primary-dark py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group relative z-10"
                            >
                                Get a Quote
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Quick Stats or Trust Indicators (Static for now, can be dynamic later) */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Why Choose Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-600">
                                    <Shield className="text-green-500" size={20} />
                                    <span>Enterprise-grade Security</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600">
                                    <Star className="text-yellow-500" size={20} />
                                    <span>Top-rated Support</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-600">
                                    <Zap className="text-blue-500" size={20} />
                                    <span>Fast Implementation</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA Block */}
            <div className="bg-white py-24 border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Ready to transform your business?</h2>
                        <p className="text-gray-500 text-lg mb-10">
                            Join hundreds of satisfied clients who have upgraded their operations with UnioTech's {page.title}.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/contact')}
                                className="w-full sm:w-auto px-10 py-4 bg-primary-dark text-white rounded-full font-bold hover:bg-primary-medium transition-all shadow-lg hover:shadow-primary-medium/30 hover:-translate-y-1"
                            >
                                Contact Sales
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold hover:border-gray-900 hover:text-gray-900 transition-all"
                            >
                                Explore Other Services
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DynamicPage;
