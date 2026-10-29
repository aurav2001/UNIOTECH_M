const sequelize = require('../config/database');
const Content = require('../models/Content');

const seedHiring = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const hiringData = {
            section: 'hiring',
            title: 'Unlock Your Potential',
            subtitle: 'Hiring Now',
            description: 'Join a team that values innovation, integrity, and impact. We are looking for passionate individuals to lead the future of integrated services.',
            isVisible: true,
            benefits: [
                "Competitive Salary Packages",
                "Health & Wellness Benefits",
                "Career Growth Opportunities",
                "World-Class Work Environment"
            ]
        };

        const [content, created] = await Content.findOrCreate({
            where: { section: 'hiring' },
            defaults: { data: hiringData }
        });

        if (created) {
            console.log('Hiring content created successfully.');
        } else {
            console.log('Hiring content already exists. Updating...');
            content.data = hiringData;
            await content.save();
            console.log('Hiring content updated.');
        }

    } catch (error) {
        console.error('Error seeding hiring content:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
};

seedHiring();
