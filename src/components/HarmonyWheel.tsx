import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRotary } from '../hooks/useRotary';
import { cn } from '../lib/utils';
import { WheelMask } from './WheelMask';

const NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const HarmonyWheel: React.FC = () => {
    const [activeNoteIndex, setActiveNoteIndex] = useState(0);
    const [maskIndex, setMaskIndex] = useState(0);

    const { rotation, containerRef, handleStart, isDragging } = useRotary({
        sections: 12,
        onValueChange: (index) => {
            setActiveNoteIndex(index);
        }
    });

    const nextMask = () => setMaskIndex((prev) => (prev + 1) % 5);
    const prevMask = () => setMaskIndex((prev) => (prev - 1 + 5) % 5);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-900 p-4 md:p-12 font-sans select-none overflow-hidden">
            {/* Header / Selection Info */}
            <div className="relative mb-8 md:mb-12 flex flex-col items-center">
                <h1 className="text-2xl md:text-3xl font-black mb-6 uppercase tracking-[0.3em] text-slate-800">
                    Harmony Tensions
                </h1>
                <div className="flex items-center gap-6 px-10 py-4 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Key</span>
                        <span className="text-slate-900 font-serif italic font-black text-4xl leading-none">{NOTES[activeNoteIndex]}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-100" />
                    <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Mask Mode</span>
                        <span className="text-slate-700 font-bold text-lg">#{maskIndex + 1}</span>
                    </div>
                </div>
            </div>

            {/* The Wheel Container */}
            <div
                ref={containerRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                className="relative w-[340px] h-[340px] md:w-[700px] md:h-[700px] cursor-grab active:cursor-grabbing flex items-center justify-center"
            >
                {/* Layer 1: Rotating Letter Wheel (letters.jpeg) - Primary Ring */}
                {/* Removed inset to maximize size, but using w-full h-full to fit container */}
                <motion.div
                    className="absolute inset-[2%] z-10 flex items-center justify-center rounded-full pointer-events-none"
                    animate={{ rotate: rotation }}
                    transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 180 }}
                >
                    <img
                        src="/assets/letters.jpeg"
                        alt="note ring"
                        draggable="false"
                        className="w-full h-full object-contain"
                    />
                </motion.div>

                {/* Layer 2: Stationary Harmony Mask (hw*.png) */}
                <div className="absolute w-[60%] h-[60%] pointer-events-none z-20 flex items-center justify-center">
                    <WheelMask index={maskIndex} />
                </div>

                {/* (Centre Cap Removed as requested) */}

                {/* Layer 4: Selection Indicator (Top) */}
                <div className="absolute top-[-25px] md:top-[-50px] left-1/2 -translate-x-1/2 z-40 h-[12%] w-[4px] flex flex-col items-center pointer-events-none">
                    <div className="w-full h-full bg-slate-900 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full -mt-1 ring-4 ring-white shadow-sm" />
                </div>

                {/* Event Capture Layer (Highest Z-index) */}
                <div className="absolute inset-0 z-50 rounded-full cursor-grab active:cursor-grabbing" />
            </div>

            {/* Navigation Controls */}
            <div className="mt-14 flex flex-col items-center gap-8">
                <div className="flex items-center gap-10 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <button
                        onClick={prevMask}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 hover:text-blue-600 hover:bg-white hover:border-blue-100 transition-all active:scale-90 shadow-sm"
                        title="Previous Pattern"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-300",
                                    maskIndex === i ? "bg-slate-900 scale-150 ring-4 ring-slate-100 shadow-sm" : "bg-slate-200"
                                )}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextMask}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 hover:text-blue-600 hover:bg-white hover:border-blue-100 transition-all active:scale-90 shadow-sm"
                        title="Next Pattern"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.5em] opacity-60">Pattern Variation {maskIndex + 1}</p>
            </div>
        </div>
    );
};
