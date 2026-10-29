const nodemailer = require("nodemailer");

/* ============================================================
   EMAIL SERVICE - cPanel SMTP (Nodemailer)
   Professional HTML Email Templates with UnioTech Theme
   All configuration from environment variables only
============================================================ */

// Theme Colors (matching your website)
const THEME = {
  primaryDark: '#0F2854',
  primaryMedium: '#1C4D8D',
  primaryLight: '#BDE8F5',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#F9FAFB',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB'
};

// All configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '465');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_RECIPIENT = process.env.EMAIL_RECIPIENT;

// Validate required email configuration
if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_RECIPIENT) {
  console.error('❌ EMAIL CONFIG ERROR:', {
    HOST: !!process.env.EMAIL_HOST,
    USER: !!process.env.EMAIL_USER,
    PASS: !!process.env.EMAIL_PASS,
    RECIPIENT: !!process.env.EMAIL_RECIPIENT
  });
  // Don't throw here to allow app to start, but log clearly
} else {
    console.log('✅ Email Service Configured:', {
        host: process.env.EMAIL_HOST,
        user: process.env.EMAIL_USER.substring(0, 3) + '...', // Masked
        recipient: process.env.EMAIL_RECIPIENT
    });
}

// Create transporter using environment variables only
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: parseInt(process.env.EMAIL_PORT || '465') === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter silently
if (EMAIL_HOST && EMAIL_USER && EMAIL_PASS) {
  transporter.verify().catch(() => {
    // SMTP verification failed - handled silently
  });
}

/* ============================================================
   BASE EMAIL TEMPLATE
============================================================ */
const getBaseTemplate = (content, title, subtitle) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${THEME.background};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${THEME.background};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: ${THEME.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 40, 84, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primaryMedium} 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; color: ${THEME.white}; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🚀 UnioTech IT
              </h1>
              <p style="margin: 0; color: ${THEME.primaryLight}; font-size: 14px; font-weight: 500;">
                ${subtitle}
              </p>
            </td>
          </tr>
          
          <!-- Title Bar -->
          <tr>
            <td style="background-color: ${THEME.primaryLight}; padding: 16px 40px;">
              <h2 style="margin: 0; color: ${THEME.primaryDark}; font-size: 18px; font-weight: 600;">
                ${title}
              </h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${THEME.background}; padding: 24px 40px; border-top: 1px solid ${THEME.border};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: ${THEME.textLight}; font-size: 12px;">
                      This is an automated notification from your website
                    </p>
                    <p style="margin: 0; color: ${THEME.textLight}; font-size: 12px;">
                      © ${new Date().getFullYear()} UnioTech IT Solutions. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ============================================================
   DETAIL ROW COMPONENT
============================================================ */
const getDetailRow = (label, value, icon = '📋') => `
<tr>
  <td style="padding: 12px 0; border-bottom: 1px solid ${THEME.border};">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td width="30" style="vertical-align: top; padding-right: 12px;">
          <span style="font-size: 18px;">${icon}</span>
        </td>
        <td>
          <p style="margin: 0 0 4px 0; color: ${THEME.textLight}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            ${label}
          </p>
          <p style="margin: 0; color: ${THEME.text}; font-size: 15px; font-weight: 500;">
            ${value || 'Not provided'}
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

/* ============================================================
   MESSAGE BOX COMPONENT
============================================================ */
const getMessageBox = (message) => `
<tr>
  <td style="padding: 20px 0 0 0;">
    <div style="background-color: ${THEME.background}; border-left: 4px solid ${THEME.primaryMedium}; border-radius: 0 8px 8px 0; padding: 16px 20px;">
      <p style="margin: 0 0 8px 0; color: ${THEME.textLight}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        💬 Message
      </p>
      <p style="margin: 0; color: ${THEME.text}; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message || 'No message provided'}</p>
    </div>
  </td>
