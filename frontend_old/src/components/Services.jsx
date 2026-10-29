import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Monitor, Server, Shield, Database, Cloud, Mail, Users, FileText, Wifi,
    Briefcase, TrendingUp, Lightbulb, ClipboardCheck, Layers, HardDrive,
    Lock, CloudRain, ArrowLeftRight, AtSign, UserCog, Radio,
    ArrowRight, Phone, MessageSquare
} from 'lucide-react';

import { useContent } from '../context/ContentContext';
import EnquiryModal from './EnquiryModal';
import ContactChoiceModal from './ContactChoiceModal';
import Skeleton from './Skeleton';

// Map icon names to components
const ICON_MAP = {
    'Monitor': Monitor,
    'Server': Server,
    'Shield': Shield,
    'Database': Database,
    'Cloud': Cloud,
    'Mail': Mail,
    'Users': Users,
    'FileText': FileText,
    'Wifi': Wifi,
    'Briefcase': Briefcase,
    'TrendingUp': TrendingUp,
    'Lightbulb': Lightbulb,
    'ClipboardCheck': ClipboardCheck,
    'Layers': Layers,
    'HardDrive': HardDrive,
    'Lock': Lock,
    'CloudRain': CloudRain,
    'ArrowLeftRight': ArrowLeftRight,
    'AtSign': AtSign,
    'UserCog': UserCog,
    'Radio': Radio
};

