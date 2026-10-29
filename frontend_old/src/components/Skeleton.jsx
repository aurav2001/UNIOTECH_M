import React from 'react';

/**
 * A reusable Skeleton component for loading states.
 * Uses Tailwind's animate-pulse utility.
 * 
 * @param {string} className - Additional CSS classes
 * @param {object} props - Additional props spread to the div
 */
const Skeleton = ({ className = "", ...props }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded-md ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