</tr>
`;

/* ============================================================
   ATTACHMENTS COMPONENT
============================================================ */
const getAttachmentsRow = (attachments) => {
  if (!attachments) return '';
  let list = [];
  if (Array.isArray(attachments)) list = attachments;
  else if (typeof attachments === 'string') {
    try { list = JSON.parse(attachments); } catch(e) { list = []; }
  }
  if (!Array.isArray(list) || list.length === 0) return '';

  const listItems = list.map(a => {
    const sizeStr = a.size ? ` (${Math.round(a.size / 1024)} KB)` : '';
    return `<li style="margin-bottom: 6px;"><a href="${a.url}" target="_blank" style="color: ${THEME.primaryMedium}; font-weight: 600; text-decoration: underline;">📎 ${a.name || 'Attached File'}</a>${sizeStr}</li>`;
  }).join('');

  return `
  <tr>
    <td style="padding: 12px 0; border-bottom: 1px solid ${THEME.border};">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="30" style="vertical-align: top; padding-right: 12px;">
            <span style="font-size: 18px;">📎</span>
          </td>
          <td>
            <p style="margin: 0 0 4px 0; color: ${THEME.textLight}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Attached Files (${list.length})
            </p>
            <ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 13px; color: ${THEME.text};">
              ${listItems}
            </ul>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  `;
};

/* ============================================================
   TIMESTAMP COMPONENT
============================================================ */
const getTimestamp = () => {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  };
  return now.toLocaleDateString('en-IN', options) + ' IST';
};

/* ============================================================
   CONTACT EMAIL
============================================================ */
const sendContactEmail = async (data) => {
  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Full Name', data.name || 'N/A', '👤')}
      ${getDetailRow('Email Address', data.email || 'N/A', '📧')}
      ${getDetailRow('Phone Number', data.phone || 'Not provided', '📱')}
      ${getDetailRow('Subject', data.subject || 'No Subject', '📌')}
      ${getMessageBox(data.message)}
      <tr>
        <td style="padding: 20px 0 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: ${THEME.primaryLight}; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0; color: ${THEME.primaryDark}; font-size: 12px;">
                  ⏰ Received on: <strong>${getTimestamp()}</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Quick Reply Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="mailto:${data.email}" style="display: inline-block; background-color: ${THEME.primaryDark}; color: ${THEME.white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            📧 Reply to ${data.name || 'Customer'}
          </a>
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech Contact" <${EMAIL_USER}>`,
    to: EMAIL_RECIPIENT,
    subject: `📩 New Contact: ${data.subject || "No Subject"}`,
    html: getBaseTemplate(content, '📩 New Contact Message', 'Website Contact Form Submission'),
  });
};

/* ============================================================
   CALLBACK EMAIL
============================================================ */
const sendCallbackEmail = async (data) => {
  const timeLabels = {
    'morning': '🌅 Morning (9AM - 12PM)',
    'afternoon': '☀️ Afternoon (12PM - 4PM)',
    'evening': '🌆 Evening (4PM - 7PM)',
    'asap': '⚡ As Soon As Possible'
  };
  const preferredTime = timeLabels[data.time] || data.time || 'Anytime';

  const content = `
    <!-- Urgency Banner -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td style="background: linear-gradient(135deg, ${THEME.success} 0%, #059669 100%); border-radius: 12px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 4px 0; color: ${THEME.white}; font-size: 32px;">📞</p>
          <h3 style="margin: 0 0 4px 0; color: ${THEME.white}; font-size: 18px; font-weight: 700;">
            Callback Request
          </h3>
          <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px;">
            A customer is waiting for your call!
          </p>
        </td>
      </tr>
    </table>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Customer Name', data.name || 'N/A', '👤')}
      ${getDetailRow('Phone Number', data.phone || 'N/A', '📱')}
      ${getDetailRow('Preferred Time', preferredTime, '⏰')}
      <tr>
        <td style="padding: 20px 0 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: ${THEME.primaryLight}; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0; color: ${THEME.primaryDark}; font-size: 12px;">
                  ⏰ Request received: <strong>${getTimestamp()}</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Call Now Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="tel:${(data.phone || '').replace(/[\s\-\(\)]/g, '')}" style="display: inline-block; background: linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primaryMedium} 100%); color: ${THEME.white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            📞 Call Now: ${data.phone || 'N/A'}
          </a>
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech Callback" <${EMAIL_USER}>`,
    to: EMAIL_RECIPIENT,
    subject: `📞 Callback Request from ${data.name || 'Customer'}`,
    html: getBaseTemplate(content, '📞 Callback Request', 'Priority Customer Request'),
  });
};

