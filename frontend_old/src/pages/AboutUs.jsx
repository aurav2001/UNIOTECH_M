import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

import { Users, Globe, Award, CheckCircle, ArrowRight, Rocket, Shield, ChevronDown, Target, Calendar, Zap } from 'lucide-react';
import SEO from '../components/SEO';

import { useContent } from '../context/ContentContext';

// --- Reusable Components ---

const SectionHeader = ({ title, subtitle }) => (
    <div className="text-center mb-10 md:mb-16 px-4">
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-medium font-bold tracking-widest uppercase text-xs md:text-sm"
        >
            {subtitle}
        </motion.span>
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mt-2"
        >
            {title}
        </motion.h2>
        <div className="w-16 md:w-20 h-1.5 bg-primary-light mx-auto mt-4 md:mt-6 rounded-full opacity-50"></div>
    </div>
);

const TimelineItem = ({ year, title, desc, align }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        // Mobile: Flex-row (content right of line). Desktop: Alternating based on 'align'.
        <div ref={ref} className={`flex items-start md:items-center justify-between w-full mb-8 md:mb-12 ${align === 'left' ? 'md:flex-row-reverse' : ''} relative`}>

            {/* Desktop Spacer (Hidden on Mobile) */}
            <div className="hidden md:block w-5/12"></div>

            {/* Dot Indicator */}
            {/* Mobile: Absolute left. Desktop: Relative center. */}
            <div className="absolute left-0 md:static md:left-auto z-20 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-primary-dark rounded-full border-4 border-white shadow-lg shrink-0 md:transform-none transform -translate-x-[18px] md:translate-x-0 mt-1 md:mt-0">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full" />
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
                transition={{ duration: 0.5 }}
                // Mobile: Full width with left padding. Desktop: 5/12 width.
                className="w-full md:w-5/12 bg-white p-5 md:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow ml-8 md:ml-0"
            >
                <span className="text-primary-dark font-black text-xl md:text-2xl block mb-1">{year}</span>
                <h4 className="text-lg font-bold text-gray-900 leading-tight">{title}</h4>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{desc}</p>
            </motion.div>
        </div>
    );
};

const Counter = ({ value, label, icon: Icon }) => {
    const ref = useRef(null);
    const motionValue = useSpring(0, { duration: 2000 });
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            const number = parseInt(value.replace(/[^0-9]/g, ''));
            motionValue.set(number);
        }
    }, [isInView, motionValue, value]);

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        return motionValue.on("change", (latest) => {
            setDisplayValue(Math.floor(latest));
        });
    }, [motionValue]);

    const suffix = value.replace(/[0-9]/g, '');

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="text-center p-6 md:p-8 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
        >
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-medium group-hover:scale-110 transition-transform">
                <Icon size={24} className="md:w-8 md:h-8" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 flex justify-center items-center">
                {displayValue}
                <span className="text-primary-medium">{suffix}</span>
            </h3>
            <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px] md:text-xs">{label}</p>
        </motion.div>
    );
};

// --- Main Component ---

