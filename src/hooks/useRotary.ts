import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRotaryOptions {
    sections: number;
    onValueChange?: (value: number) => void;
    initialRotation?: number;
}

export const useRotary = ({ sections, onValueChange, initialRotation = 0 }: UseRotaryOptions) => {
    const [rotation, setRotation] = useState(initialRotation);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startAngleRef = useRef(0);
    const currentRotationRef = useRef(initialRotation);

    const calculateAngle = useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // atan2 returns angle in radians
        const angle = Math.atan2(clientY - centerY, clientX - centerX);
        // convert to degrees
        return (angle * 180) / Math.PI;
    }, []);

    const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const angle = calculateAngle(clientX, clientY);
        startAngleRef.current = angle - currentRotationRef.current;
        setIsDragging(true);
    }, [calculateAngle]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;

        const angle = calculateAngle(clientX, clientY);
        let newRotation = angle - startAngleRef.current;

        setRotation(newRotation);
        currentRotationRef.current = newRotation;
    }, [isDragging, calculateAngle]);

    const handleEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        // Snapping logic
        const anglePerSection = 360 / sections;
        const snappedRotation = Math.round(currentRotationRef.current / anglePerSection) * anglePerSection;

        setRotation(snappedRotation);
        currentRotationRef.current = snappedRotation;

        if (onValueChange) {
            // Circle of Fifths mapping logic:
            // Rotating +30deg (CW) brings the note at -30deg (CCW) to the top.
            // Indices in NOTES array are CW: C(0), G(1), D(2)...
            // So +30deg rotation -> Selection moves backward to index 11 (F).
            let normalized = (snappedRotation % 360 + 360) % 360;
            const section = (sections - Math.round(normalized / anglePerSection) % sections) % sections;
            onValueChange(section);
        }
    }, [isDragging, sections, onValueChange]);

    useEffect(() => {
        const moveHandler = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
            handleMove(clientX, clientY);
        };

        const endHandler = () => {
            handleEnd();
        };

        if (isDragging) {
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', endHandler);
            window.addEventListener('touchmove', moveHandler);
            window.addEventListener('touchend', endHandler);
        }

        return () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', endHandler);
            window.removeEventListener('touchmove', moveHandler);
            window.removeEventListener('touchend', endHandler);
        };
    }, [isDragging, handleMove, handleEnd]);

    return {
        rotation,
        isDragging,
        containerRef,
        handleStart
    };
};