const Services = () => {
    const [showAll, setShowAll] = useState(false);
    const { getContent, loading } = useContent();

    const title = getContent('services', 'title', 'Comprehensive IT Ecosystem Solutions');
    const subtitle = getContent('services', 'subtitle', 'Our Expertise');
    const description = getContent('services', 'description', 'Tailored technology services designed to accelerate your business growth and ensure robust operational security.');
    const servicesData = getContent('services');
    const { isVisible } = servicesData || {};

    // Modal states
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [isContactChoiceOpen, setIsContactChoiceOpen] = useState(false);
    const [enquirySource, setEnquirySource] = useState('Consultation');

    if (isVisible === false) return null;

    // Default services fallback
    const defaultServices = [
        { title: "Hardware Supply", desc: "Lenovo, Dell, HP, IBM, QNAP", iconName: "Server", path: "/services/hardware-supply" },
        { title: "Server Support", desc: "Physical Server, Nutanix, Hypervisor", iconName: "Database", path: "/services/server-support" },
        { title: "Networking", desc: "Active/Passive, CCTV, Biometric", iconName: "Wifi", path: "/services/networking" },
        { title: "AMC Support", desc: "Firewall, Server, Desktop Support", iconName: "FileText", path: "/services/amc-support" },
        { title: "Software Solutions", desc: "Adobe, MongoDB, Office 365", iconName: "Monitor", path: "/services/software-solutions" },
        { title: "Cybersecurity", desc: "Sophos, Fortinet, SSL, Firewall", iconName: "Shield", path: "/services/cybersecurity" },
        { title: "Cloud & Backup", desc: "Azure, AWS, Acronis, Veeam", iconName: "Cloud", path: "/services/cloud-backup" },
        { title: "Migration & Email", desc: "Server/Email Migration, O365", iconName: "Mail", path: "/services/migration-email" },
        { title: "Managed IT Services", desc: "Virtual IT Manager", iconName: "Users", path: "/services/managed-it-services" }
    ];

    // Get services from admin-managed content or use defaults
    const serviceList = (servicesData?.items && servicesData.items.length > 0)
        ? servicesData.items
        : defaultServices;

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                {/* Unique Header Design - Left Aligned */}
                <div className="mb-20 text-left max-w-3xl">
                    <h4 className="text-primary-medium font-bold uppercase tracking-widest text-sm mb-3">{subtitle}</h4>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary-dark mb-6 leading-tight">
                        Comprehensive <strong>IT Ecosystem Solutions</strong>
                    </h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-primary-dark to-primary-light rounded-full mb-6"></div>
                    <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                        {description}
                    </p>
                </div>

                {/* Cards Grid - Dynamic from Navbar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <Skeleton className="w-16 h-16 rounded-2xl mb-6" />
                                <Skeleton className="h-6 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-5/6 mb-8" />
                                <div className="flex justify-between mt-auto">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                </div>
                            </div>
                        ))
                    ) : (
                        serviceList.map((service, index) => {
                            const IconComponent = ICON_MAP[service.icon] || ICON_MAP[service.iconName] || Layers;
                            // Normalize any legacy /pages/ paths to /services/ for SEO
                            let linkPath = service.path || '#';
                            if (typeof linkPath === 'string') {
                                linkPath = linkPath.replace(/\/pages\//g, '/services/');
                            }

                            return (
                                <Link
                                    to={linkPath}
                                    key={index}
                                    onClick={(e) => {
                                        if (!service.path) e.preventDefault();
                                    }}
                                    className={`group relative block bg-white p-6 md:p-8 rounded-2xl shadow-none hover:shadow-xl transition-all duration-300 ease-in-out border border-transparent hover:border-primary-medium/80 overflow-hidden transform-gpu hover:-translate-y-2 hover:shadow-primary-medium/20 text-left
                                    ${!showAll && index >= 6 ? 'hidden' : (!showAll && index >= 4 ? 'hidden md:block' : 'block')}`}
                                >
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none"></div>

                                    {/* Header: Icon & Title */}
                                    <div className="relative z-10 flex flex-col items-start gap-4 mb-4">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-in-out text-primary-dark group-hover:text-primary-medium group-hover:border-primary-light/30">
                                            <IconComponent size={32} />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-primary-dark transition-colors duration-300 ease-in-out">
                                            {service.name || service.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p className="relative z-10 text-gray-500 leading-relaxed text-sm md:text-base mb-8 transition-colors duration-300 ease-in-out">
                                        {service.desc}
                                    </p>

                                    {/* Bottom Action Area */}
                                    <div className="relative z-10 flex items-center justify-between mt-auto">
                                        <span className="text-primary-medium font-semibold text-sm uppercase tracking-wider group-hover:text-primary-dark transition-colors duration-300 ease-in-out">
                                            Explore Solution
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-dark group-hover:text-white transition-all duration-300 ease-in-out">
                                            <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300 ease-in-out" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        }))}
                </div>

                {/* View More Button (Mobile Only) */}
                <div className={`mt-10 text-center ${showAll ? 'hidden' : 'block'}`}>
                    <button
                        onClick={() => setShowAll(true)}
                        className="inline-flex items-center gap-2 bg-gray-100 text-primary-dark px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-sm"
                    >
                        View All Services <ArrowRight size={18} className="rotate-90" />
                    </button>
                </div>

                {/* Bottom CTA Options */}
                <div className="mt-20 flex flex-col md:flex-row justify-center gap-6">
                    <button
                        onClick={() => {
                            setEnquirySource('Consultation');
                            setIsEnquiryOpen(true);
                        }}
                        className="flex items-center gap-3 bg-primary-dark text-white px-8 py-4 rounded-full font-bold hover:bg-primary-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                    >
                        <MessageSquare size={20} />
                        Talk to a Consultant
                    </button>

                    <button
                        onClick={() => setIsContactChoiceOpen(true)}
                        className="flex items-center gap-3 bg-white text-primary-dark border-2 border-primary-dark px-8 py-4 rounded-full font-bold hover:bg-primary-dark hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                        <Phone size={20} />
                        Contact Us Now
                    </button>
                </div>
            </div>

            {/* Modals */}
            <EnquiryModal
                isOpen={isEnquiryOpen}
                onClose={() => setIsEnquiryOpen(false)}
                source={enquirySource}
            />
            <ContactChoiceModal
                isOpen={isContactChoiceOpen}
                onClose={() => setIsContactChoiceOpen(false)}
                phoneNumber="+91 98737 37020"
            />
        </section>
    );
};

export default Services;