/* ============================================================
   ENQUIRY EMAIL
============================================================ */
const sendEnquiryEmail = async (data) => {
  const content = `
    <!-- Source Badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td>
          <span style="display: inline-block; background-color: ${THEME.primaryMedium}; color: ${THEME.white}; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600;">
            🎯 ${data.source || 'General Enquiry'}
          </span>
        </td>
      </tr>
    </table>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Full Name', data.name || 'N/A', '👤')}
      ${getDetailRow('Email Address', data.email || 'N/A', '📧')}
      ${getDetailRow('Phone Number', data.phone || 'Not provided', '📱')}
      ${getDetailRow('Enquiry About', data.source || 'General', '🏷️')}
      ${getMessageBox(data.message)}
      ${(() => {
          const match = (data.message || '').match(/Payment Screenshot:\s*(https?:\/\/[^\s]+)/i);
          if (match) {
              const url = match[1];
              return `
              <tr>
                <td style="padding: 20px 0 0 0;">
                  <div style="background-color: #F0FDF4; border: 1px dashed #10B981; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #047857; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🖼️ Payment Proof Screenshot</p>
                    <a href="${url}" target="_blank" style="display: block; margin-bottom: 8px;">
                      <img src="${url}" alt="Payment Screenshot" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.05);" />
                    </a>
                    <a href="${url}" target="_blank" style="color: #10B981; font-size: 13px; font-weight: bold; text-decoration: none;">🔍 Click to View Original Receipt</a>
                  </div>
                </td>
              </tr>`;
          }
          return '';
      })()}
      <tr>
        <td style="padding: 20px 0 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: ${THEME.primaryLight}; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0; color: ${THEME.primaryDark}; font-size: 12px;">
                  ⏰ Received on: <strong>${getTimestamp()}</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Action Buttons -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="mailto:${data.email}" style="display: inline-block; background-color: ${THEME.primaryDark}; color: ${THEME.white}; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 12px;">
            📧 Reply via Email
          </a>
          ${data.phone ? `
          <a href="tel:${data.phone.replace(/[\s\-\(\)]/g, '')}" style="display: inline-block; background-color: ${THEME.success}; color: ${THEME.white}; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            📞 Call Back
          </a>
          ` : ''}
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech Enquiry" <${EMAIL_USER}>`,
    to: EMAIL_RECIPIENT,
    subject: `🎯 Enquiry: ${data.source || 'General'} from ${data.name || 'Customer'}`,
    html: getBaseTemplate(content, '🎯 New Service Enquiry', 'Potential Lead'),
  });
};

/* ============================================================
   CAREER APPLICATION EMAIL
============================================================ */
const sendCareerEmail = async (data) => {
  const content = `
    <!-- Header Badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td style="background: linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primaryMedium} 100%); border-radius: 12px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 4px 0; color: ${THEME.white}; font-size: 32px;">💼</p>
          <h3 style="margin: 0 0 4px 0; color: ${THEME.white}; font-size: 18px; font-weight: 700;">
            New Job Application
          </h3>
          <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px;">
            Position: ${data.jobTitle}
          </p>
        </td>
      </tr>
    </table>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Candidate Name', data.name || 'N/A', '👤')}
      ${getDetailRow('Email Address', data.email || 'N/A', '📧')}
      ${getDetailRow('Phone Number', data.phone || 'N/A', '📱')}
      ${getDetailRow('Applying For', data.jobTitle || 'General Application', '💼')}
      
      <!-- CV Download Link -->
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${THEME.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="30" style="vertical-align: top; padding-right: 12px;">
                <span style="font-size: 18px;">📄</span>
              </td>
              <td>
                <p style="margin: 0 0 4px 0; color: ${THEME.textLight}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Curriculum Vitae
                </p>
                <a href="${data.cvUrl}" target="_blank" style="color: ${THEME.primaryMedium}; font-size: 15px; font-weight: 600; text-decoration: underline;">
                  View / Download CV
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding: 20px 0 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: ${THEME.primaryLight}; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0; color: ${THEME.primaryDark}; font-size: 12px;">
                  ⏰ Received on: <strong>${getTimestamp()}</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Action Buttons -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="mailto:${data.email}" style="display: inline-block; background-color: ${THEME.primaryDark}; color: ${THEME.white}; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 12px;">
            📧 Contact Candidate
          </a>
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech Careers" <${EMAIL_USER}>`,
    to: EMAIL_RECIPIENT,
    subject: `💼 Application: ${data.jobTitle} - ${data.name}`,
    html: getBaseTemplate(content, '💼 New Job Application', 'Recruitment Update'),
  });
};

