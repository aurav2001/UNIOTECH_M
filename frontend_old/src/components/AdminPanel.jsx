import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Loader2, Image as ImageIcon, FileText, Trash2, X, Settings, DollarSign, MessageSquare, Workflow, RotateCcw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useContent } from '../context/ContentContext';
import { getApiUrl, apiRequest } from '../utils/api';
import AdminLogin from './AdminLogin';
import AdminLayout from './admin/AdminLayout';
import ImagePicker from './admin/ImagePicker';
import ServiceManager from './admin/ServiceManager';
import SettingsManager from './admin/SettingsManager';
import ListManager from './admin/ListManager';
import PricingManager from './admin/PricingManager';
import PagesManager from './admin/PagesManager';
import TestimonialsManager from './admin/TestimonialsManager';
import WorkflowManager from './admin/WorkflowManager';
import OffersManager from './admin/OffersManager';
import NavbarManager from './admin/NavbarManager';
import FooterManager from './admin/FooterManager';
import PartnersManager from './admin/PartnersManager';
import ClientsManager from './admin/ClientsManager';
import CareersManager from './admin/CareersManager';
import BlogsManager from './admin/BlogsManager';
import SyncWebDevPage from './admin/SyncWebDevPage';
import HeroManager from './admin/HeroManager';
import AMCPlansManager from './admin/AMCPlansManager';
import RequestsManager from './admin/RequestsManager';
import ClientAccountsManager from './admin/ClientAccountsManager';

