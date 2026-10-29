import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Calendar, Copy, Check } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const Offers = () => {
    const { getContent } = useContent();
    const { items = [], title, subtitle, isVisible } = getContent('offers');

    if (isVisible === false) return null;
    const [copiedCode, setCopiedCode] = React.useState(null);

    // Filter valid offers
    const validOffers = items.filter(offer => {
        if (!offer.expiry) return true;
        return new Date(offer.expiry) >= new Date();
    });

    if (!validOffers.length) return null;

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <section className="py-20 bg-primary-dark relative overflow-hidden text-white">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-medium/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">{title || "Exclusive Offers"}</h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">{subtitle || "Grab these limited-time deals to boost your business."}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {validOffers.map((offer, index) => (
                        <motion.div
                            key={offer.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-green-500/20 text-green-400 p-3 rounded-xl">
                                    <Tag size={24} />
                                </div>
                                {offer.discount && (
                                    <span className="bg-white text-primary-dark font-bold px-3 py-1 rounded-lg text-sm">
                                        {offer.discount}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold mb-2 text-white">{offer.title}</h3>
                            <p className="text-gray-400 mb-6">{offer.description}</p>

                            <div className="bg-black/30 rounded-xl p-4 flex items-center justify-between border border-white/5 mb-4">
                                <div className="font-mono text-lg tracking-wider text-primary-light font-bold">
                                    {offer.code}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(offer.code)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Copy Code"
                                >
                                    {copiedCode === offer.code ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                                </button>
                            </div>

                            {offer.expiry && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                                    <Calendar size={14} />
                                    <span suppressHydrationWarning>Valid until {offer.expiry ? new Date(offer.expiry).toISOString().split('T')[0] : 'N/A'}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Offers;
