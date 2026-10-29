import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, ChevronDown, ArrowUpRight, CheckCircle, MessageSquare, Zap,
    Globe, Cpu, Box, Server, Database, Shield, Cloud, Mail, Users,
    Wifi, FileText, Monitor, HardDrive, Lock, Settings, Radio
} from 'lucide-react';
import EnquiryModal from '../components/EnquiryModal';
import SEO from '../components/SEO';

// Icon map
const ICON_MAP = {
    Globe, Cpu, Box, Server, Database, Shield, Cloud, Mail, Users,
    Wifi, FileText, Monitor, HardDrive, Lock, Settings, Radio
};

// Counter component for metrics
const Counter = ({ value, label }) => {
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
                <motion.span>{rounded}</motion.span>
                <span>{value.replace(/[0-9.]/g, '')}</span>
            </h3>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">{label}</p>
        </div>
    );
};

// Default page content for all 9 services
const DEFAULT_PAGES = {
    'hardware-supply': {
        heroLabel: 'Infrastructure Services',
        heroTitle: 'Hardware Supply',
        seoTitle: 'Hardware Supply | UnioTech',
        seoDesc: 'Professional hardware procurement and logistics services.',
        sections: [
            { id: "01", title: "Global Procurement", subtitle: "Sourcing without borders", description: "We navigate the global supply chain with Tier-1 distributors across 3 continents.", features: ["Direct OEM Access", "Obsolete Part Sourcing", "Bulk Volume Discounts"], icon: "Globe", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670" },
            { id: "02", title: "Custom Configuration", subtitle: "Ready-to-deploy engineering", description: "Our engineers configure RAID arrays and flash firmware before the hardware reaches your dock.", features: ["BIOS/Firmware Updates", "RAID Configuration", "OS Imaging"], icon: "Cpu", image: "https://images.unsplash.com/photo-1558494949-efc5e60c94ef?q=80&w=2670" },
            { id: "03", title: "Secure Logistics", subtitle: "Insured door-to-door delivery", description: "Specialized freight carriers with climate control ensure your infrastructure arrives perfectly.", features: ["Real-time GPS Tracking", "Full Value Insurance", "White Glove Delivery"], icon: "Box", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670" }
        ],
        metrics: [{ label: "Partner Brands", val: "50+" }, { label: "Delivery Success", val: "99.9%" }, { label: "Active Clients", val: "200+" }, { label: "Warranty Coverage", val: "3 Yrs" }]
    },
    'server-support': {
        heroLabel: 'Infrastructure Services',
        heroTitle: 'Server Support',
        seoTitle: 'Server Support | UnioTech',
        seoDesc: 'Physical server, Nutanix, and hypervisor support services.',
        sections: [
            { id: "01", title: "Physical Server Management", subtitle: "Enterprise-grade support", description: "24/7 monitoring and maintenance for your physical server infrastructure.", features: ["Hardware Diagnostics", "Preventive Maintenance", "Emergency Response"], icon: "Server", image: "https://images.unsplash.com/photo-1558494949-efc5e60c94ef?q=80&w=2670" },
            { id: "02", title: "Nutanix Solutions", subtitle: "Hyperconverged infrastructure", description: "Expert deployment and management of Nutanix HCI platforms.", features: ["Cluster Management", "Storage Optimization", "Performance Tuning"], icon: "Database", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670" },
            { id: "03", title: "Hypervisor Support", subtitle: "VMware & Hyper-V experts", description: "Complete virtualization platform management and optimization.", features: ["VM Migration", "Resource Allocation", "Backup & Recovery"], icon: "Cpu", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072" }
        ],
        metrics: [{ label: "Servers Managed", val: "500+" }, { label: "Uptime SLA", val: "99.99%" }, { label: "Response Time", val: "15 Min" }, { label: "Expert Engineers", val: "20+" }]
    },
    'networking': {
        heroLabel: 'Network Services',
        heroTitle: 'Networking',
        seoTitle: 'Networking Solutions | UnioTech',
        seoDesc: 'Active/Passive networking, CCTV, and biometric solutions.',
        sections: [
            { id: "01", title: "Active Networking", subtitle: "Switches, routers, firewalls", description: "Design and deployment of enterprise-grade network infrastructure.", features: ["Network Design", "VLAN Configuration", "Traffic Optimization"], icon: "Wifi", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2670" },
            { id: "02", title: "CCTV Surveillance", subtitle: "Complete security coverage", description: "End-to-end video surveillance solutions with cloud storage and AI analytics.", features: ["IP Camera Systems", "Cloud Recording", "Motion Detection"], icon: "Monitor", image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2670" },
            { id: "03", title: "Access Control", subtitle: "Biometric & card systems", description: "Modern access control with face recognition and fingerprint authentication.", features: ["Biometric Readers", "Card Access", "Visitor Management"], icon: "Lock", image: "https://images.unsplash.com/photo-1558002070-dc6d6f4d71e0?q=80&w=2670" }
        ],
        metrics: [{ label: "Sites Covered", val: "300+" }, { label: "Cameras Installed", val: "5K+" }, { label: "Network Uptime", val: "99.9%" }, { label: "Support Hours", val: "24/7" }]
    },
    'amc-support': {
        heroLabel: 'Maintenance Services',
        heroTitle: 'AMC Support',
        seoTitle: 'Annual Maintenance Contracts | UnioTech',
        seoDesc: 'Comprehensive AMC support for firewalls, servers, and desktops.',
        sections: [
            { id: "01", title: "Firewall AMC", subtitle: "Security perimeter protection", description: "Regular updates, rule optimization, and threat monitoring for your firewalls.", features: ["Firmware Updates", "Rule Audits", "Threat Response"], icon: "Shield", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670" },
            { id: "02", title: "Server AMC", subtitle: "Infrastructure reliability", description: "Preventive maintenance and rapid response for your server infrastructure.", features: ["Monthly Health Checks", "Patch Management", "Performance Reports"], icon: "Server", image: "https://images.unsplash.com/photo-1558494949-efc5e60c94ef?q=80&w=2670" },
            { id: "03", title: "Desktop Support", subtitle: "End-user computing", description: "Complete desktop lifecycle management and helpdesk support.", features: ["Remote Support", "On-site Visits", "Asset Tracking"], icon: "Monitor", image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=2670" }
        ],
        metrics: [{ label: "Active Contracts", val: "150+" }, { label: "Devices Covered", val: "10K+" }, { label: "Resolution Rate", val: "98%" }, { label: "Client Retention", val: "95%" }]
    },
    'software-solutions': {
        heroLabel: 'Software Services',
        heroTitle: 'Software Solutions',
        seoTitle: 'Software Solutions | UnioTech',
        seoDesc: 'Adobe, MongoDB, Office 365 licensing and deployment.',
        sections: [
            { id: "01", title: "Adobe Licensing", subtitle: "Creative Cloud experts", description: "Volume licensing, deployment, and management for Adobe Creative Cloud.", features: ["Volume Licensing", "User Provisioning", "License Compliance"], icon: "Monitor", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=2670" },
            { id: "02", title: "Database Solutions", subtitle: "MongoDB & SQL Server", description: "Professional database licensing, setup, and optimization services.", features: ["License Management", "Cluster Setup", "Performance Tuning"], icon: "Database", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2636" },
            { id: "03", title: "Microsoft 365", subtitle: "Complete productivity suite", description: "End-to-end Microsoft 365 deployment with migration and training.", features: ["License Optimization", "User Training", "Admin Support"], icon: "FileText", image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?q=80&w=2680" }
        ],
        metrics: [{ label: "Licenses Managed", val: "15K+" }, { label: "Vendors", val: "50+" }, { label: "Cost Savings", val: "30%" }, { label: "Compliance Rate", val: "100%" }]
    },
    'cybersecurity': {
        heroLabel: 'Security Services',
        heroTitle: 'Cybersecurity',
        seoTitle: 'Cybersecurity Solutions | UnioTech',
        seoDesc: 'Sophos, Fortinet, SSL, and firewall security solutions.',
        sections: [
            { id: "01", title: "Endpoint Protection", subtitle: "Sophos & advanced EDR", description: "Next-gen antivirus with AI-powered threat detection and response.", features: ["Sophos XDR", "Ransomware Protection", "Device Encryption"], icon: "Shield", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670" },
            { id: "02", title: "Network Security", subtitle: "Fortinet firewalls", description: "Enterprise-grade perimeter security with advanced threat prevention.", features: ["FortiGate Deployment", "VPN Configuration", "Threat Intelligence"], icon: "Lock", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2670" },
            { id: "03", title: "SSL & Certificates", subtitle: "Trust infrastructure", description: "Complete SSL certificate management for secure communications.", features: ["SSL Procurement", "Auto-Renewal", "Certificate Monitoring"], icon: "Globe", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2670" }
        ],
        metrics: [{ label: "Threats Blocked", val: "1M+" }, { label: "Endpoints Protected", val: "8K+" }, { label: "Zero-Day Response", val: "<1 Hr" }, { label: "Security Audits", val: "200+" }]
    },
    'cloud-backup': {
        heroLabel: 'Cloud Services',
        heroTitle: 'Cloud & Backup',
        seoTitle: 'Cloud & Backup Solutions | UnioTech',
        seoDesc: 'Azure, AWS, Acronis, and Veeam cloud backup services.',
        sections: [
            { id: "01", title: "Cloud Migration", subtitle: "Azure & AWS experts", description: "Seamless migration to cloud with minimal downtime and zero data loss.", features: ["Architecture Design", "Data Migration", "Cost Optimization"], icon: "Cloud", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072" },
            { id: "02", title: "Backup Solutions", subtitle: "Acronis & Veeam", description: "Enterprise backup with instant recovery and ransomware protection.", features: ["Automated Backups", "Instant VM Recovery", "Offsite Replication"], icon: "Database", image: "https://images.unsplash.com/photo-1558494949-efc5e60c94ef?q=80&w=2670" },
            { id: "03", title: "Disaster Recovery", subtitle: "Business continuity", description: "Comprehensive DR planning with automated failover and testing.", features: ["DR Planning", "Failover Testing", "RTO/RPO Guarantee"], icon: "Shield", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=2574" }
        ],
        metrics: [{ label: "Data Protected", val: "500 TB" }, { label: "Recovery Rate", val: "100%" }, { label: "Cloud Clients", val: "250+" }, { label: "Uptime SLA", val: "99.99%" }]
    },
    'migration-email': {
        heroLabel: 'Migration Services',
        heroTitle: 'Migration & Email',
        seoTitle: 'Migration & Email Services | UnioTech',
        seoDesc: 'Server and email migration with Office 365 expertise.',
        sections: [
            { id: "01", title: "Email Migration", subtitle: "Zero-downtime transitions", description: "Seamless migration to Microsoft 365, Google Workspace, or on-prem Exchange.", features: ["Mailbox Migration", "Calendar Sync", "Archive Transfer"], icon: "Mail", image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=2574" },
            { id: "02", title: "Server Migration", subtitle: "Physical to virtual", description: "Complete server migrations with application compatibility testing.", features: ["P2V Migration", "App Testing", "Rollback Plans"], icon: "Server", image: "https://images.unsplash.com/photo-1558494949-efc5e60c94ef?q=80&w=2670" },
            { id: "03", title: "Data Migration", subtitle: "Secure transfers", description: "Large-scale data migration with integrity verification and encryption.", features: ["Data Validation", "Encrypted Transfer", "Audit Trails"], icon: "Database", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=2574" }
        ],
        metrics: [{ label: "Migrations Done", val: "500+" }, { label: "Mailboxes Moved", val: "50K+" }, { label: "Zero Data Loss", val: "100%" }, { label: "Avg Downtime", val: "0 Min" }]
    },
    'managed-services': {
        heroLabel: 'Managed IT',
        heroTitle: 'Managed Services',
        seoTitle: 'Managed IT Services | UnioTech',
        seoDesc: 'Virtual IT Manager and complete IT infrastructure management.',
        sections: [
            { id: "01", title: "Virtual IT Manager", subtitle: "Your dedicated IT head", description: "A dedicated IT manager to oversee your entire technology strategy and operations.", features: ["IT Strategy", "Vendor Management", "Budget Planning"], icon: "Users", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2670" },
            { id: "02", title: "24/7 Monitoring", subtitle: "Proactive infrastructure care", description: "Round-the-clock monitoring with automated alerts and rapid response.", features: ["Real-time Alerts", "Performance Metrics", "Incident Response"], icon: "Monitor", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670" },
            { id: "03", title: "Helpdesk Support", subtitle: "Always-on user support", description: "Multi-tier helpdesk with SLA-backed response times and escalation.", features: ["Ticketing System", "Remote Support", "On-site Visits"], icon: "MessageSquare", image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2674" }
        ],
        metrics: [{ label: "Tickets/Month", val: "2K+" }, { label: "First Call Resolution", val: "85%" }, { label: "Client Satisfaction", val: "4.9/5" }, { label: "Managed Devices", val: "5K+" }]
    },
    'it-strategy': {
        heroLabel: 'Consulting Services',
        heroTitle: 'IT Strategy',
        seoTitle: 'IT Strategy Consulting | UnioTech',
        seoDesc: 'Strategic IT roadmap building and planning for your business.',
        sections: [
            { id: "01", title: "Technology Roadmap", subtitle: "Vision to execution", description: "Build a comprehensive IT roadmap aligned with your business goals and growth trajectory.", features: ["3-5 Year Planning", "Technology Assessment", "Investment Prioritization"], icon: "Globe", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670" },
            { id: "02", title: "Digital Maturity", subtitle: "Where you stand", description: "Assess your organization's digital capabilities and identify improvement opportunities.", features: ["Maturity Assessment", "Gap Analysis", "Benchmark Comparison"], icon: "Monitor", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426" },
            { id: "03", title: "IT Governance", subtitle: "Structure for success", description: "Establish frameworks for IT decision-making, risk management, and compliance.", features: ["Policy Development", "Risk Framework", "Compliance Planning"], icon: "FileText", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670" }
        ],
        metrics: [{ label: "Strategies Delivered", val: "100+" }, { label: "ROI Improvement", val: "40%" }, { label: "Client Retention", val: "95%" }, { label: "Years Experience", val: "15+" }]
    },
    'digital-transformation': {
        heroLabel: 'Consulting Services',
        heroTitle: 'Digital Transformation',
        seoTitle: 'Digital Transformation | UnioTech',
        seoDesc: 'Modernize your workflows and tools with expert digital transformation services.',
        sections: [
            { id: "01", title: "Process Automation", subtitle: "Efficiency at scale", description: "Automate repetitive tasks and streamline workflows with modern tools and AI.", features: ["Workflow Automation", "RPA Implementation", "AI Integration"], icon: "Settings", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2670" },
            { id: "02", title: "Cloud Adoption", subtitle: "Modern infrastructure", description: "Migrate legacy systems to cloud-first architecture for agility and cost savings.", features: ["Cloud Strategy", "Migration Planning", "Cost Optimization"], icon: "Cloud", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072" },
            { id: "03", title: "Data Analytics", subtitle: "Insights that drive action", description: "Unlock the value of your data with modern analytics and visualization platforms.", features: ["BI Implementation", "Data Warehousing", "Dashboard Creation"], icon: "Database", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670" }
        ],
        metrics: [{ label: "Transformations", val: "75+" }, { label: "Efficiency Gains", val: "60%" }, { label: "Cost Reduction", val: "35%" }, { label: "Adoption Rate", val: "90%" }]
    },
    'tech-consultancy': {
        heroLabel: 'Consulting Services',
        heroTitle: 'Tech Consultancy',
        seoTitle: 'Technology Consultancy | UnioTech',
        seoDesc: 'Expert IT advisory and guidance for technology decisions.',
        sections: [
            { id: "01", title: "Architecture Review", subtitle: "Build it right", description: "Expert review of your technology architecture with actionable recommendations.", features: ["System Analysis", "Scalability Assessment", "Best Practices"], icon: "Server", image: "https://images.unsplash.com/photo-1558494949-efc5e60c94ef?q=80&w=2670" },
            { id: "02", title: "Vendor Selection", subtitle: "Right tools for you", description: "Unbiased guidance on technology vendor selection and contract negotiation.", features: ["RFP Development", "Vendor Evaluation", "Contract Review"], icon: "Users", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670" },
            { id: "03", title: "Project Advisory", subtitle: "Success assurance", description: "Expert oversight for critical IT projects to ensure on-time, on-budget delivery.", features: ["Project Review", "Risk Mitigation", "Quality Assurance"], icon: "FileText", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670" }
        ],
        metrics: [{ label: "Consultations", val: "500+" }, { label: "Success Rate", val: "95%" }, { label: "Cost Savings", val: "$10M+" }, { label: "Expert Advisors", val: "15+" }]
    },
    'security-audits': {
        heroLabel: 'Consulting Services',
        heroTitle: 'Security Audits',
        seoTitle: 'Security Audits & Compliance | UnioTech',
        seoDesc: 'Comprehensive security risk assessment and compliance services.',
        sections: [
            { id: "01", title: "Vulnerability Assessment", subtitle: "Find the gaps", description: "Comprehensive scanning and testing to identify security vulnerabilities in your infrastructure.", features: ["Network Scanning", "Penetration Testing", "Vulnerability Reports"], icon: "Shield", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670" },
            { id: "02", title: "Compliance Audits", subtitle: "Meet requirements", description: "Expert audits for regulatory compliance including ISO 27001, SOC 2, and GDPR.", features: ["ISO 27001", "SOC 2 Readiness", "GDPR Assessment"], icon: "FileText", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2670" },
            { id: "03", title: "Risk Assessment", subtitle: "Know your exposure", description: "Comprehensive risk analysis with prioritized remediation recommendations.", features: ["Risk Identification", "Impact Analysis", "Remediation Plan"], icon: "Lock", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2670" }
        ],
        metrics: [{ label: "Audits Completed", val: "300+" }, { label: "Vulnerabilities Found", val: "5K+" }, { label: "Compliance Rate", val: "100%" }, { label: "Certifications Achieved", val: "150+" }]
    }
};

const ServicePage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState(null);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const [enquirySource, setEnquirySource] = useState('');

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL;
                const res = await fetch(`${API_URL}/api/content/pages/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) {
                        setPageData(data.data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                // Use default page data on error
            }
            // Use default data
            setPageData(DEFAULT_PAGES[slug] || DEFAULT_PAGES['hardware-supply']);
            setLoading(false);
        };
        fetchPageData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin w-8 h-8 border-4 border-primary-medium border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const { heroLabel, heroTitle, seoTitle, seoDesc, sections, metrics } = pageData;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary-light/20 selection:text-primary-dark"
        >
            <SEO title={seoTitle} description={seoDesc} />

            {/* HERO SECTION */}
            <header className="relative py-24 md:py-32 px-6 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#213448]/90"></div>
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
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 md:w-20 bg-gradient-to-l from-primary-light/60 to-transparent"></div>
                            <span className="text-primary-light font-bold tracking-widest uppercase text-sm md:text-base whitespace-nowrap">
                                {heroLabel}
                            </span>
                            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-primary-light/60 to-transparent"></div>
                        </div>

                        <nav className="flex items-center justify-center gap-2 text-sm md:text-base font-medium text-gray-300">
                            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-white transition-colors">Home</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <span onClick={() => navigate('/#services')} className="cursor-pointer hover:text-white transition-colors">Services</span>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                            <span className="text-white font-bold border-b border-primary-light/50 pb-0.5">{heroTitle}</span>
                        </nav>
                    </motion.div>
                </div>
            </header>

            {/* MAIN CONTENT: Zig-Zag Layout */}
            <main className="container mx-auto max-w-6xl px-6 py-24 space-y-32">
                {sections.map((section, index) => {
                    const IconComponent = ICON_MAP[section.icon] || Globe;
                    return (
                        <section key={section.id} className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Image Side */}
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="lg:w-1/2 w-full"
                            >
                                <div className="overflow-hidden border-2 border-gray-200">
                                    <img src={section.image} alt={section.title} className="w-full h-auto block" />
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
                                        <IconComponent className="w-6 h-6" />
                                    </span>
                                    <h4 className="text-primary-medium font-semibold uppercase tracking-wider text-sm">{section.subtitle}</h4>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{section.title}</h2>
                                <p className="text-lg text-gray-500 mb-8 leading-relaxed border-l-2 border-primary-light/30 pl-6">
                                    {section.description}
                                </p>

                                <ul className="space-y-4 mb-10">
                                    {section.features.map((feature, i) => (
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
                                                            setEnquirySource(`${pageData?.heroTitle || 'Service'} - ${section.title}`);
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

            {/* METRICS STRIP */}
            <section className="bg-gray-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {metrics.map((stat, idx) => (
                            <Counter key={idx} value={stat.val} label={stat.label} />
                        ))}
                    </div>
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section className="py-20 bg-white relative overflow-hidden border-t border-gray-100">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-light/5 rounded-full blur-3xl -mr-[100px] -mt-[100px] pointer-events-none"></div>
                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                        <div className="lg:max-w-xl">
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                <div className="p-3 bg-gray-100 rounded-2xl">
                                    <Zap className="w-8 h-8 text-primary-medium" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to get started?</h2>
                            </div>
                            <p className="text-xl text-gray-500 leading-relaxed">
                                Get in touch with our experts for a personalized consultation and quote.
                            </p>
                        </div>

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
                source={enquirySource || `Service: ${pageData?.heroTitle || 'Service'}`}
            />
        </motion.div>
    );
};

export default ServicePage;
