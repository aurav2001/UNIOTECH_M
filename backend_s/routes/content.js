const express = require('express');
const jwt = require('jsonwebtoken');
const Content = require('../models/Content');
const router = express.Router();

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Default content for auto-initialization (ALL sections)
const getDefaultContent = () => ({
    hero: {
        title: 'Empowering Your Business with Intelligent IT',
        subtitle: 'Intelligent IT',
        description: 'We safeguard your digital assets and optimize infrastructure with cutting-edge hardware, software, and cybersecurity solutions.',
        backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
        backgroundImages: [
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2026&auto=format&fit=crop'
        ],
        ctaText: 'Get Started',
        ctaLink: '/contact'
    },
    navbar: {
        logo: '/logo.png',
        items: []
    },
    services: {
        title: 'Comprehensive IT Ecosystem Solutions',
        subtitle: 'Our Expertise',
        description: 'Tailored technology services designed to accelerate your business growth.',
        items: [
            { title: "Softwares", iconName: "Layers", desc: "Expert license management for Adobe, MongoDB, and Office 365." },
            { title: "Hardware", iconName: "HardDrive", desc: "High-performance workstations and servers from Lenovo, Dell, HP." },
            { title: "Servers", iconName: "Database", desc: "Physical and virtual servers like VMware and Nutanix." },
            { title: "Security", iconName: "Lock", desc: "Advanced security with Sophos and Firewalls." },
            { title: "Cloud", iconName: "CloudRain", desc: "Azure and AWS backup strategies for disaster recovery." },
            { title: "Migration", iconName: "ArrowLeftRight", desc: "Zero-downtime Email and Server migrations." },
            { title: "Email", iconName: "AtSign", desc: "Reliable hosting for Office 365, Google Workspace, Zoho." },
            { title: "Managed IT", iconName: "UserCog", desc: "Virtual IT Manager for proactive monitoring." },
            { title: "Network", iconName: "Radio", desc: "End-to-end networking and AMC support." }
        ]
    },
    pricing: {
        title: 'Simple, transparent pricing',
        subtitle: 'Choose the plan that matches your ambition.',
        items: [
            { tier: 3, name: "Basic", tagline: "Perfect for small teams", priceMonthly: "4,999", features: ["Up to 10 User Licenses", "Basic IT Support", "Monthly Health Check"], popular: false },
            { tier: 2, name: "Professional", tagline: "For growing teams", priceMonthly: "9,999", features: ["Up to 50 User Licenses", "Priority Support", "Advanced Security"], popular: true },
            { tier: 1, name: "Enterprise", tagline: "For large organizations", priceMonthly: "Custom", features: ["Unlimited Licenses", "Dedicated Manager", "24/7 Monitoring"], popular: false }
        ]
    },
    testimonials: {
        title: 'Trusted by Industry Leaders',
        subtitle: 'See what our clients say.',
        items: [
            { id: 1, author: "Sarah Jenkins", role: "CTO, TechFlow Inc.", quote: "UnioTech IT transformed our infrastructure.", stat: "50%", statDesc: "Reduction in IT costs" },
            { id: 2, author: "Michael Chen", role: "DevOps Lead", quote: "The automated cloud solutions have been a game changer.", stat: "20hrs", statDesc: "Saved per week" }
        ]
    },
    offers: {
        title: 'Special Offers',
        subtitle: 'Limited time deals.',
        items: [
            { id: 1, title: "New Year Sale", description: "Get 20% off on all annual plans.", code: "NEWYEAR2026", discount: "20%", expiry: "2026-02-01" }
        ]
    },
    workflow: {
        title: 'How We Work',
        subtitle: 'Our Process',
        description: 'A streamlined workflow to deliver excellence.',
        items: [
            { id: 1, title: "Discussion", description: "Understanding your vision and goals.", iconName: "MessageCircle" },
            { id: 2, title: "Concepts", description: "Brainstorming innovative solutions.", iconName: "Lightbulb" },
            { id: 3, title: "Testing", description: "Rigorous testing and prototyping.", iconName: "FlaskConical" },
            { id: 4, title: "Execute", description: "Seamless deployment and integration.", iconName: "Rocket" }
        ]
    },
    partners: {
        title: 'Our Trusted Partners',
        isVisible: true,
        items: []
    },
    clients: {
        title: 'Our Valued Clients',
        subtitle: 'Trusted by leading organizations',
        isVisible: true,
        items: []
    },
    footer: {
        companyName: 'UnioTech IT',
        tagline: 'Empowering businesses with innovative IT solutions.',
        email: 'sales@uniotechit.com',
        phone: '+91 98737 37020',
        address: 'Block B ,Sector-63, Noida',
        copyrightText: 'All rights reserved.'
    },
    amcPlans: {
        heroTitle: 'AMC Plans',
        heroSubtitle: 'Comprehensive Annual Maintenance Contracts designed to keep your IT infrastructure running smoothly, securely, and efficiently — all year round.',
        detailsTitle: 'Why Choose Our AMC Plans?',
        detailsContent: 'Our Annual Maintenance Contracts (AMC) provide proactive IT support, preventive maintenance, and rapid issue resolution to minimize downtime and maximize productivity. Whether you are a homeowner with a few devices or a corporation with complex infrastructure, we have the perfect plan for you.',
        detailsFeatures: [
            'Preventive maintenance & health checks',
            'Priority support with guaranteed response times',
            'On-site & remote technical assistance',
            'Hardware & software troubleshooting',
            'Network monitoring & optimization',
            'Regular system updates & security patches'
        ],
        homePlans: [
            {
                name: 'Silver',
                tagline: 'Essential coverage for home users',
                price: '2,999',
                period: '/year',
                popular: false,
                features: ['Up to 2 Devices Covered', 'Quarterly Health Checkup', 'Remote Support (Business Hours)', 'Basic Antivirus Setup', 'OS & Software Updates', 'Email Support']
            },
            {
                name: 'Gold',
                tagline: 'Complete protection for your home setup',
                price: '5,999',
                period: '/year',
                popular: true,
                features: ['Up to 5 Devices Covered', 'Monthly Health Checkup', 'Remote + 2 On-site Visits/Year', 'Advanced Security Suite', 'Wi-Fi Network Optimization', 'Data Backup Setup', 'Priority Email & Phone Support', 'Printer & Peripheral Support']
            },
            {
                name: 'Platinum',
                tagline: 'Premium all-inclusive home IT care',
                price: '9,999',
                period: '/year',
                popular: false,
                features: ['Unlimited Devices Covered', 'Bi-weekly Health Checkup', 'Unlimited On-site Visits', 'Enterprise-grade Security', 'Smart Home Device Support', 'Cloud Backup & Recovery', '24/7 Priority Support', 'Dedicated Technician', 'Annual Hardware Cleaning']
            }
        ],
        corporatePlans: [
            {
                name: 'Starter',
                tagline: 'Ideal for small businesses & startups',
                price: '14,999',
                period: '/year',
                popular: false,
                features: ['Up to 10 Workstations', '1 Server Covered', 'Monthly Preventive Maintenance', 'Remote Support (Business Hours)', 'Basic Network Monitoring', 'Email & Ticketing Support', 'Quarterly Reports']
            },
            {
                name: 'Business',
                tagline: 'Comprehensive IT management for growing teams',
                price: '34,999',
                period: '/year',
                popular: true,
                features: ['Up to 50 Workstations', 'Up to 3 Servers Covered', 'Weekly Preventive Maintenance', 'Remote + On-site Support', 'Advanced Network Monitoring', 'Firewall & Security Management', 'Data Backup & DR Planning', 'Priority SLA (4hr Response)', 'Monthly Reports & Reviews']
            },
            {
                name: 'Enterprise',
                tagline: 'Full-scale IT infrastructure management',
                price: 'Custom',
                period: '',
                popular: false,
                features: ['Unlimited Workstations & Servers', 'Daily Preventive Maintenance', '24/7 On-site & Remote Support', 'Complete Cybersecurity Suite', 'Cloud Infrastructure Management', 'Dedicated IT Manager', 'Custom SLA (1hr Response)', 'Vendor & License Management', 'Strategic IT Consulting', 'Real-time Monitoring Dashboard']
            }
        ],
        faq: [
            { question: 'What does an AMC plan cover?', answer: 'Our AMC plans cover preventive maintenance, troubleshooting, security updates, hardware/software support, and priority assistance based on the plan tier you choose.' },
            { question: 'Can I upgrade my plan mid-year?', answer: 'Yes! You can upgrade your AMC plan at any time. The cost difference will be prorated for the remaining contract period.' },
            { question: 'Do you provide on-site support?', answer: 'Yes, on-site support is available in Gold/Platinum home plans and all corporate plans. The number of on-site visits depends on your chosen plan.' },
            { question: 'What is the response time for support requests?', answer: 'Response times vary by plan — from next-business-day for basic plans to 1-hour guaranteed response for Enterprise plans.' }
        ]
    },
    supportFaqs: {
        title: 'Frequently Asked Questions (FAQs)',
        subtitle: 'Select a question to see the response/instructions instantly.',
        items: [
            { question: 'VPN Connection Issues', answer: 'Make sure your internet is working. Open Cisco AnyConnect, enter vpn.uniotechit.com, and use your credential + OTP. If it fails, restart your router.' },
            { question: 'Email/Office 365 Password Reset', answer: 'For password resets, contact your company admin or call/WhatsApp our helpline at +91 98737 37020 for quick verification.' },
            { question: 'Printer Offline / Printing Error', answer: 'Check if the printer is powered on and connected to the network. Restart the Print Spooler service on your PC: search for "Services", find "Print Spooler", and click Restart.' },
            { question: 'Server / ERP Down', answer: 'Verify if other colleagues are facing the same issue. If it is a widespread outage, please raise this ticket immediately, our network operations center is on standby.' },
            { question: 'Software License Request', answer: 'Specify the software name (e.g. Adobe Creative Cloud, Office 365) and the number of licenses required in the detailed description.' }
        ]
    }
});

