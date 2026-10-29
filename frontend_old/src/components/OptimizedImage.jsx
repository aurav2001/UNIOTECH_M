import React, { useState, useRef, useEffect } from 'react';

/**
 * OptimizedImage - Lazy loading image component for Core Web Vitals
 * Features:
 * - Native lazy loading
 * - Blur-up placeholder effect
 * - Automatic srcset for responsive images (Cloudinary/Unsplash)
 * - Fade-in animation on load
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    width,
    height,
    priority = false, // Set true for above-the-fold images (LCP)
    placeholder = 'blur', // 'blur' | 'empty'
    objectFit = 'cover',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' }
        );

        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [priority]);

    // Generate srcset for responsive images (works with Cloudinary URLs)
    const generateSrcSet = (url) => {
        if (!url || url.includes('placeholder')) return '';
        
        // Cloudinary URL transformation
        if (url.includes('cloudinary.com')) {
            const sizes = [400, 800, 1200, 1600];
            return sizes
                .map(size => {
                    const transformed = url.replace('/upload/', `/upload/w_${size},q_auto,f_auto/`);
                    return `${transformed} ${size}w`;
                })
                .join(', ');
        }
        
        // Unsplash URL transformation
        if (url.includes('unsplash.com')) {
            const sizes = [400, 800, 1200, 1600];
            return sizes
                .map(size => `${url}&w=${size} ${size}w`)
                .join(', ');
        }
        
        return '';
    };

    // Low quality placeholder for blur effect
    const getPlaceholderUrl = (url) => {
        if (!url) return '';
        
        if (url.includes('cloudinary.com')) {
            return url.replace('/upload/', '/upload/w_50,q_10,e_blur:1000,f_auto/');
        }
        if (url.includes('unsplash.com')) {
            return `${url}&w=50&blur=50`;
        }
        return url;
    };

    const srcSet = generateSrcSet(src);
    const placeholderUrl = placeholder === 'blur' ? getPlaceholderUrl(src) : '';

    return (
        <div 
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Blur placeholder */}
            {placeholder === 'blur' && !isLoaded && placeholderUrl && (
                <img
                    src={placeholderUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full scale-110 blur-lg"
                    style={{ objectFit }}
                    aria-hidden="true"
                />
            )}
            
            {/* Main image */}
            {isInView && (
                <img
                    src={src}
                    srcSet={srcSet || undefined}
                    sizes={srcSet ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : undefined}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full transition-opacity duration-500 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ objectFit }}
                    {...props}
                />
            )}
            
            {/* Empty placeholder when image hasn't loaded */}
            {!isInView && (
                <div 
                    className="w-full h-full bg-gray-200 animate-pulse"
                    style={{ width, height }}
                />
            )}
        </div>
    );
};

export default OptimizedImage;
