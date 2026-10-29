
import React from 'react';
import { motion } from 'framer-motion';

import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Pricing from '../components/Pricing';
import Offers from '../components/Offers';
import Footer from '../components/Footer';

const PricingPage = () => {
    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
            <SEO
                title="IT Services Pricing | Transparent & Scalable Plans"
                description="View Uniotech IT’s flexible pricing plans for managed services, cybersecurity, cloud solutions, and enterprise IT support. Scalable solutions for every business size."
                keywords="IT Pricing, Managed Services Cost, Cybersecurity Pricing, IT Support Plans, Uniotech Pricing"
                url="https://uniotechit.com/pricing"
            />
            <Navbar />

            {/* Simple Hero for Pricing Page */}
            <div className="bg-primary-dark pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-light/10 rounded-full blur-3xl -mr-[100px] -mt-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-medium/10 rounded-full blur-3xl -ml-[100px] -mb-[100px]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Plans that scale with you
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-300 max-w-2xl mx-auto"
                    >
                        Whether you're a startup or an enterprise, we have a solution that fits your needs.
                    </motion.p>
                </div>
            </div>

            {/* Reuse existing components */}
            <div className="-mt-10 relative z-20">
                <div className="bg-white rounded-t-3xl shadow-xl border-t border-gray-100 overflow-hidden">
                    <Pricing />
                </div>
            </div>

            <Offers />

            {/* CTA Section */}
            <section className="py-20 bg-gray-50 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Still have questions?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Our sales team is available to help you find the perfect package for your organization.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center justify-center px-8 py-3 bg-primary-medium text-white font-bold rounded-full hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Contact Sales
                    </a>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default PricingPage;
