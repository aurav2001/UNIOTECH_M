const fs = require('fs');
const path = require('path');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
    ShadingType
} = require('docx');

async function generateComprehensiveDocx() {
    const primaryColor = "1E3A8A";   // Deep Blue
    const secondaryColor = "0284C7"; // Sky Blue
    const accentColor = "0D9488";    // Teal / Green
    const darkTextColor = "1F2937";  // Gray-800
    const lightBgColor = "F8FAFC";   // Slate-50
    const cardBgColor = "F0FDF4";    // Mint-50
    const headerBgColor = "1E293B";  // Slate-800

    const cellBorder = {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" }
    };

    const createHeaderCell = (text, widthPercent) => new TableCell({
        borders: cellBorder,
        shading: { fill: primaryColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
        width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })] })]
    });

    const createDataCell = (content, bold = false, fill = null, widthPercent = null) => {
        let p;
        if (typeof content === 'string') {
            p = new Paragraph({ children: [new TextRun({ text: content, bold, color: darkTextColor })] });
        } else if (Array.isArray(content)) {
            p = new Paragraph({ children: content });
        } else {
            p = content;
        }

        return new TableCell({
            borders: cellBorder,
            shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
            children: [p]
        });
    };

    const createFeatureBlock = (moduleNumber, moduleName, role, summary, featuresArray, purpose, howItWorks) => {
        const elements = [];

        // Heading
        elements.push(new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 260, after: 80 },
            children: [
                new TextRun({
                    text: `${moduleNumber}. ${moduleName}`,
                    bold: true,
                    size: 24,
                    color: secondaryColor
                })
            ]
        }));

        // Role & Summary
        elements.push(new Paragraph({
            spacing: { after: 100 },
            children: [
                new TextRun({ text: "• Target Role / Access: ", bold: true, color: primaryColor }),
                new TextRun({ text: `${role}\n` }),
                new TextRun({ text: "• Module Overview: ", bold: true, color: primaryColor }),
                new TextRun({ text: summary })
            ]
        }));

        // Features List
        elements.push(new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: "Key Features & Capabilities Included:", bold: true, color: darkTextColor })]
        }));

        featuresArray.forEach(f => {
            elements.push(new Paragraph({
                spacing: { after: 40 },
                children: [
                    new TextRun({ text: `  ✔ ${f.name}: `, bold: true, color: "0369A1" }),
                    new TextRun({ text: f.desc })
                ]
            }));
        });

        // Kya Work Hai (Purpose & Value)
        elements.push(new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
                new TextRun({ text: "📌 Kya Work Hai (Business Purpose & Objective): ", bold: true, color: "047857" }),
                new TextRun({ text: purpose })
            ]
        }));

        // Kaise Work Kar Raha Hai (Technical & Workflow)
        elements.push(new Paragraph({
            spacing: { after: 180 },
            children: [
                new TextRun({ text: "⚙️ Kaise Work Karta Hai (Operational & Technical Workflow): ", bold: true, color: "B45309" }),
                new TextRun({ text: howItWorks })
            ]
        }));

        return elements;
    };

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22,
                        color: darkTextColor
                    }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                }
            },
            children: [
                // Title
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [
                        new TextRun({
                            text: "UnioTech IT Solutions",
                            bold: true,
                            size: 40,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 260 },
                    children: [
                        new TextRun({
                            text: "Complete Role-by-Role Feature Specifications & Technical Architecture",
                            bold: true,
                            size: 24,
                            color: secondaryColor
                        })
                    ]
                }),

                // Metadata Box
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    shading: { fill: lightBgColor, type: ShadingType.CLEAR },
                                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({ text: "Document Type: ", bold: true, color: primaryColor }),
                                                new TextRun({ text: "Manager-Level Comprehensive Feature Breakdown & Architecture Blueprint\n" }),
                                                new TextRun({ text: "Supported Roles: ", bold: true, color: primaryColor }),
                                                new TextRun({ text: "1. Platform Administrator | 2. Contracted Client User | 3. Public Web Visitor & Lead\n" }),
                                                new TextRun({ text: "Release Version: ", bold: true, color: primaryColor }),
                                                new TextRun({ text: "Version 3.0 (Production-Verified & Ready for Deployment)" })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                new Paragraph({ spacing: { before: 200, after: 150 }, text: "" }),

                // Section 1: Executive Summary & Role Matrix
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 120 },
                    children: [
                        new TextRun({
                            text: "1. Platform Roles & Permissions Matrix",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 140 },
                    children: [
                        new TextRun({
                            text: "The UnioTech platform is architected around 3 primary user roles, each with dedicated workspaces, security boundaries, and automated operational pipelines:"
                        })
                    ]
                }),

                // Roles Summary Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                createHeaderCell("Role Name", 25),
                                createHeaderCell("Dedicated Workspace & URL", 30),
                                createHeaderCell("Core Responsibilities & Capabilities", 45)
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("1. Platform Administrator / IT Support Manager", true),
                                createDataCell("/admin (Admin Management Hub)"),
                                createDataCell("Manage inbound leads, triage & resolve support tickets, download attached error logs & CVs, write engineer solutions, manage client company accounts, AMC plans, and dynamic CMS content (Blogs, Services, Hero, Navigation).")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("2. Contracted Client / Corporate User", true),
                                createDataCell("/client-portal (Client Helpdesk)"),
                                createDataCell("Raise support tickets with multi-file drag & drop uploads (screenshots, logs up to 25MB), converse in ticket reply threads, send urgent 1-click reminders/nudges, view official engineer solutions, and manage company files in the Document Repository.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("3. Public Website Visitor / Lead / Job Seeker", true),
                                createDataCell("/ (Public Corporate Portal)"),
                                createDataCell("Explore Managed IT & Cloud service offerings, request callbacks with preferred time slot, request free IT audits, submit job applications with CV attachment, read SEO tech blogs, and interact with the 24/7 Google Gemini AI Chatbot.")
                            ]
                        })
                    ]
                }),

                new Paragraph({ spacing: { before: 300, after: 150 }, text: "" }),

                // Section 2: ROLE 1 - ADMIN DASHBOARD
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 120 },
                    children: [
                        new TextRun({
                            text: "2. Role 1: Platform Administrator & IT Manager (Admin Hub)",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 140 },
                    children: [
                        new TextRun({
                            text: "The Admin Dashboard provides full centralized governance over client support operations, communications, user accounts, and dynamic marketing content. Below is the detailed breakdown of all administrative modules:"
                        })
                    ]
                }),

                // Admin Modules
                ...createFeatureBlock(
                    "2.1",
                    "Requests & Support Tickets Manager (RequestsManager.jsx)",
                    "Platform Administrator / IT Engineers",
                    "Centralized inbox to monitor and resolve all inbound client requests across 6 categories.",
                    [
                        { name: "Tabbed Inbox Filtering", desc: "Filter requests by All, Contact Forms, Callbacks, Enquiries, Careers (CVs), and Support Tickets." },
                        { name: "Live Stats & Badging", desc: "Displays real-time count cards for New, In Progress, Resolved, and Total requests." },
                        { name: "Client Nudge / Reminder Banner", desc: "Animated flashing banner showing how many reminders the client sent and the timestamp of their last nudge." },
                        { name: "Attachment Downloader", desc: "Displays all client-attached error logs, screenshots, and PDFs in dedicated pills with 1-click download." },
                        { name: "Resume / CV Downloader", desc: "Direct Cloudinary fl_attachment streaming button to download candidate resumes instantly." },
                        { name: "Status Lifecycle Toggles", desc: "Quick-click status updates: New, Read, Approved, In Progress, Resolved, Rejected, Closed." },
                        { name: "Official Solution Dispatcher", desc: "Rich text input for engineers to write resolutions; saving auto-updates ticket status to 'Resolved' and emails the client." }
                    ],
                    "IT operations team ko ek unified platform deta hai jaha sabhi client issues, callbacks, aur candidate resumes ko bina email check kiye ek jagah se manage kiya ja sake.",
                    "Frontend api/submissions GET call karke real-time list lata hai. Jab admin status update karta hai ya official solution likhta hai, to PUT /api/submissions/:id trigger hota hai jo database me save karta hai aur backend emailService.js ke zariye client ko formatted solution email bhej deta hai."
                ),

                ...createFeatureBlock(
                    "2.2",
                    "Client Accounts & Company Manager (ClientAccountsManager.jsx)",
                    "Platform Administrator",
                    "Manage corporate client company profiles, access credentials, and AMC contract linkage.",
                    [
                        { name: "Create Client Account", desc: "Register company profile with Company ID (e.g., G-TECH), company name, contact email, phone, and secure password/PIN." },
                        { name: "AMC Plan Assignment", desc: "Link the client's account to their active AMC subscription tier (Silver, Gold, Platinum)." },
                        { name: "Status Governance", desc: "Activate or temporarily suspend client portal access with 1-click toggle." },
                        { name: "Password Reset & Edit", desc: "Update client details and reset login credentials securely." }
                    ],
                    "Corporate clients ko secure Client Portal access provide karna aur multi-tenant data isolation maintain karna.",
                    "Admin dwara form submit karne par backend bcryptjs se password hash karke Client table me store karta hai. Ye credentials client ko /client-portal par login karne ki permission dete hain."
                ),

                ...createFeatureBlock(
                    "2.3",
                    "AMC Plans & Service Tiers Manager (AMCPlansManager.jsx)",
                    "Platform Administrator / Sales",
                    "Configure and maintain Annual Maintenance Contract (AMC) packages shown to clients and visitors.",
                    [
                        { name: "Tier Definition", desc: "Add or modify plans like Basic Support, Enterprise Cloud AMC, 24/7 Cybersecurity Shield." },
                        { name: "Feature Checklist", desc: "Dynamically add SLA response times, on-site visit quotas, server monitoring checkmarks." },
                        { name: "Pricing & Billing Cycles", desc: "Set monthly and annual pricing rates with discount badges." }
                    ],
                    "Sales aur support packages ko dynamic banana taaki bina code modify kiye naye AMC plans live kiye ja sakein.",
                    "Content backend me JSON schema me persist hota hai aur frontend ke /amc-plans aur /pricing page par instant synchronize ho jata hai."
                ),

                ...createFeatureBlock(
                    "2.4",
                    "Dynamic Blog & Tech Article CMS (BlogsManager.jsx)",
                    "Platform Administrator / Content Team",
                    "Manage search-engine optimized technical articles, cybersecurity whitepapers, and company news.",
                    [
                        { name: "Rich Text Editor", desc: "Format headings, bold, bullet points, blockquotes, and embedded code snippets." },
                        { name: "Cover Image Cloudinary Upload", desc: "Upload and crop high-resolution feature images with automatic CDN hosting." },
                        { name: "SEO Meta Tags & URL Slugs", desc: "Set custom Meta Title, Meta Description, canonical URLs, and auto-generated slugs." },
                        { name: "Publishing Workflow", desc: "Draft vs. Published mode with read-time calculator and author attribution." }
                    ],
                    "Company ki online SEO visibility, organic traffic aur domain authority badhana.",
                    "Post publish hone par Puppeteer prerender engine automatically /blogs/:slug route ko crawl karke static HTML aur sitemap.xml update kar deta hai for Google indexing."
                ),

                ...createFeatureBlock(
                    "2.5",
                    "Dynamic Services & Pages Editor (PagesManager.jsx & LivePageEditor.jsx)",
                    "Platform Administrator",
                    "Create and visually edit corporate IT service pages without writing code.",
                    [
                        { name: "Modular Layout Builder", desc: "Build service pages using pre-styled hero banners, feature grids, SLA blocks, and CTA sections." },
                        { name: "Live Preview Mode", desc: "Preview changes in real time before publishing to live visitors." },
                        { name: "Dynamic Slug Routing", desc: "Create routes like /services/cloud-migration with auto-generated dynamic components." }
                    ],
                    "Naye IT services (e.g. AI Consulting, Server Support) ko turant launch karna bina developer ki zarurat ke.",
                    "Backend /api/pages route me page schema store hota hai jise DynamicPage.jsx dynamically fetch karke render karta hai."
                ),

                ...createFeatureBlock(
                    "2.6",
                    "Navigation & Footer CMS (NavbarManager.jsx & FooterManager.jsx)",
                    "Platform Administrator",
                    "Maintain header navigation dropdowns, footer link columns, and social links.",
                    [
                        { name: "Header Navigation Links", desc: "Add, reorder, or remove navigation links and nested dropdown menus." },
                        { name: "CTA Button Customizer", desc: "Update header 'Book Audit' button text, color, and destination URL." },
                        { name: "Footer Columns & Legal", desc: "Manage footer columns, contact numbers, corporate address, and copyright notices." }
                    ],
                    "Website navigation ko hamesha updated aur conversion-optimized rakhna.",
                    "Frontend ContentContext application startup par /api/content/navbar aur /api/content/footer load karta hai aur globally update kar deta hai."
                ),

                ...createFeatureBlock(
                    "2.7",
                    "Careers & Vacancies Manager (CareersManager.jsx)",
                    "Platform Administrator / HR",
                    "Post job openings and review candidate applications with attached CVs.",
                    [
                        { name: "Job Openings Manager", desc: "Post roles (e.g., Senior DevOps Engineer, IT Support Specialist) with experience and salary brackets." },
                        { name: "Applicant Review Dashboard", desc: "View candidate submissions with contact info, cover notes, and direct resume download link." }
                    ],
                    "HR recruitment workflow ko automate karna aur job portals par dependency kam karna.",
                    "Jab candidate /join-us par apply karta hai, to resume Cloudinary/disk par upload hoke admin ko notify ho jata hai."
                ),

                ...createFeatureBlock(
                    "2.8",
                    "AI Content Generator Tool (AIGeneratorModal.jsx)",
                    "Platform Administrator / Content Creators",
                    "Integrated Google Gemini AI assistant inside the admin dashboard to generate marketing copy and blog posts.",
                    [
                        { name: "Topic to Blog Generator", desc: "Input a technical topic to generate a complete 1000-word structured blog post with headings." },
                        { name: "Service Description Writer", desc: "Draft marketing descriptions and feature bullet points for new services in seconds." }
                    ],
                    "Content creation time ko 80% reduce karna aur professional enterprise tone maintain karna.",
                    "Directly frontend se Google Gemini AI API (@google/generative-ai) ko call karta hai aur generated output ko editor me inject kar deta hai."
                ),

                new Paragraph({ spacing: { before: 300, after: 150 }, text: "" }),

                // Section 3: ROLE 2 - CLIENT PORTAL
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 120 },
                    children: [
                        new TextRun({
                            text: "3. Role 2: Contracted Enterprise Client (Client Portal)",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 140 },
                    children: [
                        new TextRun({
                            text: "The Client Portal (/client-portal) is an isolated, high-security self-service workspace for contracted companies. It is divided into 2 primary dedicated tabs:"
                        })
                    ]
                }),

                ...createFeatureBlock(
                    "3.1",
                    "Workspace A: 🎫 Support Tickets & Live Helpdesk",
                    "Contracted Enterprise Client",
                    "Complete ticket lifecycle management, multi-file uploads, live conversations, and urgent escalations.",
                    [
                        { name: "Multi-File Drag & Drop Upload", desc: "Raise tickets with error screenshots, PDFs, config files, or logs up to 25MB with upload progress bars." },
                        { name: "Real-Time Status & Priority", desc: "Live status badges (New, Under Review, In Progress, Resolved, Closed) and priority tags (Low, Medium, High, Urgent)." },
                        { name: "Interactive Reply & Conversation", desc: "Client can post follow-up comments and attach new screenshots directly to open tickets." },
                        { name: "Smart Nudge / Send Reminder", desc: "1-click escalation button (with 5-min anti-spam cooldown) sending urgent alerts to IT engineers." },
                        { name: "Official Engineer Solution", desc: "Displays step-by-step resolution written by verified support engineers with timestamp." }
                    ],
                    "Client ko 24/7 transparent support tracking provide karna aur issue resolution speed ko 3x fast karna.",
                    "Client multipart request bhejta hai -> Backend fileUploader.js Cloudinary/disk par save karke attachments array banata hai -> Submission me merge hota hai -> Admin ko email alert jata hai."
                ),

                ...createFeatureBlock(
                    "3.2",
                    "Workspace B: 📁 My Documents & Central Company Repository",
                    "Contracted Enterprise Client & Account Managers",
                    "Centralized secure cloud vault for corporate documentation and IT assets.",
                    [
                        { name: "Centralized Document Vault", desc: "Store AMC agreements, monthly SLA performance reports, invoices, and network architecture diagrams." },
                        { name: "Smart Categorization", desc: "Filter by All, Contracts, Invoices, Reports, and General." },
                        { name: "Real-Time Search", desc: "Instant search across document file names and descriptions." },
                        { name: "Direct Client File Upload", desc: "Upload company files with custom category and description." },
                        { name: "1-Click Direct Download & Delete", desc: "Download files directly or delete outdated versions with tenant security." }
                    ],
                    "Client ko bar-bar email par contracts ya invoices mangne ki zarurat na pade; sabhi legal aur technical documents ek jagah organized rahein.",
                    "ClientDocument model me companyId ke sath file metadata store hota hai. ClientAuthMiddleware verify karta hai ki client sirf apni company ke documents hi access kar sake."
                ),

                new Paragraph({ spacing: { before: 300, after: 150 }, text: "" }),

                // Section 4: ROLE 3 - PUBLIC WEBSITE & LEAD ENGINE
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 120 },
                    children: [
                        new TextRun({
                            text: "4. Role 3: Public Website Visitor, Lead & Job Seeker",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 140 },
                    children: [
                        new TextRun({
                            text: "The Public Corporate Website (/) is engineered for maximum visitor conversion, high SEO rankings, and seamless lead acquisition:"
                        })
                    ]
                }),

                ...createFeatureBlock(
                    "4.1",
                    "Corporate Home & Dynamic IT Service Catalog",
                    "Website Visitors / Prospective Clients",
                    "Showcase IT infrastructure solutions, cybersecurity, cloud consulting, and client trust proofs.",
                    [
                        { name: "Animated Hero & Stats", desc: "Dynamic counters for 99.9% uptime, 500+ clients served, and 24/7 NOC monitoring." },
                        { name: "Service Offerings (/services/:slug)", desc: "Deep-dive pages for Managed IT, Cloud Solutions, Server Support, and Network Infrastructure with SLA details." },
                        { name: "Pricing & AMC Plans (/pricing, /amc-plans)", desc: "Interactive plan comparison table with monthly/annual toggle and feature checklist." },
                        { name: "Client & Partner Trust Proofs", desc: "Showcase enterprise client logos, technology partner affiliations (Microsoft, Cisco, AWS), and verified testimonials." }
                    ],
                    "Prospective clients ko enterprise capability showcase karna aur consultation book karne ke liye motivate karna.",
                    "React SPA architecture with Tailwind CSS animations for sleek user experience, with prerendered static HTML for instant load times."
                ),

                ...createFeatureBlock(
                    "4.2",
                    "Interactive Lead Capture Engine (Contact, Callback & Audit Forms)",
                    "Prospective Clients / Sales Leads",
                    "Multiple high-intent capture channels across the website.",
                    [
                        { name: "Request a Callback Form", desc: "Visitors can select a preferred time slot (Morning, Afternoon, Evening) for immediate sales calls." },
                        { name: "Free IT Infrastructure Audit", desc: "Comprehensive audit request form capturing company size, current IT pain points, and server needs." },
                        { name: "Public Support Ticket (/support)", desc: "Emergency public ticket submission with file/screenshot upload for new clients." }
                    ],
                    "Visitor-to-lead conversion rate maximize karna aur zero lead loss ensure karna.",
                    "Form submit hone par database me Submission record banta hai aur instantly sales/support team ko email notification chala jata hai."
                ),

                ...createFeatureBlock(
                    "4.3",
                    "Careers Portal with CV Attachment (/join-us)",
                    "Job Seekers / IT Professionals",
                    "Job opening showcase and candidate application pipeline.",
                    [
                        { name: "Live Vacancy Listings", desc: "Browse open technical and support positions with requirements and salary ranges." },
                        { name: "Resume / CV Multipart Upload", desc: "Applicants upload PDF or Word resumes (upto 25MB) directly during form submission." }
                    ],
                    "Recruitment process ko streamline karna aur qualified candidate resumes ko direct admin dashboard me deliver karna.",
                    "File upload utility resume ko Cloudinary/local storage me bhej kar direct link email aur admin RequestsManager me provide karta hai."
                ),

                ...createFeatureBlock(
                    "4.4",
                    "Google Gemini AI Virtual Assistant",
                    "All Website Visitors",
                    "24/7 intelligent conversational AI assistant embedded across all pages.",
                    [
                        { name: "Real-Time IT Troubleshooting", desc: "Answers technical questions regarding network outages, cloud migrations, and security protocols." },
                        { name: "Service Recommendation", desc: "Recommends matching UnioTech IT packages based on visitor's company size and budget." },
                        { name: "Lead Qualification", desc: "Prompts users to book a callback or raise a ticket directly through chat." }
                    ],
                    "Instant 24/7 visitor engagement provide karna aur bounce rate reduce karna.",
                    "Integrated with @google/generative-ai SDK passing structured company prompts to deliver tailored corporate responses."
                ),

                new Paragraph({ spacing: { before: 300, after: 150 }, text: "" }),

                // Section 5: Automated Email & Communication Subsystem
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 120 },
                    children: [
                        new TextRun({
                            text: "5. Automated Email & Notification Subsystem (Nodemailer)",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 140 },
                    children: [
                        new TextRun({
                            text: "Every critical action across the platform triggers a formatted HTML email via Nodemailer SMTP:"
                        })
                    ]
                }),

                // Email Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                createHeaderCell("Trigger Event", 22),
                                createHeaderCell("Recipient", 18),
                                createHeaderCell("Email Subject", 25),
                                createHeaderCell("Key Data & Attachments Included", 35)
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("1. Ticket Raised", true),
                                createDataCell("Client & Admin"),
                                createDataCell("Ticket Received - #[ID]"),
                                createDataCell("Ticket ID, priority badge, issue summary, and formatted table of attached file links.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("2. Client Reply on Ticket", true),
                                createDataCell("Admin Team"),
                                createDataCell("Client Reply on Ticket #[ID]"),
                                createDataCell("Full conversation log, client company name, and newly attached screenshot download links.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("3. Client Urgent Nudge", true),
                                createDataCell("Admin Team"),
                                createDataCell("URGENT: Reminder on #[ID]"),
                                createDataCell("Escalation alert, reminder count, time since last nudge, and direct admin action link.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("4. Official Solution Provided", true),
                                createDataCell("Client"),
                                createDataCell("Official Solution: #[ID]"),
                                createDataCell("Complete engineer resolution text, ticket status update to Resolved, and portal login link.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("5. Career / Job Application", true),
                                createDataCell("HR / Admin"),
                                createDataCell("New Career Application - [Name]"),
                                createDataCell("Candidate name, phone, email, applied position, and direct 1-click CV download link.")
                            ]
                        }),
                        new TableRow({
                            children: [
                                createDataCell("6. Callback / Lead Form", true),
                                createDataCell("Sales / Admin"),
                                createDataCell("New Lead Submission from [Name]"),
                                createDataCell("Prospect phone, email, preferred callback time slot, and infrastructure requirements.")
                            ]
                        })
                    ]
                }),

                new Paragraph({ spacing: { before: 300, after: 150 }, text: "" }),

                // Section 6: Architecture, Security & Storage
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 120 },
                    children: [
                        new TextRun({
                            text: "6. Security, Storage & SEO Architecture Summary",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "• Hybrid Storage Resilience: ", bold: true, color: primaryColor }),
                        new TextRun({ text: "File uploads automatically try Cloudinary CDN first; if network/API limits occur, they instantly fallback to secure local disk storage (/uploads/) to guarantee zero file upload failures.\n" }),
                        new TextRun({ text: "• 100% SEO Prerendering: ", bold: true, color: primaryColor }),
                        new TextRun({ text: "Custom Headless Chrome crawler (prerender.js) pre-renders all static and dynamic routes into crawlable HTML with sitemap.xml for top Google ranking.\n" }),
                        new TextRun({ text: "• Multi-Tenant Data Isolation: ", bold: true, color: primaryColor }),
                        new TextRun({ text: "Client accounts can only view and manage their own company's tickets and documents via JWT middleware and Sequelize Op filters.\n" }),
                        new TextRun({ text: "• Production cPanel & Cloud Ready: ", bold: true, color: primaryColor }),
                        new TextRun({ text: "Clean separation of frontend build (dist) and Node.js backend (backend_s) with automated DB migrations for 1-click cPanel deployment." })
                    ]
                }),

                new Paragraph({ spacing: { before: 200, after: 100 }, text: "" }),

                // Closing Callout
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    shading: { fill: cardBgColor, type: ShadingType.CLEAR },
                                    margins: { top: 140, bottom: 140, left: 160, right: 160 },
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({ text: "✅ Conclusion for Management: ", bold: true, color: "065F46" }),
                                                new TextRun({ text: "This project is a fully integrated, production-tested enterprise platform. It eliminates manual support overhead, secures client document exchanges, and delivers an automated marketing-to-resolution pipeline for UnioTech IT Solutions." })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    
    // Save to root directory as Unio_Project_Documentation_Updated.docx
    const targetPath1 = path.join(__dirname, '..', '..', 'Unio_Project_Documentation_Updated.docx');
    fs.writeFileSync(targetPath1, buffer);
    console.log('Saved to:', targetPath1);

    // Also save as UnioTech_Project_Documentation.docx (or alternative if locked)
    try {
        const targetPath2 = path.join(__dirname, '..', '..', 'UnioTech_Project_Documentation.docx');
        fs.writeFileSync(targetPath2, buffer);
        console.log('Saved to:', targetPath2);
    } catch(e) {
        const targetPath3 = path.join(__dirname, '..', '..', 'UnioTech_Project_Complete_Documentation.docx');
        fs.writeFileSync(targetPath3, buffer);
        console.log('Saved to:', targetPath3);
    }
}

generateComprehensiveDocx().catch(err => {
    console.error('Error generating docx:', err);
    process.exit(1);
});
