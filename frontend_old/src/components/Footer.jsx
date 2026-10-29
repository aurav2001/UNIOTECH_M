import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight, MapPin, Phone, Star, ExternalLink } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { Link } from 'react-router-dom';
import { isExternalLink, getFormattedUrl } from '../utils/api';

const Footer = () => {
    const { getContent } = useContent();
    const footerContent = getContent('footer') || {};
    const clientsContent = getContent('clients') || {};

    const {
        companyName = 'UnioTech IT',
        tagline = 'Empowering businesses with innovative IT solutions.',
        email: contactEmail = 'sales@uniotechit.com',
        phone = '+91 98737 37020',
        address = 'Block B, Sector 63, Noida',
        addresses = [],
        quickLinks: dynamicQuickLinks,
        socialLinks = {},
        copyrightText = 'All rights reserved.'
    } = footerContent;

    // Compute effective addresses - prefer new array format, fallback to legacy single address
    const effectiveAddresses = addresses.length > 0
        ? addresses
        : (address ? [{ label: 'Office', value: address }] : []);

    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setEmail('');
        alert('Thanks for subscribing!');
    };

    // Default Quick Links with their routes - fallback if not in API
    const defaultQuickLinks = [
        { name: 'About Us', path: '/about', visible: true },
        { name: 'Services', path: '/#services', visible: true },
        { name: 'Pricing', path: '/pricing', visible: true },
        { name: 'Case Studies', path: '/case-studies', visible: true },
        { name: 'Our Clients', path: '/our-clients', visible: true },
        { name: 'Blogs', path: '/blogs', visible: true },
        { name: 'Contact', path: '/contact', visible: true },
    ];

    // Use dynamic links from API, or fallback to defaults
    let quickLinks = dynamicQuickLinks || defaultQuickLinks;

    // Filter out Our Clients link if clients page is hidden
    if (clientsContent.isVisible === false) {
        quickLinks = quickLinks.filter(link => link.path !== '/our-clients');
    }

    // Filter to only show visible links
    quickLinks = quickLinks.filter(link => link.visible !== false);

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <footer id="footer" className="bg-primary-dark text-white pt-20 pb-10 md:pb-16 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-medium/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-light/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16"
                    variants={containerVariants}
                    initial="visible"
                    animate="visible"
                >
                    {/* Brand Section */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="flex items-center gap-2">
                            {/* Replace with actual logo if available, using text for now matching Navbar style */}
                            <span className="text-2xl font-bold tracking-tight">
                                {companyName ? (
                                    <>
                                        {companyName.split(' ')[0]} <span className="text-primary-light">{companyName.split(' ').slice(1).join(' ')}</span>
                                    </>
                                ) : (
                                    <>UnioTech<span className="text-primary-light">IT</span></>
                                )}
                            </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {tagline || 'Empowering businesses with innovative IT solutions. We bridge the gap between complex technology and your business goals.'}
                        </p>
                        <div className="text-xs text-gray-400">
                            Our Regional Site:{' '}
                            <a
                                href="https://uniotechit.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-light hover:text-white hover:underline inline-flex items-center gap-1 font-medium transition-colors"
                            >
                                uniotechit.in <ExternalLink size={12} />
                            </a>
                        </div>
                        <div className="flex gap-4">
                            {[
                                { Icon: Facebook, url: socialLinks.facebook || '#' },
                                { Icon: Twitter, url: socialLinks.twitter || '#' },
                                { Icon: Instagram, url: socialLinks.instagram || '#' },
                                { Icon: Linkedin, url: socialLinks.linkedin || '#' }
                            ].map(({ Icon, url }, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-primary-medium/30 flex items-center justify-center hover:bg-primary-light hover:text-primary-dark transition-all duration-300"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                        {/* Pricing button removed - now only in Quick Links */}
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h3 className="text-lg font-bold">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            {quickLinks.map((link) => {
                                const isExternal = isExternalLink(link.path);
                                const href = getFormattedUrl(link.path);
                                return (
                                    <li key={link.name}>
                                        {isExternal ? (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center hover:text-primary-light transition-all duration-300 hover:translate-x-2"
                                            >
                                                <span className="w-0 overflow-hidden group-hover:w-5 transition-all duration-300 text-primary-light flex items-center">
                                                    <ArrowRight size={14} />
                                                </span>
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link
                                                to={link.path}
                                                className="group flex items-center hover:text-primary-light transition-all duration-300 hover:translate-x-2"
                                            >
                                                <span className="w-0 overflow-hidden group-hover:w-5 transition-all duration-300 text-primary-light flex items-center">
                                                    <ArrowRight size={14} />
                                                </span>
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h3 className="text-lg font-bold">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-gray-300">
                            {/* Multiple Addresses */}
                            {effectiveAddresses.map((addr, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <MapPin size={20} className="text-primary-light flex-shrink-0 mt-0.5" />
                                    <div>
                                        {addr.label && <span className="font-semibold text-white block text-xs mb-0.5">{addr.label}</span>}
                                        <span>{addr.value}</span>
                                    </div>
                                </li>
                            ))}
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-primary-light flex-shrink-0" />
                                <span>{phone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-primary-light flex-shrink-0" />
                                <span>{contactEmail}</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Services Links (SEO Optimized - All Service Pages for Crawlability) */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h3 className="text-lg font-bold">Services</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/services/hardware-supply" className="hover:text-primary-light transition-colors">Hardware Supply</Link></li>
                            <li><Link to="/services/server-support" className="hover:text-primary-light transition-colors">Server Support</Link></li>
                            <li><Link to="/services/networking" className="hover:text-primary-light transition-colors">Networking</Link></li>
                            <li><Link to="/services/amc-support" className="hover:text-primary-light transition-colors">AMC Support</Link></li>
                            <li><Link to="/services/software-solutions" className="hover:text-primary-light transition-colors">Software Solutions</Link></li>
                            <li><Link to="/services/cybersecurity" className="hover:text-primary-light transition-colors">Cybersecurity</Link></li>
                            <li><Link to="/services/cloud-backup" className="hover:text-primary-light transition-colors">Cloud & Backup</Link></li>
                            <li><Link to="/services/migration-email" className="hover:text-primary-light transition-colors">Migration & Email</Link></li>
                            <li><Link to="/services/managed-it-services" className="hover:text-primary-light transition-colors">Managed IT Services</Link></li>
                            <li><Link to="/services/security-audits" className="hover:text-primary-light transition-colors">Security Audits</Link></li>
                            <li><Link to="/services/cloud" className="hover:text-primary-light transition-colors">Cloud Solutions</Link></li>
                            <li><Link to="/services/email-solutions" className="hover:text-primary-light transition-colors">Email Solutions</Link></li>
                            <li><Link to="/services/end-point-security" className="hover:text-primary-light transition-colors">Endpoint Security</Link></li>
                            <li><Link to="/services/dlp" className="hover:text-primary-light transition-colors">Data Loss Prevention</Link></li>
                            <li><Link to="/services/web-development-services" className="hover:text-primary-light transition-colors">Web Development</Link></li>
                            <li><Link to="/blogs" className="hover:text-primary-light transition-colors">Blogs</Link></li>
                        </ul>
                    </motion.div>

                    {/* Rate Us on Google Maps */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            Rate Us
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Love our services? Share your experience and help others discover us!
                        </p>

                        {/* Star Rating Display */}
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.div
                                    key={star}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: star * 0.1, type: "spring", stiffness: 300 }}
                                    viewport={{ once: true }}
                                >
                                    <Star
                                        size={22}
                                        className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]"
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-2 rounded-lg inline-block shadow-lg">
                            <img
                                src="/google-maps-qr.png"
                                alt="Scan to rate us on Google Maps"
                                className="w-24 h-24"
                            />
                        </div>
                        <p className="text-xs text-gray-400">Scan QR to rate us</p>

                        {/* CTA Button */}
                        <a
                            href="https://share.google/9pIUaS2n0IaVuOfKF"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-primary-dark font-semibold py-2 px-4 rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 text-sm shadow-lg hover:shadow-yellow-500/20 hover:scale-105"
                        >
                            <Star size={16} className="fill-current" />
                            Rate on Google
                            <ExternalLink size={14} />
                        </a>
                    </motion.div>


                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    initial="visible"
                    animate="visible"
                    className="border-t border-primary-medium/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400"
                >
                    <p>&copy; 2026 {companyName || 'UnioTechIT Solutions'}. {copyrightText}</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
