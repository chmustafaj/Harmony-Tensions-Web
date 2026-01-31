import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useRotary Hook
 * 
 * This hook manages the logic for a "rotary" or "dial" interaction.
 * It allows a user to "click-and-drag" (or touch) a circular element to rotate it.
 * It also handles "snapping" the rotation to specific sections (like 12 notes on a clock).
 */

interface UseRotaryOptions {
    sections: number;           // How many "slots" the wheel has (e.g., 12 for the clock/notes)
    onValueChange?: (value: number) => void; // A callback function to run when the wheel stops on a new section
    initialRotation?: number;   // The starting angle in degrees
}

/**
 * A helper function to extract the X and Y coordinates from either a Mouse Event or a Touch Event.
 * This makes the rest of the code cleaner by not having to check "is this a touch?" everywhere.
 */
function getEventCoordinates(event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
    if ('touches' in event) {
        // This is a touch event (mobile)
        return {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    } else {
        // This is a mouse event (desktop)
        return {
            x: (event as MouseEvent).clientX,
            y: (event as MouseEvent).clientY
        };
    }
}

export const useRotary = ({ sections, onValueChange, initialRotation = 0 }: UseRotaryOptions) => {
    // --- State Management ---

    // "rotation" is the angle (in degrees) that we use to visually rotate the wheel in the UI.
    const [rotation, setRotation] = useState(initialRotation);

    // "isDragging" tells us if the user currently has their mouse/finger down on the wheel.
    const [isDragging, setIsDragging] = useState(false);

    // --- References (Refs) ---
    // Why use refs? Refs allow us to store values that don't trigger a re-render when they change.
    // This is useful for "startAngle" which we only need during the drag calculation.

    const containerRef = useRef<HTMLDivElement>(null); // Points to the actual wheel element in the DOM
    const startAngleRef = useRef(0);                 // Stores the angle where the user FIRST clicked
    const currentRotationRef = useRef(initialRotation); // Tracks the rotation without waiting for React's state updates

    /**
     * calculateAngleFromCenter
     * 
     * Imagine the center of the wheel as (0, 0).
     * This function tells us the angle (in degrees) of a specific point (clientX, clientY)
     * relative to that center point.
     */
    const calculateAngleFromCenter = useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return 0;

        // 1. Find the center point of the wheel on the screen.
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 2. Calculate the difference between the mouse/finger and the center.
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;

        // 3. Use Trigonometry (Math.atan2) to find the angle in radians.
        // atan2(y, x) returns the angle between the positive x-axis and the point (x, y).
        const angleInRadians = Math.atan2(deltaY, deltaX);

        // 4. Convert Radians to Degrees because CSS/Framer Motion uses degrees.
        return (angleInRadians * 180) / Math.PI;
    }, []);

    /**
     * handleStart
     * 
     * Runs when the user first clicks or touches the wheel.
     */
    const handleStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        const { x, y } = getEventCoordinates(event);

        // Find the angle where the user clicked.
        const mouseAngle = calculateAngleFromCenter(x, y);

        // Calculate the "offset". If the wheel is already rotated 45deg, and the user clicks at 90deg,
        // the starting angle should account for that existing 45deg rotation.
        startAngleRef.current = mouseAngle - currentRotationRef.current;

        setIsDragging(true);
    }, [calculateAngleFromCenter]);

    /**
     * handleMove
     * 
     * Runs continuously while the user is dragging their mouse/finger across the screen.
     */
    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;

        // Note: The move handler from our useEffect passes clientX/clientY directly.

        // Calculate the new angle based on current mouse position.
        const mouseAngle = calculateAngleFromCenter(clientX, clientY);

        // Subtract the starting offset to get the real new rotation.
        const newRotation = mouseAngle - startAngleRef.current;

        // Update the state (for the UI) and the ref (for immediate logic).
        setRotation(newRotation);
        currentRotationRef.current = newRotation;
    }, [isDragging, calculateAngleFromCenter]);

    /**
     * handleEnd
     * 
     * Runs when the user lets go of the wheel.
     * This is where we "snap" the wheel to the nearest section.
     */
    const handleEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        // 1. Calculate how many degrees wide each section is (e.g., 360 / 12 = 30 degrees).
        const degreesPerSection = 360 / sections;

        // 2. Find the "snapped" rotation by rounding to the nearest multiple of degreesPerSection.
        const snappedRotation = Math.round(currentRotationRef.current / degreesPerSection) * degreesPerSection;

        // 3. Update the wheel to its final snapped position.
        setRotation(snappedRotation);
        currentRotationRef.current = snappedRotation;

        // 4. Trigger the callback so the rest of the app knows which note is selected.
        if (onValueChange) {
            // "Normalized" rotation keeps the value between 0 and 359.
            const normalizedRotation = (snappedRotation % 360 + 360) % 360;

            /**
             * Mapping Logic:
             * On our wheel (Circle of Fifths), the notes are arranged Clockwise.
             * Rotating the PHYSICAL wheel Clockwise (+ degrees) actually moves the SELECTION 
             * Counter-Clockwise through the note array.
             * 
             * Example: Rotating +30deg brings the note to the left (F) into the top selection area.
             */
            const sectionIndex = (sections - Math.round(normalizedRotation / degreesPerSection) % sections) % sections;
            onValueChange(sectionIndex);
        }
    }, [isDragging, sections, onValueChange]);

    /**
     * Event Listeners
     * 
     * We attach move and end listeners to the 'window' so that even if the user
     * moves their mouse outside the wheel area, the drag continues smoothly.
     */
    useEffect(() => {
        // We only want these listeners active while the user is dragging.
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent | TouchEvent) => {
            const { x, y } = getEventCoordinates(e);
            handleMove(x, y);
        };
        const onMouseUp = () => handleEnd();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onMouseMove);
        window.addEventListener('touchend', onMouseUp);

        // Clean up when the drag ends or the component unmounts.
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [isDragging, handleMove, handleEnd]);

    return {
        rotation,      // Tell the UI how much to rotate the image
        isDragging,    // Tell the UI if we are currently dragging (e.g., to disable animations)
        containerRef,  // This must be attached to the wheel div in the UI
        handleStart     // This must be attached to the onMouseDown/onTouchStart of the wheel
    };
};
