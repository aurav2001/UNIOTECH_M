
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight, ChevronDown, Check, Globe, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { validateContactForm, isValidEmail, isRequired } from '../utils/validation';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <span className="font-bold text-gray-900">{question}</span>
                <ChevronDown
                    className={`text - gray - 400 transition - transform duration - 300 ${isOpen ? 'rotate-180' : ''} `}
                    size={20}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-gray-50/50"
                    >
                        <div className="p-6 pt-0 text-gray-600 leading-relaxed text-sm">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import { useContent } from '../context/ContentContext';

const ContactUs = () => {
    const { getContent } = useContent();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);

    // Fetch dynamic content
    const heroTitle = getContent('contact', 'heroTitle', "Let's Start a Conversation");
    const heroSubtitle = getContent('contact', 'heroSubtitle', 'Get in Touch');
    const email = getContent('contact', 'email', 'sales@uniotechit.com');
    const phone = getContent('contact', 'phone', '+91 98737 37020');
    const address = getContent('contact', 'address', 'Block B, Sector 63, Noida');
    const addresses = getContent('contact', 'addresses', []);
    const apiUrl = import.meta.env.VITE_API_URL;
    const whatsapp = getContent('contact', 'whatsapp', 'https://wa.me/919873737020');

    // Compute effective addresses - prefer new array format, fallback to legacy single address
    const effectiveAddresses = addresses.length > 0
        ? addresses
        : (address ? [{ label: 'Office', value: address }] : []);

    // Form state
    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', message: ''
    });
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    // Read email from URL params on mount
    useEffect(() => {
        const emailFromUrl = searchParams.get('email');
        if (emailFromUrl) {
            setFormData(prev => ({ ...prev, email: emailFromUrl }));
        }
    }, [searchParams]);

    const handleNext = () => {
        // Validate step 1 fields (name and email)
        const errors = {};
        if (!isRequired(formData.name, 2)) {
            errors.name = 'Name must be at least 2 characters';
        }
        if (!isRequired(formData.email)) {
            errors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        setFieldErrors(errors);
        if (Object.keys(errors).length === 0) {
            setStep(2);
        }
    };
    const handleBack = () => setStep(1);

    const handleSubmit = async (e) => {
        // Validate full form
        const validation = validateContactForm(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        setFieldErrors({});
        setStatus({ loading: true, success: false, error: '' });

        try {
            const res = await fetch(`${apiUrl}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus({ loading: false, success: true, error: '' });
                setFormData({ name: '', email: '', subject: '', message: '' });
                setStep(1);
                // Reset success message after 3 seconds
                setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);
            } else {
                setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again.' });
            }
        } catch (error) {
            setStatus({ loading: false, success: false, error: 'Network error. Please try again later.' });
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans pt-24 md:pt-32 pb-20 overflow-x-hidden">
            <SEO
                title="Contact Uniotech IT Solutions | IT Consulting & Support"
                description="Get in touch with Uniotech IT Solutions for managed IT services, cybersecurity consulting, cloud solutions, and enterprise technology support. We are here to help."
                keywords="Contact Uniotech, IT Support Contact, IT Consulting Inquiry, Business IT Support"
                url="https://uniotechit.com/contact"
            />

            {/* --- HEADER --- */}
            <div className="container mx-auto px-6 md:px-12 lg:px-20 text-center mb-16">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-primary-medium font-bold tracking-widest uppercase text-xs md:text-sm"
                >
                    {heroSubtitle}
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-6xl font-bold text-gray-900 mt-3 md:mt-4"
                >
                    {heroTitle}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg leading-relaxed"
                >
                    Have a project in mind? We'd love to hear about it. Send us a message or chat with us directly on WhatsApp.
                </motion.p>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="container mx-auto px-6 md:px-12 lg:px-20 mb-32">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* --- LEFT COLUMN: INFO & WHATSAPP --- */}
                    <div className="space-y-8 h-fit lg:sticky lg:top-32">

                        {/* SLA / Timeframe Info - Redesigned */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-1 bg-primary-medium rounded-full"></span>
                                Response Timeline
                            </h3>

                            <div className="space-y-6 relative ml-3">
                                {/* Connecting Line */}
                                <div className="absolute left-[7px] top-2 bottom-4 w-[2px] bg-gray-100"></div>

                                {/* Step 1 */}
                                <div className="relative pl-8">
                                    <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-primary-medium shadow-sm z-10"></span>
                                    <p className="text-gray-900 font-bold text-sm">Submit your request</p>
                                    <p className="text-gray-500 text-xs mt-1">Via social channels or form</p>
                                </div>

                                {/* Step 2 */}
                                <div className="relative pl-8">
                                    <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-primary-light shadow-sm z-10"></span>
                                    <p className="text-gray-900 font-bold text-sm">Initial Response</p>
                                    <p className="text-gray-500 text-xs mt-1">Within a couple of hours</p>
                                </div>

                                {/* Step 3 */}
                                <div className="relative pl-8">
                                    <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-green-500 shadow-sm z-10"></span>
                                    <p className="text-gray-900 font-bold text-sm">Issue Resolution</p>
                                    <p className="text-gray-500 text-xs mt-1">Max 2 working days guaranteed</p>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Option */}
                        <motion.a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-4 p-5 rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                                <MessageCircle size={24} className="fill-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-green-50 text-xs font-bold uppercase tracking-wider mb-0.5">Fastest Way</p>
                                <p className="text-lg font-bold">WhatsApp Now</p>
                            </div>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.a>

                        {/* Contact Info Cards - Stacked */}
                        <div className="grid gap-4">
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Support</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{phone}</p>
                                </div>
                            </div>

                            {/* Multiple Address Cards */}
                            {effectiveAddresses.map((addr, index) => (
                                <div key={index} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{addr.label || 'Visit Us'}</p>
                                        <p className="text-sm font-bold text-gray-900 mt-0.5">{addr.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: FORM --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 h-fit"
                    >
                        {/* Progress Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {step === 1 ? "The Basics" : "Project Details"}
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className={`h - 2 rounded - full transition - all duration - 300 ${step === 1 ? 'w-8 bg-primary-medium' : 'w-2 bg-gray-300'} `} />
                                <div className={`h - 2 rounded - full transition - all duration - 300 ${step === 2 ? 'w-8 bg-primary-medium' : 'w-2 bg-gray-300'} `} />
                            </div>
                        </div>

                        {status.success && (
                            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl flex items-center gap-2">
                                <Check size={20} />
                                <span className="font-bold">Message sent successfully!</span>
                            </div>
                        )}

                        {status.error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-2">
                                <AlertCircle size={20} />
                                <span className="font-bold">{status.error}</span>
                            </div>
                        )}

                        <form className="space-y-6 overflow-hidden relative min-h-[300px]">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, name: e.target.value });
                                                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                                                }}
                                                className={`w - full px - 4 py - 3 rounded - xl bg - white border ${fieldErrors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus: ring - 2 focus: ring - primary - light / 20 outline - none transition - all`}
                                                placeholder="Enter your full name"
                                                autoFocus
                                            />
                                            {fieldErrors.name && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {fieldErrors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                                                }}
                                                className={`w - full px - 4 py - 3 rounded - xl bg - white border ${fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus: ring - 2 focus: ring - primary - light / 20 outline - none transition - all`}
                                                placeholder="Enter your email address"
                                            />
                                            {fieldErrors.email && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {fieldErrors.email}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="w-full bg-primary-medium text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-medium/20 mt-4"
                                        >
                                            Next Step <ArrowRight size={18} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, subject: e.target.value });
                                                    if (fieldErrors.subject) setFieldErrors(prev => ({ ...prev, subject: '' }));
                                                }}
                                                className={`w - full px - 4 py - 3 rounded - xl bg - white border ${fieldErrors.subject ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus: ring - 2 focus: ring - primary - light / 20 outline - none transition - all`}
                                                placeholder="Project Inquiry"
                                                autoFocus
                                            />
                                            {fieldErrors.subject && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {fieldErrors.subject}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                            <textarea
                                                rows="5"
                                                value={formData.message}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, message: e.target.value });
                                                    if (fieldErrors.message) setFieldErrors(prev => ({ ...prev, message: '' }));
                                                }}
                                                className={`w - full px - 4 py - 3 rounded - xl bg - white border ${fieldErrors.message ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus: ring - 2 focus: ring - primary - light / 20 outline - none transition - all resize - none`}
                                                placeholder="Tell us about your project..."
                                            ></textarea>
                                            {fieldErrors.message && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {fieldErrors.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="w-1/3 text-gray-500 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                className="w-2/3 bg-primary-dark text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-dark/20 group"
                                                disabled={status.loading}
                                            >
                                                {status.loading ? 'Sending...' : 'Send Message'}
                                                {!status.loading && <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* --- FAQ SECTION --- */}
            <section className="container mx-auto px-6 md:px-12 lg:px-20 mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    <p className="text-gray-500 mt-2">Answers whitespace to some common queries.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <FAQItem
                        question="What is your typical response time?"
                        answer="We usually respond within 2 hours during business days. For urgent matters, we recommend using WhatsApp for a quicker reply."
                    />
                    <FAQItem
                        question="Do you offer custom software development?"
                        answer="Yes! We specialize in tailored solutions. From mobile apps to enterprise ERPs, we build what you need."
                    />
                    <FAQItem
                        question="How does your pricing work?"
                        answer="We offer flexible engagement models including fixed-cost projects and dedicated team hiring. Contact us for a quote!"
                    />
                    <FAQItem
                        question="Do you provide post-launch support?"
                        answer="Absolutely. We offer 3 months of free support with every project and extended maintenance packages thereafter."
                    />
                </div>
            </section>

        </div>
    );
};

export default ContactUs;