// Migration: Append "AMC Plans" to navbar categories in DB if it's missing
const migrateNavbar = async () => {
    try {
        const navbar = await Content.findOne({ where: { section: 'navbar' } });
        if (navbar && navbar.data) {
            const data = navbar.data;
            if (data.categories) {
                let changed = false;
                const categories = data.categories.map(cat => {
                    if (cat.id === 'software') {
                        const hasAmc = cat.items.some(item => item.path === '/amc-plans');
                        if (!hasAmc) {
                            cat.items.push({
                                name: "AMC Plans",
                                desc: "Home & Corporate AMC Plans",
                                icon: "FileText",
                                path: "/amc-plans"
                            });
                            changed = true;
                        }
                    }
                    return cat;
                });
                if (changed) {
                    navbar.data = { ...data, categories };
                    navbar.changed('data', true);
                    await navbar.save();
                    console.log('✅ Migrated navbar database: Added AMC Plans submenu');
                }
            }
        }
    } catch (e) {
        console.error('Navbar migration failed:', e.message);
    }
};

// Auto-initialize missing content sections
const autoInitContent = async () => {
    try {
        console.log('Checking for missing content sections...');
        const defaults = getDefaultContent();
        let added = 0;

        for (const [section, data] of Object.entries(defaults)) {
            const [record, created] = await Content.findOrCreate({
                where: { section },
                defaults: { data }
            });
            if (created) {
                added++;
                console.log(`Created missing section: ${section}`);
            }
        }

        if (added > 0) {
            console.log(`Auto-initialized ${added} missing sections`);
        }

        // Run database migration to verify navbar has the AMC Plans page link
        await migrateNavbar();
    } catch (error) {
        console.error('Auto-init error:', error.message);
    }
};

