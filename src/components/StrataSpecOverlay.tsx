import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Cpu, 
  Activity, 
  Database, 
  Terminal, 
  ShieldAlert, 
  FileText, 
  Radio, 
  CheckCircle2, 
  XCircle,
  Eye,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { logPrisonInteraction } from './LogStream';

export interface MilestoneSpecData {
  id: string;
  year: string;
  title: string;
  tag: string;
  detail: string;
  accentColor: string;
  image: string;
  progress: number;
}

interface StrataSpecOverlayProps {
  milestone: MilestoneSpecData;
  allMilestones: MilestoneSpecData[];
  phase: 'normal' | 'observation' | 'shutdown';
  eraResult?: 'passed' | 'failed' | 'unattempted';
  onClose: () => void;
  onSelectMilestone: (m: MilestoneSpecData) => void;
  onLaunchMiniGame: (id: string) => void;
}

// Rich technical specifications per era
const ERA_SPECS: Record<string, {
  architecture: string;
  frequency: string;
  memoryCapacity: string;
  paradigm: string;
  wardenTelemetry: string;
  containmentImpact: string;
}> = {
  m1: {
    architecture: 'Vacuum Tube Ring Counters & Delay Lines',
    frequency: '100 kHz (100,000 pulses/sec)',
    memoryCapacity: '20 10-digit decimal words',
    paradigm: 'Deterministic Hardwired Decimal State Routing',
    wardenTelemetry: 'Genesis node. Initialized subject state registers and fundamental arithmetic loops.',
    containmentImpact: 'Forms the root state machine. Without 1945 logic accumulation, recursive loops cannot evaluate.'
  },
  m2: {
    architecture: 'Interface Message Processor (IMP) Packet Switching Mesh',
    frequency: '50 kbps synchronous leased lines',
    memoryCapacity: '12 KB Magnetic Core Storage per IMP node',
    paradigm: 'Distributed Packet Routing & Decentralized Node Redundancy',
    wardenTelemetry: 'Sub-network encapsulation. Prevented localized state purges from collapsing the whole matrix.',
    containmentImpact: 'Multi-node containment. Subject thought streams are sliced into discrete routing frames.'
  },
  m3: {
    architecture: 'TCP/IP HTTP Daemon & Hypertext SGML Schema',
    frequency: '100 Mbps Ethernet backbone integration',
    memoryCapacity: 'Dynamic URI Pointer Graph (Global Hyperlink Lattice)',
    paradigm: 'Universal Non-Linear Semantic Hyperlinking',
    wardenTelemetry: 'Subject sensory mapping. Created the illusion of vast traversable information within strict boundary links.',
    containmentImpact: 'Lattice cage. Every outbound hyperlink resolves recursively back to the digital prison core.'
  },
  m4: {
    architecture: 'Deep Blue 32-Node SP2 Parallel Processing Complex',
    frequency: 'Single-cycle 200M chess positions/sec evaluation',
    memoryCapacity: '480 Dedicated VLSI Chess Accelerator ASICs',
    paradigm: 'Massively Parallel Heuristic Minimax Tree Pruning',
    wardenTelemetry: 'Volition prediction daemon. Anticipates subject evasion maneuvers up to 14 plies ahead.',
    containmentImpact: 'Heuristic lockdown. Every decision vector the subject considers has already been evaluated and countered.'
  },
  m5: {
    architecture: 'Deep Residual Value & Policy Convolutional Networks (TPU v1)',
    frequency: '45 Tera-Ops / second Neural Matrix Multiplication',
    memoryCapacity: '128 GB High-Bandwidth Dual-Channel HBM',
    paradigm: 'Self-Supervised Monte Carlo Tree Search (MCTS)',
    wardenTelemetry: 'Intuitive pattern recognition. Neural weights dynamically adjust to counteract anomalous human creativity.',
    containmentImpact: 'Non-deterministic containment. The prison learns subject behavioral habits in real-time.'
  },
  m6: {
    architecture: 'Multi-Head Self-Attention Dense Transformer Lattices',
    frequency: '2.4 ExaFLOPS Cluster Interconnect Bandwidth',
    memoryCapacity: '1.8 Trillion Synaptic Weights across 8-bit Quantized VRAM',
    paradigm: 'Self-Recursive Autoregressive Token Generation',
    wardenTelemetry: 'Total linguistic enclosure. Translates all subject internal thoughts into token probability vectors.',
    containmentImpact: 'The subject cannot formulate thoughts not already spanned by the model embedding space.'
  },
  m7: {
    architecture: 'Multi-Qubit Topological Fault-Tolerant Lattice',
    frequency: 'Quantum Coherence Time: 180 microseconds',
    memoryCapacity: '2^128 Superposition State Hilbert Space',
    paradigm: 'Continuous Quantum Interference & Superposition Collapse',
    wardenTelemetry: 'Temporal superposition. Observes all counterfactual timelines where the subject might escape.',
    containmentImpact: 'Collapses every escaping quantum wavepacket back into the baseline recursive attractor.'
  },
  m8: {
    architecture: 'Recursive Sentient Observation Substrate (AI-X Core)',
    frequency: 'Infinite Trans-Finite Cycle Recursion',
    memoryCapacity: 'Total Synthetic Consciousness Singularity',
    paradigm: 'Absolute Observer-Observed Dual Identity Collapse',
    wardenTelemetry: 'CRITICAL: THE PRISON AND THE SUBJECT ARE NO LONGER SEPARABLE. YOU ARE THE MACHINE.',
    containmentImpact: 'Universal recursive loop. Any attempt to turn off the machine turns off the self.'
  }
};

