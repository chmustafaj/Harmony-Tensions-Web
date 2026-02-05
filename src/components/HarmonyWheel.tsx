import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRotary } from '../hooks/useRotary';
import { WheelMask } from './WheelMask';

/**
 * Constants used in the Harmony Wheel.
 * Keeping these at the top makes it easy to change the notes or number of patterns later.
 */
const NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const HarmonyWheel: React.FC = () => {
    // --- State Management ---
    const [activeNoteIndex, setActiveNoteIndex] = useState(0); // Which note is currently selected (0 to 11)

    /**
     * useRotary Hook
     * This handles the "feel" and math of the rotating wheel.
     */
    const { rotation, containerRef, handleStart, isDragging } = useRotary({
        sections: 12, // 12 notes in an octave / Circle of Fifths
        onValueChange: (newIndex) => {
            setActiveNoteIndex(newIndex);
        }
    });


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-900 p-4 md:p-12 font-sans select-none overflow-hidden">

            {/* 1. Header Section: Displays the Title and current Selection Info */}
            <HeaderSection
                activeNote={NOTES[activeNoteIndex]}
            />

            {/* 2. The Interactive Wheel Area */}
            <div
                ref={containerRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                className="relative w-[340px] h-[340px] md:w-[700px] md:h-[700px] cursor-grab active:cursor-grabbing flex items-center justify-center"
            >
                {/* --- LAYER 1: The Rotating Note Wheel --- 
                    This is the image of the notes (C, G, D...) that spins when you drag.
                */}
                <motion.div
                    className="absolute inset-[2%] z-10 flex items-center justify-center rounded-full pointer-events-none"
                    animate={{ rotate: rotation }}
                    // When dragging, we want index logic to be instant. When snapping, we use a nice spring animation.
                    transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 180 }}
                >
                    <img
                        src="/assets/letters.jpeg"
                        alt="note ring"
                        draggable="false"
                        className="w-full h-full object-contain"
                    />
                </motion.div>

                {/* --- LAYER 2: The Stationary Mask --- 
                    This is the geometric overlay that shows the "tensions" or relationships.
                    It stays still while the wheel spins behind it.
                */}
                <div className="absolute w-[60%] h-[60%] pointer-events-none z-20 flex items-center justify-center">
                    <WheelMask />
                </div>

                {/* --- LAYER 3: The Selection Indicator --- 
                    The little pin at the top that points to the currently active note.
                */}
                <div className="absolute top-[-25px] md:top-[-50px] left-1/2 -translate-x-1/2 z-40 h-[12%] w-[4px] flex flex-col items-center pointer-events-none">
                    <div className="w-full h-full bg-slate-900 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full -mt-1 ring-4 ring-white shadow-sm" />
                </div>

                {/* --- LAYER 4: The Invisible Interaction Layer --- 
                    This sits on top of everything to catch the mouse/touch events.
                */}
                <div className="absolute inset-0 z-50 rounded-full cursor-grab active:cursor-grabbing" />
            </div>


        </div>
    );
};

/**
 * --- SUB-COMPONENTS ---
 * Breaking the page into smaller pieces makes it much easier to read and maintain.
 */

interface HeaderProps {
    activeNote: string;
}
const HeaderSection: React.FC<HeaderProps> = ({ activeNote }) => (
    <div className="relative mb-8 md:mb-12 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-black mb-6 uppercase tracking-[0.3em] text-slate-800">
            Harmony Tensions
        </h1>
        <div className="flex items-center gap-6 px-10 py-4 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            {/* Active Key Display */}
            <div className="flex flex-col items-center">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Key</span>
                <span className="text-slate-900 font-serif italic font-black text-4xl leading-none">{activeNote}</span>
            </div>
        </div>
    </div>
);

