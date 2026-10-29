import React from 'react';
import QuickApply from '../components/QuickApply';
import SEO from '../components/SEO';

const JoinUs = () => {
    return (
        <>
            <SEO
                title="Careers at Uniotech IT | Join Our Technology Team"
                description="Explore career opportunities at Uniotech IT and grow your future in IT services, cybersecurity, cloud technologies, and enterprise solutions."
                keywords="Careers, Jobs, IT Jobs, Uniotech Careers, Tech Jobs, Cybersecurity Jobs, Cloud Computing Careers"
                url="https://uniotechit.com/join-us"
            />
            <div className="pt-20"> {/* Add padding for fixed navbar */}
                <QuickApply />
            </div>
        </>
    );
};

export default JoinUs;
