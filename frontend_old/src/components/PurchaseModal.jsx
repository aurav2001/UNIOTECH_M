import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Loader2, Upload, Phone, User, ShieldCheck } from 'lucide-react';
import { isValidPhone, isRequired } from '../utils/validation';
import { getApiUrl } from '../utils/api';

const PurchaseModal = ({ isOpen, onClose, planName, planPrice, planType }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [errors, setErrors] = useState({});
    
    // States for upload and submit
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('idle'); // idle, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset form after transition time
            const timer = setTimeout(() => {
                setFormData({ name: '', phone: '' });
                setScreenshotFile(null);
                setScreenshotPreview(null);
                setErrors({});
                setSubmitStatus('idle');
                setErrorMessage('');
            }, 300);
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, screenshot: 'File size must be less than 5MB' }));
                return;
            }
            // Check file type
            if (!file.type.match('image.*')) {
                setErrors(prev => ({ ...prev, screenshot: 'Please select an image file' }));
                return;
            }

            setScreenshotFile(file);
            setErrors(prev => ({ ...prev, screenshot: '' }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validation
        const newErrors = {};
        if (!isRequired(formData.name, 2)) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        if (!isRequired(formData.phone)) {
            newErrors.phone = 'Phone number is required';
        } else if (!isValidPhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number (min 10 digits)';
        }
        if (!screenshotFile) {
            newErrors.screenshot = 'Payment screenshot is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        let uploadedUrl = '';
        setIsUploading(true);

        try {
            // 2. Upload Screenshot to Public endpoint
            const uploadFormData = new FormData();
            uploadFormData.append('screenshot', screenshotFile);

            const uploadResponse = await fetch(getApiUrl('/api/upload/payment-proof'), {
                method: 'POST',
                body: uploadFormData
            });

            const uploadData = await uploadResponse.json();

            if (uploadResponse.ok && uploadData.url) {
                uploadedUrl = uploadData.url;
            } else {
                console.warn('Screenshot upload warning:', uploadData.error || 'Unknown error');
            }
        } catch (uploadErr) {
            console.error('Screenshot upload failed, proceeding without file:', uploadErr);
        } finally {
            setIsUploading(false);
        }

        try {
            // 3. Submit Purchase Details to Enquiry (stores in submissions database)
            const enquiryResponse = await fetch(getApiUrl('/api/enquiry'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: 'payment@uniotechit.com', // fallback required email
                    phone: formData.phone,
                    message: `Plan Purchased: ${planName}\nPrice: ₹${planPrice}\nType: ${planType === 'home' ? 'Home AMC' : 'Corporate AMC'}\nPayment Screenshot: ${uploadedUrl || 'Upload failed or skipped (Ask customer for screenshot manually)'}`,
                    source: `AMC Purchase: ${planName}`
                })
            });

            const enquiryData = await enquiryResponse.json();

            if (!enquiryResponse.ok) {
                throw new Error(enquiryData.error || 'Failed to save purchase details. Please contact support.');
            }

            setSubmitStatus('success');
        } catch (error) {
            console.error('Purchase error:', error);
            setSubmitStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    // Generate Dynamic UPI QR Code link (Paytm QR with auto amount)
    const cleanPrice = (planPrice || '').replace(/[^0-9]/g, ''); // Extract numerical digits
    const upiLink = `upi://pay?pa=paytmqr2810050501011gueq3saw65i@paytm&pn=Paytm%20Merchant&am=${cleanPrice}&cu=INR&tn=${encodeURIComponent(planName + ' AMC Plan')}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#0a192f] text-white">
                                <div>
                                    <h3 className="text-xl font-bold">Complete Your Purchase</h3>
                                    <p className="text-sm text-blue-200 mt-1">
                                        Scan and Pay for: <span className="font-semibold text-white">{planName} Plan (₹{planPrice})</span>
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-200 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto space-y-6">
                                {submitStatus === 'success' ? (
                                    <div className="text-center py-10 space-y-4">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={40} />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900">Payment Submitted!</h4>
                                        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                                            Thank you! Your payment details and screenshot for the <strong>{planName} Plan</strong> have been submitted successfully. Our billing team will verify it and activate your plan shortly.
                                        </p>
                                        <div className="pt-4">
                                            <button
                                                onClick={onClose}
                                                className="px-8 py-3 bg-[#0a192f] text-white font-bold rounded-xl hover:bg-[#112240] transition-colors shadow-lg"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Left Side: QR Code Instructions */}
                                        <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Scan to Pay</p>
                                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                                                <img
                                                    src={qrCodeUrl}
                                                    alt="Payment QR Code"
                                                    className="w-44 h-44 object-contain"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 text-center mt-3 font-medium px-4">
                                                Scan QR code with any UPI app. Amount <strong>₹{planPrice}</strong> will be automatically filled.
                                            </p>
                                        </div>

                                        {/* Right Side: Form */}
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {submitStatus === 'error' && (
                                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                                    <p>{errorMessage}</p>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <User size={13} className="text-gray-400" /> Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white text-sm outline-none transition-all
                                                        ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'}`}
                                                />
                                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <Phone size={13} className="text-gray-400" /> Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Enter phone number"
                                                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white text-sm outline-none transition-all
                                                        ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'}`}
                                                />
                                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <Upload size={13} className="text-gray-400" /> Payment Screenshot
                                                </label>
                                                
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />

                                                {screenshotPreview ? (
                                                    <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center group">
                                                        <img
                                                            src={screenshotPreview}
                                                            alt="Payment Proof Preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                            <button
                                                                type="button"
                                                                onClick={triggerFileInput}
                                                                className="px-4 py-2 bg-white text-gray-900 font-bold rounded-xl text-xs shadow-md hover:bg-gray-100"
                                                            >
                                                                Change Screenshot
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={triggerFileInput}
                                                        className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50/50 transition-colors
                                                            ${errors.screenshot ? 'border-red-300 bg-red-50/10' : 'border-gray-200'}`}
                                                    >
                                                        <Upload size={24} className="text-gray-400" />
                                                        <span className="text-xs font-semibold text-gray-600">Upload Screenshot</span>
                                                        <span className="text-[10px] text-gray-400">PNG, JPG, JPEG up to 5MB</span>
                                                    </button>
                                                )}
                                                {errors.screenshot && <p className="text-xs text-red-500 mt-1">{errors.screenshot}</p>}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2 mt-4"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        {isUploading ? 'Uploading Image...' : 'Submitting payment details...'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={18} />
                                                        Complete & Verify
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PurchaseModal;
