import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import * as LucideIcons from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal.jsx';

// ... (keep constant destructuring)

const {
    ChevronRight,
    ChevronDown,
    MessageSquare,
    Zap,
    CheckCircle,
    ArrowUpRight,
    FileText,
    Share2,
    Printer,
    Bookmark,
    Copy,
    Check
} = LucideIcons;

const Counter = ({ value, label, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    // Check if value is numeric (e.g., "100%", "50+", "1000")
    const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
    const isNumeric = !isNaN(numericPart) && numericPart > 0 && /\d/.test(value);

    useEffect(() => {
        if (isInView && isNumeric) {
            const controls = animate(count, numericPart, { duration: 2, ease: "easeOut" });
            return controls.stop;
        }
    }, [isInView, numericPart, count, isNumeric]);

    return (
        <div ref={ref} className="border-l-4 border-blue-600 pl-4">
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1 flex items-baseline gap-1">
                {isNumeric ? (
                    <>
                        <motion.span>{rounded}</motion.span>
                        <span>{value.replace(/[0-9.]/g, '') || suffix}</span>
                    </>
                ) : (
                    <span>{value}</span>
                )}
            </h3>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{label}</p>
        </div>
    );
};

const UnioTechLayout = ({ page }) => {
    const navigate = useNavigate();
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [enquirySource, setEnquirySource] = useState('');
    const [copied, setCopied] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    // Default sections if none provided
    const sections = page.sections || [];
    const stats = page.stats || [];

    // ... (keep handlers)

    const handleGetQuote = () => {
        // Dynamic CTA Action
        if (page.ctaAction === 'whatsapp' && page.ctaValue) {
            const message = `Hi, I'm interested in ${page.title || 'UnioTech Services'}`;
            window.open(`https://wa.me/${page.ctaValue}?text=${encodeURIComponent(message)}`, '_blank');
            return;
        }

        if (page.ctaAction === 'link' && page.ctaValue) {
            if (page.ctaValue.startsWith('http')) {
                window.open(page.ctaValue, '_blank');
            } else {
                navigate(page.ctaValue);
            }
            return;
        }

        // Default Modal
        setEnquirySource(`Service: ${page.title}`);
        setIsEnquiryOpen(true);
    };

    const handleShare = async () => {
        // ... (keep handleShare implementation same as original)
        const url = window.location.href;
        const title = page.title || 'UnioTech IT Solutions';

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: page.subtitle || 'Check out this page from UnioTech',
                    url: url
                });
            } catch (err) {
                // User cancelled or failed
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                alert('URL copied to clipboard!');
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-50 selection:text-blue-900"
        >
            <SEO
                title={page.seo?.title || page.title}
                description={page.seo?.description || page.subtitle}
                keywords={page.seo?.keywords}
                url={page.seo?.url}
            />

            {/* --- HERO SECTION (Modern Header) --- */}
            <header className="relative bg-gradient-to-b from-gray-50 to-white pt-20 pb-12 px-6">
                <div className="container mx-auto max-w-[1200px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-3xl"
                        >
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-4 bg-blue-50 w-fit px-3 py-1 rounded-full">
                                <span onClick={() => navigate('/')} className="cursor-pointer hover:underline">Home</span>
                                <span>/</span>
                                <span>{page.type || 'Service'}</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                                {page.title}
                            </h1>
                            <p className="text-xl text-gray-500 font-light leading-relaxed">
                                {page.subtitle || 'Comprehensive product details and specifications.'}
                            </p>
                        </motion.div>

                        {/* Action Tools (Modern Pills) */}
                        <div className="hidden md:flex gap-3 shrink-0">
                            {/* REMOVED PRINT BUTTON AS REQUESTED */}

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 rounded-full text-sm font-medium shadow-sm transition-all active:scale-95"
                                title="Share"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                                {copied ? 'Copied' : 'Share'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT LAYOUT --- */}
            <main className="container mx-auto max-w-[1200px] px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* LEFT COLUMN: Main Articles */}
                    <article className="flex-1 min-w-0">



                        {sections.length === 0 && !page.content && (
                            <div className="bg-gray-50 p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                                Content under development.
                            </div>
                        )}

                        {sections.map((section, index) => {
                            // === PARAGRAPH SECTION (Modern Float) ===
                            if (section.type === 'paragraph' || !section.type || section.type === 'content') {
                                return (
                                    <motion.section
                                        key={index}
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5 }}
                                        className="mb-10 group"
                                    >
                                        {(section.heading || section.title) && (
                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-8 clear-both flex items-center gap-3">
                                                <span className="w-8 h-1 bg-blue-600 rounded-full block"></span>
                                                {(section.heading || section.title).replace(/\bSection\s*\(Grid\s*Layout\)/gi, '').trim() || 'Key Features'}
                                            </h2>
                                        )}

                                        {/* TEXT CONTENT WRAPPER */}
                                        <div className="prose prose-lg prose-slate max-w-none text-gray-600 leading-8 font-normal">
                                            <style>{`
                                                    .rich-content { overflow-wrap: break-word; word-wrap: break-word; hyphens: none; -webkit-hyphens: none; }
                                                    .rich-content p { margin-bottom: 1.5em; word-break: normal; hyphens: none; }
                                                    .rich-content strong { color: #111827; font-weight: 700; }
                                                    .rich-content a { color: #2563eb; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; overflow-wrap: break-word; word-break: normal; hyphens: none; }
                                                    .rich-content a:hover { border-bottom-color: #2563eb; }
                                                    .rich-content ul { list-style-type: none; padding-left: 0; margin-bottom: 1.5em; }
                                                    .rich-content li { padding-left: 1.5em; position: relative; margin-bottom: 0.5em; word-break: normal; hyphens: none; }
                                                    .rich-content li::before { content: "•"; color: #3b82f6; position: absolute; left: 0; font-weight: bold; }
                                                    .ql-align-justify { text-align: left !important; }
                                                `}</style>

                                            {/* FLOATING IMAGE (Moved inside prose for wrapping) */}
                                            {section.image && (
                                                <figure className="float-right ml-6 mb-6 w-full sm:w-[320px] md:w-[380px] lg:w-[420px] group-hover:translate-y-[-2px] transition-transform duration-300 not-prose">
                                                    <div className="rounded-2xl overflow-hidden shadow-xl shadow-blue-900/5 ring-1 ring-black/5">
                                                        <img
                                                            src={section.image}
                                                            alt={section.heading ? section.heading.replace(/\bSection\s*\(Grid\s*Layout\)/gi, '').trim() : "Illustration"}
                                                            className="w-full h-auto object-cover bg-gray-100"
                                                        />
                                                    </div>
                                                    {section.heading && (
                                                        <figcaption className="mt-3 text-sm text-gray-500 font-medium px-2 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                            {section.heading.replace(/\bSection\s*\(Grid\s*Layout\)/gi, '').trim() || 'Illustration'}
                                                        </figcaption>
                                                    )}
                                                </figure>
                                            )}

                                            {/* COMBINED TEXT CONTENT */}
                                            <div className="rich-content" style={{ hyphens: 'none', WebkitHyphens: 'none', wordBreak: 'normal' }}>
                                                {/* Intro Text (if exists) */}
                                                {section.introText && (
                                                    <div dangerouslySetInnerHTML={{ __html: section.introText.replace(/\n/g, '<br/>') }} />
                                                )}

                                                {/* Main Content */}
                                                <div dangerouslySetInnerHTML={{ __html: (section.content || section.description || '').replace(/\n/g, '<br/>') }} />
                                            </div>
                                        </div>

                                        {/* FEATURES LIST (Modern Grid) */}
                                        {section.features && section.features.length > 0 && (
                                            <div className="clear-both mt-8 bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Key Features</h4>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {section.features.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-gray-700 font-medium">
                                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Learn More Details Expand Button */}
                                        <div className="clear-both pt-6">
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                                                className="group inline-flex items-center gap-2 text-blue-600 font-bold border-b-2 border-transparent hover:border-blue-600 pb-1 transition-colors text-sm"
                                            >
                                                {expandedSection === index ? 'Hide details' : 'Learn more details'}
                                                {expandedSection === index ? (
                                                    <ChevronDown className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
                                                        className="mt-6 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-blue-200 shadow-lg space-y-6 text-left relative overflow-hidden"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 pb-4">
                                                            <div>
                                                                <span className="text-xs font-black uppercase tracking-wider text-blue-600 block">
                                                                    Overview & Deep Technical Details
                                                                </span>
                                                                <h3 className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                                                                    {section.detailedHeading || `${section.heading || section.title} — Full Execution & Architecture`}
                                                                </h3>
                                                            </div>
                                                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                                                                {section.detailedBadge || 'Enterprise Solution'}
                                                            </span>
                                                        </div>

                                                        {/* Body Paragraphs */}
                                                        <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-3">
                                                            <p>
                                                                {section.detailedDescription || (
                                                                    `Our dedicated engineering department handles complete planning, provisioning, and proactive management for ${section.heading || section.title}. We ensure full compatibility across existing IT infrastructure, robust multi-layer data protection, and minimal operational downtime.`
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
                                                                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
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
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* DATA TABLE (for Full Section type) */}
                                        {section.hasTable && section.columns && section.rows && (
                                            <div className="clear-both mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                                {section.tableTitle && (
                                                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                                        <h3 className="text-lg font-bold text-gray-900">{section.tableTitle}</h3>
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                                                            <tr>
                                                                {section.columns.map((col, colIdx) => (
                                                                    <th key={colIdx} className="px-6 py-4 font-semibold tracking-wider">
                                                                        {col}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {section.rows.map((row, rowIdx) => (
                                                                <tr key={rowIdx} className="group border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                                                    {row.map((cell, cellIdx) => (
                                                                        <td key={cellIdx} className={`px-6 py-4 text-gray-600 group-hover:text-gray-900 ${cellIdx === 0 ? 'font-medium text-gray-900' : ''}`}>
                                                                            {cell}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                    </motion.section>
                                );
                            }

                            // === TABLE SECTION (Modern Data Card) ===
                            if (section.type === 'table') {
                                return (
                                    <motion.section
                                        key={index}
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        className="mb-12"
                                    >
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                                <h2 className="text-lg font-bold text-gray-900">
                                                    {section.title || 'Technical Specifications'}
                                                </h2>
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                                                        <tr>
                                                            {(section.columns || []).map((col, colIdx) => (
                                                                <th key={colIdx} className="px-6 py-4 font-semibold tracking-wider">
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(section.rows || []).map((row, rowIdx) => (
                                                            <tr key={rowIdx} className="group border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                                                {(row || []).map((cell, cellIdx) => (
                                                                    <td key={cellIdx} className={`px-6 py-4 text-gray-600 group-hover:text-gray-900 ${cellIdx === 0 ? 'font-medium text-gray-900' : ''}`}>
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </motion.section>
                                );
                            }
                            // === FAQ SECTION ===
                            if (section.type === 'faq') {
                                return (
                                    <motion.section
                                        key={index}
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        className="mb-12"
                                    >
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                            <span className="w-8 h-1 bg-blue-600 rounded-full block"></span>
                                            {section.heading || 'Frequently Asked Questions'}
                                        </h2>
                                        <div className="space-y-4">
                                            {section.items.map((faq, i) => (
                                                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-colors">
                                                    <h3 className="font-bold text-lg text-gray-900 mb-2">{faq.question}</h3>
                                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.section>
                                );
                            }

                            return null;
                        })}


                        {/* --- STATS STRIP (Modern) --- */}
                        {stats.length > 0 && (
                            <section className="mt-16 mb-12 py-10 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                                    {stats.map((stat, idx) => (
                                        <Counter key={idx} value={stat.value} label={stat.label} />
                                    ))}
                                </div>
                            </section>
                        )}

                    </article>

                    {/* RIGHT COLUMN: Modern Sidebar */}
                    <aside className="lg:w-[340px] shrink-0">
                        <div className="sticky top-24 space-y-8">

                            {/* DYNAMIC QUICK INFO BOX */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Bookmark className="text-blue-600" size={20} />
                                    {page.sidebarTitle || 'Quick Info'}
                                </h3>
                                <div className="space-y-4 text-sm text-gray-600">
                                    {page.sidebarContent ? (
                                        <p className="whitespace-pre-wrap">{page.sidebarContent}</p>
                                    ) : (
                                        <>
                                            <p><strong>Category:</strong> {page.type || 'Service'}</p>
                                            <p><strong>Updated:</strong> {new Date().toLocaleDateString()}</p>
                                            <div className="h-px bg-gray-200 my-4" />
                                            <p className="italic">"{page.subtitle}"</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* CTA Box - High Contrast */}
                            <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl shadow-gray-900/20 text-white relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all duration-500"></div>

                                <h3 className="text-xl font-bold mb-2 relative z-10">Ready to start?</h3>
                                <p className="text-gray-400 text-sm mb-6 relative z-10 leading-relaxed">
                                    Transform your business with our enterprise-grade solution.
                                </p>

                                <div className="space-y-3 relative z-10">
                                    <button
                                        onClick={handleGetQuote}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Get Quotation
                                        <ArrowUpRight size={18} />
                                    </button>
                                    <a
                                        href="https://wa.me/919810443288"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                                    >
                                        <MessageSquare size={18} />
                                        WhatsApp Chat
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div >
            </main >

            {/* Modern Footer Cites */}
            < footer className="border-t border-gray-100 py-10 mt-10" >
                <div className="container mx-auto px-6 flex flex-col items-center">
                    <div className="text-blue-600 font-bold tracking-tight text-lg mb-2">UnioTech</div>
                    <p className="text-sm text-gray-500">© {new Date().getFullYear()} Enterprise Solutions. Designed for scale.</p>
                </div>
            </footer >

            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                source={enquirySource}
            />
        </motion.div >
    );
};

export default UnioTechLayout;
