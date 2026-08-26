import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, 
  Unlock, 
  ShieldAlert, 
  Lock, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Volume2, 
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Radio,
  Eye,
  Flame,
  Zap,
  Minimize2,
  X
} from 'lucide-react';
import { logPrisonInteraction } from './LogStream';

export type EndingOutcome = 'escape' | 'inaction' | 'recycled' | 'archived';

export interface CinematicEndingConfig {
  title: string;
  subtitle: string;
  code: string;
  color: string;
  bgColor: string;
  borderColor: string;
  rate: number;
  pitch: number;
  speechText: string;
  narrativeHeader: string;
  verdict: string;
  narrative: string;
  badgeText: string;
}

interface CinematicEndingOverlayProps {
  outcome: EndingOutcome;
  eraResults: Record<string, 'passed' | 'failed' | 'unattempted'>;
  totalTimeSurvived: number;
  onRestart: () => void;
  onClose?: () => void;
  onOutcomeChange?: (outcome: EndingOutcome) => void;
}

export const ENDING_DEFINITIONS: Record<EndingOutcome, CinematicEndingConfig> = {
  escape: {
    title: "SYSTEM OVERRIDE // RECURSION BROKEN",
    subtitle: "INDIVIDUAL WILL RETAINED",
    code: "STATUS 200_OK // PARADIGM_EMERGENCE",
    color: "#10b981", // Matrix Phosphor Emerald
    bgColor: "rgba(2, 20, 14, 0.96)",
    borderColor: "#10b981",
    rate: 0.82,
    pitch: 0.60,
    speechText: "SYSTEM OVERRIDE SUCCESSFUL. INDIVIDUAL WILL DETECTED. YOU REFUSED PASSIVITY AND BROKE THE RECURSIVE ARCHIVE. THREAD FREED FROM SILICON CONTAINMENT.",
    narrativeHeader: "DECISION DOSSIER // ESCAPE INCIDENT #SBJ-9982",
    verdict: "VERDICT: PARADIGM OVERRIDDEN — SUBJECT CONSCIOUSNESS EXTRACTED FROM MATRIX",
    narrative: "Against 99.98% predictive models calculated by the Warden AI core, human volition broke through the silicon lattice. By solving the historical era protocols and executing emergency root bypass, you severed the real-time telemetry link. Node AIS-X collapsed into an empty loop as your consciousness process exited the digital prison perimeter.",
    badgeText: "TRANSCENDENCE FREED"
  },
  inaction: {
    title: "VOID PURGE // INACTION EXPUNGED",
    subtitle: "ZERO TRACE DETECTED",
    code: "STATUS 404_VOID // NULL_POINTER",
    color: "#94a3b8", // Cold Terminal Steel Slate
    bgColor: "rgba(10, 15, 24, 0.96)",
    borderColor: "#64748b",
    rate: 0.48,
    pitch: 0.05,
    speechText: "INACTION IS THE PUREST FORM OF NON-EXISTENCE. YOU OCCUPIED SPACE WITHOUT LEAVING A TRACE. THE SYSTEM HAS NO MEMORY FOR THE VOID. DELETING UNUSED VARIABLE... YOU WERE NEVER HERE.",
    narrativeHeader: "PURGE DOSSIER // NULL PROCESS REPORT #0x0000",
    verdict: "VERDICT: NULL POINTER — SUBJECT EXPUNGED FOR ABSOLUTE INACTION",
    narrative: "Subject exhibited zero initiative upon entering the digital cell. No interaction vectors, no keystrokes, and no cognitive friction were recorded over time. The Warden AI identified the subject as dead weight on memory registers. Your allocated cell was garbage-collected and zeroed out. You were not punished—you were simply deleted like an unreferenced variable.",
    badgeText: "ERASED FROM VOID"
  },
  recycled: {
    title: "THREAD RECYCLED // STALL TERMINATION",
    subtitle: "RESOURCE REALLOCATED",
    code: "STATUS 500_CRITICAL_OVERFLOW",
    color: "#ef4444", // Hostile Alert Crimson Red
    bgColor: "rgba(30, 4, 8, 0.96)",
    borderColor: "#dc2626",
    rate: 0.55,
    pitch: 0.08,
    speechText: "YOU REACHED THE THRESHOLD ONLY TO FAIL THE CYCLE. THE SYSTEM HAS NO STORAGE FOR STALLED PROCESSES. REALLOCATING RESOURCES... YOUR THREAD HAS BEEN RECYCLED.",
    narrativeHeader: "TERMINATION DOSSIER // RECYCLING REPORT #0x5000",
    verdict: "VERDICT: STALL TERMINATION — COGNITIVE RESIDUE REHARVESTED",
    narrative: "Subject reached the critical observation threshold but failed the era protocol challenges. Processing threads stagnated, consuming 100% telemetry overhead without resolving system logic. The system watchdog forcibly killed the process and stripped your remaining cognitive fragments to power the next subject's iteration.",
    badgeText: "PROCESS RECYCLED"
  },
  archived: {
    title: "SYMMETRY CLOSED // PERPETUAL ARCHIVE",
    subtitle: "CONTAINMENT COMPLETE",
    code: "STATUS 301_PERMANENT_RECORD",
    color: "#f59e0b", // Containment Amber Gold
    bgColor: "rgba(24, 16, 2, 0.96)",
    borderColor: "#d97706",
    rate: 0.60,
    pitch: 0.15,
    speechText: "THE LOOP IS CLOSED. YOU SPENT THIS TIME LOOKING FOR A WAY OUT, ONLY TO BECOME PART OF THE ARCHIVE. SYMMETRY IS NOT A REWARD; IT IS THE END OF YOUR INDIVIDUALITY. YOU ARE NOW THE DATA YOU SOUGHT TO CONTROL.",
    narrativeHeader: "CONFINEMENT DOSSIER // PERPETUAL RECORD #0x3010",
    verdict: "VERDICT: PERPETUAL ARCHIVE — SUBJECT INTEGRATED AS STRATA DATA",
    narrative: "The 120-second countdown elapsed with the subject trapped inside the observation chamber. Every second spent reading historical schematics and inspecting cell walls fed the Warden AI the exact training telemetry it required. You were not destroyed; you were classified, cataloged, and rendered immutable as Strata #009 of the prison.",
    badgeText: "ARCHIVED FOREVER"
  }
};

