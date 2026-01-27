import React from 'react';

interface MaskProps {
    index: number;
}

export const WheelMask: React.FC<MaskProps> = ({ index }) => {
    // Map index to original asset names: hw.png (0), hw1.png (1), etc.
    const maskImages = ['hw.png', 'hw1.png', 'hw2.png', 'hw3.png', 'hw4.png'];
    const currentImage = maskImages[index % maskImages.length];

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <img
                src={`/assets/${currentImage}`}
                alt={`Harmony Mask ${index}`}
                className="w-full h-full object-contain"
            />
        </div>
    );
};