// Run auto-init on startup
autoInitContent();

// Helper: normalize any /pages/ paths to /services/ in navbar/services content
const normalizePagesPaths = (data) => {
    if (!data || typeof data !== 'object') return data;
    // Deep clone to avoid mutating the DB record
    const normalized = JSON.parse(JSON.stringify(data));

    // Normalize navbar categories items paths
    if (normalized.categories && Array.isArray(normalized.categories)) {
        normalized.categories.forEach(cat => {
            if (cat.items && Array.isArray(cat.items)) {
                cat.items.forEach(item => {
                    if (item.path && typeof item.path === 'string') {
                        item.path = item.path.replace(/\/pages\//g, '/services/');
                    }
                });
            }
        });
    }

    // Normalize services items paths
    if (normalized.items && Array.isArray(normalized.items)) {
        normalized.items.forEach(item => {
            if (item.path && typeof item.path === 'string') {
                item.path = item.path.replace(/\/pages\//g, '/services/');
            }
        });
    }

    return normalized;
};

// Get all content
router.get('/', async (req, res) => {
    try {
        let content = await Content.findAll();

        // If still empty, try to auto-init again
        if (content.length === 0) {
            await autoInitContent();
            content = await Content.findAll();
        }

        const contentMap = {};
        content.forEach(item => {
            // Normalize paths for navbar and services sections
            if (item.section === 'navbar' || item.section === 'services') {
                contentMap[item.section] = normalizePagesPaths(item.data);
            } else {
                contentMap[item.section] = item.data;
            }
        });
        res.json(contentMap);
    } catch (error) {
        console.error('Content fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch content', details: error.message });
    }
});

// Get content by section
router.get('/:section', async (req, res) => {
    try {
        const content = await Content.findOne({ where: { section: req.params.section } });
        if (!content) {
            return res.json({ section: req.params.section, data: null });
        }
        // Normalize paths for navbar and services sections
        if (req.params.section === 'navbar' || req.params.section === 'services') {
            const normalized = { ...content.toJSON() };
            normalized.data = normalizePagesPaths(normalized.data);
            return res.json(normalized);
        }
        res.json(content);
    } catch (error) {
        console.error('Section fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch section content', details: error.message });
    }
});

