import React, { useCallback, useEffect, useState } from 'react';

/**
 * RippleEffect - A global component that creates a water drop ripple effect on every click/tap
 * Place this component at the root of your app (e.g., in App.jsx or main.jsx)
 */
const RippleEffect = () => {
    const [ripples, setRipples] = useState([]);

    const createRipple = useCallback((e) => {
        // Get the click/touch position
        const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
        const y = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

        const newRipple = {
            id: Date.now() + Math.random(),
            x,
            y,
        };

        setRipples(prev => [...prev, newRipple]);

        // Remove ripple after animation completes
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
    }, []);

    useEffect(() => {
        // Listen to all mouse and touch events on the document
        document.addEventListener('mousedown', createRipple);
        document.addEventListener('touchstart', createRipple, { passive: true });

        return () => {
            document.removeEventListener('mousedown', createRipple);
            document.removeEventListener('touchstart', createRipple);
        };
    }, [createRipple]);

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
            aria-hidden="true"
        >
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="ripple-drop"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                    }}
                />
            ))}

            <style>{`
                .ripple-drop {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    margin-left: -10px;
                    margin-top: -10px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(29, 78, 216, 0.4) 0%, rgba(29, 78, 216, 0.2) 40%, transparent 70%);
                    animation: ripple-expand 0.6s ease-out forwards;
                    pointer-events: none;
                }

                @keyframes ripple-expand {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default RippleEffect;
