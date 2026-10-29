# UnioTech IT Solutions — Complete Platform & Technical Architecture Breakdown
**Document Version:** 3.0 (Role-by-Role Feature Specifications & Operational Workflows)  
**Target Roles:** Platform Administrator, Contracted Enterprise Client, Public Website Visitor & Lead  
**Document Purpose:** Complete executive & technical breakdown of all modules, permissions, purpose (*Kya work hai*), and end-to-end technical workflows (*Kaise work karta hai*).

---

## 1. Platform Overview & User Role Permissions Matrix

The **UnioTech IT Solutions** platform is built with a 3-tier role architecture to unify external corporate marketing with authenticated client support and administrative operations:

| User Role | Dedicated Portal / Route | Key Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **1. Platform Administrator & IT Manager** | `/admin` (Admin Command Center) | Full governance over support tickets, client company accounts, AMC subscriptions, dynamic CMS (Blogs, Services, Hero, Navigation), and automated email responses. |
| **2. Contracted Enterprise Client** | `/client-portal` (Client Helpdesk) | Multi-tenant self-service hub to raise support tickets with multi-file drag & drop uploads (up to 25MB), converse in ticket threads, send urgent 1-click reminders/nudges, and manage company contracts/invoices in the Document Repository. |
| **3. Public Visitor / Prospect / Applicant** | `/` (Public Corporate Portal) | Explore Managed IT & Cloud services, request callbacks with preferred time slots, request free IT infrastructure audits, submit job applications with CV attachments, read SEO blogs, and interact with the 24/7 Google Gemini AI Chatbot. |

---

## 2. Role 1: Platform Administrator & IT Operations Hub (`/admin`)

The Administrative Command Center provides full centralized oversight over business leads, client support operations, and dynamic content.

---

### Module 2.1: Requests & Support Tickets Manager (`RequestsManager.jsx`)
- **Target Role:** Platform Administrator / IT Support Engineers
- **Features Included:**
  - **Tabbed Filtering:** Categorized views for `All Requests`, `Contact Forms`, `Callbacks`, `Enquiries`, `Careers (CVs)`, and `Support Tickets`.
  - **Live Statistics Cards:** Real-time counters displaying counts for *New*, *In Progress*, *Resolved*, and *Total* submissions.
  - **Urgent Client Nudge Banner:** Animated flashing banner displaying how many reminders the client sent and the timestamp of their last nudge.
  - **Attachment Inspector & Downloader:** Dedicated pill badges for all client-attached error logs, screenshots, and PDFs with 1-click download.
  - **Resume / CV Downloader:** Direct Cloudinary attachment streaming button for candidate resumes.
  - **Status Lifecycle Toggles:** 1-click status transitions: `New`, `Read`, `Approved`, `In Progress`, `Resolved`, `Rejected`, `Closed`.
  - **Official Solution Dispatcher:** Rich response box allowing engineers to write formal resolutions; saving auto-updates ticket status and emails the client.
- **📌 Kya Work Hai (Purpose):** IT support team ko ek centralized desk provide karna jaha se sabhi client tickets, callbacks aur job resumes ko bina email login kiye directly triage aur resolve kiya ja sake.
- **⚙️ Kaise Work Karta Hai (Workflow):**
  1. Frontend `/api/submissions` GET call se real-time requests load karta hai.
  2. Admin jab ticket expand karta hai, to conversation history aur attached files show hoti hain.
  3. Admin solution likhkar submit karta hai $\rightarrow$ `PUT /api/submissions/:id` route database me `adminResponse` update karta hai aur status `resolved` set karta hai.
  4. Backend `emailService.js` automatically client ko formatted HTML solution email bhej deta hai.

---

### Module 2.2: Client Accounts & Company Manager (`ClientAccountsManager.jsx`)
- **Target Role:** Platform Administrator
- **Features Included:**
  - **Client Account Provisioning:** Register new client company profile with Company ID (e.g. `G-TECH`), company name, contact email, phone, and secure password/PIN.
  - **AMC Plan Association:** Link client profile with an active AMC tier (Silver, Gold, Platinum).
  - **Account Status Toggles:** Instantly activate or suspend client portal access.
  - **Password & Profile Management:** Update client contact numbers or reset credentials securely.
