import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Check,
    Star,
    Shield,
    Home,
    Building2,
    ArrowRight,
    Phone,
    Zap,
    Wrench,
    Clock,
    HeadphonesIcon,
    ChevronDown,
    Sparkles
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';
import EnquiryModal from '../components/EnquiryModal';
import CallbackModal from '../components/CallbackModal';
import PurchaseModal from '../components/PurchaseModal';

// ─── DEFAULT AMC PLANS DATA (Fallback) ────────────────────────────────
const defaultAmcData = {
    heroTitle: 'AMC Plans',
    heroSubtitle: 'Comprehensive Annual Maintenance Contracts designed to keep your IT infrastructure running smoothly, securely, and efficiently — all year round.',
    detailsTitle: 'Why Choose Our AMC Plans?',
    detailsContent: 'Our Annual Maintenance Contracts (AMC) provide proactive IT support, preventive maintenance, and rapid issue resolution to minimize downtime and maximize productivity. Whether you\'re a homeowner with a few devices or a corporation with complex infrastructure, we have the perfect plan for you.',
    detailsFeatures: [
        'Preventive maintenance & health checks',
        'Priority support with guaranteed response times',
        'On-site & remote technical assistance',
        'Hardware & software troubleshooting',
        'Network monitoring & optimization',
        'Regular system updates & security patches'
    ],
    homePlans: [
        {
            name: 'Silver',
            tagline: 'Essential coverage for home users',
            price: '7999',
            period: '/year',
            popular: false,
            features: [
                'Up to 2 Devices Covered',
                'Quarterly Health Checkup',
                'Remote Support (Business Hours)',
                'Basic Antivirus Setup',
                'OS & Software Updates',
                'Email Support'
            ]
        },
        {
            name: 'Gold',
            tagline: 'Complete protection for your home setup',
            price: '1,099',
            period: '/year',
            popular: true,
            features: [
                'Up to 5 Devices Covered',
                'Monthly Health Checkup',
                'Remote + 2 On-site Visits/Year',
                'Advanced Security Suite',
                'Wi-Fi Network Optimization',
                'Data Backup Setup',
                'Priority Email & Phone Support',
                'Printer & Peripheral Support'
            ]
        },
        {
            name: 'Platinum',
            tagline: 'Premium all-inclusive home IT care',
            price: '1,599',
            period: '/year',
            popular: false,
            features: [
                'Unlimited Devices Covered',
                'Bi-weekly Health Checkup',
                'Unlimited On-site Visits',
                'Enterprise-grade Security',
                'Smart Home Device Support',
                'Cloud Backup & Recovery',
                '24/7 Priority Support',
                'Dedicated Technician',
                'Annual Hardware Cleaning'
            ]
        }
    ],
    corporatePlans: [
        {
            name: 'Starter',
            tagline: 'Ideal for small businesses & startups',
            price: '2,999',
            period: '/year',
            popular: false,
            features: [
                'Up to 10 Workstations',
                '1 Server Covered',
                'Monthly Preventive Maintenance',
                'Remote Support (Business Hours)',
                'Basic Network Monitoring',
                'Email & Ticketing Support',
                'Quarterly Reports'
            ]
        },
        {
            name: 'Business',
            tagline: 'Comprehensive IT management for growing teams',
            price: '3,999',
            period: '/year',
            popular: true,
            features: [
                'Up to 50 Workstations',
                'Up to 3 Servers Covered',
                'Weekly Preventive Maintenance',
                'Remote + On-site Support',
                'Advanced Network Monitoring',
                'Firewall & Security Management',
                'Data Backup & DR Planning',
                'Priority SLA (4hr Response)',
                'Monthly Reports & Reviews'
            ]
        },
        {
            name: 'Enterprise',
            tagline: 'Full-scale IT infrastructure management',
            price: '4,999',
            period: '/year',
            popular: false,
            features: [
                'Unlimited Workstations & Servers',
                'Daily Preventive Maintenance',
                '24/7 On-site & Remote Support',
                'Complete Cybersecurity Suite',
                'Cloud Infrastructure Management',
                'Dedicated IT Manager',
                'Custom SLA (1hr Response)',
                'Vendor & License Management',
                'Strategic IT Consulting',
                'Real-time Monitoring Dashboard'
            ]
        }
    ],
    faq: [
        {
            question: 'What does an AMC plan cover?',
            answer: 'Our AMC plans cover preventive maintenance, troubleshooting, security updates, hardware/software support, and priority assistance based on the plan tier you choose.'
        },
        {
            question: 'Can I upgrade my plan mid-year?',
            answer: 'Yes! You can upgrade your AMC plan at any time. The cost difference will be prorated for the remaining contract period.'
        },
        {
            question: 'Do you provide on-site support?',
            answer: 'Yes, on-site support is available in Gold/Platinum home plans and all corporate plans. The number of on-site visits depends on your chosen plan.'
        },
        {
            question: 'What is the response time for support requests?',
            answer: 'Response times vary by plan — from next-business-day for basic plans to 1-hour guaranteed response for Enterprise plans.'
        }
    ]
};