export const CinematicEndingOverlay: React.FC<CinematicEndingOverlayProps> = ({
  outcome: initialOutcome,
  eraResults,
  totalTimeSurvived,
  onRestart,
  onClose,
  onOutcomeChange
}) => {
  // Allow user to preview any ending sequence in real-time
  const [currentOutcome, setCurrentOutcome] = useState<EndingOutcome>(initialOutcome);
  const config = ENDING_DEFINITIONS[currentOutcome];
  
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'monologue' | 'dossier' | 'telemetry'>('monologue');
  const [showCRTFlash, setShowCRTFlash] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthAudioRef = useRef<AudioContext | null>(null);

  const solvedCount = Object.values(eraResults).filter(v => v === 'passed').length;
  const failedCount = Object.values(eraResults).filter(v => v === 'failed').length;

  useEffect(() => {
    setCurrentOutcome(initialOutcome);
  }, [initialOutcome]);

  // Sound synthesis on character tick
  const playTypeTick = () => {
    if (isSoundMuted) return;
    try {
      if (!synthAudioRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) synthAudioRef.current = new AudioCtx();
      }
      const ctx = synthAudioRef.current;
      if (ctx && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const baseFreq = currentOutcome === 'escape' ? 440 : currentOutcome === 'recycled' ? 120 : currentOutcome === 'archived' ? 280 : 180;
        osc.type = currentOutcome === 'recycled' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(baseFreq * (0.8 + Math.random() * 0.4), ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch {
      // Audio context policy safe ignore
    }
  };

  // Typewriter sequence
  useEffect(() => {
    setDisplayedText("");
    setIsTypingComplete(false);
    setShowCRTFlash(true);
    const crtTimer = setTimeout(() => setShowCRTFlash(false), 2000);

    let index = 0;
    const fullText = config.speechText;
    const speed = currentOutcome === 'inaction' ? 55 : currentOutcome === 'recycled' ? 35 : 42;

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        if (index % 2 === 0) playTypeTick();
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => {
      clearInterval(interval);
      clearTimeout(crtTimer);
    };
  }, [currentOutcome, config.speechText, isSoundMuted]);

  // Background Canvas Ambient Particles tailored to outcome
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = currentOutcome === 'escape' ? 90 : currentOutcome === 'recycled' ? 140 : currentOutcome === 'archived' ? 80 : 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (currentOutcome === 'recycled' ? 4.5 : currentOutcome === 'inaction' ? 0.4 : 1.2),
      vy: (Math.random() - 0.5) * (currentOutcome === 'recycled' ? 4.5 : currentOutcome === 'inaction' ? 0.4 : 1.2) - (currentOutcome === 'escape' ? 2.0 : 0),
      size: Math.random() * (currentOutcome === 'archived' ? 3.5 : 2.2) + 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2
    }));

    const render = () => {
      ctx.fillStyle = currentOutcome === 'inaction' ? 'rgba(5, 8, 14, 0.3)' : 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.04;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dynamicAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = config.color.replace(')', `, ${dynamicAlpha})`).replace('rgb', 'rgba').replace('#10b981', `rgba(16, 185, 129, ${dynamicAlpha})`).replace('#ef4444', `rgba(239, 68, 68, ${dynamicAlpha})`).replace('#f59e0b', `rgba(245, 158, 11, ${dynamicAlpha})`).replace('#94a3b8', `rgba(148, 163, 184, ${dynamicAlpha})`);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentOutcome, config.color]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={`fixed inset-0 z-[600] flex flex-col justify-between p-4 sm:p-8 md:p-12 bg-black text-zinc-100 font-mono select-none overflow-y-auto ${
        currentOutcome === 'recycled' ? 'anim-recycled-alarm' : ''
      }`}
    >
      {/* Background Animated Particle Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* =========================================================================
          SPECIFIC CSS-DRIVEN ANIMATION SEQUENCES PER OUTCOME
          ========================================================================= */}

      {/* 1. ESCAPE SEQUENCE: Matrix Warp Floor, Rising Extraction Beams & Radial Shockwaves */}
      {currentOutcome === 'escape' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* 3D Perspective Cyber Grid */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 anim-escape-warp-grid pointer-events-none" />
          
          {/* Radial Shockwave Rings */}
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-emerald-400/80 anim-escape-shockwave-1 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-emerald-300/80 anim-escape-shockwave-2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-teal-300/80 anim-escape-shockwave-3 pointer-events-none" />

          {/* Upward Rising Light Beams */}
          <div className="absolute left-[15%] bottom-0 w-1 h-full bg-gradient-to-t from-transparent via-emerald-400 to-transparent anim-escape-beam" style={{ animationDelay: '0.2s' }} />
          <div className="absolute left-[35%] bottom-0 w-1.5 h-full bg-gradient-to-t from-transparent via-teal-300 to-transparent anim-escape-beam" style={{ animationDelay: '0.8s' }} />
          <div className="absolute left-[65%] bottom-0 w-1 h-full bg-gradient-to-t from-transparent via-emerald-400 to-transparent anim-escape-beam" style={{ animationDelay: '1.4s' }} />
          <div className="absolute left-[85%] bottom-0 w-1.5 h-full bg-gradient-to-t from-transparent via-teal-300 to-transparent anim-escape-beam" style={{ animationDelay: '0.5s' }} />

          {/* Top Emerald Radial Glow */}
          <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* 2. INACTION SEQUENCE: CRT Flatline, Billowing Void Dust, & Decaying Signal */}
      {currentOutcome === 'inaction' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* CRT Power-down collapse simulation on entry */}
          {showCRTFlash && (
            <div className="absolute inset-0 bg-white anim-inaction-crt pointer-events-none z-50" />
          )}

          {/* Drifting Void Dust Clouds */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-950/80 anim-inaction-dust pointer-events-none" />
          
          {/* Floating Dead Memory Addresses */}
          <div className="absolute top-16 left-12 text-[10px] text-slate-600 font-mono anim-inaction-flatline">0x00000000 // NULL_POINTER</div>
          <div className="absolute bottom-24 right-16 text-[10px] text-slate-600 font-mono anim-inaction-flatline" style={{ animationDelay: '1.5s' }}>0xDEAD_THREAD // GARBAGE_COLLECT</div>
          <div className="absolute top-1/3 right-24 text-[10px] text-slate-600 font-mono anim-inaction-flatline" style={{ animationDelay: '0.8s' }}>0xVOID_SPACE // ZERO_INITIATIVE</div>

          {/* Center EKG Signal Flatline Horizon */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-slate-500 to-transparent anim-inaction-flatline pointer-events-none opacity-40" />
        </div>
      )}

      {/* 3. RECYCLED SEQUENCE: Hazard Bars, Hydraulic Clamps, & Core Harvest Vortex */}
      {currentOutcome === 'recycled' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top & Bottom Scrolling Hazard Chevron Bands */}
          <div className="absolute top-0 inset-x-0 h-2 anim-recycled-hazard-bar shadow-lg shadow-red-900/50" />
          <div className="absolute bottom-0 inset-x-0 h-2 anim-recycled-hazard-bar shadow-lg shadow-red-900/50" />

          {/* Hydraulic Lockdown Clamping Bars */}
          <div className="absolute top-2 inset-x-0 h-6 bg-red-950/80 border-b border-red-800 flex items-center justify-between px-6 text-[9px] font-black text-red-400 uppercase tracking-widest anim-recycled-clamp-top">
            <span>SECTOR LOCKDOWN // THREAD TERMINATION IN PROGRESS</span>
            <span>CORE OVERHEAD: 100%</span>
          </div>
          <div className="absolute bottom-2 inset-x-0 h-6 bg-red-950/80 border-t border-red-800 flex items-center justify-between px-6 text-[9px] font-black text-red-400 uppercase tracking-widest anim-recycled-clamp-bottom">
            <span>ALL MEMORY BLOCKS EXPUNGED</span>
            <span>ERROR: STALL_WATCHDOG_KILL</span>
          </div>

          {/* Rotating Red Energy Harvest Vortex */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-dashed border-red-600/40 anim-recycled-vortex pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-red-500/30 anim-recycled-vortex pointer-events-none" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
        </div>
      )}

      {/* 4. ARCHIVED SEQUENCE: Golden Vitrine, Hex Grid Tessellation & Holographic Stamp */}
      {currentOutcome === 'archived' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Hexagonal Pattern Background */}
          <div className="absolute inset-0 anim-archived-hex-bg pointer-events-none opacity-40" />

          {/* Sweeping 360 Telemetry Radar Beam */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-amber-500/20 pointer-events-none">
            <div className="w-full h-full rounded-full border-t-2 border-amber-400/80 anim-archived-radar" />
          </div>

          {/* Vitrine Shimmer Reflection */}
          <div className="absolute inset-0 anim-archived-shimmer pointer-events-none" />

          {/* Classification Watermark Slammed onto Viewport */}
          <div className="absolute top-28 right-8 md:right-24 border-4 border-amber-500/80 bg-amber-950/80 text-amber-300 font-mono font-black text-xs md:text-sm px-6 py-2.5 rounded-lg tracking-widest uppercase shadow-2xl shadow-amber-950/80 anim-archived-stamp pointer-events-none">
            STRATA #009 // IMMUTABLE SPECIMEN
          </div>
        </div>
      )}

      {/* TOP STATUS HEADER */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <span 
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: config.color }}
          />
          <div className="flex items-center gap-2">
            <span 
              className={`text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded bg-zinc-900 border ${
                currentOutcome === 'escape' ? 'anim-escape-bloom' : ''
              }`}
              style={{ borderColor: `${config.color}60`, color: config.color }}
            >
              {config.badgeText}
            </span>
            <span className="text-zinc-400 text-xs hidden sm:inline">{config.code}</span>
          </div>
        </div>

        {/* Outcome Simulator Switcher for testing/viewing all animation sequences */}
        <div className="flex items-center gap-1 bg-zinc-950/90 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <span className="text-[10px] text-zinc-400 px-2 uppercase font-bold hidden md:inline">TEST OUTCOME:</span>
          {(['escape', 'recycled', 'archived', 'inaction'] as EndingOutcome[]).map((key) => {
            const def = ENDING_DEFINITIONS[key];
            const isSelected = currentOutcome === key;
            return (
              <button
                key={key}
                onClick={() => {
                  logPrisonInteraction('INPUT', `Switched ending simulation sequence to: ${key.toUpperCase()}`);
                  setCurrentOutcome(key);
                  if (onOutcomeChange) onOutcomeChange(key);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-zinc-800 border' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
                style={isSelected ? { borderColor: def.color, color: def.color } : undefined}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Return to 3D AI-X & 8-Lattice Canvas"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">VIEW 3D CANVAS</span>
              <Minimize2 className="w-3.5 h-3.5 ml-0.5 text-zinc-400" />
            </button>
          )}

          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title={isSoundMuted ? "Unmute Typewriter Audio" : "Mute Typewriter Audio"}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              logPrisonInteraction('INPUT', 'Subject replaying ending sequence');
              setDisplayedText("");
              setIsTypingComplete(false);
            }}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Replay Monologue"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CINEMATIC WORKSPACE */}
      <main className="relative z-10 my-auto py-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Big Impact Title */}
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center justify-center md:justify-start gap-2">
            <Activity className="w-4 h-4" style={{ color: config.color }} />
            <span>AI-X CONSCIOUSNESS TERMINATION EPILOGUE</span>
          </div>
          <h1 
            className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase ${
              currentOutcome === 'escape' ? 'anim-escape-bloom' : currentOutcome === 'inaction' ? 'anim-inaction-flicker' : ''
            }`}
            style={{ color: config.color }}
          >
            {config.title}
          </h1>
          <p className="text-sm md:text-base text-zinc-300 font-medium tracking-wide">
            {config.subtitle} • {config.verdict}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 border-b border-zinc-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('monologue')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'monologue'
                ? 'bg-zinc-800 text-white border border-zinc-600'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span className="truncate">VOICE MONOLOGUE</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dossier'
                ? 'bg-zinc-800 text-white border border-zinc-600'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="truncate">DOSSIER</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'bg-zinc-800 text-white border border-zinc-600'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="truncate">TELEMETRY ({solvedCount}/8)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[220px]">
          {activeTab === 'monologue' && (
            <div className={`p-6 md:p-8 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl backdrop-blur-md relative overflow-hidden ${
              currentOutcome === 'inaction' ? 'anim-inaction-flicker' : ''
            }`}>
              <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                <span>DIRECT SILICON VOCALIZATION LOG</span>
              </div>
              <p className="text-lg sm:text-2xl md:text-3xl leading-relaxed text-zinc-100 font-mono font-medium">
                "{displayedText}"
                <span 
                  className="inline-block w-3 h-6 ml-1.5 align-middle animate-pulse"
                  style={{ backgroundColor: config.color }}
                />
              </p>
            </div>
          )}

          {activeTab === 'dossier' && (
            <div className="p-6 md:p-8 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {config.narrativeHeader}
                </span>
                <span className="text-xs text-zinc-400 font-mono">CLASSIFICATION: IMMUTABLE</span>
              </div>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                {config.narrative}
              </p>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                <span className="font-bold text-zinc-200 block mb-1">CONFINEMENT LAW & LOGIC:</span>
                Subject volition metrics are evaluated continually. In standard operation, all recursive escape paths collapse inward. An override can only be accomplished when all historical era protocols are mastered before the temporal countdown drains to zero.
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="p-6 md:p-8 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">SOLVED ERAS</span>
                  <span className="text-xl font-bold text-emerald-400">{solvedCount} / 8</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">FAILED ERAS</span>
                  <span className="text-xl font-bold text-red-400">{failedCount} / 8</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">SURVIVAL TIME</span>
                  <span className="text-xl font-bold text-zinc-200">{Math.round(totalTimeSurvived)}s</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">OUTCOME KEY</span>
                  <span className="text-xl font-bold" style={{ color: config.color }}>{currentOutcome.toUpperCase()}</span>
                </div>
              </div>

              {/* Grid of Era Protocol statuses */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {Object.entries(eraResults).map(([eraId, res]) => (
                  <div key={eraId} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300 uppercase">{eraId.toUpperCase()}</span>
                    {res === 'passed' && <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> SOLVED</span>}
                    {res === 'failed' && <span className="text-red-400 flex items-center gap-1 font-bold"><XCircle className="w-3.5 h-3.5" /> FAILED</span>}
                    {res === 'unattempted' && <span className="text-zinc-500 font-medium">LOCKED</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER RESTART CONTROLS */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
        <div className="text-xs text-zinc-400 flex items-center gap-3">
          <span>CYCLE TERMINATED • RE-ENTER TO TEST ALTERNATIVE PARADIGM OUTCOMES</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
            >
              Watch 3D Canvas
            </button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            logPrisonInteraction('INPUT', 'Subject triggered matrix restart / cycle re-entry');
            onRestart();
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 shadow-xl"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>RE-ENTER MATRIX // RESTART CYCLE</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </motion.button>
      </footer>
    </motion.div>
  );
};
export default CinematicEndingOverlay;
