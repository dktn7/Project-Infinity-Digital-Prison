import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Icons8 } from './Icons8';
import { TechMilestone, SimulationPhase } from '../types';
import { BiometricTouchReticle } from './BiometricTouchReticle';
import { MobileChronoDial } from './MobileChronoDial';
import { triggerHaptic } from '../utils/haptics';
import { 
  Eye, 
  Clock, 
  Terminal, 
  Volume2, 
  VolumeX, 
  Zap, 
  Info, 
  Unlock, 
  ChevronUp, 
  ChevronDown,
  Fingerprint
} from 'lucide-react';

interface MobilePrisonTerminalProps {
  phase: SimulationPhase;
  timeRemaining: number;
  initialTime: number;
  isStalled: boolean;
  mobileViewMode: 'dual' | 'face' | 'lemniscate';
  onUpdateMobileViewMode: (mode: 'dual' | 'face' | 'lemniscate') => void;
  activeMilestone: TechMilestone;
  allMilestones: TechMilestone[];
  activeIndex: number;
  onSelectMilestoneIndex: (idx: number) => void;
  onOpenMiniGame: (id: string) => void;
  onOpenTerminal: () => void;
  onOpenSpecOverlay: (milestone: TechMilestone) => void;
  eraResults: Record<string, 'passed' | 'failed' | 'unattempted'>;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onSystemOverride: () => void;
  isCardMinimized: boolean;
  onToggleCardMinimized: () => void;
  isTouching: boolean;
  scrollProgress?: number;
  onScrubProgress?: (progress: number) => void;
  mousePos?: { x: number; y: number };
}

// Map each historical era to an Icons8 asset name
const ERA_ICONS8_NAMES: Record<string, string> = {
  '1945': 'binary-code',
  '1956': 'circuit',
  '1997': 'chess',
  '2012': 'neural-network',
  '2016': 'brain',
  '2026': 'smartphone',
  '2045': 'black-hole',
  '2050': 'visible',
};