// ─── FAQ ITEM COMPONENT ────────────────────────────────────────────────
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden transition-all hover:border-gray-200 hover:shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-6 text-left font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
                <span className="text-lg">{question}</span>
                <ChevronDown
                    className={`transition-transform duration-300 text-gray-400 shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── PLAN CARD COMPONENT ───────────────────────────────────────────────
const PlanCard = ({ plan, type, onSelect, index }) => {
    const isCustom = plan.price === 'Custom';
    const isPopular = plan.popular;

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`relative bg-white rounded-[2rem] p-8 md:p-10 border transition-all duration-500 group flex flex-col
                ${isPopular
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/10 scale-[1.02] z-10'
                    : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200'
                }`}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute top-0 inset-x-0 flex justify-center -mt-4">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                        <Star size={12} fill="currentColor" />
                        Most Popular
                    </span>
                </div>
            )}

            {/* Plan Type Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110
                ${isPopular ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}
            >
                {type === 'home' ? <Home size={28} strokeWidth={1.5} /> : <Building2 size={28} strokeWidth={1.5} />}
            </div>

            {/* Plan Name & Tagline */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{plan.tagline}</p>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-8">
                {!isCustom ? (
                    <>
                        <span className="text-2xl text-gray-400 font-medium">₹</span>
                        <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.price}</span>
                        <span className="text-gray-400 font-medium">{plan.period}</span>
                    </>
                ) : (
                    <span className="text-4xl font-black text-gray-900">Custom</span>
                )}
            </div>

            {/* CTA Button */}
            <button
                onClick={() => onSelect(plan.name, plan.price, type)}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 mb-8 border-2 flex items-center justify-center gap-2 group/btn
                    ${isPopular
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-lg shadow-blue-600/20'
                        : 'bg-transparent text-gray-900 border-gray-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
            >
                {isCustom ? 'Contact Sales' : 'Get Started'}
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* Features */}
            <div className="space-y-3.5 flex-grow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">What's Included</p>
                {plan.features && plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${isPopular ? 'text-blue-600' : 'text-green-500'}`}>
                            <Check size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-gray-700 text-sm font-medium leading-normal">{feature}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// ─── MAIN AMC PLANS PAGE ───────────────────────────────────────────────
const AMCPlansPage = () => {
    const { getContent, loading } = useContent();
    const [activeTab, setActiveTab] = useState('home');
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [enquirySource, setEnquirySource] = useState('');
    const [isCallbackOpen, setIsCallbackOpen] = useState(false);
    const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({ name: '', price: '', type: '' });

    // Get content from CMS or use defaults
    const amcContent = getContent('amcPlans') || defaultAmcData;
    const data = { ...defaultAmcData, ...amcContent };

    const handlePlanSelect = (planName, price, type) => {
        if (price === 'Custom') {
            const label = type === 'home' ? 'Home' : 'Corporate';
            setEnquirySource(`AMC ${label} Plan: ${planName}`);
            setIsEnquiryOpen(true);
        } else {
            setSelectedPlan({ name: planName, price, type });
            setIsPurchaseOpen(true);
        }
    };

    const homePlans = data.homePlans || defaultAmcData.homePlans;
    const corporatePlans = data.corporatePlans || defaultAmcData.corporatePlans;
    const faqItems = data.faq || defaultAmcData.faq;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <SEO
                title="AMC Plans | Annual Maintenance Contracts – UnioTech IT"
                description="Choose from our comprehensive Home & Corporate AMC plans. Preventive maintenance, priority support, and complete IT care for homes and businesses."
                keywords="AMC plans, annual maintenance contract, IT support plan, home AMC, corporate AMC, IT maintenance, UnioTech"
                url="https://uniotechit.com/amc-plans"
            />

            {/* ═══════════════════ HERO SECTION ═══════════════════ */}
            <section className="relative bg-[#0a192f] pt-32 pb-44 lg:pt-40 lg:pb-52 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
                    <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]" />

                    {/* Grid Pattern */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" width="100%" height="100%">
                        <pattern id="amc-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M0 60L60 0" stroke="currentColor" strokeWidth="1" fill="none" className="text-white" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#amc-grid)" />
                    </svg>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    {/* Breadcrumb */}
                    <motion.nav
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex justify-center items-center gap-2 text-sm font-medium text-blue-200/70 mb-8"
                    >
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <span className="text-blue-200/30">/</span>
                        <span className="text-white">{data.heroTitle}</span>
                    </motion.nav>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6"
                    >
                        {data.heroTitle}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-blue-100/80 font-light max-w-3xl mx-auto leading-relaxed mb-10"
                    >
                        {data.heroSubtitle}
                    </motion.p>

                    {/* Hero CTA Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        {[
                            { icon: <Shield size={16} />, text: 'Trusted by 500+ Clients' },
                            { icon: <Clock size={16} />, text: '99.9% Uptime SLA' },
                            { icon: <HeadphonesIcon size={16} />, text: '24/7 Support Available' }
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-blue-100">
                                <span className="text-blue-400">{badge.icon}</span>
                                {badge.text}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════ AMC DETAILS SECTION ═══════════════════ */}
            <section className="relative z-20 -mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            {/* Left: Content */}
                            <div className="p-8 md:p-12 lg:p-16">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Wrench size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">About AMC</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                    {data.detailsTitle}
                                </h2>

                                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                    {data.detailsContent}
                                </p>

                                {/* Features List */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {(data.detailsFeatures || []).map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3 group">
                                            <div className="mt-1 text-green-500 shrink-0 group-hover:scale-110 transition-transform">
                                                <Check size={18} strokeWidth={3} />
                                            </div>
                                            <span className="text-gray-700 font-medium text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Visual / Stats */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { value: '500+', label: 'Active Clients', icon: <Building2 size={24} /> },
                                        { value: '99.9%', label: 'Uptime Guarantee', icon: <Zap size={24} /> },
                                        { value: '< 4hr', label: 'Avg Response Time', icon: <Clock size={24} /> },
                                        { value: '24/7', label: 'Support Available', icon: <HeadphonesIcon size={24} /> }
                                    ].map((stat, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                                        >
                                            <div className="text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                                {stat.icon}
                                            </div>
                                            <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setIsCallbackOpen(true)}
                                    className="mt-8 w-full py-4 bg-[#0a192f] text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-[#112240] transition-all hover:shadow-xl active:scale-[0.98] group"
                                >
                                    <Phone size={18} className="text-green-400" />
                                    Request a Free Consultation
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════ PLANS SECTION ═══════════════════ */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-6">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-center gap-2 mb-4"
                        >
                            <Sparkles size={18} className="text-blue-600" />
                            <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-sm">Choose Your Plan</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
                        >
                            Plans That Fit Your Needs
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 text-lg max-w-2xl mx-auto mb-12"
                        >
                            Select from our carefully crafted Home and Corporate plans, each designed to provide the exact level of support you need.
                        </motion.p>

                        {/* Tab Toggle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm"
                        >
                            <button
                                onClick={() => setActiveTab('home')}
                                className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    activeTab === 'home'
                                        ? 'bg-[#0a192f] text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                <Home size={18} />
                                Home Plans
                            </button>
                            <button
                                onClick={() => setActiveTab('corporate')}
                                className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    activeTab === 'corporate'
                                        ? 'bg-[#0a192f] text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                <Building2 size={18} />
                                Corporate Plans
                            </button>
                        </motion.div>
                    </div>

                    {/* Plan Cards Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
                        >
                            {activeTab === 'home'
                                ? homePlans.map((plan, idx) => (
                                    <PlanCard
                                        key={`home-${idx}`}
                                        plan={plan}
                                        type="home"
                                        onSelect={handlePlanSelect}
                                        index={idx}
                                    />
                                ))
                                : corporatePlans.map((plan, idx) => (
                                    <PlanCard
                                        key={`corp-${idx}`}
                                        plan={plan}
                                        type="corporate"
                                        onSelect={handlePlanSelect}
                                        index={idx}
                                    />
                                ))
                            }
                        </motion.div>
                    </AnimatePresence>

                    {/* Bottom Note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-sm text-gray-400 mt-12 flex items-center justify-center gap-2"
                    >
                        <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                        All plans include basic security setup. GST as applicable.
                    </motion.p>
                </div>
            </section>

            {/* ═══════════════════ FAQ SECTION ═══════════════════ */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12"
                        >
                            Frequently Asked Questions
                        </motion.h2>

                        <div className="space-y-4">
                            {faqItems.map((faq, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <FAQItem question={faq.question} answer={faq.answer} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
                        >
                            Not sure which plan is right for you?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-500 text-lg mb-10"
                        >
                            Our team will help you find the perfect AMC plan tailored to your specific needs and budget.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <button
                                onClick={() => setIsCallbackOpen(true)}
                                className="w-full sm:w-auto px-10 py-4 bg-[#0a192f] text-white rounded-full font-bold hover:bg-[#112240] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <Phone size={18} />
                                Talk to an Expert
                            </button>
                            <Link
                                to="/contact"
                                className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold hover:border-gray-900 hover:text-gray-900 transition-all text-center"
                            >
                                Send Enquiry
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ MODALS ═══════════════════ */}
            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                source={enquirySource}
            />
            <CallbackModal
                isOpen={isCallbackOpen}
                onClose={() => setIsCallbackOpen(false)}
                prefillMessage="I'm interested in your AMC Plans."
            />
            <PurchaseModal
                isOpen={isPurchaseOpen}
                onClose={() => setIsPurchaseOpen(false)}
                planName={selectedPlan.name}
                planPrice={selectedPlan.price}
                planType={selectedPlan.type}
            />
        </div>
    );
};

export default AMCPlansPage;
