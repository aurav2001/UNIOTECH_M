import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    Star,
    ChevronDown,
    ShieldCheck,
    ArrowRight,
    Zap,
    ExternalLink
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';
import CallbackModal from '../components/CallbackModal';

const PlanDetailsPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { getContent } = useContent();
    const [plan, setPlan] = useState(null);
    const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

    const toSlug = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    useEffect(() => {
        window.scrollTo(0, 0);
        const { items: plans = [] } = getContent('pricing');
        if (plans.length > 0) {
            const foundPlan = plans.find(p => toSlug(p.name) === slug);
            setPlan(foundPlan);
        }
    }, [slug, getContent, pathname]);

    if (!plan) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <SEO
                    title="Plan Not Found"
                    description="The pricing plan you are looking for does not exist."
                />
                <div className="text-center">
                    <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Plan Not Found</h2>
                    <p className="text-gray-500 mb-6">This pricing plan doesn't exist or has been removed.</p>
                    <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-dark text-white rounded-full font-medium hover:bg-primary-medium transition-colors"
                    >
                        <ArrowLeft size={18} />
                        View All Plans
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate price
    const displayPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually || plan.priceMonthly;
    const isCustomPrice = plan.priceMonthly === 'Custom';

    return (
        <div className="min-h-screen bg-gray-50 relative font-sans text-gray-900">
            <SEO
                title={`${plan.name} | UnioTech`}
                description={plan.tagline}
            />

            {/* --- TOP SECTION (Dark Background) --- */}
            <div className="bg-primary-dark pt-32 pb-48 lg:pt-40 lg:pb-56 relative overflow-hidden text-center">
                {/* Background Pattern (Subtle) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" width="100%" height="100%">
                        <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M0 60L60 0" stroke="currentColor" strokeWidth="1" fill="none" className="text-white" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    </svg>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    {/* Navigation */}
                    <nav className="flex justify-center items-center gap-2 text-sm font-medium text-blue-200/70 mb-8">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <span className="text-blue-200/30">/</span>
                        <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <span className="text-blue-200/30">/</span>
                        <span className="text-white">{plan.name}</span>
                    </nav>

                    {/* Title & Tagline */}
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6">
                        {plan.name}
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100/80 font-light max-w-2xl mx-auto leading-relaxed">
                        {plan.tagline}
                    </p>
                </div>
            </div>

            {/* --- MAIN FLOATING CARD --- */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 mb-20">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                        {/* LEFT COLUMN: Features & Content (Span 8) */}
                        <div className="lg:col-span-8 p-8 md:p-12 lg:p-16">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded border border-blue-100">
                                    Tier {plan.tier} Series
                                </div>
                                {plan.popular && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded border border-yellow-100">
                                        <Star size={12} fill="currentColor" /> Top Choice
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <ShieldCheck className="text-primary-medium" strokeWidth={1.5} size={28} />
                                Included Features
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                                {plan.features && plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-3 items-start group">
                                        <div className="mt-1 text-green-500 shrink-0 group-hover:scale-110 transition-transform">
                                            <Check size={18} strokeWidth={3} />
                                        </div>
                                        <span className="text-gray-700 font-medium leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Testimonial Block */}
                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative">
                                <p className="text-lg text-gray-700 italic leading-relaxed mb-6 font-serif">
                                    "The {plan.name} plan gave us the exact infrastructure stability we needed. It's robust, reliable, and the support is unmatched."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="User" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">David Miller</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest">CTO, FinTech Sol</div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQs */}
                            <div className="mt-12 pt-12 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                                <div className="space-y-4">
                                    <FAQItem question="Can I upgrade anytime?" answer="Yes, upgrades are instant and prorated for the billing cycle." />
                                    <FAQItem question="Is support included?" answer="Standard support is included. Priority support is available on Enterprise plans." />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sticky Pricing & CTA (Span 4) */}
                        <div className="lg:col-span-4 bg-gray-50/50 p-8 md:p-12 flex flex-col relative">
                            <div className="sticky top-8">
                                <div className="text-center md:text-left mb-8">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                                        {isCustomPrice ? 'Contact for details' : 'Total Investment'}
                                    </p>
                                    <div className="flex items-baseline justify-center md:justify-start gap-1 mb-2">
                                        {!isCustomPrice && <span className="text-3xl text-gray-400 font-light">₹</span>}
                                        <span className="text-6xl font-black text-gray-900 tracking-tighter">
                                            {displayPrice}
                                        </span>
                                    </div>
                                    {!isCustomPrice && (
                                        <p className="text-gray-500 font-medium">
                                            Billed {billingCycle}
                                        </p>
                                    )}
                                </div>

                                {/* Billing Toggle */}
                                {!isCustomPrice && (
                                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 mb-8 shadow-sm">
                                        <button
                                            onClick={() => setBillingCycle('monthly')}
                                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-primary-medium text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            onClick={() => setBillingCycle('yearly')}
                                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-primary-medium text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            Yearly
                                        </button>
                                    </div>
                                )}

                                {/* Main CTA */}
                                <button
                                    onClick={() => setIsCallbackModalOpen(true)}
                                    className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/10 hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 group mb-4"
                                >
                                    <span>{isCustomPrice ? 'Talk to Experts' : 'Get Started Now'}</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </button>

                                <p className="text-center text-xs text-gray-400 font-medium mb-8">
                                    <Zap size={12} className="inline mr-1 text-yellow-500 fill-yellow-500" />
                                    Instant activation available
                                </p>

                                {/* Sidebar Links */}
                                <div className="space-y-4 pt-8 border-t border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1 bg-blue-100 rounded text-primary-medium">
                                            <ExternalLink size={14} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">Need styling?</h4>
                                            <p className="text-xs text-gray-500 mt-1">We offer custom branding for Enterprise tiers.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CallbackModal
                isOpen={isCallbackModalOpen}
                onClose={() => setIsCallbackModalOpen(false)}
                prefillMessage={`I am interested in the ${plan.name} plan.`}
            />
        </div>
    );
};

// FAQ Helper Component
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-100 rounded-lg bg-white overflow-hidden transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-3 px-1 text-left font-bold text-gray-900 hover:text-primary-medium transition-colors"
            >
                {question}
                <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-400`} size={18} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 px-1 text-sm text-gray-600 leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlanDetailsPage;