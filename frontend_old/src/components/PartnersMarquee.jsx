import React from 'react';
import { useContent } from '../context/ContentContext';
import { Monitor } from 'lucide-react';

// Dynamically import all partner logos from local assets as fallback
const partnerLogos = import.meta.glob('../assets/partners/*.png', { eager: true });

// Partner name to Simple Icons slug and official Brand Color mapping
const BRAND_MAP = {
    'Cisco': { slug: 'cisco', color: '1BA0D7' },
    'Dell': { slug: 'dell', color: '007DB8' },
    'Fortinet': { slug: 'fortinet', color: 'EE3124' },
    'Fujitsu': { slug: 'fujitsu', color: 'FF0000' },
    'Google': { slug: 'google', color: '4285F4' },
    'HP': { slug: 'hp', color: '0096D6' },
    'Kaspersky': { slug: 'kaspersky', color: '006D5C' },
    'Lenovo': { slug: 'lenovo', color: 'E2231A' },
    'McAfee': { slug: 'mcafee', color: 'C01212' },
    'MongoDB': { slug: 'mongodb', color: '47A248' },
    'Red Hat': { slug: 'redhat', color: 'EE0000' },
    'SUSE': { slug: 'suse', color: '0C322C' },
    'SonicWall': { slug: 'sonicwall', color: 'FF6600' },
    'TeamViewer': { slug: 'teamviewer', color: '0080FF' },
    'Trend Micro': { slug: 'trendmicro', color: 'D9151B' },
    'Ubiquiti': { slug: 'ubiquiti', color: '0559C9' },
    'VMware': { slug: 'vmware', color: '607078' },
    'Veeam': { slug: 'veeam', color: '00B336' }
};

// Transform imported modules into a partners array for fallback
const staticPartners = Object.entries(partnerLogos).map(([path, module]) => {
    const fileName = path.split('/').pop().replace('.png', '');
    const name = fileName.replace(/_/g, ' ');
    return { name, logo: module.default };
});

const PartnersMarquee = () => {
    const { getContent, loading } = useContent();
    const partnersData = getContent('partners') || {};

    const title = partnersData.title || 'Our Trusted Partners';
    const isVisible = partnersData.isVisible !== false;

    // Use API partners if available, otherwise fall back to static imports
    const apiPartners = partnersData.items || [];
    const partners = apiPartners.length > 0 ? apiPartners : staticPartners;

    // Local state to track which logos failed and current source for each partner
    const [failedLogos, setFailedLogos] = React.useState(new Set());
    const [logoSources, setLogoSources] = React.useState({});

    const getLogoUrl = (partner) => {
        // If we already have a successful fallback source, use it
        if (logoSources[partner.name]) return logoSources[partner.name];

        const brand = BRAND_MAP[partner.name];
        if (brand) {
            // Priority 1: High-quality colorful SVG from Simple Icons
            return `https://cdn.simpleicons.org/${brand.slug}/${brand.color}`;
        }
        // Fallback to local logo immediately if not in the map
        return partner.logo;
    };

    const handleImageError = (partner) => {
        // Multi-stage fallback:
        // Stage 1: If current was CDN, try falling back to local asset
        if (!logoSources[partner.name] && BRAND_MAP[partner.name]) {
            setLogoSources(prev => ({ ...prev, [partner.name]: partner.logo }));
        } else {
            // Stage 2: Both CDN and Local failed, show text name
            setFailedLogos(prev => new Set([...prev, partner.name]));
        }
    };

    // Don't render if not visible
    if (!isVisible) return null;

    // Show loading state only if loading and no fallback
    if (loading && apiPartners.length === 0 && staticPartners.length === 0) {
        return (
            <div className="w-full py-6 overflow-hidden relative bg-transparent">
                <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">{title}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-6 overflow-hidden relative bg-transparent">
            {/* Title removed for less clutter, Hero handles main title */}

            {/* Marquee Container */}
            <div className="flex w-max min-w-full animate-marquee items-center py-2">
                {/* First Set */}
                <div className="flex items-center gap-14 md:gap-20 px-4 md:px-12 shrink-0">
                    {partners.map((partner, index) => (
                        <div
                            key={`partner-1-${index}`}
                            className="flex flex-col items-center justify-center shrink-0 w-36 md:w-48 group/partner transition-all duration-300"
                            title={partner.name}
                        >
                            <div className="h-12 md:h-14 w-full flex items-center justify-center mb-4 p-2 transform transition-transform duration-300 group-hover/partner:scale-110">
                                {failedLogos.has(partner.name) ? (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <Monitor size={24} strokeWidth={1.5} className="opacity-40" />
                                    </div>
                                ) : (
                                    <img
                                        src={getLogoUrl(partner)}
                                        alt={partner.name}
                                        className="h-full w-auto max-w-[120px] md:max-w-[160px] object-contain opacity-80 group-hover/partner:opacity-100 transition-all duration-300 pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                                        onError={() => handleImageError(partner)}
                                    />
                                )}
                            </div>
                            <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em] text-center opacity-40 group-hover/partner:opacity-100 transition-all duration-300 whitespace-nowrap">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Second Set (Duplicate for seamless loop) */}
                <div className="flex items-center gap-14 md:gap-20 px-4 md:px-12 shrink-0">
                    {partners.map((partner, index) => (
                        <div
                            key={`partner-2-${index}`}
                            className="flex flex-col items-center justify-center shrink-0 w-36 md:w-48 group/partner transition-all duration-300"
                            title={partner.name}
                        >
                            <div className="h-12 md:h-14 w-full flex items-center justify-center mb-4 p-2 transform transition-transform duration-300 group-hover/partner:scale-110">
                                {failedLogos.has(partner.name) ? (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <Monitor size={24} strokeWidth={1.5} className="opacity-40" />
                                    </div>
                                ) : (
                                    <img
                                        src={getLogoUrl(partner)}
                                        alt={partner.name}
                                        className="h-full w-auto max-w-[120px] md:max-w-[160px] object-contain opacity-80 group-hover/partner:opacity-100 transition-all duration-300 pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                                        onError={() => handleImageError(partner)}
                                    />
                                )}
                            </div>
                            <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em] text-center opacity-40 group-hover/partner:opacity-100 transition-all duration-300 whitespace-nowrap">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartnersMarquee;
