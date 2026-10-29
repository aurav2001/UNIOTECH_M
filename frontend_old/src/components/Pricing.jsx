import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Building2, Rocket, Crown, ChevronDown } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EnquiryModal from './EnquiryModal.jsx';
import Skeleton from './Skeleton';

const Pricing = () => {
    const { getContent, loading } = useContent();
    const { items: plans = [], title, subtitle, isVisible } = getContent('pricing');

    const toSlug = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    if (isVisible === false) return null;
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [enquirySource, setEnquirySource] = useState('');

    // Default features if missing in DB
    if (!plans || plans.length === 0) {
        // Fallback or loading state could go here, but context handles loading.
        // We'll proceed with empty or partial data gracefully.
    }

    const getIcon = (tier) => {
        if (tier === 1) return <Crown size={32} strokeWidth={1.5} />;
        if (tier === 2) return <Rocket size={32} strokeWidth={1.5} />;
        return <Building2 size={32} strokeWidth={1.5} />;
    };

    const handlePlanSelect = (planName) => {
        setEnquirySource(`Pricing: ${planName} Plan`);
        setIsEnquiryOpen(true);
    };

    const faqs = [
        {
            question: "Can I cancel my subscription at any time?",
            answer: "Yes, absolutely. You can cancel your subscription from your account settings at any time. Your access will continue until the end of your current billing period."
        },
        {
            question: "Is there a free trial available?",
            answer: "We offer a 14-day free trial for our Professional plan. No credit card is required to sign up. You can explore all the features before committing."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For Enterprise plans, we can also support invoice-based bank transfers."
        },
        {
            question: "Do you offer discounts for non-profits?",
            answer: "Yes! We love supporting organizations that do good. Please contact our sales team with proof of your non-profit status to receive a special discount code."
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
        }
    };

    return (
        <section className="py-24 md:py-32 bg-gray-50 relative overflow-hidden font-sans">
            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="mb-20 flex flex-col items-center text-center max-w-3xl mx-auto">
                    <motion.h4
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#0a192f] font-bold uppercase tracking-[0.2em] text-sm mb-4"
                    >
                        Pricing Plans
                    </motion.h4>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0a192f] mb-6 leading-tight"
                    >
                        {title || "Transparent & Simple."}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 text-lg md:text-xl font-medium max-w-2xl mb-12"
                    >
                        {subtitle || "Select the perfect plan for your business needs. No hidden costs."}
                    </motion.p>

                    {/* Toggle Switch */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex p-1 bg-white rounded-full border border-gray-200 shadow-sm"
                    >
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-[#0a192f] text-white shadow-md' : 'text-gray-500 hover:text-[#0a192f]'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('customize')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'customize' ? 'bg-[#0a192f] text-white shadow-md' : 'text-gray-500 hover:text-[#0a192f]'}`}
                        >
                            Customize <span className={`text-[10px] px-1.5 py-0.5 rounded ${billingCycle === 'customize' ? 'bg-white text-[#0a192f]' : 'bg-[#0a192f] text-white'}`}>PRO</span>
                        </button>
                    </motion.div>
                </div>

                {/* Grid */}
                <motion.div
                    key={billingCycle}
                    className={`grid ${billingCycle === 'customize' ? 'grid-cols-1 max-w-lg' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'} max-w-7xl mx-auto mb-24`}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {loading ? (
                        [1, 2, 3].map((_, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-lg h-full flex flex-col gap-6">
                                <Skeleton className="w-14 h-14 rounded-2xl mb-2" />
                                <div className="space-y-3">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                                <div className="flex items-baseline gap-2 my-4">
                                    <Skeleton className="h-12 w-32" />
                                    <Skeleton className="h-6 w-12" />
                                </div>
                                <Skeleton className="h-14 w-full rounded-xl mb-4" />
                                <div className="space-y-4 flex-grow">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    {[1, 2, 3, 4, 5].map((_, j) => (
                                        <div key={j} className="flex gap-3">
                                            <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : billingCycle === 'customize' ? (
                        <motion.div
                            variants={cardVariants}
                            className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-2xl relative overflow-hidden group hover:border-[#0a192f]/20 transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#0a192f]"></div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-[#0a192f]/5 rounded-2xl flex items-center justify-center text-[#0a192f] mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Building2 size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0a192f] mb-2">Enterprise Custom</h3>
                                <p className="text-gray-500 mb-8">Tailored for large organizations.</p>

                                <div className="text-5xl font-black text-[#0a192f] mb-8 tracking-tight">Custom</div>

                                <button
                                    onClick={() => handlePlanSelect('Custom Enterprise')}
                                    className="w-full py-4 rounded-xl bg-[#0a192f] text-white font-bold hover:bg-[#112240] transition-colors shadow-lg hover:shadow-xl mb-8"
                                >
                                    Contact Sales
                                </button>

                                <div className="space-y-4 w-full text-left">
                                    {["Dedicated Manager", "Custom SLA", "On-premise Options", "24/7 Priority Support"].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[#0a192f] flex items-center justify-center text-white shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-gray-700 font-medium">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        plans.map((plan, index) => (
                            <motion.div
                                key={index}
                                variants={cardVariants}
                                className={`bg-white rounded-[2rem] p-8 md:p-10 border transition-all duration-500 relative group flex flex-col
                                    ${plan.popular
                                        ? 'border-[#0a192f] shadow-2xl scale-105 z-10'
                                        : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 inset-x-0 flex justify-center -mt-4">
                                        <span className="bg-[#0a192f] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110
                                    ${plan.popular ? 'bg-[#0a192f] text-white' : 'bg-[#0a192f]/5 text-[#0a192f]'}`}>
                                    {getIcon(plan.tier || 3)}
                                </div>

                                <h3 className="text-2xl font-bold text-[#0a192f] mb-2">{plan.name}</h3>
                                <p className="text-gray-500 text-sm mb-8 min-h-[40px]">{plan.tagline}</p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    {plan.priceMonthly !== 'Custom' ? (
                                        <>
                                            <span className="text-2xl text-gray-400 font-medium">₹</span>
                                            <span className="text-5xl font-black text-[#0a192f] tracking-tight">{plan.priceMonthly}</span>
                                            <span className="text-gray-400 font-medium">/mo</span>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-black text-[#0a192f]">Custom</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handlePlanSelect(plan.name)}
                                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 mb-8 border-2
                                        ${plan.popular
                                            ? 'bg-[#0a192f] text-white border-[#0a192f] hover:bg-[#112240] hover:border-[#112240] shadow-lg'
                                            : 'bg-transparent text-[#0a192f] border-[#0a192f]/10 hover:border-[#0a192f] hover:bg-[#0a192f]/5'
                                        }`}
                                >
                                    {plan.buttonText || (plan.tier === 1 ? 'Contact Sales' : (plan.popular ? 'Start Free Trial' : 'Get Started'))}
                                </button>

                                <div className="space-y-4 flex-grow">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Features</p>
                                    {plan.features && plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <Check size={18} className="text-[#0a192f] shrink-0 mt-0.5" strokeWidth={2.5} />
                                            <span className="text-gray-700 text-sm font-medium leading-normal">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.excludedFeatures && plan.excludedFeatures.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3 opacity-50">
                                            <X size={18} className="text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-gray-500 text-sm leading-normal">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto mt-32">
                    <h3 className="text-3xl font-bold text-[#0a192f] text-center mb-12">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.details
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden open:shadow-lg transition-all"
                            >
                                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                                    <span className="font-bold text-[#0a192f] text-lg">{faq.question}</span>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-open:bg-[#0a192f] group-open:text-white transition-colors">
                                        <ChevronDown size={18} className="transition-transform duration-300 group-open:rotate-180" />
                                    </div>
                                </summary>
                                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </motion.details>
                        ))}
                    </div>
                </div>

                <EnquiryModal
                    isOpen={isEnquiryOpen}
                    onClose={() => setIsEnquiryOpen(false)}
                    source={enquirySource}
                />
            </div>
        </section>
    );
};

export default Pricing;
