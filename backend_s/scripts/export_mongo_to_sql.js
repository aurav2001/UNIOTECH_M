const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
let MONGODB_URI = process.env.MONGODB_URI;
// Try fallback
if (!MONGODB_URI) {
    try {
        const backendEnv = fs.readFileSync(path.join(__dirname, '../../backend/.env'), 'utf8');
        const match = backendEnv.match(/MONGODB_URI=(.*)/);
        if (match) MONGODB_URI = match[1].trim();
    } catch (e) { }
}

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI not found.');
    process.exit(1);
}

// Mongo Schemas
const Content = mongoose.model('Content', new mongoose.Schema({ section: String, data: mongoose.Schema.Types.Mixed }));
const Page = mongoose.model('Page', new mongoose.Schema({
    title: String, slug: String, type: String, subtitle: String,
    heroImage: String, layout: String, sections: Array, stats: Array,
    features: Array, content: String, isPublished: Boolean, seo: Object, order: Number
}));

// Helper to escape SQL strings
const escape = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'number') return val;
    // JSON objects
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
        switch (char) {
            case "'": return "\\'";
            case '"': return '\\"';
            case "\\": return "\\\\";
            case "\n": return "\\n";
            case "\r": return "\\r";
            default: return char;
        }
    })}'`;
    // Strings
    return `'${val.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
        switch (char) {
            case "'": return "\\'";
            case '"': return '\\"';
            case "\\": return "\\\\";
            case "\n": return "\\n";
            case "\r": return "\\r";
            default: return char;
        }
    })}'`;
};

const OUTPUT_FILE = path.join(__dirname, 'migration_dump.sql');

async function exportToSQL() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        
        const stream = fs.createWriteStream(OUTPUT_FILE);
        
        stream.write('-- UnioTech Backend Migration Dump\n');
        stream.write(`-- Generated at ${new Date().toISOString()}\n\n`);

        // --- Migrating Content ---
        const contents = await Content.find({});
        console.log(`Found ${contents.length} Content items.`);
        
        stream.write('-- Table: Contents\n');
        stream.write('CREATE TABLE IF NOT EXISTS `Contents` (`id` INTEGER NOT NULL auto_increment , `section` VARCHAR(255) NOT NULL UNIQUE, `data` JSON NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;\n\n');
        
        for (const item of contents) {
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const sql = `INSERT INTO \`Contents\` (\`section\`, \`data\`, \`createdAt\`, \`updatedAt\`) VALUES (${escape(item.section)}, ${escape(item.data)}, '${now}', '${now}') ON DUPLICATE KEY UPDATE \`data\`=${escape(item.data)};\n`;
            stream.write(sql);
        }

        // --- Migrating Pages ---
        const pages = await Page.find({});
        console.log(`Found ${pages.length} Pages.`);

        stream.write('\n-- Table: Pages\n');
        stream.write('CREATE TABLE IF NOT EXISTS `Pages` (`id` INTEGER NOT NULL auto_increment , `title` VARCHAR(255) NOT NULL, `slug` VARCHAR(255) NOT NULL UNIQUE, `type` VARCHAR(255) DEFAULT \'other\', `subtitle` VARCHAR(255) DEFAULT \'\', `heroImage` VARCHAR(255) DEFAULT \'\', `layout` VARCHAR(255) DEFAULT \'default\', `sections` JSON, `stats` JSON, `features` JSON, `content` LONGTEXT, `isPublished` TINYINT(1) DEFAULT 0, `seo` JSON, `order` INTEGER DEFAULT 0, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;\n\n');

        for (const page of pages) {
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const sections = escape(page.sections || []);
            const stats = escape(page.stats || []);
            const features = escape(page.features || []);
            const seo = escape(page.seo || {});
            
            const sql = `INSERT INTO \`Pages\` (\`title\`, \`slug\`, \`type\`, \`subtitle\`, \`heroImage\`, \`layout\`, \`sections\`, \`stats\`, \`features\`, \`content\`, \`isPublished\`, \`seo\`, \`order\`, \`createdAt\`, \`updatedAt\`) VALUES (${escape(page.title)}, ${escape(page.slug)}, ${escape(page.type||'other')}, ${escape(page.subtitle||'')}, ${escape(page.heroImage||'')}, ${escape(page.layout||'default')}, ${sections}, ${stats}, ${features}, ${escape(page.content||'')}, ${page.isPublished?1:0}, ${seo}, ${escape(page.order||0)}, '${now}', '${now}') ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`), \`content\`=VALUES(\`content\`);\n`;
            stream.write(sql);
        }

        stream.end();
        console.log(`\nSUCCESS! SQL Dump written to: ${OUTPUT_FILE}`);
        console.log('Now upload this file to phpMyAdmin -> Import tab.');

    } catch (e) {
        console.error('Export failed:', e);
    } finally {
        await mongoose.disconnect();
    }
}

exportToSQL();