/* ============================================================
   OTP VERIFICATION EMAIL
 ============================================================ */
const sendOTPEmail = async (email, otp) => {
  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 20px 0; text-align: center;">
          <p style="margin: 0 0 16px 0; color: ${THEME.text}; font-size: 16px; line-height: 1.6;">
            Hello,
          </p>
          <p style="margin: 0 0 24px 0; color: ${THEME.text}; font-size: 16px; line-height: 1.6;">
            Thank you for your interest in joining <strong>UnioTech IT Solutions</strong>. Please use the following One-Time Password (OTP) to verify your email address and complete your application:
          </p>
          <div style="background-color: ${THEME.background}; border: 2px dashed ${THEME.primaryMedium}; border-radius: 12px; padding: 24px; display: inline-block; min-width: 200px;">
            <h1 style="margin: 0; color: ${THEME.primaryDark}; font-size: 36px; font-weight: 800; letter-spacing: 8px;">
              ${otp}
            </h1>
          </div>
          <p style="margin: 24px 0 0 0; color: ${THEME.textLight}; font-size: 13px;">
            This OTP is valid for 5 minutes. If you did not request this, please ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech Verification" <${EMAIL_USER}>`,
    to: email,
    subject: `🔐 Your Verification Code: ${otp}`,
    html: getBaseTemplate(content, '🔐 Email Verification', 'Candidate Verification'),
  });
};

