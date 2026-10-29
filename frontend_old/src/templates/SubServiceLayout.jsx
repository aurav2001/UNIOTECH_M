import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal.jsx';
import SEO from '../components/SEO';

const {
    ChevronRight,
    ChevronDown,
    MessageSquare,
    Zap,
    CheckCircle,
    ArrowUpRight
} = LucideIcons;

const Counter = ({ value, label, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        if (isInView) {
            const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
            const controls = animate(count, numericValue, { duration: 2, ease: "easeOut" });
            return controls.stop;
        }
    }, [isInView, value, count]);

    return (
        <div ref={ref} className="border-l border-gray-700 first:border-0 pl-12 md:pl-0">
            <h3 className="text-4xl md:text-5xl font-bold text-primary-medium mb-2 flex justify-center items-center gap-1">
                <motion.span suppressHydrationWarning>{rounded}</motion.span>
                <span>{value.replace(/[0-9.]/g, '') || suffix}</span>
            </h3>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">{label}</p>
        </div>
    );
};

const SubServiceLayout = ({ page }) => {
    const navigate = useNavigate();
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [enquirySource, setEnquirySource] = useState('');
    const [expandedSection, setExpandedSection] = useState(null);

    // Default sections if none provided (for safety)
    const sections = page.sections || [];
    const stats = page.stats || [];

    // Icon helper
    const getIcon = (iconName) => {
        const IconComponent = LucideIcons[iconName] || LucideIcons.Box; // Fallback
        return <IconComponent className="w-6 h-6" />;
    };

    const handleGetQuote = () => {
        setEnquirySource(`Service: ${page.title}`);
        setIsEnquiryOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary-light/20 selection:text-primary-dark overflow-x-hidden"
        >
            <SEO
                title={page.seo?.title || page.title}
                description={page.seo?.description || page.subtitle || "Uniotech IT Solutions Service Page"}
                keywords={page.seo?.keywords}
                url={page.seo?.url}
            />
            {/* --- HERO SECTION --- */}
            <header className="relative py-24 md:py-32 px-6 flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={page.heroImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"}
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
                                {page.subtitle || 'Services'}
                            </span>
                            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-primary-light/60 to-transparent"></div>
                        </div>

                        {/* Breadcrumbs */}
                        <nav className="flex items-center justify-center gap-2 text-sm md:text-base font-medium text-gray-300">
                            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-white transition-colors">Home</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <span onClick={() => navigate('/#services')} className="cursor-pointer hover:text-white transition-colors">Services</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <span className="text-white font-bold border-b border-primary-light/50 pb-0.5">{page.title}</span>
                        </nav>
                    </motion.div>
                </div>
            </header>

            {/* --- MAIN CONTENT: Dynamic Sections --- */}
            <main className="container mx-auto max-w-6xl px-6 py-24 space-y-32">
                {sections.map((section, index) => {
                    // === PARAGRAPH SECTION ===
                    if (section.type === 'paragraph') {
                        const isHtml = (text) => /<[a-z][\s\S]*>/i.test(text);
                        return (
                            <motion.section
                                key={index}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="max-w-6xl mx-auto"
                            >
                                {section.heading && (
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                                        {section.heading}
                                    </h2>
                                )}

                                <div className={`flex flex-col ${section.image ? 'lg:flex-row' : ''} gap-8 items-start`}>
                                    {section.image && (
                                        <div className="w-full lg:w-1/3 shrink-0">
                                            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                                                <img
                                                    src={section.image}
                                                    alt={section.heading || "Section Image"}
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className={`w-full ${section.image ? 'lg:flex-1' : ''} min-w-0`}>
                                        {isHtml(section.content) ? (
                                            <div
                                                className="prose prose-blue prose-sm max-w-none text-gray-600 leading-relaxed overflow-hidden [&_table]:w-full [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                                                style={{ hyphens: 'none', WebkitHyphens: 'none', wordBreak: 'normal' }}
                                                dangerouslySetInnerHTML={{ __html: section.content }}
                                            />
                                        ) : (
                                            <div className="prose prose-blue prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed" style={{ hyphens: 'none', WebkitHyphens: 'none', wordBreak: 'normal' }}>
                                                {section.content?.split('\n').map((paragraph, pIdx) => (
                                                    paragraph.trim() && (
                                                        <p key={pIdx} className="mb-4">
                                                            {paragraph}
                                                        </p>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.section>
                        );
                    }

                    // === TABLE SECTION ===
                    if (section.type === 'table') {
                        return (
                            <motion.section
                                key={index}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="w-full"
                            >
                                {section.title && (
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                                        {section.title}
                                    </h2>
                                )}

                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="w-full border-collapse bg-white">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-primary-dark to-[#213448]">
                                                {(section.columns || []).map((col, colIdx) => (
                                                    <th
                                                        key={colIdx}
                                                        className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider border-b border-gray-200"
                                                    >
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(section.rows || []).map((row, rowIdx) => (
                                                <tr
                                                    key={rowIdx}
                                                    className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary-light/5 transition-colors`}
                                                >
                                                    {(row || []).map((cell, cellIdx) => (
                                                        <td
                                                            key={cellIdx}
                                                            className="px-6 py-4 text-gray-700 border-b border-gray-100"
                                                        >
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {(section.rows || []).map((row, rowIdx) => (
                                        <div
                                            key={rowIdx}
                                            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                                        >
                                            {(row || []).map((cell, cellIdx) => (
                                                <div key={cellIdx} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                                    <span className="font-medium text-gray-500 text-sm">
                                                        {section.columns?.[cellIdx] || `Column ${cellIdx + 1}`}
                                                    </span>
                                                    <span className="text-gray-900 font-medium text-right">
                                                        {cell}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        );
                    }

                    // === CONTENT SECTION (Original Zig-Zag) ===
                    return (
                        <section key={index} className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Image Side */}
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="lg:w-1/2 w-full"
                            >
                                <div className="overflow-hidden border-2 border-gray-200">
                                    <img
                                        src={section.image}
                                        alt={section.title}
                                        className="w-full h-auto block"
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
                                        {getIcon(section.icon)}
                                    </span>
                                    <h4 className="text-primary-medium font-semibold uppercase tracking-wider text-sm">{section.subtitle}</h4>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{section.title}</h2>
                                <p className="text-lg text-gray-500 mb-8 leading-relaxed border-l-2 border-primary-light/30 pl-6">
                                    {section.description}
                                </p>

                                <ul className="space-y-4 mb-10">
                                    {(section.features || []).map((feature, i) => (
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
                                                        {section.detailedHeading || `${section.title} — Full Execution & Architecture`}
                                                    </h3>
                                                </div>
                                                <span className="px-3 py-1 bg-primary-medium text-white text-xs font-bold rounded-full shadow-sm">
                                                    {section.detailedBadge || 'Enterprise Solution'}
                                                </span>
                                            </div>

                                            {/* Body Paragraphs */}
                                            <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-3">
                                                <p>
                                                    {section.detailedDescription || (
                                                        `Our dedicated engineering department handles complete planning, provisioning, and proactive management for ${section.title}. We ensure full compatibility across existing IT infrastructure, robust multi-layer data protection, and minimal operational downtime.`
                                                    )}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-500">
                                                    {section.additionalInfo || (
                                                        `Includes SLA-backed uptime monitoring, regular vulnerability checks, automated patches, and direct escalation channels with our senior support specialists.`
                                                    )}
                                                </p>
                                            </div>

                                            {/* Feature Badges / Highlights */}
                                            <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                                <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                                    <span className="text-xs font-semibold text-gray-800">
                                                        {section.highlight1 || '24/7 Monitoring & Rapid SLA'}
                                                    </span>
                                                </div>
                                                <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                    <div className="w-2 h-2 rounded-full bg-primary-medium shrink-0"></div>
                                                    <span className="text-xs font-semibold text-gray-800">
                                                        {section.highlight2 || 'Dedicated Certified Engineers'}
                                                    </span>
                                                </div>
                                                <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                                    <span className="text-xs font-semibold text-gray-800">
                                                        {section.highlight3 || 'Full Compliance & Data Security'}
                                                    </span>
                                                </div>
                                                <div className="p-3 bg-white rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-2.5">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                                                    <span className="text-xs font-semibold text-gray-800">
                                                        {section.highlight4 || 'Seamless Integration & Support'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CTA Bottom Bar */}
                                            <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    Guaranteed Professional Implementation
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEnquirySource(`${page.title} - ${section.title}`);
                                                            setIsEnquiryOpen(true);
                                                        }}
                                                        className="text-xs md:text-sm bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95"
                                                    >
                                                        Request Custom Proposal
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </section>
                    );
                })}
            </main>

            {/* --- METRICS STRIP --- */}
            {stats.length > 0 && (
                <section className="bg-gray-900 text-white py-24 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    <div className="container mx-auto px-6 max-w-6xl relative z-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                            {stats.map((stat, idx) => (
                                <Counter key={idx} value={stat.value} label={stat.label} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* --- BOTTOM CTA --- */}
            <section className="py-20 bg-white relative overflow-hidden border-t border-gray-100">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-light/5 rounded-full blur-3xl -mr-[100px] -mt-[100px] pointer-events-none"></div>

                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
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

                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <a
                                href="https://wa.me/919810443288"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-full shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 min-w-[200px]"
                            >
                                <MessageSquare className="w-5 h-5 fill-white" />
                                <span>WhatsApp Us</span>
                            </a>
                            <button
                                onClick={handleGetQuote}
                                className="px-8 py-4 bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold rounded-full shadow-lg shadow-gray-200 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 min-w-[200px]"
                            >
                                <span>Get a Quote</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                source={enquirySource}
            />
        </motion.div>
    );
};

export default SubServiceLayout;
