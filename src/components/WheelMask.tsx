import React from 'react';

export const WheelMask: React.FC = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <img
                src="/assets/hw1.png"
                alt="Harmony Mask"
                className="w-full h-full object-contain"
            />
        </div>
    );
};