const defaultSchemas = {
    hero: {
        title: 'Empowering Your Business with Intelligent IT',
        subtitle: 'Intelligent IT',
        description: 'We safeguard your digital assets and optimize infrastructure with cutting-edge hardware, software, and cybersecurity solutions.',
        backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
        backgroundImages: [
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2026&auto=format&fit=crop'
        ],
        ctaText: 'Get Started',
        ctaLink: '/contact'
    },
    about: {
        heroTitle: 'We Are UnioTech IT',
        heroSubtitle: 'Architecting the digital future.',
        heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
        missionTitle: 'Building the Future, Today.',
        missionText: 'Our mission goes beyond just maintaining systems. We architect resilient digital ecosystems that drive growth.',
        yearsTitle: 'Our Journey',
        yearsSubtitle: 'How we started',
        timeline: [
            { year: '2018', title: 'The Inception', desc: 'Founded in a small garage with a vision to simplify enterprise IT solutions.' },
            { year: '2020', title: 'Global Expansion', desc: 'Despite global challenges, we expanded our operations to 3 continents.' },
            { year: '2023', title: 'Tech Innovation Award', desc: "Recognized as the 'Top Tech Innovator' for our cloud framework." },
            { year: '2025', title: 'The Future is Now', desc: 'Launching our AI-driven division to help businesses automate workflows.' }
        ],
        values: [
            { icon: 'Rocket', title: "Innovation First", text: "Leveraging AI and Cloud to stay ahead." },
            { icon: 'Shield', title: "Zero-Trust Security", text: "Proactive defense for critical assets." },
            { icon: 'Users', title: "Client-Centric", text: "Your success is our only metric." }
        ],
        stats: [
            { icon: 'Users', label: "Happy Clients", value: "500+" },
            { icon: 'CheckCircle', label: "Projects Done", value: "1200+" },
            { icon: 'Globe', label: "Countries Served", value: "15+" },
            { icon: 'Award', label: "Awards Won", value: "25+" }
        ]
    },
    testimonials: {
        title: "What Our Clients Say",
        subtitle: "See how we're transforming businesses globally.",
        items: [
            { quote: "Exceptional service and support.", author: "John Doe", role: "CEO, TechCorp", avatar: "" },
            { quote: "Transformed our workflow entirely.", author: "Jane Smith", role: "CTO, Innovate Inc", avatar: "" }
        ]
    },
    workflow: {
        title: 'How We Work',
        subtitle: 'Our Process',
        description: 'A streamlined workflow designed to deliver excellence.',
        items: [
            { title: 'Discussion', description: 'Understanding your needs.', iconName: 'MessageCircle' },
            { title: 'Strategy', description: 'Planning the roadmap.', iconName: 'Lightbulb' },
            { title: 'Development', description: 'Building the solution.', iconName: 'FlaskConical' },
            { title: 'Launch', description: 'Deploying to production.', iconName: 'Rocket' }
        ]
    },
    offers: {
        title: "Exclusive Offers",
        subtitle: "Grab these limited-time deals to boost your business.",
        items: [
            { title: 'Startup Bundle', description: 'Get 20% off on your first month.', discount: '20% OFF', code: 'STARTUP20', expiry: '2025-12-31' }
        ]
    },
    contact: {
        heroTitle: "Let's Start a Conversation",
        heroSubtitle: 'Get in Touch',
        email: 'sales@uniotechit.com',
        phone: '+91 98737 37020',
        address: 'Block B, Sector-63, Noida',
        whatsapp: 'https://wa.me/919873737020'
    },
    services: {
        title: 'Comprehensive IT Ecosystem Solutions',
        subtitle: 'Our Expertise',
        description: 'Tailored technology services designed to accelerate your business growth.',
        items: [
            { title: "Softwares", iconName: "Layers", desc: "Expert license management for Adobe, MongoDB, and Office 365." },
            { title: "Hardware", iconName: "HardDrive", desc: "High-performance workstations and servers from Lenovo, Dell, HP." },
            { title: "Servers", iconName: "Database", desc: "Physical and virtual servers like VMware and Nutanix." },
            { title: "Security", iconName: "Lock", desc: "Advanced security with Sophos and Firewalls." },
            { title: "Cloud", iconName: "CloudRain", desc: "Azure and AWS backup strategies for disaster recovery." },
            { title: "Migration", iconName: "ArrowLeftRight", desc: "Zero-downtime Email and Server migrations." },
            { title: "Email", iconName: "AtSign", desc: "Reliable hosting for Office 365, Google Workspace, Zoho." },
            { title: "Managed IT", iconName: "UserCog", desc: "Virtual IT Manager for proactive monitoring." },
            { title: "Network", iconName: "Radio", desc: "End-to-end networking and AMC support." }
        ]
    },
    pricing: {
        title: 'Simple, transparent pricing',
        subtitle: 'Choose the plan that matches your ambition.',
        items: [
            { tier: 3, name: "Basic", tagline: "Perfect for small teams", priceMonthly: "4,999", features: ["Up to 10 User Licenses", "Basic IT Support", "Monthly Health Check"], popular: false },
            { tier: 2, name: "Professional", tagline: "For growing teams", priceMonthly: "9,999", features: ["Up to 50 User Licenses", "Priority Support", "Advanced Security"], popular: true },
            { tier: 1, name: "Enterprise", tagline: "For large organizations", priceMonthly: "Custom", features: ["Unlimited Licenses", "Dedicated Manager", "24/7 Monitoring"], popular: false }
        ]
    },
    partners: {
        title: 'Our Trusted Partners',
        isVisible: true,
        items: []
    },
    clients: {
        title: 'Our Valued Clients',
        subtitle: 'Trusted by leading organizations',
        isVisible: true,
        items: []
    },
    footer: {
        companyName: 'UnioTech IT',
        tagline: 'Empowering businesses with innovative IT solutions.',
        email: 'sales@uniotechit.com',
        phone: '+91 98737 37020',
        address: 'Block B, Sector-63, Noida',
        copyrightText: 'All rights reserved.'
    },
    supportFaqs: {
        title: 'Frequently Asked Questions (FAQs)',
        subtitle: 'Select a question to see the response/instructions instantly.',
        items: [
            { question: 'VPN Connection Issues', answer: 'Make sure your internet is working. Open Cisco AnyConnect, enter vpn.uniotechit.com, and use your credential + OTP. If it fails, restart your router.' },
            { question: 'Email/Office 365 Password Reset', answer: 'For password resets, contact your company admin or call/WhatsApp our helpline at +91 98737 37020 for quick verification.' },
            { question: 'Printer Offline / Printing Error', answer: 'Check if the printer is powered on and connected to the network. Restart the Print Spooler service on your PC: search for "Services", find "Print Spooler", and click Restart.' }
        ]
    }
};