// Update content by section (protected)
router.put('/:section', authMiddleware, async (req, res) => {
    try {
        const { data } = req.body;

        // Upsert: Create or Update
        // Sequelize upsert returns [instance, created] (boolean) in Postgres, but varies in MySQL.
        // Easiest reliable way for response is to upsert then fetch, or check exists.

        const [content, created] = await Content.findOrCreate({
            where: { section: req.params.section },
            defaults: { data }
        });

        if (!created) {
            content.data = data;
            await content.save();
        }

        res.json({ success: true, content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update content' });
    }
});

// Initialize default content (protected)
router.post('/init', authMiddleware, async (req, res) => {
    try {
        const defaultContent = {
            hero: {
                title: 'Empowering Your Business with Intelligent IT',
                subtitle: 'Intelligent IT',
                description: 'We safeguard your digital assets and optimize infrastructure with cutting-edge hardware, software, and cybersecurity solutions.',
                backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
                backgroundImages: [
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2026&auto=format&fit=crop'
                ],
                ctaText: 'Get Started',
                ctaLink: '/contact'
            },
            services: {
                title: 'Comprehensive IT Ecosystem Solutions',
                subtitle: 'Our Expertise',
                description: 'Tailored technology services designed to accelerate your business growth and ensure robust operational security.',
                items: [
                    {
                        title: "Softwares",
                        iconName: "Layers",
                        desc: "Expert license management for Adobe, MongoDB, and Office 365."
                    },
                    {
                        title: "Hardware",
                        iconName: "HardDrive",
                        desc: "Authorized high-performance workstations and servers from Lenovo, Dell, and HP."
                    },
                    {
                        title: "Servers",
                        iconName: "Database",
                        desc: "Implementation of physical and virtual servers like VMware and Nutanix."
                    },
                    {
                        title: "Security",
                        iconName: "Lock",
                        desc: "Advanced security with Sophos and Firewalls to protect digital assets."
                    },
                    {
                        title: "Cloud",
                        iconName: "CloudRain",
                        desc: "Secure Azure and AWS backup strategies for disaster recovery."
                    },
                    {
                        title: "Migration",
                        iconName: "ArrowLeftRight",
                        desc: "Zero-downtime Email and Server migrations with seamless data transition."
                    },
                    {
                        title: "Email",
                        iconName: "AtSign",
                        desc: "Reliable hosting for Office 365, Google Workspace, and Zoho."
                    },
                    {
                        title: "Managed IT",
                        iconName: "UserCog",
                        desc: "Virtual IT Manager ensuring proactive monitoring and infrastructure oversight."
                    },
                    {
                        title: "Network",
                        iconName: "Radio",
                        desc: "End-to-end networking, CCTV surveillance, and AMC support solutions."
                    }
                ]
            },
            pricing: {
                section: 'pricing',
                title: 'Simple, transparent pricing',
                subtitle: 'Choose the plan that matches your ambition.',
                items: [
                    {
                        tier: 3,
                        name: "Basic",
                        tagline: "Perfect for small teams",
                        priceMonthly: "4,999",
                        features: ["Up to 10 User Licenses", "Basic IT Support", "Monthly Health Check"],
                        popular: false
                    },
                    {
                        tier: 2,
                        name: "Professional",
                        tagline: "For growing teams",
                        priceMonthly: "9,999",
                        features: ["Up to 50 User Licenses", "Priority Support", "Advanced Security"],
                        popular: true
                    },
                    {
                        tier: 1,
                        name: "Enterprise",
                        tagline: "For large scale organizations",
                        priceMonthly: "Custom",
                        features: ["Unlimited Licenses", "Dedicated Manager", "24/7 Monitoring"],
                        popular: false
                    }
                ]
            },
            testimonials: {
                section: 'testimonials',
                title: 'Trusted by Industry Leaders',
                subtitle: 'See what our clients have to say about us.',
                items: [
                    {
                        id: 1,
                        author: "Sarah Jenkins",
                        role: "CTO, TechFlow Inc.",
                        quote: "UnioTech IT transformed our infrastructure.",
                        stat: "50%",
                        statDesc: "Reduction in IT costs"
                    },
                    {
                        id: 2,
                        author: "Michael Chen",
                        role: "DevOps Lead, StartUp A",
                        quote: "The automated cloud solutions have been a game changer.",
                        stat: "20hrs",
                        statDesc: "Saved per week"
                    }
                ]
            },
            offers: {
                section: 'offers',
                title: 'Special Offers',
                subtitle: 'Limited time deals just for you.',
                items: [
                    {
                        id: 1,
                        title: "New Year Sale",
                        description: "Get 20% off on all annual plans.",
                        code: "NEWYEAR2026",
                        discount: "20%",
                        expiry: "2026-02-01"
                    },
                    {
                        id: 2,
                        title: "Launch Special",
                        description: "Exclusive 50% off for early adopters.",
                        code: "LAUNCH50",
                        discount: "50%",
                        expiry: "2026-03-01"
                    }
                ]
            },
            workflow: {
                section: 'workflow',
                title: 'How We Work',
                subtitle: 'Our Process',
                description: 'A streamlined 4-step workflow designed to deliver excellence from concept to reality.',
                items: [
                    {
                        id: 1,
                        title: "Discussion",
                        description: "We start by understanding your vision, requirements, and business goals through in-depth consultation.",
                        iconName: "MessageCircle"
                    },
                    {
                        id: 2,
                        title: "Concepts & Initiatives",
                        description: "Our team brainstorms innovative concepts and strategic initiatives tailored to your specific needs.",
                        iconName: "Lightbulb"
                    },
                    {
                        id: 3,
                        title: "Testing & Trying",
                        description: "Rigorous testing and prototyping ensure our solutions are robust, secure, and error-free before launch.",
                        iconName: "FlaskConical"
                    },
                    {
                        id: 4,
                        title: "Execute & Install",
                        description: "We flawlessly execute the plan and deploy the final solution, ensuring seamless integration and performance.",
                        iconName: "Rocket"
                    }
                ]
            },
            footer: {
                companyName: 'UnioTech IT',
                tagline: 'Empowering businesses with innovative IT solutions. We bridge the gap between complex technology and your business goals.',
                email: 'info@uniotechit.com',
                phone: '+91 7669256669',
                address: 'Sector 63, Noida',
                quickLinks: [
                    { name: 'About Us', path: '/about', visible: true },
                    { name: 'Services', path: '/#services', visible: true },
                    { name: 'Pricing', path: '/pricing', visible: true },
                    { name: 'Case Studies', path: '/case-studies', visible: true },
                    { name: 'Our Clients', path: '/our-clients', visible: true },
                    { name: 'Contact', path: '/contact', visible: true }
                ],
                socialLinks: {
                    facebook: 'https://facebook.com',
                    twitter: 'https://twitter.com',
                    instagram: 'https://instagram.com',
                    linkedin: 'https://linkedin.com'
                },
                copyrightText: 'All rights reserved.'
            },
            partners: {
                title: 'Our Trusted Partners',
                isVisible: true,
                items: [
                    { name: 'Microsoft', logo: 'https://res.cloudinary.com/demo/image/upload/v1/partners/microsoft.png' },
                    { name: 'Dell', logo: 'https://res.cloudinary.com/demo/image/upload/v1/partners/dell.png' },
                    { name: 'HP', logo: 'https://res.cloudinary.com/demo/image/upload/v1/partners/hp.png' },
                    { name: 'Lenovo', logo: 'https://res.cloudinary.com/demo/image/upload/v1/partners/lenovo.png' },
                    { name: 'Cisco', logo: 'https://res.cloudinary.com/demo/image/upload/v1/partners/cisco.png' }
                ]
            },
            clients: {
                title: 'Our Valued Clients',
                subtitle: 'Trusted by leading organizations worldwide',
                isVisible: true,
                items: []
            },
            hiring: {
                section: 'hiring',
                title: 'We Are Hiring!',
                subtitle: 'Join Our Team',
                description: 'We are looking for passionate individuals to join our growing team. Apply now for exciting opportunities!',
                isVisible: true,
                positions: [
                    {
                        id: 1,
                        title: 'Software Developer',
                        vacancies: 2,
                        description: 'Develop and maintain web applications using modern technologies.',
                        isActive: true
                    }
                ],
                benefits: [
                    "Competitive Salary Packages",
                    "Health & Wellness Benefits",
                    "Career Growth Opportunities",
                    "Modern Work Environment"
                ]
            },
            careers: {
                section: 'careers',
                title: 'Build Your Career With Us',
                subtitle: 'Career Opportunities',
                description: 'Join our talented team and help us shape the future of technology. We offer exciting opportunities across various departments.',
                isVisible: true
            },
            supportFaqs: {
                section: 'supportFaqs',
                title: 'Frequently Asked Questions (FAQs)',
                subtitle: 'Select a question to see the response/instructions instantly.',
                items: [
                    { question: 'VPN Connection Issues', answer: 'Make sure your internet is working. Open Cisco AnyConnect, enter vpn.uniotechit.com, and use your credential + OTP. If it fails, restart your router.' },
                    { question: 'Email/Office 365 Password Reset', answer: 'For password resets, contact your company admin or call/WhatsApp our helpline at +91 98737 37020 for quick verification.' },
                    { question: 'Printer Offline / Printing Error', answer: 'Check if the printer is powered on and connected to the network. Restart the Print Spooler service on your PC: search for "Services", find "Print Spooler", and click Restart.' },
                    { question: 'Server / ERP Down', answer: 'Verify if other colleagues are facing the same issue. If it is a widespread outage, please raise this ticket immediately, our network operations center is on standby.' },
                    { question: 'Software License Request', answer: 'Specify the software name (e.g. Adobe Creative Cloud, Office 365) and the number of licenses required in the detailed description.' }
                ]
            }
        };

        for (const [section, data] of Object.entries(defaultContent)) {
            const [item, created] = await Content.findOrCreate({
                where: { section },
                defaults: { data }
            });
        }

        res.json({ success: true, message: 'Default content initialized' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize content' });
    }
});

module.exports = router;
