const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Blog = require('../models/Blog');

const seedBlog = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const existing = await Blog.findOne({ });
        if (existing) {
            console.log('Blogs already exist. Skipping seed.');
            process.exit(0);
        }

        const sampleBlog = {
            title: " The Future of Cloud Computing in 2026",
            subtitle: "How edge computing and AI are redefining enterprise infrastructure.",
            content: "<h2>Introduction</h2><p>Cloud computing is no longer just about storage and compute power; it's about intelligence and proximity. As we move into late 2026, the convergence of <strong>Edge Computing</strong> and <strong>Artificial Intelligence</strong> is creating a new paradigm for enterprise IT.</p><h3>The Rise of the Intelligent Edge</h3><p>Data processing is moving closer to the source. With 6G networks rolling out, the latency barrier is practically non-existent, unlocking real-time autonomous systems...</p><blockquote>'The cloud is not a place, it's an operating model.'</blockquote><p>UnioTech IT is at the forefront of this shift, helping businesses migrate their legacy monolithic apps to microservices-based, edge-ready architectures.</p>",
            coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
            tags: ["Cloud", "AI", "Infrastructure"],
            isPublished: true,
            readTime: "4 min read",
            author: {
                name: "Satyam Pandey",
                image: ""
            }
        };

        await Blog.create(sampleBlog);
        console.log('Sample blog created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding blog:', error);
        process.exit(1);
    }
};

seedBlog();
