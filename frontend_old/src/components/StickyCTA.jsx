import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import EnquiryModal from './EnquiryModal';

const StickyCTA = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.getElementById('footer');
            const footerTop = footer ? footer.offsetTop : document.documentElement.scrollHeight;
            const scrollPosition = window.scrollY + window.innerHeight;

            // Show after scrolling past hero section (approx 600px)
            // AND hide if we reach the footer
            if (window.scrollY > 600 && scrollPosition < footerTop + 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSeeHowItWorks = () => {
        if (location.pathname !== '/') {
            navigate('/#workflow');
        } else {
            const workflowSection = document.getElementById('workflow');
            if (workflowSection) {
                workflowSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        // x: "-50%" centers the element relative to left: 50%
                        initial={{ y: 100, opacity: 0, x: "-50%" }}
                        animate={{ y: 0, opacity: 1, x: "-50%" }}
                        exit={{ y: 100, opacity: 0, x: "-50%" }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="
                            fixed bottom-6 left-1/2 z-50 
                            flex items-center justify-between
                            w-[90%] md:w-auto max-w-fit
                            gap-2 md:gap-3 
                            p-1.5 md:p-2 
                            bg-white/80 backdrop-blur-lg 
                            border border-white/20 shadow-2xl rounded-full
                        "
                    >
                        {/* Primary Button (Book a Demo) */}
                        <button
                            onClick={() => setIsEnquiryOpen(true)}
                            className="
                                flex-1 md:flex-none justify-center
                                flex items-center gap-2 
                                bg-primary-medium hover:bg-primary-light 
                                text-white 
                                text-xs md:text-base font-bold 
                                px-4 py-3 md:px-6 md:py-3 
                                rounded-full transition-all shadow-md group whitespace-nowrap
                            "
                        >
                            <span>Book a demo</span>
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </div>
                        </button>

                        {/* Secondary Button (See how it works) */}
                        <button
                            onClick={handleSeeHowItWorks}
                            className="
                                flex-1 md:flex-none justify-center
                                flex items-center gap-2 
                                bg-primary-dark hover:bg-gray-800 
                                text-white 
                                text-xs md:text-base font-bold 
                                px-4 py-3 md:px-6 md:py-3 
                                rounded-full transition-all shadow-md group whitespace-nowrap
                            "
                        >
                            <span>See how it works</span>
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                                <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                source="Sticky CTA"
            />
        </>
    );
};

export default StickyCTA;