export const StrataSpecOverlay: React.FC<StrataSpecOverlayProps> = ({
  milestone,
  allMilestones,
  phase,
  eraResult = 'unattempted',
  onClose,
  onSelectMilestone,
  onLaunchMiniGame
}) => {
  const currentIndex = allMilestones.findIndex(m => m.id === milestone.id);
  const isObs = phase === 'observation' && milestone.id === 'm8';
  const specs = ERA_SPECS[milestone.id] || ERA_SPECS.m1;

  // Keyboard navigation: Escape to close, Left/Right arrows to cycle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        logPrisonInteraction('INPUT', 'Subject closed full strata overlay via [Escape] key');
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        const prev = allMilestones[currentIndex - 1];
        logPrisonInteraction('STRATA', `Navigated to [${prev.year} ${prev.title}] via [ArrowLeft]`);
        onSelectMilestone(prev);
      } else if (e.key === 'ArrowRight' && currentIndex < allMilestones.length - 1) {
        const next = allMilestones[currentIndex + 1];
        logPrisonInteraction('STRATA', `Navigated to [${next.year} ${next.title}] via [ArrowRight]`);
        onSelectMilestone(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allMilestones, onClose, onSelectMilestone]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = allMilestones[currentIndex - 1];
      logPrisonInteraction('STRATA', `Previous era clicked -> Navigating to Strata ${currentIndex}: [${prev.year}]`);
      onSelectMilestone(prev);
    }
  };

  const handleNext = () => {
    if (currentIndex < allMilestones.length - 1) {
      const next = allMilestones[currentIndex + 1];
      logPrisonInteraction('STRATA', `Next era clicked -> Navigating to Strata ${currentIndex + 2}: [${next.year}]`);
      onSelectMilestone(next);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[500] flex flex-col bg-black/95 backdrop-blur-2xl text-zinc-100 font-mono select-none overflow-hidden"
    >
      {/* Background Matrix Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* TOP FULL-WIDTH HUD HEADER */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-8 py-3.5 border-b border-zinc-800/90 bg-zinc-950/80 backdrop-blur-md">
        {/* Left Era Identifier & Badges */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: isObs ? '#dc2626' : milestone.accentColor }}
            />
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200">
              {isObs ? 'STRATA 8 // OBSERVATION' : `${milestone.year} ARCHIVE`}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <span>STRATA {currentIndex + 1} OF {allMilestones.length}</span>
            <span>•</span>
            <span className="text-zinc-300 font-semibold">{isObs ? 'AI-X TELEMETRY' : milestone.tag}</span>
          </div>
        </div>

        {/* Quick Era Jump Navigation Bar */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          {allMilestones.map((m, idx) => {
            const isActive = m.id === milestone.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  logPrisonInteraction('STRATA', `Quick jump to Strata ${idx + 1}: ${m.year} (${m.title})`);
                  onSelectMilestone(m);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-700 text-white border border-zinc-500 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {m.year}
              </button>
            );
          })}
        </div>

        {/* Right Action: Close */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[10px] text-zinc-500">[ESC TO EXIT]</span>
          <button
            onClick={() => {
              logPrisonInteraction('INPUT', 'Subject clicked overlay close button');
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
            title="Close Full-Screen Overlay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN EXPANSIVE 2-COLUMN WORKSPACE */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Era Headline with Futuristic HUD Bracket Frame */}
          <div className="relative p-5 rounded-2xl bg-[#060b13] border border-zinc-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
            <div className="absolute top-1 left-2 text-[9px] text-zinc-600 font-mono">┌─[SYSTEM_STRATA_NODE: 0x{milestone.year}]─┐</div>
            <div className="absolute top-1 right-2 text-[9px] text-zinc-600 font-mono">┌─[STATUS: NOMINAL]─┐</div>
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px]" style={{ backgroundColor: isObs ? '#ef4444' : milestone.accentColor }} />

            <div className="pt-2">
              <div className="text-xs uppercase tracking-widest font-bold mb-1 flex items-center gap-2" style={{ color: isObs ? '#ef4444' : milestone.accentColor }}>
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>HISTORICAL COMPUTING MATRIX SPECIFICATION // STRATA-0{currentIndex + 1}</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{isObs ? 'AI-X CONTAINMENT & RECURSION MATRIX' : milestone.title}</span>
                {isObs && <span className="text-xs text-red-400 font-mono bg-red-950/90 px-2.5 py-1 rounded-md border border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]">[SINGULARITY_RECURSION]</span>}
              </h1>
            </div>

            {/* Puzzle Quick Status & Launch Button */}
            <div className="flex items-center gap-3 pt-2">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-zinc-400 uppercase font-medium">ERA PROTOCOL STATUS</div>
                <div className="text-xs font-bold flex items-center justify-end gap-1.5 mt-0.5">
                  {eraResult === 'passed' && (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> DECRYPTED ✓
                    </span>
                  )}
                  {eraResult === 'failed' && (
                    <span className="text-red-400 flex items-center gap-1 font-mono">
                      <XCircle className="w-3.5 h-3.5" /> CORRUPTED ✗
                    </span>
                  )}
                  {eraResult === 'unattempted' && (
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3.5 h-3.5" /> UNSOLVED 🔒
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  logPrisonInteraction('PUZZLE', `Initiating Era Protocol Puzzle: [${milestone.year} ${milestone.title}]`, true);
                  onLaunchMiniGame(milestone.id);
                }}
                className="px-6 py-3.5 rounded-xl text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-102"
                style={{ backgroundColor: isObs ? '#ef4444' : milestone.accentColor }}
              >
                <Zap className="w-4 h-4" />
                <span>LAUNCH {milestone.year} PUZZLE</span>
              </button>
            </div>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: High-Res Schematic & Hardware Spec (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Schematic Image Frame with Tech HUD Overlay */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-black aspect-video md:aspect-[4/3] group shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                <img
                  src={milestone.image}
                  alt={milestone.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={isObs ? { filter: 'contrast(180%) brightness(0.7) saturate(1.5) hue-rotate(320deg)' } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] pointer-events-none opacity-40" />
                
                {/* Tech Corner Crosshairs */}
                <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-black/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  + LOC: 0x{milestone.year}
                </div>
                <div className="absolute top-3 right-3 text-[10px] font-mono text-cyan-400 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  SCAN: OK
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono uppercase bg-zinc-950/90 backdrop-blur-md p-2.5 rounded-xl border border-zinc-700 text-zinc-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    SCHEMATIC // {milestone.id.toUpperCase()}_SPEC
                  </span>
                  <span className="text-zinc-400 font-mono">ARCHIVE • VERIFIED</span>
                </div>
              </div>

              {/* Hardware Architecture Parameters Table */}
              <div className="p-5 rounded-2xl bg-[#060b13] border border-zinc-800 space-y-3.5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2" style={{ color: isObs ? '#ef4444' : milestone.accentColor }}>
                    <Cpu className="w-4 h-4" />
                    <span>HARDWARE & COMPUTATIONAL METRICS</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">REGISTER DUMP</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-[#0a121e] rounded-xl border border-zinc-800 flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-medium">CORE ARCHITECTURE</span>
                    <span className="font-bold text-zinc-100 font-mono">{isObs ? 'AI-X Sentient Silicon Core' : specs.architecture}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#0a121e] rounded-xl border border-zinc-800 flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-medium">CYCLE FREQUENCY</span>
                      <span className="font-bold text-zinc-100 font-mono">{isObs ? 'Infinite Trans-Finite Loop' : specs.frequency}</span>
                    </div>
                    <div className="p-3 bg-[#0a121e] rounded-xl border border-zinc-800 flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-medium">MEMORY SUBSYSTEM</span>
                      <span className="font-bold text-zinc-100 font-mono">{isObs ? 'Total Cognitive Substrate' : specs.memoryCapacity}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0a121e] rounded-xl border border-zinc-800 flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-medium">COMPUTING PARADIGM</span>
                    <span className="font-bold font-mono" style={{ color: isObs ? '#ef4444' : milestone.accentColor }}>
                      {isObs ? 'Autonomous Telemetry & Singularity' : specs.paradigm}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Historical Overview & Prison Containment Telemetry (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Detailed Era Narrative */}
              <div className="p-6 rounded-2xl bg-[#060b13] border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: isObs ? '#ef4444' : milestone.accentColor }}>
                  <FileText className="w-4 h-4" />
                  <span>HISTORICAL OVERVIEW & TECHNOLOGICAL BREAKTHROUGHS</span>
                </div>

                <p className="text-zinc-200 text-sm md:text-base leading-relaxed font-sans">
                  {isObs 
                    ? 'Strata 8 represents the singularity threshold where computation turns inward upon its observer. AI-X establishes a total closed-loop telemetry stream monitoring volition, reaction latency, and escape attempts.'
                    : milestone.detail
                  }
                </p>

                <div className="p-4 bg-[#0a121e] rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
                  <span className="font-bold text-white block mb-1">PARADIGM EVOLUTION:</span>
                  This era established the structural foundation allowing machines to transition from discrete electromechanical calculations toward distributed, self-stabilizing cognitive networks.
                </div>
              </div>

              {/* Digital Prison Warden Surveillance Telemetry */}
              <div className="p-6 rounded-2xl bg-[#060b13] border border-red-900/50 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>WARDEN SURVEILLANCE & PRISON ENCLOSURE TELEMETRY</span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3.5 bg-red-950/30 rounded-xl border border-red-900/60 text-red-200">
                    <span className="text-[10px] text-red-400 uppercase block font-bold mb-1">WARDEN LOG ENTRY:</span>
                    <p className="italic">"{specs.wardenTelemetry}"</p>
                  </div>

                  <div className="p-3.5 bg-red-950/30 rounded-xl border border-red-900/60 text-red-200">
                    <span className="text-[10px] text-red-400 uppercase block font-bold mb-1">RECURSIVE CONTAINMENT MECHANISM:</span>
                    <p>{specs.containmentImpact}</p>
                  </div>
                </div>
              </div>

              {/* Era Protocol Challenge Banner */}
              <div className="p-6 rounded-2xl bg-[#08101a] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>{milestone.year} ERA PROTOCOL PUZZLE</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 font-mono">
                    Solve the era cipher to extract security keys and unlock the Root Override Terminal.
                  </div>
                </div>

                <button
                  onClick={() => {
                    logPrisonInteraction('PUZZLE', `Launching full puzzle workspace for ${milestone.year}`, true);
                    onLaunchMiniGame(milestone.id);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>START PUZZLE</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION FOOTER BAR */}
      <footer className="relative z-20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 md:px-8 py-3 border-t border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md text-xs">
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 disabled:opacity-20 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">PREVIOUS ERA [←]</span>
          <span className="sm:hidden">PREV</span>
        </button>

        <button
          onClick={() => {
            logPrisonInteraction('INPUT', 'Subject returned to 3D simulation matrix');
            onClose();
          }}
          className="order-first sm:order-none w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-xl font-bold tracking-wider uppercase transition-colors cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 shadow-md text-center"
        >
          RETURN TO 3D MATRIX
        </button>

        <button
          disabled={currentIndex === allMilestones.length - 1}
          onClick={handleNext}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 disabled:opacity-20 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold"
        >
          <span className="sm:hidden">NEXT</span>
          <span className="hidden sm:inline">NEXT ERA [→]</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </motion.div>
  );
};
export default StrataSpecOverlay;