- **📌 Kya Work Hai (Purpose):** Contracted enterprise clients ko secure Client Portal credentials provide karna aur multi-tenant data privacy ensure karna.
- **⚙️ Kaise Work Karta Hai (Workflow):** Admin form submit karta hai $\rightarrow$ Backend `bcryptjs` se password hash karke `Client` model me save karta hai. Client in credentials se `/client-portal` par login karke sirf apni company ke tickets aur documents dekh sakta hai.

---

### Module 2.3: AMC Plans & Tier Manager (`AMCPlansManager.jsx`)
- **Target Role:** Platform Administrator / Sales Lead
- **Features Included:**
  - **Plan Creation & Editing:** Create plans like *Basic Maintenance*, *Enterprise Cloud AMC*, *24/7 Security Shield*.
  - **Feature Matrix Editor:** Add custom SLA response times, on-site visit quotas, and remote monitoring checkmarks.
  - **Pricing & Billing Cycles:** Set monthly and annual pricing with discount tags.
- **📌 Kya Work Hai (Purpose):** Sales aur service packages ko dynamic banana taaki bina code update kiye naye AMC plans website par live kiye ja sakein.
- **⚙️ Kaise Work Karta Hai (Workflow):** Plan data `/api/content` me JSON schema ke roop me save hota hai aur public website ke `/amc-plans` aur `/pricing` pages par dynamically render hota hai.

---

### Module 2.4: Dynamic Blog & Knowledge Base CMS (`BlogsManager.jsx`)
- **Target Role:** Platform Administrator / Marketing Team
- **Features Included:**
  - **Rich Text Article Editor:** Headings, bold, bullet points, blockquotes, and code formatting.
  - **Cloudinary Cover Image Upload:** Direct CDN image upload with auto-resizing.
  - **SEO Meta Tags & URL Slugs:** Custom Meta Title, Meta Description, and automated clean URL slugs.
  - **Draft vs. Published Workflow:** Control post visibility with automatic read-time calculator.
- **📌 Kya Work Hai (Purpose):** Company ki organic SEO reach, Google search rankings, aur domain authority badhana.
- **⚙️ Kaise Work Karta Hai (Workflow):** Blog save hote hi backend `Blog` model me persist hota hai. Frontend build ke waqt `prerender.js` crawler `/blogs/:slug` route ko crawl karke pre-rendered static HTML aur `sitemap.xml` generate karta hai.

---

### Module 2.5: Dynamic Services & Page Builder (`PagesManager.jsx` & `LivePageEditor.jsx`)
- **Target Role:** Platform Administrator
- **Features Included:**
  - **Modular Page Builder:** Create custom service pages using hero banners, feature grids, SLA blocks, and CTA sections.
  - **Live Preview Mode:** Real-time preview before publishing changes to live traffic.
  - **Dynamic Slug Routing:** Automatically registers routes like `/services/cloud-migration`.
- **📌 Kya Work Hai (Purpose):** Naye IT services ko market me turant launch karna bina developer dependency ke.
- **⚙️ Kaise Work Karta Hai (Workflow):** Page configurations `/api/pages` endpoint me store hoti hain. Jab user `/services/:slug` visit karta hai, `DynamicPage.jsx` backend se layout fetch karke render karta hai.

---

### Module 2.6: Navigation & Footer CMS (`NavbarManager.jsx` & `FooterManager.jsx`)
- **Target Role:** Platform Administrator
- **Features Included:**
  - **Header Navigation Management:** Add, reorder, or edit navigation links and nested dropdown menus.
  - **CTA Button Customizer:** Customize header 'Book Audit' or 'Get Quote' button text and destination URL.
  - **Footer Columns & Legal:** Manage footer columns, contact numbers, address, and copyright notices.
- **📌 Kya Work Hai (Purpose):** Website navigation aur global branding ko hamesha updated aur conversion-optimized rakhna.
- **⚙️ Kaise Work Karta Hai (Workflow):** Global `ContentContext` app startup par `/api/content/navbar` aur `/api/content/footer` load karta hai aur site-wide navbar/footer ko instantly update kar deta hai.

---

### Module 2.7: Careers & Vacancies Manager (`CareersManager.jsx`)
- **Target Role:** Platform Administrator / HR
- **Features Included:**
  - **Job Opening Postings:** Post technical and support roles with department, experience, and salary brackets.
  - **Applicant Tracker:** View applicant details with contact info, cover notes, and direct 1-click resume download links.
