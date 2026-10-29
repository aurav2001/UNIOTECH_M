
import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import ClientsMarquee from '../components/ClientsMarquee';
import Services from '../components/Services';
import WorkFlow from '../components/WorkFlow';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import Offers from '../components/Offers';

const Home = () => {
    return (
        <div className="bg-white">
            <SEO
                title="Uniotech IT Solutions | Managed IT, Cybersecurity & Cloud Services"
                description="Uniotech IT Solutions delivers managed IT services, cybersecurity, cloud, networking, and enterprise support to help businesses scale securely and efficiently."
                keywords="Uniotech IT Solutions, IT Services, Managed IT, Cybersecurity, Cloud Services, Networking, Enterprise Support, IT Consulting"
                url="https://uniotechit.com"
            />

            <div className="relative z-10">
                <Hero />

                {/* Divider */}
                <div className="mx-8 md:mx-16 lg:mx-24">
                    <hr className="border-t border-gray-200" />
                </div>
                <div className="mx-4 md:mx-12 lg:mx-20">
                    <Services />
                </div>

                {/* Divider */}
                <div className="mx-8 md:mx-16 lg:mx-24">
                    <hr className="border-t border-gray-200" />
                </div>
                <div className="mx-4 md:mx-12 lg:mx-20">
                    <WorkFlow />
                </div>

                {/* Divider */}
                <div className="mx-8 md:mx-16 lg:mx-24">
                    <hr className="border-t border-gray-200" />
                </div>
                <div className="mx-4 md:mx-12 lg:mx-20">
                    <Testimonials />
                </div>

                <Offers />

                <Pricing />
            </div>
        </div>
    );
};

export default Home;
