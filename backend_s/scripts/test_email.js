const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('--- Email Config Check ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}... (Found)` : 'MISSING');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****** (Found)' : 'MISSING');
console.log('EMAIL_RECIPIENT:', process.env.EMAIL_RECIPIENT ? `${process.env.EMAIL_RECIPIENT.substring(0, 3)}... (Found)` : 'MISSING');
console.log('--------------------------');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "uniotechit.com",
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: Number(process.env.EMAIL_PORT || 465) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function testEmail() {
    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('Sending test email to pandeygaurav9801@gmail.com...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'pandeygaurav9801@gmail.com',
            subject: '🚀 UnioTech IT - Test Email Verification',
            text: 'Hello Gaurav!\n\nThis is a confirmation test email from UnioTech cPanel mail server (test@uniotechit.com).\nYour email service is configured and working 100% properly!\n\nRegards,\nUnioTech IT Solutions'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email Test Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
    }
}

testEmail();
