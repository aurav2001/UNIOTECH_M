import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageCircle, Lightbulb, FlaskConical, Rocket, ArrowRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';

// Icon mapping
const ICON_MAP = {
    'MessageCircle': MessageCircle,
    'Lightbulb': Lightbulb,
    'FlaskConical': FlaskConical,
    'Rocket': Rocket
};

const WorkFlow = () => {
    const { getContent } = useContent();
    const { items = [], title, subtitle, description, isVisible } = getContent('workflow');

    if (isVisible === false) return null;
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 75%", "end center"]
    });

    const safeItems = items && items.length > 0 ? items : [
        // Fallback items if no content
        { id: 1, title: 'Discussion', description: 'Consultation...', iconName: 'MessageCircle' }
    ];

    return (
        <section id="workflow" ref={containerRef} className="py-24 bg-white font-sans overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="mb-16 lg:text-center max-w-2xl mx-auto">
                    <h4 className="text-primary-medium font-bold uppercase tracking-widest text-sm mb-3">{subtitle || 'Our Process'}</h4>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary-dark mb-6">{title || 'How We Work'}</h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-primary-dark to-primary-light mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 text-lg">{description || 'A streamlined workflow designed to deliver excellence.'}</p>
                </div>

                <div className="relative">
                    {/* ========================================================= */}
                    {/* THE LINES (Desktop & Mobile Separate)                     */}
                    {/* ========================================================= */}

                    {/* MOBILE LINE (Vertical - Left Side) */}
                    <div className="lg:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100 rounded-full">
                        <motion.div
                            style={{ scaleY: scrollYProgress }}
                            className="absolute top-0 left-0 w-full h-full bg-primary-medium origin-top rounded-full"
                        />
                    </div>

                    {/* DESKTOP LINE (Horizontal - Top Side) */}
                    <div className="hidden lg:block absolute top-6 left-0 right-0 h-0.5 bg-gray-100 rounded-full mx-12">
                        <motion.div
                            style={{ scaleX: scrollYProgress }}
                            className="absolute top-0 left-0 h-full w-full bg-primary-medium origin-left rounded-full"
                        />
                    </div>

                    {/* ========================================================= */}
                    {/* STEPS CONTAINER                                           */}
                    {/* ========================================================= */}
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
                        {safeItems.map((step, index) => (
                            <TimelineItem
                                key={step.id || index}
                                step={step}
                                index={index}
                                total={safeItems.length}
                                scrollYProgress={scrollYProgress}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const TimelineItem = ({ step, index, total, scrollYProgress }) => {
    const stepStart = index / total;

    // Reactive colors - Theme: Dark #213448, Medium #547792, Light #94b4c1
    const iconColor = useTransform(scrollYProgress, [stepStart, stepStart + 0.1], ["#9CA3AF", "#213448"]); // Gray to Primary Dark
    const iconBg = useTransform(scrollYProgress, [stepStart, stepStart + 0.1], ["#F3F4F6", "#94b4c1"]); // Gray to Primary Light
    const borderColor = useTransform(scrollYProgress, [stepStart, stepStart + 0.1], ["#E5E7EB", "#547792"]); // Gray to Primary Medium

    const IconComponent = ICON_MAP[step.iconName] || MessageCircle;

    return (
        <div className="relative flex lg:flex-col lg:items-center lg:text-center group flex-1">

            {/* --- ICON NODE --- */}
            {/* Mobile: Absolute Left | Desktop: Relative Center */}
            <motion.div
                style={{ backgroundColor: iconBg, borderColor: borderColor }}
                className="
                    absolute left-8 lg:left-auto lg:relative
                    lg:mb-6
                    -translate-x-1/2 lg:translate-x-0
                    w-12 h-12 rounded-full border-4 flex items-center justify-center z-20 
                    transition-all duration-300
                "
            >
                <motion.div style={{ color: iconColor }}>
                    <IconComponent size={20} />
                </motion.div>
            </motion.div>

            {/* --- THE CARD --- */}
            {/* Mobile: Padding Left | Desktop: No Padding, Full Width */}
            <div className="pl-20 lg:pl-0 w-full">
                <div
                    className="
                        p-6 rounded-xl transition-all duration-300 ease-in-out cursor-default
                        border-2 border-transparent bg-white
                        hover:border-primary-light/50 hover:bg-primary-light/10 hover:shadow-xl
                        group-hover:-translate-y-1 lg:group-hover:-translate-y-2
                        h-full flex flex-col justify-center lg:items-center
                    "
                >
                    <div className="flex items-center lg:justify-center justify-between mb-2 w-full">
                        <span className="text-xs font-bold tracking-wider text-primary-medium uppercase">Step 0{index + 1}</span>
                        {/* Arrow only shows on hover */}
                        <ArrowRight className="w-4 h-4 text-primary-medium opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </div>

                    <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-primary-medium transition-colors">
                        {step.title}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-600">
                        {step.description || step.desc}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WorkFlow;