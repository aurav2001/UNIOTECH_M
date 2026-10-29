import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, Monitor, Server, Shield, Database, Cloud, Mail, Users, FileText, Wifi, Briefcase, TrendingUp, Lightbulb, ClipboardCheck, Phone, Home, Info, HelpCircle, ChevronRight, Ticket } from 'lucide-react';
import CallbackModal from './CallbackModal';
import { useClient } from '../context/ClientContext';
import Logo from '../assets/Logo_1.png';
import { getApiUrl, isExternalLink, getFormattedUrl } from '../utils/api';

const Navbar = () => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(null);
    const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
    const [navData, setNavData] = useState(null);
    const location = useLocation();
    const { isAuthenticated, client } = useClient();

    // Prevent Background Scroll when Mobile Menu is Open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setMobileExpanded(null);
        setActiveCategory(null);
    }, [location]);

    // Icon map
    const ICON_MAP = {
        Monitor, Server, Shield, Database, Cloud, Mail, Users, FileText, Wifi,
        Briefcase, TrendingUp, Lightbulb, ClipboardCheck, Ticket
    };

    const getIcon = (iconName) => {
        const IconComponent = ICON_MAP[iconName];
        return IconComponent ? <IconComponent size={16} /> : <Monitor size={16} />;
    };

    // Fetch Navbar Data
    useEffect(() => {
        const fetchNavbar = async () => {
            try {
                const res = await fetch(getApiUrl('/api/content/navbar'));
                if (res.ok) setNavData((await res.json()).data);
            } catch (error) {
                // Failed silently
            }
        };
        fetchNavbar();
    }, []);

    // Default Data
    const defaultHardwareItems = [
        { name: "Hardware Supply", desc: "Lenovo, Dell, HP, IBM", icon: "Server", path: "/services/hardware-supply" },
        { name: "Server Support", desc: "Physical, Nutanix, Hypervisor", icon: "Database", path: "/services/server-support" },
        { name: "Networking", desc: "CCTV, Biometric, Switching", icon: "Wifi", path: "/services/networking" },
        { name: "AMC Support", desc: "Firewall, Desktop Support", icon: "FileText", path: "/services/amc-support" }
    ];

    const defaultSoftwareItems = [
        { name: "Software Solutions", desc: "Adobe, MongoDB, Office 365", icon: "Monitor", path: "/services/software-solutions" },
        { name: "Cybersecurity", desc: "Sophos, Fortinet, SSL", icon: "Shield", path: "/services/cybersecurity" },
        { name: "Cloud & Backup", desc: "Azure, AWS, Acronis", icon: "Cloud", path: "/services/cloud-backup" },
        { name: "Migration & Email", desc: "Server/Email Migration", icon: "Mail", path: "/services/migration-email" },
        { name: "Managed IT Services", desc: "Virtual IT Manager", icon: "Users", path: "/services/managed-it-services" },
        { name: "AMC Plans", desc: "Home & Corporate AMC Plans", icon: "FileText", path: "/amc-plans" }
    ];

    const defaultConsultingItems = [
        { name: "Cloud Solutions", desc: "Azure, AWS Cloud", icon: "Cloud", path: "/services/cloud" },
        { name: "Email Solutions", desc: "O365, Google Workspace", icon: "Mail", path: "/services/email-solutions" },
        { name: "Endpoint Security", desc: "EDR & Protection", icon: "Shield", path: "/services/end-point-security" },
        { name: "Security Audits", desc: "Risk & Compliance", icon: "ClipboardCheck", path: "/services/security-audits" }
    ];

    const SERVICE_PATHS = {
        'Hardware Supply': '/services/hardware-supply',
        'Server Support': '/services/server-support',
        'Networking': '/services/networking',
        'AMC Support': '/services/amc-support',
        'Software Solutions': '/services/software-solutions',
        'Cybersecurity': '/services/cybersecurity',
        'Cloud & Backup': '/services/cloud-backup',
        'Migration & Email': '/services/migration-email',
        'Managed IT Services': '/services/managed-it-services',
        'Cloud Solutions': '/services/cloud',
        'Email Solutions': '/services/email-solutions',
        'Endpoint Security': '/services/end-point-security',
        'Security Audits': '/services/security-audits'
    };

    const getItemsByCategory = (categoryId) => {
        let items = [];
        if (navData && navData.categories) {
            const category = navData.categories.find(c => c.id === categoryId);
            if (category) items = category.items;
            else {
                if (categoryId === 'hardware') items = defaultHardwareItems;
                else if (categoryId === 'software') items = defaultSoftwareItems;
                else if (categoryId === 'consulting') items = defaultConsultingItems;
            }
        } else {
            if (categoryId === 'hardware') items = defaultHardwareItems;
            else if (categoryId === 'software') items = defaultSoftwareItems;
            else if (categoryId === 'consulting') items = defaultConsultingItems;
        }

        return items.map(item => {
            let itemPath = item.path || SERVICE_PATHS[item.name] || SERVICE_PATHS[item.title] || '#';
            // Normalize any legacy /pages/ paths to /services/ for SEO
            // Handle both relative (/pages/...) and full URL (https://.../pages/...) formats
            if (typeof itemPath === 'string') {
                itemPath = itemPath.replace(/\/pages\//g, '/services/');
            }
            return { ...item, path: itemPath };
        });
    };

    const hardwareItems = getItemsByCategory('hardware');
    const softwareItems = getItemsByCategory('software');
    const consultingItems = getItemsByCategory('consulting');

    const supportDropdownItems = [
        { name: "General Support", desc: "Raise technical tickets and lookup solution FAQs.", icon: "Ticket", path: "/support" },
        { name: isAuthenticated && client ? `Corporate Support (${client.companyId})` : "Corporate Support", desc: "Access the client portal, manage company details & logs.", icon: "Users", path: "/client-portal" }
    ];

    const toggleMobileCategory = (category) => {
        setMobileExpanded(mobileExpanded === category ? null : category);
    };

    return (
        <>
            {/* --- DESKTOP NAVBAR --- */}
            <div className="fixed top-0 lg:top-3 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <nav
                    className="pointer-events-auto bg-white w-full lg:w-auto px-8 lg:px-16 py-5 rounded-b-2xl lg:rounded-b-3xl shadow-sm lg:border-x border-b border-gray-100/50 flex justify-between lg:justify-center items-center gap-14 transition-all duration-300 relative"
                    onMouseLeave={() => setActiveCategory(null)}
                >

                    {/* Logo Section */}
                    <div className="flex items-center cursor-pointer">
                        <Link to="/" className="flex items-center">
                            <img
                                src={Logo}
                                alt="Logo"
                                className="w-auto object-contain"
                                style={{ height: '48px' }}
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-6">
                        <Link to="/about" className="text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm">About Us</Link>

                        <DesktopDropdown
                            title="Hardware"
                            id="hardware"
                            items={hardwareItems}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            getIcon={getIcon}
                        />
                        <DesktopDropdown
                            title="Software"
                            id="software"
                            items={softwareItems}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            getIcon={getIcon}
                        />
                        <DesktopDropdown
                            title="Consulting"
                            id="consulting"
                            items={consultingItems}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            getIcon={getIcon}
                        />

                        <Link to="/contact" className="text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm">Enquiry</Link>
                        <DesktopDropdown
                            title="Support"
                            id="support"
                            items={supportDropdownItems}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            getIcon={getIcon}
                        />
                        <Link to="/blogs" className="text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm">Blogs</Link>
                        <Link to="/join-us" className="text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm">Careers</Link>

                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden lg:flex items-center gap-4">
                        <button
                            onClick={() => setIsCallbackModalOpen(true)}
                            className="flex items-center gap-2 bg-[#4ade80] text-gray-900 px-4 py-2 rounded-full font-bold hover:bg-[#22c55e] transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 text-xs lg:text-sm"
                        >
                            <span>Get a Call</span>
                            <Phone size={16} className="text-gray-900" />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </nav>
            </div>

            {/* --- MOBILE SIDEBAR DRAWER --- */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden pointer-events-auto"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-[85%] max-w-[340px] bg-white z-[70] lg:hidden shadow-2xl flex flex-col border-l border-gray-100 pointer-events-auto"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                {/* Mobile Logo Size: Increased slightly to 40px */}
                                <img src={Logo} alt="Logo" className="w-auto object-contain" style={{ height: '36px' }} />
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                                <MobileLink to="/" icon={<Home size={18} />} label="Home" onClick={() => setMobileMenuOpen(false)} />
                                <MobileLink to="/about" icon={<Info size={18} />} label="About Us" onClick={() => setMobileMenuOpen(false)} />
                                <MobileLink to="/blogs" icon={<FileText size={18} />} label="Blogs" onClick={() => setMobileMenuOpen(false)} />
                                <MobileLink to="/join-us" icon={<Users size={18} />} label="Careers" onClick={() => setMobileMenuOpen(false)} />
                                <MobileLink to="/contact" icon={<HelpCircle size={18} />} label="Enquiry" onClick={() => setMobileMenuOpen(false)} />
                                <MobileAccordion
                                    title="Support"
                                    isOpen={mobileExpanded === 'support'}
                                    onToggle={() => toggleMobileCategory('support')}
                                    items={supportDropdownItems}
                                    getIcon={getIcon}
                                    onItemClick={() => setMobileMenuOpen(false)}
                                />

                                <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Services</p>
                                    <MobileAccordion title="Hardware" isOpen={mobileExpanded === 'hardware'} onToggle={() => toggleMobileCategory('hardware')} items={hardwareItems} getIcon={getIcon} onItemClick={() => setMobileMenuOpen(false)} />
                                    <MobileAccordion title="Software" isOpen={mobileExpanded === 'software'} onToggle={() => toggleMobileCategory('software')} items={softwareItems} getIcon={getIcon} onItemClick={() => setMobileMenuOpen(false)} />
                                    <MobileAccordion title="Consulting" isOpen={mobileExpanded === 'consulting'} onToggle={() => toggleMobileCategory('consulting')} items={consultingItems} getIcon={getIcon} onItemClick={() => setMobileMenuOpen(false)} />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <button onClick={() => { setMobileMenuOpen(false); setIsCallbackModalOpen(true); }} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                                    <Phone size={18} className="text-[#4ade80]" />
                                    <span>Request Callback</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <CallbackModal isOpen={isCallbackModalOpen} onClose={() => setIsCallbackModalOpen(false)} />
        </>
    );
};

// --- Helper Components ---

const DesktopDropdown = ({ title, id, items, activeCategory, setActiveCategory, getIcon }) => (
    <div className="relative group py-2" onMouseEnter={() => setActiveCategory(id)}>
        <button className={`flex items-center gap-1.5 font-medium text-base transition-colors duration-200 ${activeCategory === id ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
            {title}
            <ChevronDown size={14} className={`transition-transform duration-300 ${activeCategory === id ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
            {activeCategory === id && (
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[350px] z-50"
                >
                    <div suppressHydrationWarning className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 ring-1 ring-black/5 overflow-hidden">
                        <div suppressHydrationWarning className="flex flex-col gap-2">
                            {items.map((item, idx) => (
                                <SmartLink
                                    key={idx}
                                    to={item.path}
                                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 group/item transition-all"
                                    onClick={() => setActiveCategory(null)}
                                >
                                    <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 text-gray-600 group-hover/item:bg-gray-900 group-hover/item:text-white transition-colors">
                                        {getIcon(item.icon)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800 group-hover/item:text-gray-900 transition-colors">{item.name}</div>
                                        <div className="text-[11px] text-gray-500 leading-tight mt-0.5 line-clamp-2">{item.desc}</div>
                                    </div>
                                </SmartLink>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const SmartLink = ({ to, className, onClick, children }) => {
    const isExternal = isExternalLink(to);
    const href = getFormattedUrl(to);

    if (isExternal) {
        return (
            <a
                href={href}
                className={className}
                onClick={onClick}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        );
    }

    return (
        <Link to={to} className={className} onClick={onClick}>
            {children}
        </Link>
    );
};

const MobileLink = ({ to, icon, label, onClick }) => (
    <SmartLink to={to} onClick={onClick} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">
        <span className="text-gray-400 bg-gray-100 p-2 rounded-lg">{icon}</span>
        <span className="text-base">{label}</span>
    </SmartLink>
);

const MobileAccordion = ({ title, isOpen, onToggle, items, getIcon, onItemClick }) => (
    <div className="rounded-xl overflow-hidden bg-white">
        <button onClick={onToggle} className="w-full flex items-center justify-between p-3 pl-4 text-left font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition-colors">
            {title}
            <ChevronRight size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50/50 rounded-b-xl"
                >
                    <div className="p-2 space-y-1">
                        {items.map((item, i) => (
                            <SmartLink key={i} to={item.path} onClick={onItemClick} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all ml-2">
                                <div className="text-gray-400 scale-75">
                                    {getIcon(item.icon)}
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    {item.name}
                                </div>
                            </SmartLink>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default Navbar;