const ContentEditor = () => {
    const { content, refreshContent } = useContent();
    // const { token } = useAdmin();
    const [activeSection, setActiveSection] = useState('hero');
    const [currentData, setCurrentData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [imagePickerTarget, setImagePickerTarget] = useState(null);

    const sectionCategories = {
        'Home Page': ['hero', 'services', 'workflow', 'testimonials', 'offers', 'pricing', 'partners'],
        'About Us': ['about'],
        'Contact Us': ['contact'],
        'Other Pages': ['clients', 'footer', 'amcPlans', 'supportFaqs']
    };

    const allSections = Object.values(sectionCategories).flat();

    useEffect(() => {
        if (content && content[activeSection]) {
            setCurrentData(content[activeSection]);
        } else if (defaultSchemas[activeSection]) {
            setCurrentData(defaultSchemas[activeSection]);
        } else {
            setCurrentData({});
        }
    }, [content, activeSection]);

    const updateField = (field, value) => {
        setCurrentData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateSectionData = (newData) => {
        setCurrentData(newData);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await apiRequest(`/api/content/${activeSection}`, {
                method: 'PUT',
                body: JSON.stringify({ data: currentData })
            });

            if (!res.ok) throw new Error('Failed to save');

            await refreshContent();
            setNotification({ type: 'success', message: 'Changes saved successfully!' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to save changes.' });
        } finally {
            setIsSaving(false);
        }
    };

    const openImagePicker = (field) => {
        setImagePickerTarget(field);
        setShowImagePicker(true);
    };

    const handleImageSelect = (image) => {
        const url = typeof image === 'string' ? image : image.url;
        if (imagePickerTarget) {
            updateField(imagePickerTarget, url);
        }
        setShowImagePicker(false);
    };

    return (
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section Tabs - Organized by Page Categories */}
            <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
                <div className="flex p-2 lg:p-3 gap-3 lg:gap-4 min-w-max">
                    {Object.entries(sectionCategories).map(([category, sections]) => (
                        <div key={category} className="flex items-center gap-1 lg:gap-2">
                            {/* Category Label */}
                            <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider px-2 shrink-0">
                                {category}
                            </span>
                            {/* Section Buttons */}
                            <div className="flex gap-1">
                                {sections.map(section => (
                                    <button
                                        key={section}
                                        onClick={() => setActiveSection(section)}
                                        className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-medium transition-all whitespace-nowrap active:scale-95 ${activeSection === section
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {section.charAt(0).toUpperCase() + section.slice(1)}
                                    </button>
                                ))}
                            </div>
                            {/* Separator */}
                            {category !== 'Contact Us' && (
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className="p-3 lg:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 gap-3">
                <h3 className="font-bold text-base lg:text-lg capitalize truncate">{activeSection} Content</h3>
                <div className="flex items-center gap-4">
                    {/* Visibility Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Section Visible</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={currentData.isVisible !== false} // Default to true if undefined
                                onChange={(e) => updateField('isVisible', e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </div>
                    </label>

                    {/* Reset Button */}
                    <button
                        onClick={() => {
                            if (confirm('Reset this section to default content? Unsaved changes will be lost.')) {
                                setCurrentData(defaultSchemas[activeSection] || {});
                                setNotification({ type: 'success', message: 'Reset to defaults. Click Save to apply.' });
                                setTimeout(() => setNotification(null), 3000);
                            }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reset to Defaults"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 lg:px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 text-sm lg:text-base shrink-0"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span className="hidden sm:inline">Save Changes</span>
                        <span className="sm:hidden">Save</span>
                    </button>
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
                            {notification.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="p-3 lg:p-6">

                {/* Specialized Managers */}
                {activeSection === 'hero' && (
                    <HeroManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}
                {activeSection === 'services' && (
                    <ServiceManager
                        services={currentData.items || []}
                        onChange={(newItems) => updateField('items', newItems)}
                    />
                )}

                {activeSection === 'pricing' && (
                    <PricingManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* About Us Section - Text Fields + List Managers */}
                {activeSection === 'about' && (
                    <div className="space-y-6">
                        {/* Text/Image Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {Object.keys(currentData).map(field => {
                                // Skip arrays - they're handled by ListManagers below
                                if (['timeline', 'values', 'stats', '_id', 'section'].includes(field)) return null;
                                if (Array.isArray(currentData[field])) return null;

                                const isLongText = typeof currentData[field] === 'string' && currentData[field].length > 60;
                                const isImage = field.toLowerCase().includes('image') || field.toLowerCase().includes('bg');
                                const isFullWidth = isLongText || isImage;

                                return (
                                    <div key={field} className={isFullWidth ? "col-span-full" : ""}>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                                            {field.replace(/([A-Z])/g, ' $1').trim()}
                                        </label>

                                        {isImage ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    {currentData[field] && (
                                                        <img
                                                            src={currentData[field]}
                                                            alt="Preview"
                                                            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border border-gray-200"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => openImagePicker(field)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium"
                                                    >
                                                        <ImageIcon size={16} />
                                                        Change Image
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={currentData[field] || ''}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-500"
                                                    readOnly
                                                />
                                            </div>
                                        ) : isLongText ? (
                                            <textarea
                                                value={currentData[field] || ''}
                                                onChange={(e) => updateField(field, e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none text-sm md:text-base"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={currentData[field] || ''}
                                                onChange={(e) => updateField(field, e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm md:text-base"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* List Managers for Arrays */}
                        <div className="space-y-6 mt-6 pt-6 border-t border-gray-200">
                            <ListManager
                                title="Timeline Items"
                                items={currentData.timeline || []}
                                onChange={(newItems) => updateField('timeline', newItems)}
                                schema={{
                                    year: { label: 'Year', type: 'text' },
                                    title: { label: 'Title', type: 'text' },
                                    desc: { label: 'Description', type: 'textarea' }
                                }}
                            />
                            <ListManager
                                title="Mission Values"
                                items={currentData.values || []}
                                onChange={(newItems) => updateField('values', newItems)}
                                schema={{
                                    title: { label: 'Title', type: 'text' },
                                    text: { label: 'Description', type: 'text' },
                                    icon: { label: 'Icon', type: 'icon' }
                                }}
                            />
                            <ListManager
                                title="Statistics"
                                items={currentData.stats || []}
                                onChange={(newItems) => updateField('stats', newItems)}
                                schema={{
                                    label: { label: 'Label', type: 'text' },
                                    value: { label: 'Value (e.g., 500+)', type: 'text' },
                                    icon: { label: 'Icon', type: 'icon' }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Testimonials Manager */}
                {activeSection === 'testimonials' && (
                    <TestimonialsManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* Workflow Manager */}
                {activeSection === 'workflow' && (
                    <WorkflowManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* Offers Manager */}
                {activeSection === 'offers' && (
                    <OffersManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* Footer Manager */}
                {activeSection === 'footer' && (
                    <FooterManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* Partners Manager */}
                {activeSection === 'partners' && (
                    <PartnersManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* AMC Plans Manager */}
                {activeSection === 'amcPlans' && (
                    <AMCPlansManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* Clients Manager */}
                {activeSection === 'clients' && (
                    <ClientsManager
                        data={currentData}
                        onChange={updateSectionData}
                    />
                )}

                {/* Support FAQs Manager */}
                {activeSection === 'supportFaqs' && (
                    <div className="space-y-6">
                        {/* Text fields for Title / Subtitle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['title', 'subtitle'].map(field => (
                                <div key={field}>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">{field}</label>
                                    <input
                                        type="text"
                                        value={currentData[field] || ''}
                                        onChange={e => updateField(field, e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* List Manager for FAQ items */}
                        <div className="border-t border-gray-200 pt-6">
                            <ListManager
                                title="FAQ Items (Support Subjects)"
                                items={currentData.items || []}
                                onChange={(newItems) => updateField('items', newItems)}
                                schema={{
                                    question: { label: 'Question / Subject', type: 'text' },
                                    answer: { label: 'Answer / Resolution Instructions', type: 'textarea' }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Positions Manager (Hiring Section) */}
                {activeSection === 'hiring' && (
                    <div className="space-y-6">
                        {/* Text fields for Hiring Hero */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['title', 'subtitle', 'description'].map(field => (
                                <div key={field} className={field === 'description' ? 'col-span-full' : ''}>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">{field}</label>
                                    {field === 'description' ? (
                                        <textarea
                                            value={currentData[field] || ''}
                                            onChange={e => updateField(field, e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-gray-900 outline-none resize-none"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={currentData[field] || ''}
                                            onChange={e => updateField(field, e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-gray-900 outline-none"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <PositionsManager
                                positions={currentData.positions || []}
                                onChange={(newPositions) => updateField('positions', newPositions)}
                            />
                        </div>

                        {/* List Manager for Benefits */}
                        <div className="border-t border-gray-200 pt-6">
                            <ListManager
                                title="Benefits & Perks"
                                items={currentData.benefits || []}
                                onChange={(newItems) => updateField('benefits', newItems)}
                                schema={{
                                    text: { label: 'Benefit Text', type: 'text' }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Generic Form for other fields (skipping arrays/internal fields) */}
                {!['services', 'pricing', 'about', 'testimonials', 'workflow', 'offers', 'footer', 'partners', 'clients', 'hiring', 'amcPlans', 'supportFaqs'].includes(activeSection) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.keys(currentData).map(field => {
                            // Skip internal fields or array fields handled by ListManagers
                            if (['items', 'plans', '_id', 'section', 'timeline', 'values', 'stats'].includes(field)) return null;

                            const isLongText = typeof currentData[field] === 'string' && currentData[field].length > 60;
                            const isImage = field.toLowerCase().includes('image') || field.toLowerCase().includes('bg');
                            const isFullWidth = isLongText || isImage;

                            return (
                                <div key={field} className={isFullWidth ? "col-span-full" : ""}>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>

                                    {isImage ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4">
                                                {currentData[field] && (
                                                    <img
                                                        src={currentData[field]}
                                                        alt="Preview"
                                                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                                                    />
                                                )}
                                                <button
                                                    onClick={() => openImagePicker(field)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium"
                                                >
                                                    <ImageIcon size={16} />
                                                    Change Image
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={currentData[field]}
                                                onChange={(e) => updateField(field, e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-500"
                                                readOnly
                                            />
                                        </div>
                                    ) : isLongText ? (
                                        <textarea
                                            value={currentData[field]}
                                            onChange={(e) => updateField(field, e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={currentData[field]}
                                            onChange={(e) => updateField(field, e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showImagePicker && (
                <ImagePicker
                    onSelect={handleImageSelect}
                    onClose={() => setShowImagePicker(false)}
                    currentImage={imagePickerTarget ? currentData[imagePickerTarget] : null}
                />
            )}
        </div>
    );
};

const AdminPanel = () => {
    const { isAuthenticated, isBlogEditor, userRole } = useAdmin();
    // Blog editors default to blogs tab, admins to dashboard
    const [activeTab, setActiveTab] = useState(() => {
        // Check if user is blog editor (will be set after login)
        return 'dashboard';
    });

    // Update activeTab when role becomes available (after login)
    useEffect(() => {
        if (isBlogEditor && activeTab === 'dashboard') {
            setActiveTab('blogs');
        }
    }, [isBlogEditor]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
                <AdminLogin onSuccess={() => { }} />
            </div>
        );
    }

    return (
        <AdminLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >
            {activeTab === 'dashboard' && !isBlogEditor && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 pb-20 lg:pb-0">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-700 p-6 lg:p-8 rounded-xl lg:rounded-2xl text-white lg:col-span-2 shadow-lg">
                        <h3 className="text-xl lg:text-2xl font-bold mb-2">Welcome Back!</h3>
                        <p className="text-gray-300 text-sm lg:text-base">Manage your website content efficiently.</p>
                    </div>
                    <div className="bg-white p-6 lg:p-8 rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-bold mb-1 uppercase tracking-wide text-xs">Quick Tip</p>
                        <p className="text-gray-600 text-sm lg:text-base">Use the Content Editor to update text and images across your site instantly.</p>
                    </div>
                </div>
            )}

            {activeTab === 'content' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <ContentEditor />
                </div>
            )}
            {activeTab === 'requests' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <RequestsManager />
                </div>
            )}
            {activeTab === 'client-accounts' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <ClientAccountsManager />
                </div>
            )}
            {activeTab === 'careers' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <CareersManager />
                </div>
            )}
            {activeTab === 'blogs' && (
                <div className="pb-20 lg:pb-0">
                    <BlogsManager />
                </div>
            )}
            {activeTab === 'pages' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <PagesManager />
                </div>
            )}
            {activeTab === 'navigation' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <NavbarManager />
                </div>
            )}
            {activeTab === 'media' && (
                <div className="p-4 pb-20 lg:pb-4 bg-white rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Media Library</h3>
                    <p className="text-gray-500 text-sm">Access the library via the Content Editor image pickers.</p>
                </div>
            )}
            {activeTab === 'settings' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <SettingsManager />
                </div>
            )}
            {activeTab === 'sync' && !isBlogEditor && (
                <div className="pb-20 lg:pb-0">
                    <SyncWebDevPage />
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPanel;
