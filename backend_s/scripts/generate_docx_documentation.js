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

async function generateDocx() {
    const primaryColor = "1E3A8A"; // Deep Blue
    const secondaryColor = "0284C7"; // Sky Blue
    const darkTextColor = "1F2937"; // Gray-800
    const lightBgColor = "F0F9FF"; // Sky-50

    const cellBorder = {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" }
    };

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22, // 11pt
                        color: darkTextColor
                    }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1 inch
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: [
                // Title
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: "UnioTech IT Solutions",
                            bold: true,
                            size: 38,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 },
                    children: [
                        new TextRun({
                            text: "Enterprise Platform Architecture & Project Specifications",
                            bold: true,
                            size: 26,
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
                                                new TextRun({ text: "Document Version: ", bold: true, color: primaryColor }),
                                                new TextRun({ text: "2.0 (Comprehensive & Feature-Complete)\n" }),
                                                new TextRun({ text: "Project Scope: ", bold: true, color: primaryColor }),
                                                new TextRun({ text: "Corporate Website, Client Helpdesk Portal, Document Vault & Admin CMS\n" }),
                                                new TextRun({ text: "Target Audience: ", bold: true, color: primaryColor }),
                                                new TextRun({ text: "Management, Project Stakeholders, Technical Leads & Client Support" })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                new Paragraph({ spacing: { before: 300, after: 150 }, text: "" }),

                // Section 1: Executive Summary
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 240, after: 120 },
                    children: [
                        new TextRun({
                            text: "1. Executive Summary & Core Platform Overview",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: "UnioTech IT Solutions is an enterprise-grade digital platform engineered to unify external client acquisition with authenticated client support operations and back-office management. The platform delivers an end-to-end ecosystem connecting prospective buyers, active enterprise clients, and internal IT support engineers."
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 180 },
                    children: [
                        new TextRun({
                            text: "Key Business Pillars:\n",
                            bold: true
                        }),
                        new TextRun({ text: "• High-Performance Lead Generation: SEO prerendered service pages, dynamic tech blogs, Google Gemini AI Chatbot, and instant consultation scheduling.\n" }),
                        new TextRun({ text: "• Enterprise Client Portal: Dedicated self-service hub for client companies to raise support tickets with multi-file attachments, converse in real time, send urgent escalation nudges, and access a secure company document repository.\n" }),
                        new TextRun({ text: "• Central Admin Command Center: Unified management dashboard for triaging support requests, sending official engineer resolutions with auto-emailing, managing resumes/CVs, and maintaining dynamic CMS content." })
                    ]
                }),

                // Section 2: Technical Architecture
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 140 },
                    children: [
                        new TextRun({
                            text: "2. Technical Stack & Infrastructure Architecture",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),

                // Tech Stack Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                    width: { size: 30, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Layer / Component", bold: true, color: "FFFFFF" })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                    width: { size: 70, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Technology & Implementation Details", bold: true, color: "FFFFFF" })] })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Frontend Framework", bold: true })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "React 18 + Vite (TailwindCSS, Lucide Icons, Framer Motion animations)" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "SEO & Prerendering", bold: true })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Headless Chrome Puppeteer crawler (prerender.js) generating 100% pre-rendered static HTML routes and sitemap.xml" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "AI Virtual Assistant", bold: true })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Google Gemini AI SDK (@google/generative-ai) for instant intelligent interactive client troubleshooting & service advice" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Backend Server", bold: true })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Node.js + Express.js REST API with CORS, JWT middleware, rate-limiting, and error pipelines" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Database & ORM", bold: true })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "MySQL (Production) / SQLite (Dev) via Sequelize ORM with automatic schema synchronization" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "File Storage & Uploads", bold: true })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Hybrid Cloudinary CDN + Local Disk Fallback (/uploads/) handling screenshots, logs, and docs up to 25MB" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Automated Emails", bold: true })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Nodemailer SMTP integration sending formatted HTML ticket alerts, official resolutions, and urgent nudges" })]
                                })
                            ]
                        })
                    ]
                }),

                // Section 3: Portal Breakdown
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 340, after: 140 },
                    children: [
                        new TextRun({
                            text: "3. Detailed Portal Breakdown & Feature Specifications",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),

                // 3.1 Public Portal
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                    children: [
                        new TextRun({
                            text: "A. Public Corporate Website & Lead Engine",
                            bold: true,
                            size: 24,
                            color: secondaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({ text: "• Interactive Home & Services: Showcase Managed IT, Cloud Solutions, Cybersecurity, Network Setup, and IT Audits with dynamic pricing & quotes.\n" }),
                        new TextRun({ text: "• Dynamic Knowledge Base & Tech Blogs: Search-engine optimized articles with read-time estimations, categories, and author credentials.\n" }),
                        new TextRun({ text: "• Lead Acquisition Forms: Quick Contact form, 'Request a Callback' with time picker, Free IT Infrastructure Audit request, and Public Support Ticket creation.\n" }),
                        new TextRun({ text: "• Careers & CV Upload: Job vacancy listings with multipart PDF/Word resume upload directly accessible to HR.\n" }),
                        new TextRun({ text: "• Google Gemini AI Assistant: Conversational agent available 24/7 across the site to guide users and qualify inbound leads." })
                    ]
                }),

                // 3.2 Client Portal
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                    children: [
                        new TextRun({
                            text: "B. Authenticated Client Portal (/client-portal)",
                            bold: true,
                            size: 24,
                            color: secondaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({ text: "• Secure Company Login: Multi-tenant login requiring Company ID / Email and password, isolating client company tickets and documents.\n" }),
                        new TextRun({ text: "• Tab 1 — 🎫 Support Tickets Hub:\n", bold: true }),
                        new TextRun({ text: "   - Real-Time Status Tracking: Live status badges (New, Under Review, In Progress, Resolved, Closed) and Priority indicators (Low, Medium, High, Urgent).\n" }),
                        new TextRun({ text: "   - Raise Ticket with Multi-File Upload: Drag-and-drop widget supporting screenshots, error logs, and documents up to 25MB with upload progress bars.\n" }),
                        new TextRun({ text: "   - Interactive Conversation Thread: Clients can post follow-up comments and attach additional screenshots to existing open tickets.\n" }),
                        new TextRun({ text: "   - 'Nudge / Send Reminder' Feature: Smart 1-click button (with 5-minute anti-spam cooldown) triggering high-priority escalation emails to admin engineers.\n" }),
                        new TextRun({ text: "   - Official Engineer Solution: Displays the verified solution provided by IT support engineers with timestamps.\n" }),
                        new TextRun({ text: "• Tab 2 — 📁 My Documents & Files Repository:\n", bold: true }),
                        new TextRun({ text: "   - Centralized Company Vault: Stores corporate contracts, AMCs, SLA reports, invoices, and network diagrams.\n" }),
                        new TextRun({ text: "   - Categorization & Live Search: Instant filtering by All, Contracts, Invoices, Reports, General, and real-time text query search.\n" }),
                        new TextRun({ text: "   - Direct Document Upload & Download: Clients and managers can upload and manage documentation with 1-click direct download." })
                    ]
                }),

                // 3.3 Admin Command Center
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                    children: [
                        new TextRun({
                            text: "C. Central Admin Management Command Center (/admin)",
                            bold: true,
                            size: 24,
                            color: secondaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({ text: "• Requests & Tickets Command Hub (RequestsManager.jsx):\n", bold: true }),
                        new TextRun({ text: "   - Unified tabbed inbox for Contact Requests, Callbacks, Enquiries, Career Resumes, and Support Tickets.\n" }),
                        new TextRun({ text: "   - Live statistics counters for New, In-Progress, and Total submissions.\n" }),
                        new TextRun({ text: "   - Visual Urgent Nudge Banners notifying administrators when clients request ticket updates.\n" }),
                        new TextRun({ text: "   - Attachment Viewer & 1-Click Downloader for ticket screenshots, logs, and candidate CVs.\n" }),
                        new TextRun({ text: "   - Official Solution Dispatcher: Built-in response system that writes official engineer solutions, updates ticket state, and dispatches automated client emails.\n" }),
                        new TextRun({ text: "• Dynamic CMS Management:\n", bold: true }),
                        new TextRun({ text: "   - Blog Management: Create, edit, and publish rich articles with cover images and custom SEO meta tags.\n" }),
                        new TextRun({ text: "   - Service Management: Update IT service offerings, key features, and SLAs dynamically.\n" }),
                        new TextRun({ text: "   - System Settings: Configure administrative credentials and platform notification settings." })
                    ]
                }),

                // Section 4: Email Automation
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 140 },
                    children: [
                        new TextRun({
                            text: "4. Automated Email & Communication Workflow",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: "The platform operates an automated SMTP email pipeline via Nodemailer for seamless synchronization between clients and support staff:"
                        })
                    ]
                }),

                // Email Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Trigger Event", bold: true, color: "FFFFFF" })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Recipient", bold: true, color: "FFFFFF" })] })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    shading: { fill: primaryColor, type: ShadingType.CLEAR },
                                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Automated Content & Attachments", bold: true, color: "FFFFFF" })] })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Ticket Raised" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Client & Admin" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Ticket ID, priority badge, issue details, and formatted table of attached file links" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Client Reply / Update" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Admin Team" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Full conversation log, client company ID, and newly attached screenshot links" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Client Nudge / Reminder" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Admin Team" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "High-priority escalation alert with reminder count and direct ticket access link" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Engineer Official Solution" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Client" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Complete official resolution text, status update to Resolved, and portal login link" })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Career / CV Application" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "HR / Admin" })]
                                }),
                                new TableCell({
                                    borders: cellBorder,
                                    margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                    children: [new Paragraph({ text: "Applicant name, contact, applied role, and direct 1-click CV download link" })]
                                })
                            ]
                        })
                    ]
                }),

                // Section 5: Key Value Proposition
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 340, after: 140 },
                    children: [
                        new TextRun({
                            text: "5. Executive Summary for Stakeholders & Management",
                            bold: true,
                            size: 28,
                            color: primaryColor
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: "The UnioTech IT Solutions platform represents a complete, production-verified system ready for full deployment. It maximizes lead generation and brand authority while reducing operational IT support overhead through automation, resilient file storage, and self-service transparency."
                        })
                    ]
                })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    
    // Save to root directory as Unio_Project_Documentation_Updated.docx (replacing the old doc)
    const targetPath1 = path.join(__dirname, '..', '..', 'Unio_Project_Documentation_Updated.docx');
    fs.writeFileSync(targetPath1, buffer);
    console.log('Generated Word document at:', targetPath1);

    // Also save as UnioTech_Project_Documentation.docx for clean naming
    const targetPath2 = path.join(__dirname, '..', '..', 'UnioTech_Project_Documentation.docx');
    fs.writeFileSync(targetPath2, buffer);
    console.log('Generated Word document at:', targetPath2);
}

generateDocx().catch(err => {
    console.error('Failed to generate docx:', err);
    process.exit(1);
});
