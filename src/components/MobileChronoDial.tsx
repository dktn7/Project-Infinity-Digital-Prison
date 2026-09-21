import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '../utils/haptics';
import { TechMilestone } from '../types';

interface MobileChronoDialProps {
  scrollProgress: number;
  onScrub: (progress: number) => void;
  milestones: TechMilestone[];
  activeIndex: number;
  phase: string;
  accentColor?: string;
}

export const MobileChronoDial: React.FC<MobileChronoDialProps> = ({
  scrollProgress,
  onScrub,
  milestones,
  activeIndex,
  phase,
  accentColor = '#10b981',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastHapticIndex = useRef<number>(activeIndex);

  const isThreat = phase === 'observation';
  const themeColor = isThreat ? '#ef4444' : accentColor;

  const handlePointerScrub = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clampedY = Math.max(rect.top, Math.min(rect.bottom, clientY));
    const normalized = (clampedY - rect.top) / rect.height; // 0 (top) to 1 (bottom)
    
    // Check if we crossed into a new milestone to trigger haptic detent
    const step = 1 / (milestones.length - 1 || 1);
    const closestIdx = Math.round(normalized / step);
    if (closestIdx !== lastHapticIndex.current) {
      lastHapticIndex.current = closestIdx;
      triggerHaptic(8);
    }

    onScrub(normalized);
  }, [milestones.length, onScrub]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    triggerHaptic(12);
    if (e.touches.length > 0) {
      handlePointerScrub(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handlePointerScrub(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    triggerHaptic(6);
  };

  const activeMilestone = milestones[activeIndex] || milestones[0];

  return (
    <div className="md:hidden fixed right-1.5 top-1/2 -translate-y-1/2 z-[210] pointer-events-auto select-none font-mono">
      {/* Floating Jog-Wheel Thumb Tab / Dial Toggle */}
      <div className="relative flex items-center">
        {/* Toggle / Quick Grab Handle */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            triggerHaptic(10);
          }}
          className={`flex flex-col items-center justify-center w-7 py-2.5 rounded-l-xl border-l border-y backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen || isDragging
              ? 'bg-black/95 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-950/85 text-zinc-400 hover:text-white'
          }`}
          style={{ borderColor: isOpen || isDragging ? themeColor : '#3f3f46' }}
          title="Toggle Chrono Thumb Jog Dial"
        >
          <span className="text-[6.5px] font-black uppercase tracking-tighter writing-vertical rotate-180" style={{ color: themeColor }}>
            CHRONO
          </span>
          <div className="w-1.5 h-1.5 rounded-full my-1 animate-pulse" style={{ backgroundColor: themeColor }} />
          <span className="text-[8px] font-black text-white">
            {activeMilestone ? activeMilestone.year.slice(2) : '00'}
          </span>
        </button>

        {/* Graduated Tactile Ruler Track */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: 52, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative h-64 overflow-hidden rounded-l-2xl bg-[#070b10]/95 border-l border-y border-zinc-800 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.9)] flex flex-col justify-between p-1.5"
              style={{ borderColor: `${themeColor}66` }}
            >
              {/* Header Label */}
              <div className="text-[6.5px] text-zinc-500 font-bold uppercase tracking-widest text-center border-b border-zinc-800 pb-1">
                JOG SCRUB
              </div>

              {/* Physical Scrubber Track Area */}
              <div
                ref={trackRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative flex-1 w-full flex items-center justify-center cursor-pointer my-1 touch-none"
              >
                {/* Central Metallic Guideline */}
                <div className="absolute top-0 bottom-0 w-[2px] bg-zinc-800 rounded-full" />
                
                {/* Illuminated Progress Line */}
                <div 
                  className="absolute top-0 w-[2px] rounded-full transition-all duration-75"
                  style={{
                    height: `${scrollProgress * 100}%`,
                    backgroundColor: themeColor,
                    boxShadow: `0 0 8px ${themeColor}`,
                  }}
                />

                {/* Graduated Micro Ticks */}
                <div className="absolute inset-y-0 w-full flex flex-col justify-between pointer-events-none py-1">
                  {milestones.map((m, idx) => {
                    const isPassed = activeIndex >= idx;
                    const isCurrent = activeIndex === idx;
                    return (
                      <div key={m.id} className="flex items-center justify-between px-1">
                        <span 
                          className={`text-[6.5px] font-black transition-colors ${
                            isCurrent 
                              ? 'text-white scale-110' 
                              : isPassed 
                              ? 'text-zinc-400' 
                              : 'text-zinc-600'
                          }`}
                          style={isCurrent ? { color: themeColor } : undefined}
                        >
                          {m.year}
                        </span>
                        <div 
                          className={`h-[1.5px] rounded transition-all ${
                            isCurrent ? 'w-3' : 'w-1.5'
                          }`}
                          style={{
                            backgroundColor: isCurrent ? themeColor : isPassed ? '#71717a' : '#27272a',
                            boxShadow: isCurrent ? `0 0 6px ${themeColor}` : undefined,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Active Thumb Drag Ring & Needle Indicator */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 flex items-center"
                  style={{ top: `calc(${scrollProgress * 100}% - 9px)` }}
                >
                  <div 
                    className="w-4 h-4 rounded-full border-2 bg-black flex items-center justify-center shadow-lg"
                    style={{ borderColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                  </div>
                </div>
              </div>

              {/* Progress Readout Footprint */}
              <div className="text-[7.5px] font-black text-center pt-1 border-t border-zinc-800" style={{ color: themeColor }}>
                {Math.round(scrollProgress * 100)}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
