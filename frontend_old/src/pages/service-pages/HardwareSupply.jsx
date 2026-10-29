import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Anchor,
    Box,
    ChevronRight,
    ChevronDown,
    Globe,
    Shield,
    Cpu,
    ArrowUpRight,
    CheckCircle,
    MessageSquare,
    Zap
} from 'lucide-react';
import EnquiryModal from '../../components/EnquiryModal';
import SEO from '../../components/SEO';

const Counter = ({ value, label, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        if (isInView) {
            // Parse numeric part from value if it contains symbols (e.g. "50+")
            const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
            const controls = animate(count, numericValue, { duration: 2, ease: "easeOut" });
            return controls.stop;
        }
    }, [isInView, value, count]);

    return (
        <div ref={ref} className="border-l border-gray-700 first:border-0 pl-12 md:pl-0">
            <h3 className="text-4xl md:text-5xl font-bold text-primary-medium mb-2 flex justify-center items-center gap-1">
                <motion.span>{rounded}</motion.span>
                <span>{value.replace(/[0-9.]/g, '') || suffix}</span>
            </h3>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">{label}</p>
        </div>
    );
};

const HardwareSupply = () => {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(null);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [enquirySource, setEnquirySource] = useState('');

    const services = [
        {
            id: "01",
            title: "Global Procurement",
            subtitle: "Sourcing without borders",
            description: "We don't just order parts; we navigate the global supply chain. By leveraging relationships with Tier-1 distributors across 3 continents, we secure genuine hardware even when local stock runs dry.",
            features: ["Direct OEM Access", "Obsolete Part Sourcing", "Bulk Volume Discounts"],
            icon: <Globe className="w-6 h-6" />,
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
        },
        {
            id: "02",
            title: "Custom Configuration",
            subtitle: "Ready-to-deploy engineering",
            description: "Stop wasting your IT team's time on unboxing and assembly. Our engineers install RAM, configure RAID arrays, and flash firmware in our ESD-safe labs before the hardware ever reaches your dock.",
            features: ["BIOS/Firmware Updates", "RAID Configuration", "OS Imaging"],
            icon: <Cpu className="w-6 h-6" />,
            image: "https://images.unsplash.com/photo-1558494949-efc5e60c94ef?q=80&w=2670&auto=format&fit=crop"
        },
        {
            id: "03",
            title: "Secure Logistics",
            subtitle: " insured door-to-door delivery",
            description: "High-value servers require high-care transport. We utilize specialized freight carriers with air-ride suspension and climate control to ensure your infrastructure arrives in perfect condition.",
            features: ["Real-time GPS Tracking", "Full Value Insurance", "White Glove Delivery"],
            icon: <Box className="w-6 h-6" />,
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary-light/20 selection:text-primary-dark"
        >
            <SEO
                title="Hardware Supply | UnioTech"
                description="Professional hardware procurement and logistics services."
            />

            {/* --- HERO SECTION: Centered + Background Image --- */}
            <header className="relative py-24 md:py-32 px-6 flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#213448]/90"></div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-medium/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-light/10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Label with Styled Lines */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 md:w-20 bg-gradient-to-l from-primary-light/60 to-transparent"></div>
                            <span className="text-primary-light font-bold tracking-widest uppercase text-sm md:text-base whitespace-nowrap">
                                Infrastructure Services
                            </span>
                            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-primary-light/60 to-transparent"></div>
                        </div>

                        {/* Breadcrumbs */}
                        <nav className="flex items-center justify-center gap-2 text-sm md:text-base font-medium text-gray-300">
                            <span
                                onClick={() => navigate('/')}
                                className="cursor-pointer hover:text-white transition-colors"
                            >
                                Home
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <span
                                onClick={() => navigate('/#services')}
                                className="cursor-pointer hover:text-white transition-colors"
                            >
                                Services
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <span className="text-white font-bold border-b border-primary-light/50 pb-0.5">
                                Hardware Supply
                            </span>
                        </nav>
                    </motion.div>
                </div>
            </header>

            {/* --- MAIN CONTENT: Zig-Zag Layout --- */}
            <main className="container mx-auto max-w-6xl px-6 py-24 space-y-32">
                {services.map((service, index) => (
                    <section key={service.id} className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>

                        {/* Image Side */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 w-full"
                        >
                            <div className="relative aspect-[4/3] group overflow-hidden bg-gray-100 rounded-3xl shadow-2xl shadow-gray-200/50">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </motion.div>

                        {/* Content Side */}
                        <motion.div
                            initial={{ x: index % 2 === 0 ? 50 : -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 w-full"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="p-3 bg-primary-light/10 text-primary-medium rounded-full">
                                    {service.icon}
                                </span>
                                <h4 className="text-primary-medium font-semibold uppercase tracking-wider text-sm">{service.subtitle}</h4>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{service.title}</h2>
                            <p className="text-lg text-gray-500 mb-8 leading-relaxed border-l-2 border-primary-light/30 pl-6">
                                {service.description}
                            </p>

                            <ul className="space-y-4 mb-10">
                                {service.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                                className="group flex items-center gap-2 text-primary-dark font-bold border-b-2 border-gray-200 hover:border-primary-medium pb-1 transition-colors"
                            >
                                {expandedSection === index ? 'Hide details' : 'Learn more details'}
                                {expandedSection === index ? (
                                    <ChevronDown className="w-5 h-5 transition-transform text-primary-medium" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                )}
                            </button>

                            {/* Rich Expanded Section */}
                            <AnimatePresence>
                                {expandedSection === index && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.35 }}
                                        className="mt-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-primary-light/30 shadow-xl space-y-6 text-left relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-light/10 rounded-full blur-3xl pointer-events-none"></div>

                                        {/* Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
                                            <div>
                                                <span className="text-xs font-black uppercase tracking-wider text-primary-medium block">
                                                    Overview & Deep Technical Details
                                                </span>
                                                <h3 className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                                                    {service.detailedHeading || `${service.title} — Full Hardware Procurement & Deployment`}
                                                </h3>
                                            </div>
                                            <span className="px-3 py-1 bg-primary-medium text-white text-xs font-bold rounded-full shadow-sm">
                                                {service.detailedBadge || 'Certified Hardware'}
                                            </span>
                                        </div>

                                        {/* Body Paragraphs */}
                                        <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-3">
                                            <p>
                                                {service.detailedDescription || (
                                                    `Our specialized infrastructure division provides end-to-end hardware procurement, stress-testing, and field installation for ${service.title}. Sourced directly through verified Tier-1 authorized distributor channels.`
                                                )}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-500">
                                                {service.additionalInfo || (
                                                    `Every unit passes rigorous burn-in tests, firmware compatibility verification, and carries full OEM manufacturer warranty with expedited on-site replacement SLA.`
                                                )}
                                            </p>
                                        </div>

                                        {/* Feature Badges / Highlights */}
                                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                                <span className="text-xs font-semibold text-gray-800">
                                                    {service.highlight1 || '100% Genuine OEM Certified'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-primary-medium shrink-0"></div>
                                                <span className="text-xs font-semibold text-gray-800">
                                                    {service.highlight2 || 'Same-Day Dispatch & Tracking'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                                <span className="text-xs font-semibold text-gray-800">
                                                    {service.highlight3 || 'Pre-Configured & Burn-in Tested'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                                                <span className="text-xs font-semibold text-gray-800">
                                                    {service.highlight4 || 'Comprehensive Replacement Warranty'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* CTA Bottom Bar */}
                                        <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                Direct Corporate Bulk Pricing
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEnquirySource(`Hardware: ${service.title}`);
                                                        setIsEnquiryOpen(true);
                                                    }}
                                                    className="text-xs md:text-sm bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95"
                                                >
                                                    Request Hardware Quote
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </section>
                ))}
            </main>

            {/* --- METRICS STRIP (Animated) --- */}
            <section className="bg-gray-900 text-white py-24 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Partner Brands", val: "50+" },
                            { label: "Delivery Success", val: "99.9%" },
                            { label: "Active Clients", val: "200+" },
                            { label: "Warranty Coverage", val: "3 Yrs" }
                        ].map((stat, idx) => (
                            <Counter key={idx} value={stat.val} label={stat.label} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- BOTTOM CTA: Full Width Light Modern --- */}
            <section className="py-20 bg-white relative overflow-hidden border-t border-gray-100">
                {/* Background Details */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-light/5 rounded-full blur-3xl -mr-[100px] -mt-[100px] pointer-events-none"></div>

                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                        {/* Text Content */}
                        <div className="lg:max-w-xl">
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                <div className="p-3 bg-gray-100 rounded-2xl">
                                    <Zap className="w-8 h-8 text-primary-medium" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to upgrade?</h2>
                            </div>
                            <p className="text-xl text-gray-500 leading-relaxed">
                                Don't let outdated hardware slow you down. Get a custom quote for your infrastructure needs in less than 4 hours.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <a
                                href="https://wa.me/919876543210"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-full shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 min-w-[200px]"
                            >
                                <MessageSquare className="w-5 h-5 fill-white" />
                                <span>WhatsApp Us</span>
                            </a>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-8 py-4 bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold rounded-full shadow-lg shadow-gray-200 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 min-w-[200px]"
                            >
                                <span>Get a Quote</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            {/* Enquiry Modal */}
            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                source={enquirySource || "Hardware Supply Service"}
            />
        </motion.div>
    );
};
export default HardwareSupply;