import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, User, Mail, Phone, Briefcase, CheckCircle, AlertCircle, MapPin, Clock, ArrowRight, Users, ChevronDown } from 'lucide-react';

const QuickApply = () => {
    // Fixed duplicate transition warning
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: 'General Application'
    });
    const [cvFile, setCvFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [openings, setOpenings] = useState([]);

    // OTP States
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState(null);
    const [otpCooldown, setOtpCooldown] = useState(0);

    // Fetch job openings from API
    useEffect(() => {
        const fetchOpenings = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const response = await fetch(`${apiUrl}/api/careers/openings`);
                const data = await response.json();
                if (data.success && data.data) {
                    setOpenings(data.data);
                }
            } catch (error) {
                // Fail silently
            }
        };
        fetchOpenings();
    }, []);

    // Get positions - combine openings with defaults
    const getPositions = () => {
        const openingTitles = openings.map(o => o.title);
        const combined = ['General Application', ...openingTitles];
        return [...new Set(combined)];
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Reset OTP status if email changes
        if (name === 'email') {
            setIsOtpSent(false);
            setIsOtpVerified(false);
            setOtpError(null);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setOtpError('Please enter a valid email address first');
            return;
        }

        setOtpLoading(true);
        setOtpError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/careers/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();
            if (data.success) {
                setIsOtpSent(true);
                setOtpCooldown(60);
                setOtpError(null);
            } else {
                setOtpError(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            setOtpError('Error sending OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setOtpError('Please enter a 6-digit OTP');
            return;
        }

        setOtpLoading(true);
        setOtpError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/careers/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp })
            });
            const data = await response.json();
            if (data.success) {
                setIsOtpVerified(true);
                setOtpError(null);
            } else {
                setOtpError(data.message || 'Invalid OTP');
            }
        } catch (error) {
            setOtpError('Error verifying OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Cooldown timer for OTP
    useEffect(() => {
        if (otpCooldown > 0) {
            const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpCooldown]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setSubmitStatus({ type: 'error', message: 'Please upload a PDF, DOC, or DOCX file' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setSubmitStatus({ type: 'error', message: 'File size must be less than 5MB' });
                return;
            }
            setCvFile(file);
            setSubmitStatus(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isOtpVerified) {
            setOtpError('Please verify your email with OTP before submitting');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const formPayload = new FormData();
            formPayload.append('name', formData.name);
            formPayload.append('email', formData.email);
            formPayload.append('phone', formData.phone);
            formPayload.append('position', formData.position);
            if (cvFile) {
                formPayload.append('cv', cvFile);
            }

            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/careers/apply`, {
                method: 'POST',
                body: formPayload
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitStatus({ type: 'success', message: 'Application submitted successfully! We will get back to you soon.' });
                setFormData({ name: '', email: '', phone: '', position: 'General Application' });
                setCvFile(null);
                setOtp('');
                setIsOtpSent(false);
                setIsOtpVerified(false);
            } else {
                setSubmitStatus({ type: 'error', message: data.message || 'Failed to submit application' });
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectPosition = (title) => {
        setFormData(prev => ({ ...prev, position: title }));
    };

    return (
        <section className="py-24 bg-white font-sans overflow-hidden">
            <div className="container mx-auto px-4">

                {/* TOP CENTERED HEADING */}
                <div className="text-center mb-16">
                    <h4 className="text-primary-medium font-bold uppercase tracking-widest text-sm mb-3">
                        Careers
                    </h4>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary-dark mb-6">
                        Start Your Career With Us
                    </h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-primary-dark to-primary-light mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                    {/* LEFT SIDE - Text & Job Openings */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:sticky lg:top-24"
                    >
                        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                            We're always looking for talented individuals to join our growing team.
                            If you're passionate about technology and innovation, we'd love to hear from you.
                        </p>

                        {/* Job Openings List */}
                        {openings.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-primary-dark uppercase tracking-wide">
                                    Current Openings
                                </h3>
                                {openings.map((opening, index) => (
                                    <motion.div
                                        key={opening.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => selectPosition(opening.title)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${formData.position === opening.title
                                            ? 'border-primary-medium bg-primary-light/20'
                                            : 'border-gray-100 hover:border-primary-light hover:bg-primary-light/10'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-primary-dark group-hover:text-primary-medium transition-colors">
                                                    {opening.title}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                    {opening.department && (
                                                        <span className="flex items-center gap-1">
                                                            <Briefcase size={14} />
                                                            {opening.department}
                                                        </span>
                                                    )}
                                                    {opening.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={14} />
                                                            {opening.location}
                                                        </span>
                                                    )}
                                                    {opening.type && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {opening.type}
                                                        </span>
                                                    )}
                                                    {opening.vacancies && opening.vacancies > 0 && (
                                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                                            <Users size={14} />
                                                            {opening.vacancies} {opening.vacancies === 1 ? 'vacancy' : 'vacancies'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="text-primary-medium opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-primary-dark uppercase tracking-wide mb-4">
                                    Why Join Us?
                                </h3>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <CheckCircle className="text-primary-medium flex-shrink-0" size={20} />
                                    <span>Competitive salary & benefits</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <CheckCircle className="text-primary-medium flex-shrink-0" size={20} />
                                    <span>Flexible work environment</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <CheckCircle className="text-primary-medium flex-shrink-0" size={20} />
                                    <span>Growth opportunities</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <CheckCircle className="text-primary-medium flex-shrink-0" size={20} />
                                    <span>Collaborative team culture</span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* RIGHT SIDE - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg hover:border-primary-light/50 transition-all duration-300"
                        >
                            <h3 className="text-2xl font-bold text-primary-dark mb-6">Quick Apply</h3>

                            <div className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2 uppercase tracking-wide">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-medium" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 text-primary-dark placeholder-gray-400 focus:outline-none focus:border-primary-medium focus:bg-white transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2 uppercase tracking-wide">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-medium" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isOtpVerified}
                                            className={`w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-12 pr-32 text-primary-dark placeholder-gray-400 focus:outline-none focus:border-primary-medium focus:bg-white transition-all ${isOtpVerified ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            placeholder="your@email.com"
                                        />
                                        {!isOtpVerified && (
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={otpLoading || otpCooldown > 0}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-medium text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
                                            >
                                                {otpLoading ? '...' : (otpCooldown > 0 ? `Resend (${otpCooldown}s)` : (isOtpSent ? 'Resend' : 'Send OTP'))}
                                            </button>
                                        )}
                                        {isOtpVerified && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 flex items-center gap-1">
                                                <CheckCircle size={16} />
                                                <span className="text-xs font-bold uppercase">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* OTP Field */}
                                {isOtpSent && !isOtpVerified && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2"
                                    >
                                        <label className="block text-sm font-bold text-primary-dark mb-2 uppercase tracking-wide">
                                            Verification Code *
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-medium" size={18} />
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 text-primary-dark placeholder-gray-400 focus:outline-none focus:border-primary-medium focus:bg-white transition-all tracking-[0.5em] font-mono text-lg"
                                                    placeholder="000000"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleVerifyOtp}
                                                disabled={otpLoading || otp.length !== 6}
                                                className="bg-primary-dark text-white px-6 rounded-xl font-bold hover:bg-primary-medium transition-all disabled:opacity-50"
                                            >
                                                {otpLoading ? '...' : 'Verify'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {otpError && (
                                    <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                        <AlertCircle size={14} /> {otpError}
                                    </p>
                                )}

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2 uppercase tracking-wide">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-medium" size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 text-primary-dark placeholder-gray-400 focus:outline-none focus:border-primary-medium focus:bg-white transition-all"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2 uppercase tracking-wide">
                                        Position *
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-medium pointer-events-none" size={18} />
                                        <select
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-12 pr-10 text-primary-dark focus:outline-none focus:border-primary-medium focus:bg-white transition-all appearance-none cursor-pointer"
                                        >
                                            {getPositions().map(pos => (
                                                <option key={pos} value={pos}>{pos}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-medium pointer-events-none" size={18} />
                                    </div>
                                </div>

                                {/* CV Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-primary-dark mb-2 uppercase tracking-wide">
                                        Upload CV (PDF, DOC, DOCX)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="cv-upload"
                                    />
                                    <label
                                        htmlFor="cv-upload"
                                        className="flex items-center justify-center gap-3 w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl py-4 px-4 text-gray-500 hover:border-primary-medium hover:text-primary-medium hover:bg-primary-light/10 transition-all cursor-pointer"
                                    >
                                        <Upload size={20} />
                                        {cvFile ? cvFile.name : 'Click to upload your CV'}
                                    </label>
                                </div>
                            </div>

                            {/* Status Message */}
                            {submitStatus && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${submitStatus.type === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}
                                >
                                    {submitStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    {submitStatus.message}
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !isOtpVerified}
                                className="mt-6 w-full bg-gradient-to-r from-primary-dark to-primary-medium text-white py-4 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-3 hover:shadow-xl hover:from-primary-medium hover:to-primary-dark transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default QuickApply;
