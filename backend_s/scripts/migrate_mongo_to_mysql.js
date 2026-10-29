const mongoose = require('mongoose');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// --- Configuration ---
// Try to find MongoDB URI from sibling backend folder if not in current env
let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    try {
        const backendEnvPath = path.join(__dirname, '../../backend/.env');
        if (fs.existsSync(backendEnvPath)) {
            const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
            const match = backendEnv.match(/MONGODB_URI=(.*)/);
            if (match) {
                MONGODB_URI = match[1].trim();
                console.log('Found MongoDB URI from ../backend/.env');
            }
        }
    } catch (e) {
        console.warn('Could not read ../backend/.env');
    }
}

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env or ../backend/.env');
    process.exit(1);
}

// Debug Config
console.log('--- Database Config ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('-----------------------');

// --- MySQL Setup (Sequelize) ---
const sequelize = new Sequelize(
    process.env.DB_NAME || 'uniotech_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);

// Define MySQL Models (Simplified for migration)
const MySQLContent = sequelize.define('Content', {
    section: { type: DataTypes.STRING, allowNull: false, unique: true },
    data: { type: DataTypes.JSON, allowNull: false }
}, { timestamps: true });

const MySQLPage = sequelize.define('Page', {
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.STRING, defaultValue: 'other' },
    subtitle: { type: DataTypes.STRING },
    heroImage: { type: DataTypes.STRING },
    layout: { type: DataTypes.STRING, defaultValue: 'default' },
    sections: { type: DataTypes.JSON },
    stats: { type: DataTypes.JSON },
    features: { type: DataTypes.JSON },
    content: { type: DataTypes.TEXT },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
    seo: { type: DataTypes.JSON },
    order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true });


// --- MongoDB Schemas (Invoke-alike) ---
const mongoContentSchema = new mongoose.Schema({
    section: String,
    data: mongoose.Schema.Types.Mixed
});
const MongoContent = mongoose.model('Content', mongoContentSchema);

const mongoPageSchema = new mongoose.Schema({
    title: String,
    slug: String,
    type: String,
    subtitle: String,
    heroImage: String,
    layout: String,
    sections: Array,
    stats: Array,
    features: Array,
    content: String,
    isPublished: Boolean,
    seo: Object,
    order: Number
});
const MongoPage = mongoose.model('Page', mongoPageSchema);


// --- Migration Logic ---

async function migrate() {
    try {
        console.log('Connecting to MySQL...');
        await sequelize.authenticate();
        console.log('MySQL Connected.');
        
        // Sync MySQL models to ensure tables exist
        await sequelize.sync(); 

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected.');

        // 1. Migrate Content
        console.log('\n--- Migrating "Content" Collection ---');
        const mongoContents = await MongoContent.find({});
        console.log(`Found ${mongoContents.length} content items in MongoDB.`);

        for (const item of mongoContents) {
            try {
                // Upsert into MySQL
                const [record, created] = await MySQLContent.findOrCreate({
                    where: { section: item.section },
                    defaults: {
                        data: item.data
                    }
                });

                if (!created) {
                    // Update existing
                    record.data = item.data;
                    await record.save();
                    console.log(`Updated Content: ${item.section}`);
                } else {
                    console.log(`Created Content: ${item.section}`);
                }
            } catch (err) {
                console.error(`Failed to migrate content "${item.section}":`, err.message);
            }
        }

        // 2. Migrate Pages
        console.log('\n--- Migrating "Pages" Collection ---');
        const mongoPages = await MongoPage.find({});
        console.log(`Found ${mongoPages.length} pages in MongoDB.`);

        for (const page of mongoPages) {
            try {
                const pageData = {
                    title: page.title,
                    slug: page.slug,
                    type: page.type || 'other',
                    subtitle: page.subtitle || '',
                    heroImage: page.heroImage || '',
                    layout: page.layout || 'default',
                    content: page.content || '',
                    isPublished: page.isPublished || false,
                    order: page.order || 0,
                    // JSON Fields
                    sections: page.sections || [],
                    stats: page.stats || [],
                    features: page.features || [],
                    seo: page.seo || {}
                };

                const [record, created] = await MySQLPage.findOrCreate({
                    where: { slug: pageData.slug },
                    defaults: pageData
                });

                if (!created) {
                    await record.update(pageData);
                    console.log(`Updated Page: /${pageData.slug}`);
                } else {
                    console.log(`Created Page: /${pageData.slug}`);
                }

            } catch (err) {
                console.error(`Failed to migrate page "/${page.slug}":`, err.message);
            }
        }

        console.log('\nMigration Completed Successfully.');

    } catch (error) {
        console.error('Migration Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
        await sequelize.close();
        process.exit();
    }
}

migrate();