/* ============================================================
   TICKET EMAILS (USER & ADMIN)
============================================================ */
const sendTicketEmails = async (data) => {
  const priorityMap = {
    low: { label: 'LOW', color: '#10B981', bg: '#D1FAE5' },
    medium: { label: 'MEDIUM', color: '#3B82F6', bg: '#DBEAFE' },
    high: { label: 'HIGH', color: '#F59E0B', bg: '#FEF3C7' },
    urgent: { label: 'URGENT / CRITICAL', color: '#EF4444', bg: '#FEE2E2' }
  };
  const p = priorityMap[data.priority?.toLowerCase()] || priorityMap.medium;

  const priorityBadge = `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid ${THEME.border};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="30" style="vertical-align: top; padding-right: 12px;">
              <span style="font-size: 18px;">⚡</span>
            </td>
            <td>
              <p style="margin: 0 0 4px 0; color: ${THEME.textLight}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Priority Level
              </p>
              <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; background-color: ${p.bg}; color: ${p.color};">
                ${p.label}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const adminContent = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Ticket ID', `#${data.id}`, '🎫')}
      ${priorityBadge}
      ${getDetailRow('User Name', data.name || 'N/A', '👤')}
      ${getDetailRow('Email Address', data.email || 'N/A', '📧')}
      ${data.companyId ? getDetailRow('Company ID', data.companyId, '🏢') : ''}
      ${getDetailRow('Subject', data.subject || 'No Subject', '📌')}
      ${getMessageBox(data.message)}
      ${getAttachmentsRow(data.attachments)}
      <tr>
        <td style="padding: 20px 0 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: ${THEME.primaryLight}; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0; color: ${THEME.primaryDark}; font-size: 12px;">
                  ⏰ Created on: <strong>${getTimestamp()}</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Reply Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="mailto:${data.email}" style="display: inline-block; background-color: ${THEME.primaryDark}; color: ${THEME.white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            📧 Reply to Customer
          </a>
        </td>
      </tr>
    </table>
  `;

  const userContent = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 10px 0;">
          <p style="margin: 0 0 16px 0; color: ${THEME.text}; font-size: 16px; line-height: 1.6;">
            Dear ${data.name},
          </p>
          <p style="margin: 0 0 24px 0; color: ${THEME.text}; font-size: 16px; line-height: 1.6;">
            Your support ticket has been successfully created. Our support team has been notified and will review your request shortly. Below are your ticket details for reference:
          </p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Ticket ID', `#${data.id}`, '🎫')}
      ${priorityBadge}
      ${getDetailRow('Subject', data.subject || 'No Subject', '📌')}
      ${getMessageBox(data.message)}
      ${getAttachmentsRow(data.attachments)}
      <tr>
        <td style="padding: 20px 0 0 0;">
          <p style="margin: 0; color: ${THEME.textLight}; font-size: 13px; line-height: 1.6;">
            We usually respond to all tickets within 2 to 24 business hours. If your issue is extremely urgent, you can notify our admin team directly through your Client Portal or reach out to us via WhatsApp.
          </p>
        </td>
      </tr>
    </table>
  `;

  // Send to Admin and User independently using Promise.allSettled
  const results = await Promise.allSettled([
    transporter.sendMail({
      from: `"UnioTech Support" <${EMAIL_USER}>`,
      to: EMAIL_RECIPIENT,
      subject: `🎫 [${p.label}] New Ticket [#${data.id}]: ${data.subject || "No Subject"}`,
      html: getBaseTemplate(adminContent, `🎫 Ticket Alert: #${data.id} (${p.label})`, 'New Customer Support Ticket'),
    }),
    transporter.sendMail({
      from: `"UnioTech IT Solutions" <${EMAIL_USER}>`,
      to: data.email,
      subject: `🎫 Ticket Received [#${data.id}]: ${data.subject || "No Subject"}`,
      html: getBaseTemplate(userContent, `🎫 Support Ticket: #${data.id}`, 'We Have Received Your Ticket'),
    })
  ]);

  results.forEach((res, index) => {
    const target = index === 0 ? `Admin (${EMAIL_RECIPIENT})` : `Client (${data.email})`;
    if (res.status === 'fulfilled') {
      console.log(`✅ Ticket email delivered to ${target}`);
    } else {
      console.error(`❌ Ticket email failed to ${target}:`, res.reason?.message || res.reason);
    }
  });

  return results;
};

/* ============================================================
   TICKET REMINDER EMAIL (CLIENT TO ADMIN ESCALATION)
============================================================ */
const sendTicketReminderEmail = async (ticket, clientName) => {
  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 12px 0;">
          <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 14px 16px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
              🔔 The client has sent a reminder/nudge regarding this pending ticket.
            </p>
          </div>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Ticket ID', `#${ticket.id}`, '🎫')}
      ${getDetailRow('Client / User', `${ticket.name} (${clientName || ticket.name})`, '👤')}
      ${getDetailRow('Email', ticket.email || 'N/A', '📧')}
      ${ticket.companyId ? getDetailRow('Company ID', ticket.companyId, '🏢') : ''}
      ${getDetailRow('Priority', (ticket.priority || 'medium').toUpperCase(), '⚡')}
      ${getDetailRow('Current Status', (ticket.status || 'new').toUpperCase(), '📊')}
      ${getDetailRow('Subject', ticket.subject || 'No Subject', '📌')}
      ${getDetailRow('Total Reminders Sent', `${ticket.remindersCount || 1}`, '🔔')}
      ${getMessageBox(ticket.message)}
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="mailto:${ticket.email}" style="display: inline-block; background-color: ${THEME.primaryDark}; color: ${THEME.white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            📧 Reply to Client
          </a>
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech Ticket Alert" <${EMAIL_USER}>`,
    to: EMAIL_RECIPIENT,
    subject: `🔔 CLIENT REMINDER on Ticket [#${ticket.id}]: ${ticket.subject || 'Support Ticket'}`,
    html: getBaseTemplate(content, `🔔 Ticket Reminder: #${ticket.id}`, 'Client Requesting Status Update'),
  });
};