- **📌 Kya Work Hai (Purpose):** HR recruitment pipeline ko automate karna aur job portals par dependency kam karna.
- **⚙️ Kaise Work Karta Hai (Workflow):** Candidate jab `/join-us` par apply karta hai, to resume Cloudinary/local storage me save hota hai aur direct link HR/Admin dashboard me display ho jata hai.

---

### Module 2.8: Google Gemini AI Content Generator (`AIGeneratorModal.jsx`)
- **Target Role:** Platform Administrator / Content Creators
- **Features Included:**
  - **Topic to Blog Generator:** Input a topic to generate a complete 1000-word structured blog post with headings.
  - **Service Description Writer:** Draft marketing copy and feature lists for new IT services in seconds.
- **📌 Kya Work Hai (Purpose):** Content creation time ko 80% reduce karna aur professional enterprise tone maintain karna.
- **⚙️ Kaise Work Karta Hai (Workflow):** Directly Google Gemini AI API (`@google/generative-ai`) ko call karta hai aur generated output ko blog/service editor me inject kar deta hai.

---

## 3. Role 2: Contracted Enterprise Client Portal (`/client-portal`)

The Client Portal is an isolated, high-security self-service workspace for contracted companies, divided into 2 primary dedicated tabs:

---

### Workspace A: 🎫 Support Tickets & Live Helpdesk
- **Features Included:**
  - **Multi-File Drag & Drop Upload:** Raise tickets with screenshots, error logs, configuration files, and PDFs up to 25MB with upload progress bars.
  - **Real-Time Status & Priority Tracking:** Live status badges (`New`, `Under Review`, `In Progress`, `Resolved`, `Closed`) and priority tags (`Low`, `Medium`, `High`, `Urgent`).
  - **Interactive Ticket Conversation Thread:** Clients can post follow-up comments and attach new screenshots directly to existing open tickets.
  - **Smart Nudge / Send Reminder:** 1-click escalation button (with 5-minute anti-spam cooldown) sending urgent alerts to IT engineers.
  - **Official Engineer Solution Card:** Verified support engineer solution card with timestamp and step-by-step resolution details.
- **📌 Kya Work Hai (Purpose):** Client ko 24/7 transparent support tracking provide karna aur issue resolution speed ko 3x fast karna.
- **⚙️ Kaise Work Karta Hai (Workflow):**
  1. Client drag-and-drop se files select karta hai $\rightarrow$ `POST /api/client/upload` multipart request bhejta hai.
  2. `fileUploader.js` Cloudinary ya `/uploads/client_files` me save karke URL generate karta hai.
  3. `POST /api/client/tickets/:id/reply` conversation thread me client reply aur attachments merge kar deta hai.
  4. Admin dashboard me notification chala jata hai aur email trigger ho jata hai.

---

### Workspace B: 📁 My Documents & Central Company Repository
- **Features Included:**
  - **Central Company Vault:** Centralized storage for company-specific contracts, Annual Maintenance Contracts (AMCs), monthly SLA reports, invoices, and network diagrams.
  - **Smart Categorization:** Filter by `All`, `Contracts`, `Invoices`, `Reports`, and `General`.
  - **Real-Time Search:** Instant client-side search across document file names and descriptions.
  - **Direct Client File Upload:** Upload company files with custom category and description.
  - **Secure Direct Download & Deletion:** Direct download links with Cloudinary/disk fallback and secure delete controls.
- **📌 Kya Work Hai (Purpose):** Client ko bar-bar email par contracts ya invoices mangne ki zarurat na pade; sabhi legal aur technical documents ek jagah organized rahein.
- **⚙️ Kaise Work Karta Hai (Workflow):**
  1. Client file upload karta hai $\rightarrow$ `POST /api/client/documents` trigger hota hai.
  2. Record `ClientDocument` table me client ke `companyId` ke sath persist hota hai.
  3. `clientAuthMiddleware` verify karta hai ki client sirf apni company ke documents hi dekh aur download kar sake.

---

## 4. Role 3: Public Website Visitor, Lead & Job Seeker (`/`)

The Public Corporate Website is engineered for maximum visitor conversion, high SEO rankings, and seamless lead acquisition:

---

