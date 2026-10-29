import React from 'react';

// Dynamically import all partner logos from local assets
// This automatically loads any .png file added to the src/assets/partners folder
const partnerLogos = import.meta.glob('../assets/partners/*.png', { eager: true });

// Transform imported modules into a partners array
const partners = Object.entries(partnerLogos).map(([path, module]) => {
    // Extract filename from path (e.g., "../assets/partners/Microsoft.png" -> "Microsoft")
    const fileName = path.split('/').pop().replace('.png', '');
    // Format name: Replace underscores with spaces (e.g., "Trend_Micro" -> "Trend Micro")
    const name = fileName.replace(/_/g, ' ');

    return {
        name,
        logo: module.default
    };
});

const ClientsMarquee = () => {
    const [failedLogos, setFailedLogos] = React.useState(new Set());

    const handleImageError = (partnerName) => {
        setFailedLogos(prev => new Set([...prev, partnerName]));
    };

    return (
        <div className="w-full py-6 overflow-hidden relative bg-transparent">
            {/* Title */}
            <div className="text-center mb-4">
                <p className="text-gray-400 text-xs uppercase tracking-widest">Our Trusted Partners</p>
            </div>

            {/* Marquee Container */}
            <div className="flex w-max min-w-full animate-marquee">
                {/* First Set */}
                <div className="flex items-center gap-8 md:gap-14 px-4 md:px-10 shrink-0">
                    {partners.map((partner, index) => (
                        <div
                            key={`partner-1-${index}`}
                            className="flex items-center justify-center shrink-0 w-32 md:w-40 opacity-90 hover:opacity-100 transition-opacity duration-300"
                            title={partner.name}
                        >
                            {failedLogos.has(partner.name) ? (
                                <span className="text-gray-400 text-xs font-semibold text-center whitespace-nowrap">
                                    {partner.name}
                                </span>
                            ) : (
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-10 md:h-14 w-auto max-w-[100px] md:max-w-[140px] object-contain drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] filter brightness-110 hover:brightness-125 transition-all duration-300"
                                    onError={() => handleImageError(partner.name)}
                                />
                            )}
                        </div>
                    ))}
                </div>
                {/* Second Set (Duplicate for seamless loop) */}
                <div className="flex items-center gap-8 md:gap-14 px-4 md:px-10 shrink-0">
                    {partners.map((partner, index) => (
                        <div
                            key={`partner-2-${index}`}
                            className="flex items-center justify-center shrink-0 w-32 md:w-40 opacity-90 hover:opacity-100 transition-opacity duration-300"
                            title={partner.name}
                        >
                            {failedLogos.has(partner.name) ? (
                                <span className="text-gray-400 text-xs font-semibold text-center whitespace-nowrap">
                                    {partner.name}
                                </span>
                            ) : (
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-10 md:h-14 w-auto max-w-[100px] md:max-w-[140px] object-contain drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] filter brightness-110 hover:brightness-125 transition-all duration-300"
                                    onError={() => handleImageError(partner.name)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Gradient Masks */}
            {/* Gradient Masks Removed */}
        </div>
    );
};

export default ClientsMarquee;