/* ============================================================
   TICKET ADMIN RESPONSE EMAIL (ADMIN TO CLIENT)
============================================================ */
const sendTicketResponseEmail = async (ticket, adminResponse, status) => {
  const statusLabels = {
    new: 'Under Review',
    approved: 'Approved / Queued',
    in_progress: 'In Progress',
    resolved: 'Resolved ✅',
    rejected: 'Rejected',
    closed: 'Closed'
  };

  const currentStatusText = statusLabels[status || ticket.status] || (status || ticket.status);

  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 10px 0;">
          <p style="margin: 0 0 16px 0; color: ${THEME.text}; font-size: 16px; line-height: 1.6;">
            Dear ${ticket.name},
          </p>
          <p style="margin: 0 0 24px 0; color: ${THEME.text}; font-size: 16px; line-height: 1.6;">
            Our support engineering team has posted an official update / response to your ticket:
          </p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Ticket ID', `#${ticket.id}`, '🎫')}
      ${getDetailRow('Subject', ticket.subject || 'Support Ticket', '📌')}
      ${getDetailRow('Updated Status', currentStatusText, '📊')}
    </table>

    <!-- Admin Response Box -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
      <tr>
        <td style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 18px 20px; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; color: #1E40AF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            💬 Support Engineer Response:
          </p>
          <p style="margin: 0; color: #1E293B; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
            ${adminResponse}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 10px 0;">
          <p style="margin: 0; color: ${THEME.textLight}; font-size: 13px; line-height: 1.6;">
            You can also log into your <a href="https://uniotechit.com/client-portal" style="color: ${THEME.primaryMedium}; font-weight: 600;">Client Portal</a> to view the complete ticket history and real-time updates.
          </p>
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech IT Support" <${EMAIL_USER}>`,
    to: ticket.email,
    subject: `💬 Update on Ticket [#${ticket.id}]: ${ticket.subject || 'Support Ticket'} [${currentStatusText}]`,
    html: getBaseTemplate(content, `💬 Ticket Update: #${ticket.id}`, 'Official Support Response'),
  });
};

/* ============================================================
   CLIENT REPLY EMAIL (CLIENT TO ADMIN)
============================================================ */
const sendClientReplyToAdminEmail = async (ticket, clientName, replyMessage) => {
  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 12px 0;">
          <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 14px 16px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1E40AF; font-size: 14px; font-weight: 700;">
              💬 Client has posted a new message / reply on Ticket #${ticket.id}.
            </p>
          </div>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${getDetailRow('Ticket ID', `#${ticket.id}`, '🎫')}
      ${getDetailRow('Client Name', clientName || ticket.name, '👤')}
      ${getDetailRow('Email', ticket.email || 'N/A', '📧')}
      ${ticket.companyId ? getDetailRow('Company ID', ticket.companyId, '🏢') : ''}
      ${getDetailRow('Subject', ticket.subject || 'Support Ticket', '📌')}
      ${getDetailRow('Priority', (ticket.priority || 'medium').toUpperCase(), '⚡')}
    </table>

    <!-- Client Reply Message Box -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
      <tr>
        <td style="background-color: #F8FAFC; border: 1px solid #CBD5E1; padding: 18px 20px; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; color: #0F172A; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            📝 Client's Latest Reply:
          </p>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
            ${replyMessage}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="https://uniotechit.com/admin" style="display: inline-block; background-color: ${THEME.primaryDark}; color: ${THEME.white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            🔐 Open Admin Panel to Respond
          </a>
        </td>
      </tr>
    </table>
  `;

  return transporter.sendMail({
    from: `"UnioTech Ticket Update" <${EMAIL_USER}>`,
    to: EMAIL_RECIPIENT,
    subject: `💬 NEW CLIENT MESSAGE on Ticket [#${ticket.id}]: ${ticket.subject || 'Support Ticket'}`,
    html: getBaseTemplate(content, `💬 Client Reply: #${ticket.id}`, 'New Message from Client'),
  });
};

module.exports = {
  sendContactEmail,
  sendCallbackEmail,
  sendEnquiryEmail,
  sendCareerEmail,
  sendOTPEmail,
  sendTicketEmails,
  sendTicketReminderEmail,
  sendTicketResponseEmail,
  sendClientReplyToAdminEmail
};