### 4.1 Corporate Home & Dynamic Service Catalog
- **Features Included:**
  - **Animated Hero & Proof Metrics:** Dynamic counters for 99.9% uptime, 500+ clients served, and 24/7 NOC monitoring.
  - **Service Offerings (`/services/:slug`):** Deep-dive pages for Managed IT, Cloud Solutions, Server Support, and Network Infrastructure with SLA details.
  - **Pricing & AMC Plans (`/pricing`, `/amc-plans`):** Interactive plan comparison table with monthly/annual toggle and feature checklist.
  - **Client & Partner Proofs:** Enterprise client logos, technology partner affiliations (Microsoft, Cisco, AWS), and verified testimonials.
- **📌 Kya Work Hai (Purpose):** Prospective clients ko enterprise capability showcase karna aur consultation book karne ke liye motivate karna.

---

### 4.2 Interactive Lead Capture Engine (Contact, Callback & Audit Forms)
- **Features Included:**
  - **Request a Callback Form:** Visitors can select a preferred time slot (Morning, Afternoon, Evening) for immediate sales calls.
  - **Free IT Infrastructure Audit:** Comprehensive audit request form capturing company size, current IT pain points, and server needs.
  - **Public Support Ticket (`/support`):** Emergency public ticket submission with file/screenshot upload for new clients.
- **📌 Kya Work Hai (Purpose):** Visitor-to-lead conversion rate maximize karna aur zero lead loss ensure karna.
- **⚙️ Kaise Work Karta Hai (Workflow):** Form submit hote hi database me `Submission` record banta hai aur instantly sales/support team ko email notification chala jata hai.

---

### 4.3 Careers Portal with CV Attachment (`/join-us`)
- **Features Included:**
  - **Live Vacancy Listings:** Browse open technical and support positions with requirements and salary ranges.
  - **Resume / CV Multipart Upload:** Applicants upload PDF or Word resumes (up to 25MB) directly during form submission.
- **📌 Kya Work Hai (Purpose):** Recruitment process ko streamline karna aur qualified candidate resumes ko direct admin dashboard me deliver karna.

---

### 4.4 Google Gemini AI Virtual Assistant
- **Features Included:**
  - **Real-Time IT Troubleshooting:** Answers technical questions regarding network outages, cloud migrations, and security protocols.
  - **Service Recommendation:** Recommends matching UnioTech IT packages based on visitor's company size and budget.
  - **Lead Qualification:** Prompts users to book a callback or raise a ticket directly through chat.
- **📌 Kya Work Hai (Purpose):** Instant 24/7 visitor engagement provide karna aur bounce rate reduce karna.

---

## 5. Automated Email & Communication Subsystem (`Nodemailer`)

| Trigger Event | Recipient | Email Subject | Key Data & Attachments Included |
| :--- | :--- | :--- | :--- |
| **1. Ticket Raised** | Client & Admin | *Ticket Received - #[ID]* | Ticket ID, priority badge, issue summary, and formatted table of attached file links. |
| **2. Client Reply on Ticket** | Admin Team | *Client Reply on Ticket #[ID]* | Full conversation log, client company name, and newly attached screenshot download links. |
| **3. Client Urgent Nudge** | Admin Team | *URGENT: Reminder on #[ID]* | Escalation alert, reminder count, time since last nudge, and direct admin action link. |
| **4. Official Solution Provided** | Client | *Official Solution: #[ID]* | Complete engineer resolution text, ticket status update to Resolved, and portal login link. |
| **5. Career Application** | HR / Admin | *New Career Application - [Name]* | Candidate name, phone, email, applied position, and direct 1-click CV download link. |
| **6. Callback / Lead Form** | Sales / Admin | *New Lead Submission from [Name]* | Prospect phone, email, preferred callback time slot, and infrastructure requirements. |

---

## 6. Architecture, Security & Storage Highlights

1. **Hybrid Storage Resilience:** File uploads automatically try Cloudinary CDN first; if network/API limits occur, they instantly fallback to secure local disk storage (`/uploads/`) to guarantee zero file upload failures.
2. **100% SEO Prerendering:** Custom Headless Chrome crawler (`prerender.js`) pre-renders all static and dynamic routes into crawlable HTML with `sitemap.xml` for top Google ranking.
3. **Multi-Tenant Data Isolation:** Client accounts can only view and manage their own company's tickets and documents via JWT middleware and Sequelize Op filters.
4. **Production cPanel & Cloud Ready:** Clean separation of frontend build (`dist`) and Node.js backend (`backend_s`) with automated DB migrations for 1-click cPanel deployment.