export const MobilePrisonTerminal: React.FC<MobilePrisonTerminalProps> = ({
  phase,
  timeRemaining,
  initialTime,
  isStalled,
  mobileViewMode,
  onUpdateMobileViewMode,
  activeMilestone,
  allMilestones,
  activeIndex,
  onSelectMilestoneIndex,
  onOpenMiniGame,
  onOpenTerminal,
  onOpenSpecOverlay,
  eraResults,
  audioMuted,
  onToggleAudio,
  onSystemOverride,
  isCardMinimized,
  onToggleCardMinimized,
  isTouching,
  scrollProgress = 0,
  onScrubProgress,
  mousePos = { x: 0, y: 0 },
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [swipeFeedback, setSwipeFeedback] = useState<'left' | 'right' | null>(null);
  const isObsSequence = phase === 'observation';
  const solvedCount = Object.values(eraResults).filter((v) => v === 'passed').length;
  const currentAccent = isObsSequence ? '#ef4444' : activeMilestone.accentColor || '#10b981';

  // Handle Swipe Gesture on the Active Strata Card
  const handleCardDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const thresholdX = 40;
    const thresholdY = 50;

    // Horizontal Swipe -> Change Era
    if (Math.abs(offset.x) > thresholdX || Math.abs(velocity.x) > 250) {
      if (offset.x < 0 || velocity.x < -250) {
        // Swiped Left -> Next Era
        if (activeIndex < allMilestones.length - 1) {
          triggerHaptic([10, 30]);
          setSwipeFeedback('left');
          setTimeout(() => setSwipeFeedback(null), 300);
          onSelectMilestoneIndex(activeIndex + 1);
        }
      } else {
        // Swiped Right -> Previous Era
        if (activeIndex > 0) {
          triggerHaptic([10, 30]);
          setSwipeFeedback('right');
          setTimeout(() => setSwipeFeedback(null), 300);
          onSelectMilestoneIndex(activeIndex - 1);
        }
      }
      return;
    }

    // Vertical Swipe Down -> Collapse Card
    if (offset.y > thresholdY && !isCardMinimized) {
      triggerHaptic(8);
      onToggleCardMinimized();
      return;
    }

    // Vertical Swipe Up -> Open Spec Dossier or Expand
    if (offset.y < -thresholdY) {
      triggerHaptic(12);
      if (isCardMinimized) {
        onToggleCardMinimized();
      } else {
        onOpenSpecOverlay(activeMilestone);
      }
    }
  };

  return (
    <div className="md:hidden pointer-events-none fixed inset-0 z-[200] flex flex-col justify-between p-2 font-mono select-none">
      {/* ─────────────────────────────────────────────────────────────
          BIOMETRIC CAPACITIVE TOUCH RETICLE (Follows Touch Coordinates)
      ────────────────────────────────────────────────────────────── */}
      <BiometricTouchReticle 
        isTouching={isTouching} 
        pos={mousePos} 
        accentColor={currentAccent} 
        phase={phase} 
      />

      {/* ─────────────────────────────────────────────────────────────
          TACTILE THUMB CHRONO JOG DIAL (Right Edge Scrubbing)
      ────────────────────────────────────────────────────────────── */}
      {onScrubProgress && (
        <MobileChronoDial
          scrollProgress={scrollProgress}
          onScrub={onScrubProgress}
          milestones={allMilestones}
          activeIndex={activeIndex}
          phase={phase}
          accentColor={currentAccent}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. BESPOKE CONTAINMENT VISOR BEZEL (Top HUD)
      ────────────────────────────────────────────────────────────── */}
      <header 
        className="pointer-events-auto relative flex items-center justify-between gap-1 p-2 rounded-xl bg-[#05090f]/95 border backdrop-blur-2xl shadow-2xl transition-all duration-300"
        style={{
          borderColor: isObsSequence ? 'rgba(239, 68, 68, 0.6)' : isStalled ? 'rgba(245, 158, 11, 0.5)' : 'rgba(39, 39, 42, 0.9)',
          boxShadow: isObsSequence ? '0 0 25px rgba(239, 68, 68, 0.25)' : '0 8px 30px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Subtle Chamfered Bezel Corner Decals */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: currentAccent }} />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: currentAccent }} />

        {/* Left: Inmate Biometric & EKG Telemetry Tag */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/80 border border-zinc-800">
          <Icons8 
            name="visible" 
            size={15} 
            color={isObsSequence ? 'ef4444' : isStalled ? 'f59e0b' : '10b981'} 
            fallbackIcon={<Eye className="w-3.5 h-3.5 text-emerald-400" />}
            title="Inmate Surveillance Status"
          />
          <div className="flex flex-col text-left leading-none">
            <div className="flex items-center gap-1">
              <span className="text-[6.5px] text-zinc-500 font-bold uppercase tracking-wider">#9982</span>
              {/* Animated Micro EKG Sine Wave */}
              <svg className="w-5 h-2" viewBox="0 0 30 10" fill="none">
                <path 
                  d="M0 5 L8 5 L11 1 L14 9 L17 3 L20 5 L30 5" 
                  stroke={isObsSequence ? '#ef4444' : isStalled ? '#f59e0b' : '#10b981'} 
                  strokeWidth="1.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={isObsSequence ? 'animate-pulse' : ''}
                />
              </svg>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${
              isObsSequence ? 'text-red-400 animate-pulse' : isStalled ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {isObsSequence ? 'BREACH' : isStalled ? 'STALL' : 'LOCKED'}
            </span>
          </div>
        </div>

        {/* Center: Digital Chrono Reactor & Countdown */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/90 border border-zinc-800 shadow-inner">
          <Icons8 
            name="clock" 
            size={14} 
            color={isObsSequence ? 'ef4444' : isStalled ? 'f59e0b' : '10b981'} 
            fallbackIcon={<Clock className="w-3 h-3 text-emerald-400" />}
            title="Temporal Stability Countdown"
          />
          <div className="flex flex-col items-center leading-none">
            <div className="flex items-baseline gap-0.5">
              <span className={`text-[12.5px] font-black tracking-widest ${
                isObsSequence ? 'text-red-400' : isStalled ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {Math.ceil(timeRemaining).toString().padStart(2, '0')}
              </span>
              <span className="text-[7.5px] font-bold text-zinc-500">SEC</span>
            </div>
            <div className="w-11 h-[2.5px] bg-zinc-800 rounded-full overflow-hidden mt-0.5">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${(timeRemaining / initialTime) * 100}%`,
                  backgroundColor: isObsSequence ? '#ef4444' : isStalled ? '#f59e0b' : '#10b981',
                  boxShadow: `0 0 6px ${isObsSequence ? '#ef4444' : isStalled ? '#f59e0b' : '#10b981'}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Tactical Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Audio Transducer Toggle with Moving Spectrum Bars */}
          <button
            onClick={() => {
              triggerHaptic(8);
              onToggleAudio();
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 active:scale-95 transition-all cursor-pointer text-zinc-300 shadow-sm"
            title={audioMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {audioMuted ? (
              <Icons8 name="mute" size={13} color="ef4444" fallbackIcon={<VolumeX className="w-3 h-3 text-red-400" />} />
            ) : (
              <div className="flex items-center gap-0.5">
                <span className="w-[1.5px] h-2 bg-emerald-400 animate-pulse" />
                <span className="w-[1.5px] h-3 bg-emerald-400 animate-pulse delay-75" />
                <span className="w-[1.5px] h-1.5 bg-emerald-400 animate-pulse delay-150" />
              </div>
            )}
          </button>

          {/* Terminal Launcher with Solved Badges */}
          <button
            onClick={() => {
              triggerHaptic(10);
              onOpenTerminal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-emerald-600 active:scale-95 transition-all cursor-pointer text-zinc-200 shadow-sm"
            title="Open Override Terminal"
          >
            <Icons8 
              name="console" 
              size={13} 
              color={isObsSequence ? 'ef4444' : '10b981'} 
              fallbackIcon={<Terminal className="w-3 h-3 text-zinc-300" />}
            />
            <span className="text-[8px] font-black text-white">{solvedCount}/8</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. CAPACITIVE TOUCH STATUS HINT & SWIPE FEEDBACK (Positioned Above Bottom Deck to Avoid Canvas Obstruction)
      ────────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-[230px] left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300 z-10">
        <AnimatePresence>
          {isTouching ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/85 border border-emerald-500/80 backdrop-blur-md text-[8px] font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap"
            >
              <Icons8 name="fingerprint" size={13} color="10b981" fallbackIcon={<Fingerprint className="w-3 h-3 text-emerald-400" />} />
              <span>[ VOLITION ENGAGED // PARTITION REACTIVE ]</span>
            </motion.div>
          ) : swipeFeedback ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/40 text-[8px] font-bold text-white shadow-xl backdrop-blur-md whitespace-nowrap"
            >
              <span>{swipeFeedback === 'left' ? 'NEXT STRATA ▶' : '◀ PREV STRATA'}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. EMERGENCY OVERRIDE BANNER (Phase 8 Only)
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isObsSequence && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="pointer-events-auto mb-2"
          >
            <button
              onClick={() => {
                triggerHaptic([30, 50, 30]);
                onSystemOverride();
              }}
              className="w-full py-2 px-3 rounded-xl bg-red-950/90 border border-red-500 text-red-200 font-bold text-[9.5px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-98 cursor-pointer animate-pulse"
            >
              <Icons8 name="unlock" size={15} color="ef4444" fallbackIcon={<Unlock className="w-3.5 h-3.5 text-red-400" />} />
              <span>SYSTEM BREACH DETECTED // BREAK RECURSION</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          4. BESPOKE HOLOGRAPHIC CHRONO-DECK (Bottom Console)
      ────────────────────────────────────────────────────────────── */}
      <footer 
        className="pointer-events-auto relative flex flex-col gap-1.5 p-2 rounded-2xl bg-[#060a11]/95 border backdrop-blur-2xl shadow-[0_-10px_35px_rgba(0,0,0,0.9)] transition-all duration-300"
        style={{
          borderColor: isObsSequence ? 'rgba(239, 68, 68, 0.5)' : 'rgba(39, 39, 42, 0.9)',
        }}
      >
        {/* Subtle Chamfered Bezel Accents */}
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: currentAccent }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: currentAccent }} />

        {/* Top Control Bar: Ergonomic Optical Perspective Selector (Zero Canvas Obstruction) */}
        <div className="flex items-center justify-between px-1 pb-1 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider">VIEW</span>
            <div className="flex items-center p-0.5 rounded-lg bg-black/90 border border-zinc-800 shadow-inner">
              <button
                onClick={() => {
                  triggerHaptic(8);
                  onUpdateMobileViewMode('dual');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[8px] font-mono font-bold transition-all cursor-pointer ${
                  mobileViewMode === 'dual'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={mobileViewMode === 'dual' ? { borderColor: currentAccent, boxShadow: `0 0 8px ${currentAccent}40`, color: '#ffffff' } : undefined}
                title="Dual View (Warden + Loop)"
              >
                <Icons8 name="layers" size={10} color={mobileViewMode === 'dual' ? currentAccent.replace('#', '') : '71717a'} fallbackIcon={<span>✨</span>} />
                <span>DUAL</span>
              </button>
              <button
                onClick={() => {
                  triggerHaptic(8);
                  onUpdateMobileViewMode('face');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[8px] font-mono font-bold transition-all cursor-pointer ${
                  mobileViewMode === 'face'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={mobileViewMode === 'face' ? { borderColor: currentAccent, boxShadow: `0 0 8px ${currentAccent}40`, color: '#ffffff' } : undefined}
                title="Warden Focus (AI-X Gaze)"
              >
                <Icons8 name="visible" size={10} color={mobileViewMode === 'face' ? currentAccent.replace('#', '') : '71717a'} fallbackIcon={<span>👁️</span>} />
                <span>WARDEN</span>
              </button>
              <button
                onClick={() => {
                  triggerHaptic(8);
                  onUpdateMobileViewMode('lemniscate');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[8px] font-mono font-bold transition-all cursor-pointer ${
                  mobileViewMode === 'lemniscate'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={mobileViewMode === 'lemniscate' ? { borderColor: currentAccent, boxShadow: `0 0 8px ${currentAccent}40`, color: '#ffffff' } : undefined}
                title="Loop Focus (3D Infinity Ribbon)"
              >
                <Icons8 name="infinity" size={10} color={mobileViewMode === 'lemniscate' ? currentAccent.replace('#', '') : '71717a'} fallbackIcon={<span>♾️</span>} />
                <span>LOOP</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentAccent }} />
            <span className="font-bold text-white uppercase tracking-wider">{activeMilestone.year}</span>
            <span className="text-[7.5px] text-zinc-500">[{activeIndex + 1}/8]</span>
          </div>
        </div>

        {/* Horizontal Strata Memory Core Selector Strip */}
        <div 
          ref={scrollRef} 
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5"
        >
          {allMilestones.map((m, idx) => {
            const isActive = activeIndex === idx;
            const isSolved = eraResults[m.id] === 'passed';
            const isCorrupt = eraResults[m.id] === 'failed';
            const iconName = ERA_ICONS8_NAMES[m.id] || 'circle';
            const eraAccent = isObsSequence ? '#ef4444' : m.accentColor;

            return (
              <button
                key={m.id}
                onClick={() => {
                  triggerHaptic(10);
                  onSelectMilestoneIndex(idx);
                }}
                className={`group relative flex items-center gap-1 px-2 py-1 rounded-lg border text-[8.5px] font-mono font-black whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-zinc-800 border-white text-white shadow-lg scale-105' 
                    : 'bg-black/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
                style={isActive ? { borderColor: eraAccent, boxShadow: `0 0 12px ${eraAccent}44` } : undefined}
              >
                {/* Era Index Badge */}
                <span className="text-[6.5px] font-bold text-zinc-500">#{idx + 1}</span>

                <Icons8 
                  name={iconName} 
                  size={12} 
                  color={isActive ? eraAccent.replace('#', '') : '71717a'} 
                  fallbackIcon={<span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: eraAccent }} />}
                />
                
                <span>{m.year}</span>

                {/* Laser Status Indicators */}
                {isSolved && <span className="text-emerald-400 text-[7.5px] font-bold">✓</span>}
                {isCorrupt && <span className="text-red-400 text-[7.5px] font-bold">✗</span>}
              </button>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ACTIVE STRATA CARD (WITH FULL SWIPE GESTURE SUPPORT)
        ────────────────────────────────────────────────────────────── */}
        {isCardMinimized ? (
          /* Minimized Stealth Ticker (Swipe Up to Expand) */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y < -30) {
                triggerHaptic(10);
                onToggleCardMinimized();
              }
            }}
            onClick={() => {
              triggerHaptic(8);
              onToggleCardMinimized();
            }}
            className="flex items-center justify-between p-1.5 rounded-xl bg-black/80 border border-zinc-800 cursor-pointer text-[9px]"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: currentAccent }} />
              <span className="font-bold text-white truncate">
                {activeMilestone.year} • {activeMilestone.title}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(10);
                  onOpenMiniGame(activeMilestone.id);
                }}
                className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-[8px] flex items-center gap-1 cursor-pointer"
              >
                <Icons8 name="puzzle" size={11} color="10b981" fallbackIcon={<Zap className="w-2.5 h-2.5 text-emerald-400" />} />
                <span>SOLVE</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(8);
                  onToggleCardMinimized();
                }}
                className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                title="Expand strata dossier"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Expanded Full Holographic Datapad Card (Swipe Left/Right to Cycle, Swipe Down to Minimize) */
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={handleCardDragEnd}
            className="relative flex flex-col gap-1.5 p-2.5 rounded-xl bg-black/90 border text-left overflow-hidden touch-pan-y"
            style={{
              borderColor: isObsSequence ? 'rgba(239, 68, 68, 0.4)' : `${currentAccent}55`,
            }}
          >
            {/* Top Glowing Laser Accent Bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300"
              style={{ backgroundColor: currentAccent, boxShadow: `0 0 8px ${currentAccent}` }}
            />

            {/* Tactile Swipe Bar & Directional Hints */}
            <div className="flex items-center justify-between text-[7px] font-bold text-zinc-500 border-b border-zinc-800/80 pb-1">
              <span className="flex items-center gap-1">
                <span className="text-zinc-400">◂</span> SWIPE ERA
              </span>
              {/* Dot Indicators for All Eras */}
              <div className="flex items-center gap-1">
                {allMilestones.map((_, i) => (
                  <span 
                    key={i} 
                    className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: i === activeIndex ? currentAccent : '#27272a',
                      transform: i === activeIndex ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
              <span className="flex items-center gap-1">
                SWIPE ERA <span className="text-zinc-400">▸</span>
              </span>
            </div>

            {/* Header: Strata Identity & Action Buttons */}
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: currentAccent, boxShadow: `0 0 8px ${currentAccent}` }} 
                />
                <span className="text-[10px] font-black text-white truncate tracking-wide">
                  [{activeIndex + 1}/8] {activeMilestone.year} // {activeMilestone.title}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    triggerHaptic(6);
                    onToggleCardMinimized();
                  }}
                  className="p-1 rounded bg-zinc-800/90 text-zinc-400 hover:text-white cursor-pointer"
                  title="Minimize strata card"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Telemetry Detail Description */}
            <p className="text-[8.5px] text-zinc-300 leading-snug line-clamp-2 font-mono">
              {isObsSequence 
                ? 'Singularity containment threshold reached. AI-X surveillance locked on operator volition.'
                : activeMilestone.detail
              }
            </p>

            {/* High-Tech Tactical Triggers */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-800/80">
              {/* Spec Dossier Trigger */}
              <button
                onClick={() => {
                  triggerHaptic(10);
                  onOpenSpecOverlay(activeMilestone);
                }}
                className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-black text-[8px] tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Icons8 name="info" size={12} color="ffffff" fallbackIcon={<Info className="w-3 h-3 text-zinc-300" />} />
                <span>SPEC DOSSIER</span>
              </button>

              {/* Neural Bypass / Mini-Game Trigger */}
              <button
                onClick={() => {
                  triggerHaptic(12);
                  onOpenMiniGame(activeMilestone.id);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg border font-black text-[8px] tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  eraResults[activeMilestone.id] === 'passed'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                    : eraResults[activeMilestone.id] === 'failed'
                    ? 'bg-red-950 border-red-500 text-red-300 shadow-sm'
                    : 'bg-emerald-900/60 hover:bg-emerald-800 border-emerald-500/80 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                }`}
              >
                <Icons8 
                  name="puzzle" 
                  size={12} 
                  color={eraResults[activeMilestone.id] === 'passed' ? '10b981' : eraResults[activeMilestone.id] === 'failed' ? 'ef4444' : '10b981'} 
                  fallbackIcon={<Zap className="w-3 h-3 text-emerald-400" />} 
                />
                <span>
                  {eraResults[activeMilestone.id] === 'passed' && 'SOLVED ✓ (+15s)'}
                  {eraResults[activeMilestone.id] === 'failed' && 'CORRUPT ✗'}
                  {(!eraResults[activeMilestone.id] || eraResults[activeMilestone.id] === 'unattempted') && 'DECIPHER (+15s)'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </footer>
    </div>
  );
};
