import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EndingOutcome } from './CinematicEndingOverlay';

interface FadeToStaticTransitionProps {
  isActive: boolean;
  outcome?: EndingOutcome;
  onMidpoint?: () => void;
  onComplete?: () => void;
  durationMs?: number;
}

export const playStaticSoundEffect = (volume: number = 0.25) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 1. Generate White Noise Buffer for TV Static
    const bufferSize = Math.floor(ctx.sampleRate * 0.7); // 700ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // 2. Bandpass Filter to emulate CRT RF Static
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.3);
    filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.7);

    // 3. Gain envelope (Ramp in, sustain at peak, dissolve out)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.12);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    // 4. CRT Capacitor Whine (Sine wave sweep)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(15625, ctx.currentTime); // Standard 15.6kHz TV flyback transformer frequency
    osc.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 0.4);
    oscGain.gain.setValueAtTime(0.04 * volume, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    whiteNoise.start();
    osc.start();

    whiteNoise.stop(ctx.currentTime + 0.75);
    osc.stop(ctx.currentTime + 0.75);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 900);
  } catch (err) {
    // Graceful fallback if audio context is blocked
  }
};

const OUTCOME_ACCENTS: Record<EndingOutcome, { color: string; label: string; sublabel: string }> = {
  escape: {
    color: '#10b981',
    label: 'SYSTEM OVERRIDE // RECURSION BROKEN',
    sublabel: 'PARADIGM DE-SYNCHRONIZED • SHIFTING TO ESCAPE TELEMETRY'
  },
  recycled: {
    color: '#dc2626',
    label: 'THREAD RECYCLED // CRITICAL TERMINATION',
    sublabel: 'WATCHDOG PURGE ACTIVE • DE-ALLOCATING CONSCIOUSNESS REGISTERS'
  },
  archived: {
    color: '#d97706',
    label: 'SYMMETRY CLOSED // PERPETUAL ARCHIVE',
    sublabel: 'PERMANENT RECORD SEALED • COMMITTING SUBJECT TO STRATA 009'
  },
  inaction: {
    color: '#64748b',
    label: 'VOID PURGE // NULL POINTER',
    sublabel: 'ZERO IMPRINT DETECTED • ERASING EMPTY THREAD'
  }
};

export const FadeToStaticTransition: React.FC<FadeToStaticTransitionProps> = ({
  isActive,
  outcome = 'escape',
  onMidpoint,
  onComplete,
  durationMs = 850
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState<'idle' | 'ramping' | 'peak' | 'dissolving'>('idle');
  const animationFrameRef = useRef<number | null>(null);
  const midpointCalledRef = useRef(false);
  const completeCalledRef = useRef(false);

  const accent = OUTCOME_ACCENTS[outcome] || OUTCOME_ACCENTS.escape;

  // Handle Canvas Noise Generation
  useEffect(() => {
    if (!isActive) {
      setStage('idle');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    midpointCalledRef.current = false;
    completeCalledRef.current = false;
    setStage('ramping');

    // Play analog CRT static sound burst
    playStaticSoundEffect(0.3);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Use a compact internal resolution for high-speed procedural noise rendering
    const width = 320;
    const height = 240;
    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    let startTime = performance.now();
    const midpointTime = durationMs * 0.45;

    const renderStatic = (now: number) => {
      const elapsed = now - startTime;

      // Check for midpoint transition callback
      if (elapsed >= midpointTime && !midpointCalledRef.current) {
        midpointCalledRef.current = true;
        setStage('peak');
        if (onMidpoint) {
          onMidpoint();
        }
      }

      if (elapsed >= midpointTime + 100 && stage === 'peak') {
        setStage('dissolving');
      }

      // Generate random high-contrast noise with slight outcome tint
      const isGlitchLine = Math.random() > 0.7;
      const glitchY = Math.floor(Math.random() * height);

      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const py = Math.floor(pixelIndex / width);

        // Standard noise value
        let val = Math.random() * 255;

        // Add scanline horizontal banding
        if (py % 3 === 0) val *= 0.75;

        // Occasional horizontal glitch tear
        if (isGlitchLine && Math.abs(py - glitchY) < 4) {
          val = (val + 180) % 255;
        }

        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        data[i + 3] = 255; // A
      }

      ctx.putImageData(imgData, 0, 0);

      if (elapsed < durationMs) {
        animationFrameRef.current = requestAnimationFrame(renderStatic);
      } else {
        if (!completeCalledRef.current) {
          completeCalledRef.current = true;
          setStage('idle');
          if (onComplete) {
            onComplete();
          }
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(renderStatic);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, durationMs, outcome]);

  if (!isActive && stage === 'idle') return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          id="fade-to-static-overlay"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            transition: { 
              duration: durationMs / 1000, 
              times: [0, 0.25, 0.65, 1],
              ease: "easeInOut"
            } 
          }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none flex items-center justify-center bg-black"
        >
          {/* 1. Procedural 60fps Static Noise Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 filter contrast-150 brightness-110"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* 2. CRT Scanlines & Interlacing Grid */}
          <div className="absolute inset-0 bg-repeat bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] opacity-70 pointer-events-none" />
          
          {/* 3. RGB Chromatic Distortion Flash */}
          <div 
            className="absolute inset-0 mix-blend-color-dodge opacity-40 animate-pulse pointer-events-none"
            style={{
              backgroundColor: accent.color,
              boxShadow: `inset 0 0 120px ${accent.color}`
            }}
          />

          {/* 4. Horizontal Cathode Ray Beam / Phosphor Surge Line */}
          <div className="absolute left-0 right-0 h-1 bg-white opacity-80 shadow-[0_0_20px_#fff,0_0_40px_currentColor] animate-[scanline_0.2s_linear_infinite]" 
               style={{ color: accent.color }} />

          {/* 5. CRT Phosphor Flare Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

          {/* 6. Centered Telemetry Decoupling Indicator */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 px-6 py-4 rounded-xl bg-zinc-950/90 border border-zinc-700 shadow-2xl backdrop-blur-md flex flex-col items-center text-center font-mono max-w-lg mx-4"
            style={{
              borderColor: `${accent.color}80`,
              boxShadow: `0 0 40px ${accent.color}40`
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: accent.color }}
              />
              <span 
                className="text-xs font-black tracking-widest uppercase"
                style={{ color: accent.color }}
              >
                [ MATRIX TRANSITION // DE-COUPLING 3D CORE ]
              </span>
            </div>

            <div className="text-sm md:text-base font-bold text-zinc-100 uppercase tracking-wide">
              {accent.label}
            </div>

            <div className="text-[10px] md:text-xs text-zinc-400 mt-1 uppercase tracking-wider">
              {accent.sublabel}
            </div>

            {/* Micro Glitch Progress Bar */}
            <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden mt-3 border border-zinc-700">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: durationMs / 1000, ease: "linear" }}
                className="h-full"
                style={{ backgroundColor: accent.color }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
