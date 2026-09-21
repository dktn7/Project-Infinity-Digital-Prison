import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BiometricTouchReticleProps {
  isTouching: boolean;
  pos: { x: number; y: number };
  accentColor?: string;
  phase?: string;
}

export const BiometricTouchReticle: React.FC<BiometricTouchReticleProps> = ({
  isTouching,
  pos,
  accentColor = '#10b981',
  phase = 'exploration',
}) => {
  const isThreat = phase === 'observation';
  const color = isThreat ? '#ef4444' : accentColor;

  return (
    <AnimatePresence>
      {isTouching && pos.x > 0 && pos.y > 0 && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed pointer-events-none z-[190] select-none font-mono"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer Pulsing Scanning Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="w-20 h-20 -ml-10 -mt-10 rounded-full border border-dashed opacity-60"
            style={{ borderColor: color }}
          />

          {/* Inner Counter-Rotating Hex Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 w-14 h-14 -ml-7 -mt-7 rounded-full border border-dotted opacity-80"
            style={{ borderColor: color }}
          />

          {/* Central Target Crosshair & Core Dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            {/* Center Glowing Dot */}
            <div 
              className="w-2 h-2 rounded-full shadow-lg animate-ping"
              style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
            />
            {/* Static Core Dot */}
            <div 
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: '#ffffff' }}
            />
            {/* Horizontal & Vertical Crosshair Lines */}
            <div className="absolute w-12 h-[1px]" style={{ backgroundColor: `${color}88` }} />
            <div className="absolute h-12 w-[1px]" style={{ backgroundColor: `${color}88` }} />
          </div>

          {/* Corner Cybernetic Brackets */}
          <div className="absolute -top-6 -left-6 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
          <div className="absolute -top-6 -right-6 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color }} />
          <div className="absolute -bottom-6 -left-6 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color }} />
          <div className="absolute -bottom-6 -right-6 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color }} />

          {/* Real-Time Telemetry Data Chip */}
          <div 
            className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-black/90 border text-[8px] font-black tracking-widest shadow-xl flex items-center gap-1.5 backdrop-blur-md"
            style={{ borderColor: `${color}aa`, color: '#ffffff' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            <span className="text-[7.5px]" style={{ color }}>VOLITION LOCK</span>
            <span className="text-zinc-400">X:{Math.round(pos.x)} Y:{Math.round(pos.y)}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