const AboutUs = () => {
    const { getContent } = useContent();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    const heroTitle = getContent('about', 'heroTitle', 'We Are UnioTech IT');
    const heroSubtitle = getContent('about', 'heroSubtitle', 'Architecting the digital future.');
    const heroImage = getContent('about', 'heroImage', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop');
    const missionTitle = getContent('about', 'missionTitle', 'Building the Future, Today.');
    const missionText = getContent('about', 'missionText', 'Our mission goes beyond just maintaining systems. We architect resilient digital ecosystems that drive growth.');
    const yearsTitle = getContent('about', 'yearsTitle', 'Our Journey');
    const yearsSubtitle = getContent('about', 'yearsSubtitle', 'How we started');

    // Fetch lists with fallbacks
    const timeline = getContent('about', 'timeline', [
        { year: '2018', title: 'The Inception', desc: 'Founded in a small garage with a vision to simplify enterprise IT solutions.' },
        { year: '2020', title: 'Global Expansion', desc: 'Despite global challenges, we expanded our operations to 3 continents.' },
        { year: '2023', title: 'Tech Innovation Award', desc: "Recognized as the 'Top Tech Innovator' for our cloud framework." },
        { year: '2025', title: 'The Future is Now', desc: 'Launching our AI-driven division to help businesses automate workflows.' }
    ]);

    const values = getContent('about', 'values', [
        { icon: 'Rocket', title: "Innovation First", text: "Leveraging AI and Cloud to stay ahead." },
        { icon: 'Shield', title: "Zero-Trust Security", text: "Proactive defense for critical assets." },
        { icon: 'Users', title: "Client-Centric", text: "Your success is our only metric." }
    ]);

    const stats = getContent('about', 'stats', [
        { icon: 'Users', label: "Happy Clients", value: "500+" },
        { icon: 'CheckCircle', label: "Projects Done", value: "1200+" },
        { icon: 'Globe', label: "Countries Served", value: "15+" },
        { icon: 'Award', label: "Awards Won", value: "25+" }
    ]);

    // Icon mapping helper since we save icon names as strings
    const getIcon = (iconName) => {
        const icons = { Users, Globe, Award, CheckCircle, Rocket, Shield };
        return icons[iconName] || Users; // Default to Users if not found
    };

    return (
        <div className="bg-white min-h-screen overflow-x-hidden font-sans pt-16 md:pt-0">
            <SEO
                title="About Uniotech IT Solutions | Trusted IT Partner"
                description="Learn about Uniotech IT Solutions, a trusted provider of managed IT services, cybersecurity, cloud solutions, and enterprise support. Trusted by 500+ clients."
                keywords="About Uniotech, IT Company Profile, Managed Service Provider, IT Consultants"
                url="https://uniotechit.com/about"
            />

            {/* --- HERO SECTION --- */}
            <div ref={heroRef} className="relative h-[70vh] md:h-[85vh] flex items-center justify-center bg-gray-900 overflow-hidden">
                <motion.div style={{ y: yHero }} className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt="Team collaboration"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-gray-900/80"></div>
                </motion.div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                            {heroTitle}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-xl md:max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10 font-light px-4">
                            {heroSubtitle}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute -bottom-24 md:-bottom-32 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block"
                    >
                        <ChevronDown size={32} />
                    </motion.div>
                </div>
            </div>

            {/* --- STORY / TIMELINE SECTION --- */}
            <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
                    <SectionHeader title={yearsTitle} subtitle={yearsSubtitle} />

                    <div className="relative max-w-5xl mx-auto">
                        {/* Timeline Vertical Line: Left on Mobile, Center on Desktop */}
                        <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>

                        {timeline.map((item, index) => (
                            <TimelineItem
                                key={index}
                                align={index % 2 === 0 ? 'right' : 'left'}
                                year={item.year}
                                title={item.title}
                                desc={item.desc}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MISSION & VALUES --- */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                    <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="order-2 lg:order-1"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                                {missionTitle}
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
                                {missionText}
                            </p>

                            <div className="grid gap-4 md:gap-6">
                                {values.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 5 }}
                                        className="flex items-start md:items-center gap-4 p-4 rounded-xl bg-gray-50/50 md:bg-transparent md:hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                    >
                                        <div className="bg-primary-light/10 p-3 rounded-lg text-primary-dark shrink-0">
                                            {/* Dynamic Icon Rendering */}
                                            {(() => {
                                                // Handle both direct import or string name
                                                const IconComponent = typeof item.icon === 'string' ? getIcon(item.icon) : item.icon;
                                                return <IconComponent size={20} className="md:w-6 md:h-6" />;
                                            })()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm md:text-base">{item.title}</h4>
                                            <p className="text-gray-500 text-xs md:text-sm mt-0.5">{item.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Success Rate Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 md:mt-10 inline-flex items-center gap-4 md:gap-5 p-4 md:p-6 rounded-[2rem] bg-white border border-gray-100 shadow-xl w-full md:w-auto justify-center md:justify-start"
                            >
                                <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                                        <motion.circle
                                            cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-primary-medium"
                                            strokeDasharray="280"
                                            strokeDashoffset="280"
                                            whileInView={{ strokeDashoffset: 280 - (280 * 0.99) }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg md:text-xl font-bold text-gray-900">99%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Success Rate</p>
                                    <p className="text-base md:text-lg font-bold text-gray-900 leading-tight">Project<br />Delivery</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative order-1 lg:order-2"
                        >
                            <div className="absolute inset-0 bg-primary-medium rounded-3xl transform rotate-3 opacity-20 blur-xl"></div>
                            <img
                                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
                                alt="Our Mission"
                                className="relative rounded-3xl shadow-2xl w-full object-cover h-[300px] md:h-[500px]"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="py-16 md:py-20 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
                    <SectionHeader title="Our Impact" subtitle="By the numbers" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {stats.map((stat, index) => {
                            const IconComponent = typeof stat.icon === 'string' ? getIcon(stat.icon) : stat.icon;
                            return (
                                <Counter
                                    key={index}
                                    label={stat.label}
                                    value={stat.value}
                                    icon={IconComponent}
                                />
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-20 md:py-32 bg-gray-50">
                <div className="container mx-auto px-6 md:px-12 lg:px-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8">
                            Ready to <span className="text-primary-medium">Transform</span> Your Business?
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-10 px-4">
                            Join hundreds of innovative companies who trust UnioTech IT.
                        </p>
                        <div className="flex justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary-dark text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-gray-800 transition-all shadow-xl shadow-primary-dark/20 flex items-center gap-2"
                            >
                                Get in Touch <ArrowRight size={20} />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;