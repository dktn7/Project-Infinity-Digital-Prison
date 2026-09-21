import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { logPrisonInteraction } from './LogStream';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Zap, 
  Cpu, 
  Network, 
  Globe, 
  Bot, 
  Eye, 
  ShieldAlert, 
  Unlock, 
  Lock, 
  X, 
  ChevronRight, 
  Activity, 
  Sliders, 
  Terminal, 
  Key, 
  Radio, 
  Sparkles, 
  RefreshCw, 
  Target, 
  ArrowRight, 
  HelpCircle, 
  Hash, 
  Volume2, 
  VolumeX, 
  Timer, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  Radar 
} from 'lucide-react';

// ============================================================================
// LIGHTWEIGHT WEB AUDIO SYNTHESIZER FOR FUTURISTIC TACTILE SFX
// ============================================================================
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 600, type: OscillatorType = 'sine', duration = 0.08, vol = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context silently ignored if not permitted by browser
    }
  }

  playClick() {
    this.playBeep(900, 'triangle', 0.04, 0.1);
  }

  playLaser() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {}
  }

  playError() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.25);
      });
    } catch {}
  }
}

const sfx = new SoundEngine();

interface MiniGameModalProps {
  milestoneId: string;
  milestoneTitle: string;
  milestoneYear: string;
  accentColor: string;
  onSuccess: () => void;
  onFailure: () => void;
  onClose: () => void;
}

// Futuristic Cyberpunk Theme Configs for Each Historical Era
const ERA_THEMES: Record<string, {
  name: string;
  code: string;
  accentHex: string;
  bgGrad: string;
  cardBg: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  btnClass: string;
  glowClass: string;
  clockRate: string;
  registerAddress: string;
}> = {
  m1: {
    name: '1945 ENIAC • LOGIC ACCUMULATOR',
    code: 'CORE-GENESIS-01',
    accentHex: '#10b981',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(16,185,129,0.18) 0%, #030712 100%)',
    cardBg: '#05110d',
    borderClass: 'border-emerald-500/60',
    textClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    btnClass: 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(16,185,129,0.2)]',
    clockRate: '100 kHz (Vacuum Pulse)',
    registerAddress: '0x0045_ACCUM'
  },
  m2: {
    name: '1969 ARPANET • QUANTUM MESH ROUTER',
    code: 'DARPA-MESH-02',
    accentHex: '#06b6d4',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(6,182,212,0.18) 0%, #030712 100%)',
    cardBg: '#041217',
    borderClass: 'border-cyan-500/60',
    textClass: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
    btnClass: 'bg-cyan-900/60 hover:bg-cyan-800 text-cyan-100 border border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(6,182,212,0.2)]',
    clockRate: '50 kbps (IMP Synchronous)',
    registerAddress: '0x0069_IMP_FRAME'
  },
  m3: {
    name: '1989 WWW • HYPERTEXT LATTICE PROXY',
    code: 'CERN-NEXUS-03',
    accentHex: '#3b82f6',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(59,130,246,0.18) 0%, #030712 100%)',
    cardBg: '#050e1c',
    borderClass: 'border-blue-500/60',
    textClass: 'text-blue-400',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-500/50',
    btnClass: 'bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(59,130,246,0.2)]',
    clockRate: '100 Mbps (HTTP/0.9 Lattice)',
    registerAddress: '0x0089_URI_POINTER'
  },
  m4: {
    name: '1997 DEEP BLUE • NEURAL DECISION MATRIX',
    code: 'MINIMAX-SEARCH-04',
    accentHex: '#6366f1',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(99,102,241,0.18) 0%, #030712 100%)',
    cardBg: '#090a1f',
    borderClass: 'border-indigo-500/60',
    textClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
    btnClass: 'bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100 border border-indigo-500/70 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(99,102,241,0.2)]',
    clockRate: '200M Pos/sec (Parallel ASIC)',
    registerAddress: '0x0097_MINIMAX_PLIES'
  },
  m5: {
    name: '2016 ALPHAGO • MONTE CARLO POLICY GRID',
    code: 'NEURAL-MCTS-05',
    accentHex: '#a855f7',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(168,85,247,0.18) 0%, #030712 100%)',
    cardBg: '#11061c',
    borderClass: 'border-purple-500/60',
    textClass: 'text-purple-400',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    btnClass: 'bg-purple-900/60 hover:bg-purple-800 text-purple-100 border border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(168,85,247,0.2)]',
    clockRate: '45 TFLOPS (TPU Tensor Core)',
    registerAddress: '0x0216_POLICY_TENSOR'
  },
  m6: {
    name: '2026 FEEDBACK LOOP • DUAL RESONANCE SYNTH',
    code: 'RECURSION-WAVE-06',
    accentHex: '#ec4899',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(236,72,153,0.18) 0%, #030712 100%)',
    cardBg: '#190613',
    borderClass: 'border-pink-500/60',
    textClass: 'text-pink-400',
    badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-500/50',
    btnClass: 'bg-pink-900/60 hover:bg-pink-800 text-pink-100 border border-pink-500/70 shadow-[0_0_15px_rgba(236,72,153,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(236,72,153,0.2)]',
    clockRate: '2.4 ExaFLOPS (Transformer Clust)',
    registerAddress: '0x0226_ATTENTION_HEAD'
  },
  m7: {
    name: '2045 SINGULARITY • QUANTUM APERTURE CORE',
    code: 'SUPERNOVA-07',
    accentHex: '#f97316',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(249,115,22,0.18) 0%, #030712 100%)',
    cardBg: '#1a0c03',
    borderClass: 'border-orange-500/60',
    textClass: 'text-orange-400',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
    btnClass: 'bg-orange-900/60 hover:bg-orange-800 text-orange-100 border border-orange-500/70 shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(249,115,22,0.2)]',
    clockRate: '180µs Coherence (Qubit Lattice)',
    registerAddress: '0x0245_SUPERPOSITION'
  },
  m8: {
    name: '2050 OBSERVATION • AI-X MEMORY CIPHER',
    code: 'PRISON-SECURITY-08',
    accentHex: '#ef4444',
    bgGrad: 'radial-gradient(ellipse at 50% 20%, rgba(239,68,68,0.22) 0%, #030712 100%)',
    cardBg: '#1c0407',
    borderClass: 'border-red-500/70',
    textClass: 'text-red-400',
    badgeBg: 'bg-red-950/80 text-red-300 border-red-500/50',
    btnClass: 'bg-red-900/60 hover:bg-red-800 text-red-100 border border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    glowClass: 'shadow-[0_0_35px_rgba(239,68,68,0.25)]',
    clockRate: 'Infinite Recursion (AI-X Core)',
    registerAddress: '0x0250_WARDEN_OBSERVER'
  }
};

// ============================================================================
// FULLSCREEN FUTURISTIC MODAL CONTAINER
// ============================================================================
export const EraMiniGameModal: React.FC<MiniGameModalProps> = ({
  milestoneId,
  milestoneTitle,
  milestoneYear,
  accentColor,
  onSuccess,
  onFailure,
  onClose
}) => {
  const [gameState, setGameState] = useState<'playing' | 'passed' | 'failed'>('playing');
  const [timeLeft, setTimeLeft] = useState(60); // 60s global terminal pressure timer
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTacticalHint, setShowTacticalHint] = useState(false);
  const usesEnvironmentalPressure = milestoneId === 'm1';

  const theme = ERA_THEMES[milestoneId] || ERA_THEMES.m1;

  // Countdown timer for tactical urgency
  useEffect(() => {
    logPrisonInteraction('PUZZLE', `Entered puzzle environment: ${milestoneYear} ${milestoneTitle}`);
  }, [milestoneYear, milestoneTitle]);

  useEffect(() => {
    if (gameState !== 'playing' || usesEnvironmentalPressure) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sfx.playError();
          handleLoss();
          return 0;
        }
        if (prev <= 10) {
          sfx.playBeep(400, 'sine', 0.05, 0.05);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, usesEnvironmentalPressure]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sfx.enabled = next;
    logPrisonInteraction('INPUT', `Synthesizer audio ${next ? 'enabled' : 'muted'}`);
    if (next) sfx.playClick();
  };

  const handleWin = () => {
    sfx.playSuccess();
    setGameState('passed');
    logPrisonInteraction('PUZZLE', `PROTOCOL SOLVED: ${milestoneYear} Era Security Key decrypted!`, true);
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handleLoss = () => {
    sfx.playError();
    setGameState('failed');
    logPrisonInteraction('ALERT', `PROTOCOL TIMEOUT/CORRUPTION: ${milestoneYear} Neural integrity compromised!`, true);
    setTimeout(() => {
      onFailure();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex flex-col bg-black/95 backdrop-blur-xl font-mono text-white pointer-events-auto select-none overflow-hidden"
    >
      {/* Fullscreen Cyber Background Grid & Ambient Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-90 transition-all duration-700" 
        style={{ background: theme.bgGrad }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* TOP SYSTEM HUD */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-4 md:px-8 py-2.5 sm:py-3.5 border-b border-white/10 bg-black/40 backdrop-blur-md gap-2">
        {/* Left Telemetry & Era Tag */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-[10px] sm:text-[11px] md:text-xs font-black tracking-widest uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border ${theme.badgeBg}`}>
              {milestoneYear} PROTOCOL
            </span>
          </div>
          <div className="hidden sm:flex flex-col text-left min-w-0">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {theme.code}
            </span>
            <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide truncate max-w-xs">
              {milestoneTitle}
            </span>
          </div>
        </div>

        {/* Center Countdown Timer Gauge */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-lg bg-black/60 border border-white/15 shrink-0">
          {usesEnvironmentalPressure ? (
            <>
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-bold uppercase hidden md:inline">PRESSURE MODEL:</span>
              <span className="text-[10px] sm:text-xs font-black font-mono tracking-widest text-amber-300">ENVIRONMENTAL</span>
            </>
          ) : (
            <>
              <Timer className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`} />
              <span className="text-[10px] text-zinc-400 font-bold uppercase hidden md:inline">SYSTEM TIMEOUT:</span>
              <span className={`text-xs sm:text-sm md:text-base font-black font-mono tracking-widest ${
                timeLeft <= 15 ? 'text-red-400 animate-pulse' : timeLeft <= 30 ? 'text-amber-400' : 'text-zinc-100'
              }`}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </span>
            </>
          )}
        </div>

        {/* Right Controls (Hint, Audio, Close) */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => {
              sfx.playClick();
              const nextHint = !showTacticalHint;
              setShowTacticalHint(nextHint);
              logPrisonInteraction('PUZZLE', `Tactical scan diagnostic ${nextHint ? 'activated' : 'deactivated'} for ${milestoneYear}`);
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              showTacticalHint ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300'
            }`}
            title="Toggle Tactical Diagnostics"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">TACTICAL SCAN</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio SFX' : 'Enable Audio SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              logPrisonInteraction('PUZZLE', `Subject closed/aborted ${milestoneYear} puzzle session`);
              onClose();
            }}
            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 transition-colors cursor-pointer"
            title="Abort Mini-Game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN GAME WORKSPACE (FULLSCREEN FLUID CONTAINER) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        <div className={`w-full max-w-6xl h-full flex-1 max-h-[860px] rounded-2xl border ${theme.borderClass} ${theme.glowClass} flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto md:overflow-hidden relative shadow-2xl`} style={{ backgroundColor: theme.cardBg }}>
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: theme.accentHex }} />

          {/* Win / Loss Overlays */}
          {gameState === 'passed' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-emerald-950/80 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-emerald-300 tracking-wider">
                ERA KEY DECRYPTED // OVERRIDE VERIFIED
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 max-w-md font-sans">
                Neural firewall bypassed. Security stratum unlocked. Synced with prison core.
              </p>
            </motion.div>
          )}

          {gameState === 'failed' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-red-950/80 border-2 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                <XCircle className="w-16 h-16 text-red-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-red-400 tracking-wider">
                NEURAL INTEGRITY COMPROMISED
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 max-w-md font-sans">
                Recursion loop reinforced. Firewall detected unauthorized access.
              </p>
            </motion.div>
          )}

          {/* Active Mini-Game Component */}
          {gameState === 'playing' && (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto md:overflow-hidden min-h-0">
              {milestoneId === 'm1' && <ENIACGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
              {milestoneId === 'm2' && <ArpanetGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
              {milestoneId === 'm3' && <WWWGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
              {milestoneId === 'm4' && <DeepBlueNeuralGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
              {milestoneId === 'm5' && <AlphaGoNeuralGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
              {milestoneId === 'm6' && <FeedbackLoopGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
              {milestoneId === 'm7' && <SingularityGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
              {milestoneId === 'm8' && <TelemetryGame onWin={handleWin} onLoss={handleLoss} showHint={showTacticalHint} />}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER DIAGNOSTIC BAR */}
      <footer className="relative z-20 px-4 md:px-8 py-2.5 border-t border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-zinc-500" />
          <span>SECURITY NODE STATUS: <strong className="text-emerald-400">ONLINE // ISOLATED</strong></span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span>CONTAINMENT MATRIX: <strong className="text-zinc-200">STRATA #{milestoneId.toUpperCase()}</strong></span>
          <span>RECURSION LATENCY: <strong className="text-cyan-400">0.042ms</strong></span>
        </div>
      </footer>
    </motion.div>
  );
};

/* =========================================================================
   1945 ENIAC: Futuristic High-Voltage Logic Accumulator & Relay Bus
   ========================================================================= */
const ENIACGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  const MODULES = [
    { id: 'A', label: 'ACCUM-A', charge: 64, slot: 0 },
    { id: 'B', label: 'ACCUM-B', charge: 16, slot: 1 },
    { id: 'C', label: 'ACCUM-C', charge: 4, slot: 2 }
  ];

  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const completedRef = useRef(false);
  const [installed, setInstalled] = useState<string[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('CORE BUS OFFLINE // RESTORE THREE ACCUMULATOR MODULES');
  const [heat, setHeat] = useState(24);
  const [surge, setSurge] = useState(false);

  useEffect(() => {
    if (completedRef.current) return;
    const interval = window.setInterval(() => {
      setHeat((prev) => {
        const next = Math.min(100, prev + 1.25);
        if (next >= 100 && !completedRef.current) {
          completedRef.current = true;
          window.setTimeout(onLoss, 250);
        }
        return next;
      });
    }, 900);
    return () => window.clearInterval(interval);
  }, [onLoss]);

  const handleDrop = (moduleId: string, point: { x: number; y: number }) => {
    const module = MODULES.find((item) => item.id === moduleId);
    if (!module || completedRef.current) return;

    const target = slotRefs.current[module.slot];
    const rect = target?.getBoundingClientRect();
    const padding = 34;
    const inside = !!rect &&
      point.x >= rect.left - padding &&
      point.x <= rect.right + padding &&
      point.y >= rect.top - padding &&
      point.y <= rect.bottom + padding;

    setActiveModule(null);

    if (!inside) {
      sfx.playError();
      setHeat((prev) => Math.min(100, prev + 10));
      setSurge(true);
      setFeedback(`${module.label} REJECTED // ALIGN WITH ITS ACTIVE SOCKET`);
      window.setTimeout(() => setSurge(false), 360);
      return;
    }

    sfx.playLaser();
    const nextInstalled = [...installed, moduleId];
    setInstalled(nextInstalled);
    setHeat((prev) => Math.max(10, prev - 12));
    setFeedback(`${module.label} MAGNETIC LOCK CONFIRMED // BUS ${nextInstalled.length}/3 ONLINE`);

    if (nextInstalled.length === MODULES.length) {
      completedRef.current = true;
      setSurge(true);
      setFeedback('ACCUMULATOR CORE SYNCHRONISED // ERA KEY EXTRACTING');
      window.setTimeout(() => {
        sfx.playSuccess();
        onWin();
      }, 900);
    }
  };

  const thermalTone =
    heat > 78 ? 'text-red-300 border-red-500/70 bg-red-950/40' :
    heat > 52 ? 'text-amber-300 border-amber-500/60 bg-amber-950/30' :
    'text-emerald-300 border-emerald-500/50 bg-emerald-950/20';

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 md:gap-4">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="text-left min-w-0">
          <div className="text-[10px] sm:text-xs tracking-[0.22em] font-black text-amber-300 uppercase">
            ENIAC // ACCUMULATOR CHAMBER
          </div>
          <div className="text-[10px] sm:text-xs text-zinc-400 mt-1">
            Rebuild the physical memory bus. Drag each glowing module into its matching socket.
          </div>
        </div>
        <div className={`px-2.5 py-1.5 rounded-lg border text-[10px] sm:text-xs font-black tracking-wider ${thermalTone}`}>
          THERMAL {Math.round(heat)}%
        </div>
      </div>

      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 rounded-lg bg-amber-950/50 border border-amber-500/70 text-[11px] text-amber-200 flex items-center gap-2"
        >
          <Radar className="w-4 h-4 shrink-0" />
          <span>TACTICAL SCAN: socket geometry and charge markings correspond. Move close enough and the prison's magnetic bus will finish the alignment.</span>
        </motion.div>
      )}

      <div className="relative flex-1 min-h-[360px] sm:min-h-[410px] rounded-2xl overflow-hidden border border-amber-900/70 bg-[#090603]">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: surge ? [0.18, 0.75, 0.14] : [0.16, 0.28, 0.16] }}
          transition={{ duration: surge ? 0.35 : 3.2, repeat: surge ? 0 : Infinity }}
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(245,158,11,0.20), transparent 34%), linear-gradient(to bottom, rgba(120,53,15,0.12), transparent 55%)'
          }}
        />

        <div className="absolute inset-x-0 top-0 h-28 pointer-events-none opacity-50 bg-[linear-gradient(to_bottom,rgba(245,158,11,0.12),transparent)]" />

        <div className="absolute left-3 right-3 sm:left-6 sm:right-6 top-3 sm:top-5 flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${heat > 78 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
          <div className="h-1.5 flex-1 rounded-full bg-black/70 border border-amber-950 overflow-hidden">
            <motion.div
              className={`h-full ${heat > 78 ? 'bg-red-500' : heat > 52 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              animate={{ width: `${heat}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="absolute inset-x-3 sm:inset-x-6 top-12 sm:top-16 bottom-[150px] sm:bottom-[165px] grid grid-cols-3 gap-2 sm:gap-5">
          {MODULES.map((module, idx) => {
            const isInstalled = installed.includes(module.id);
            const isActive = activeModule === module.id;
            return (
              <div
                key={module.id}
                ref={(node) => { slotRefs.current[idx] = node; }}
                className={`relative rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                  isInstalled
                    ? 'border-emerald-400/90 bg-emerald-950/30 shadow-[inset_0_0_35px_rgba(16,185,129,0.18),0_0_25px_rgba(16,185,129,0.22)]'
                    : isActive
                      ? 'border-amber-300 bg-amber-950/30 shadow-[0_0_35px_rgba(245,158,11,0.28)]'
                      : 'border-amber-900/60 bg-black/35'
                }`}
              >
                <div className="absolute inset-2 sm:inset-3 rounded-lg border border-dashed border-amber-700/40" />
                <div className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-black text-amber-500/80 tracking-wider">
                  SOCKET {idx + 1}
                </div>
                <div className="absolute bottom-2 right-2 text-[9px] font-bold text-zinc-600">
                  +{module.charge}V
                </div>

                {isInstalled ? (
                  <motion.div
                    initial={{ scale: 1.24, opacity: 0, rotate: -4 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 17 }}
                    className="relative z-10 w-[68%] max-w-[120px] h-[68%] rounded-xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-400/30 via-amber-400/20 to-black shadow-[0_0_26px_rgba(16,185,129,0.45)] flex flex-col items-center justify-center"
                  >
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
                    <span className="mt-2 text-[9px] sm:text-[10px] font-black text-emerald-200 tracking-widest">{module.label}</span>
                    <span className="text-[9px] text-zinc-300">LOCKED</span>
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_20px_#f59e0b]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 1.8 + idx * 0.2, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute left-2 right-2 sm:left-5 sm:right-5 bottom-3 sm:bottom-5 h-[128px] sm:h-[138px] rounded-xl border border-amber-900/70 bg-black/55 backdrop-blur-sm px-2 sm:px-4 py-3">
          <div className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-black tracking-[0.18em] mb-2">
            Ejected accumulator modules // drag to restore bus
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 h-[86px] sm:h-[94px]">
            {MODULES.map((module) => {
              const isInstalled = installed.includes(module.id);
              if (isInstalled) {
                return (
                  <div key={module.id} className="rounded-lg border border-emerald-900/50 bg-emerald-950/10 flex items-center justify-center text-[9px] text-emerald-700 font-black">
                    INSTALLED
                  </div>
                );
              }

              return (
                <motion.button
                  key={module.id}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.08}
                  whileDrag={{ scale: 1.08, rotate: -1, zIndex: 50 }}
                  whileTap={{ scale: 1.02 }}
                  onDragStart={() => {
                    sfx.playClick();
                    setActiveModule(module.id);
                    setFeedback(`${module.label} DETACHED // SEEKING MAGNETIC SOCKET`);
                  }}
                  onDragEnd={(_, info) => handleDrop(module.id, info.point)}
                  className="touch-none relative rounded-xl border-2 border-amber-500/70 bg-gradient-to-b from-amber-400/20 via-amber-900/20 to-black shadow-[0_0_18px_rgba(245,158,11,0.16)] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
                  aria-label={`Drag ${module.label} to socket ${module.slot + 1}`}
                >
                  <div className="absolute inset-1.5 rounded-lg border border-amber-300/15" />
                  <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-t-full rounded-b-md border border-amber-300/70 bg-gradient-to-t from-amber-500/50 to-transparent shadow-[0_0_13px_rgba(245,158,11,0.45)]" />
                  <span className="mt-1 text-[9px] sm:text-[10px] font-black text-amber-200 tracking-wider">{module.label}</span>
                  <span className="text-[8px] sm:text-[9px] text-zinc-500">+{module.charge}V</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.div
        animate={surge ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
        className="min-h-[38px] px-3 py-2 rounded-lg border border-amber-900/70 bg-black/45 flex items-center gap-2 text-[10px] sm:text-xs font-bold text-amber-200"
      >
        <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate sm:whitespace-normal">{feedback}</span>
      </motion.div>
    </div>
  );
};

/* =========================================================================
   1969 ARPANET: Fullscreen Quantum Mesh Topology Router
   ========================================================================= */
const ArpanetGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  const NODES = [
    { id: 'UCLA', name: 'UCLA (SRC)', x: 12, y: 35, role: 'START' },
    { id: 'SRI', name: 'SRI MESH', x: 38, y: 18, role: 'ROUTER' },
    { id: 'UCSB', name: 'UCSB NODE', x: 25, y: 80, role: 'ROUTER' },
    { id: 'UTAH', name: 'UTAH CORE', x: 62, y: 75, role: 'ROUTER' },
    { id: 'BBN', name: 'BBN HUB', x: 75, y: 22, role: 'ROUTER' },
    { id: 'MIT', name: 'MIT (DST)', x: 90, y: 65, role: 'TARGET' }
  ];

  const EDGES = [
    { from: 'UCLA', to: 'SRI', latency: 14, bandwidth: '100% OK' },
    { from: 'UCLA', to: 'UCSB', latency: 28, bandwidth: 'CONGESTED' },
    { from: 'SRI', to: 'UTAH', latency: 19, bandwidth: '100% OK' },
    { from: 'SRI', to: 'BBN', latency: 16, bandwidth: '100% OK' },
    { from: 'UCSB', to: 'UTAH', latency: 24, bandwidth: '100% OK' },
    { from: 'UTAH', to: 'MIT', latency: 32, bandwidth: 'DEGRADED' },
    { from: 'BBN', to: 'MIT', latency: 15, bandwidth: '100% OK' }
  ];

  const targetMaxLatency = 48; // UCLA(14) + SRI(16) + BBN(15) = 45ms (Target <= 48ms)

  const [path, setPath] = useState<string[]>(['UCLA']);
  const [tries, setTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentLatency = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const edge = EDGES.find(
        (e) => (e.from === path[i] && e.to === path[i + 1]) || (e.to === path[i] && e.from === path[i + 1])
      );
      if (edge) sum += edge.latency;
    }
    return sum;
  }, [path]);

  const handleNodeClick = (nodeId: string) => {
    sfx.playClick();
    if (path.includes(nodeId)) return;
    const lastNode = path[path.length - 1];

    const validEdge = EDGES.find(
      (e) => (e.from === lastNode && e.to === nodeId) || (e.to === lastNode && e.from === nodeId)
    );

    if (!validEdge) {
      sfx.playError();
      setFeedback(`NO DIRECT PACKET LINK BETWEEN ${lastNode} AND ${nodeId}!`);
      return;
    }

    const nextPath = [...path, nodeId];
    setPath(nextPath);

    let newLatency = 0;
    for (let i = 0; i < nextPath.length - 1; i++) {
      const edge = EDGES.find(
        (e) => (e.from === nextPath[i] && e.to === nextPath[i + 1]) || (e.to === nextPath[i] && e.from === nextPath[i + 1])
      );
      if (edge) newLatency += edge.latency;
    }

    if (nodeId === 'MIT') {
      if (newLatency <= targetMaxLatency) {
        setFeedback(`PACKET STREAM ROUTED IN ${newLatency}ms (WITHIN SAFE BUFFER) ✓`);
        setTimeout(() => onWin(), 600);
      } else {
        sfx.playError();
        const nextTries = tries - 1;
        setTries(nextTries);
        if (nextTries <= 0) {
          setFeedback(`BUFFER OVERFLOW: ${newLatency}ms EXCEEDED ${targetMaxLatency}ms BUDGET`);
          setTimeout(() => onLoss(), 600);
        } else {
          setFeedback(`ROUTE LATENCY TOO HIGH (${newLatency}ms > ${targetMaxLatency}ms). RESETTING MESH. ${nextTries} TRIES LEFT.`);
          setTimeout(() => setPath(['UCLA']), 800);
        }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      {/* Tactical Top Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/50 text-left">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">MISSION OBJECTIVE</span>
          <span className="text-xs text-zinc-200 font-bold">ROUTE PACKET: UCLA → MIT</span>
        </div>
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">MAX ALLOWABLE LATENCY</span>
          <span className="text-xs font-bold text-amber-300">≤ {targetMaxLatency} ms</span>
        </div>
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">CURRENT ROUTE LATENCY</span>
          <span className={`text-sm font-black font-mono ${currentLatency > targetMaxLatency ? 'text-red-400' : 'text-cyan-300'}`}>
            {currentLatency} ms ({path.join(' → ')})
          </span>
        </div>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/80 text-xs text-cyan-300 text-left flex items-center gap-2">
          <Radar className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>TACTICAL SCAN: Packet routing protocol seeks lowest latency path. High-hop routers risk cumulative delay buffer overflow.</span>
        </div>
      )}

      {/* 2D Quantum Radar Canvas */}
      <div className="flex-1 min-h-[300px] bg-[#020e17] rounded-xl border border-cyan-700/80 p-4 relative overflow-hidden select-none">
        {/* Animated Radar Sweep Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />

        {/* SVG Network Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {EDGES.map((edge, idx) => {
            const nodeA = NODES.find(n => n.id === edge.from)!;
            const nodeB = NODES.find(n => n.id === edge.to)!;
            
            let isActiveEdge = false;
            for (let i = 0; i < path.length - 1; i++) {
              if (
                (path[i] === edge.from && path[i + 1] === edge.to) ||
                (path[i] === edge.to && path[i + 1] === edge.from)
              ) {
                isActiveEdge = true;
                break;
              }
            }

            const midX = (nodeA.x + nodeB.x) / 2;
            const midY = (nodeA.y + nodeB.y) / 2;

            return (
              <g key={idx}>
                <line
                  x1={`${nodeA.x}%`}
                  y1={`${nodeA.y}%`}
                  x2={`${nodeB.x}%`}
                  y2={`${nodeB.y}%`}
                  stroke={isActiveEdge ? '#22d3ee' : '#0e4e63'}
                  strokeWidth={isActiveEdge ? '3.5' : '1.5'}
                  strokeDasharray={isActiveEdge ? 'none' : '4 4'}
                />
                <circle cx={`${midX}%`} cy={`${midY}%`} r="10" fill="#020e17" stroke={isActiveEdge ? '#22d3ee' : '#0e4e63'} />
                <text
                  x={`${midX}%`}
                  y={`${midY}%`}
                  fill={isActiveEdge ? '#a5f3fc' : '#38bdf8'}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dy="3"
                  className="font-bold"
                >
                  {edge.latency}m
                </text>
              </g>
            );
          })}
        </svg>

        {/* Node Buttons */}
        {NODES.map((node) => {
          const isSelected = path.includes(node.id);
          const isLastInPath = path[path.length - 1] === node.id;
          const order = path.indexOf(node.id);

          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              disabled={isSelected && !isLastInPath}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected 
                  ? 'bg-cyan-950 border-cyan-300 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-110' 
                  : 'bg-[#031d2b] border-cyan-800 hover:border-cyan-400 text-cyan-300'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>{node.name}</span>
              {isSelected && (
                <span className="text-[9px] bg-cyan-400 text-black px-1.5 py-0.2 rounded font-black">
                  #{order + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="text-xs font-bold text-cyan-300 bg-cyan-950/80 p-2.5 rounded-lg border border-cyan-500">
          {feedback}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-cyan-900/60 text-xs">
        <span className="text-red-400 font-bold">REMAINING TRIES: {tries} / 3</span>
        <button
          onClick={() => { sfx.playClick(); setPath(['UCLA']); }}
          className="text-xs text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
        >
          RESET TO SOURCE NODE (UCLA)
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   1989 WWW: Fullscreen CERN Hypertext Packet & Proxy Assembler
   ========================================================================= */
const WWWGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  const METHODS = ['GET', 'POST', 'INJECT', 'CONNECT'];
  const PATHS = ['/hypertext/WWW/TheProject.html', '/index.bin', '/system/core', '/cern/root'];
  const PROTOCOLS = ['HTTP/1.0', 'GOPHER/1.0', 'FTP/2.0', 'TCP/IP'];
  const HOSTS = ['info.cern.ch', 'localhost:8080', 'arpanet.darpa.mil', '127.0.0.1'];

  const [selectedMethod, setSelectedMethod] = useState('POST');
  const [selectedPath, setSelectedPath] = useState('/index.bin');
  const [selectedProtocol, setSelectedProtocol] = useState('FTP/2.0');
  const [selectedHost, setSelectedHost] = useState('localhost:8080');
  const [tries, setTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isCorrect = 
    selectedMethod === 'GET' &&
    selectedPath === '/hypertext/WWW/TheProject.html' &&
    selectedProtocol === 'HTTP/1.0' &&
    selectedHost === 'info.cern.ch';

  const handleSend = () => {
    sfx.playClick();
    if (isCorrect) {
      setFeedback('HTTP 200 OK — CERN HYPERTEXT LATTICE BREACHED ✓');
      setTimeout(() => onWin(), 600);
    } else {
      sfx.playError();
      const nextTries = tries - 1;
      setTries(nextTries);
      if (nextTries <= 0) {
        setFeedback('400 BAD REQUEST — PROTOCOL HANDSHAKE TERMINATED');
        setTimeout(() => onLoss(), 600);
      } else {
        setFeedback(`404 NOT FOUND / MALFORMED PACKET. BUFFER PURGED. ${nextTries} TRIES REMAINING.`);
        setSelectedMethod('POST');
        setSelectedPath('/index.bin');
        setSelectedProtocol('FTP/2.0');
        setSelectedHost('localhost:8080');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/50 text-left">
        <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
          CERN 1989 • WORLD WIDE WEB PROTOCOL RECONSTRUCTION
        </h4>
        <p className="text-xs text-blue-200/80 mt-1">
          Reconstruct the authentic HTTP 1.0 client handshake to query Tim Berners-Lee's original hypertext root server:
        </p>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-500/80 text-xs text-blue-300 text-left flex items-center gap-2">
          <Globe className="w-4 h-4 shrink-0 text-blue-400" />
          <span>TACTICAL SCAN: CERN hypermedia protocol requires the standard HTTP/1.0 resource retrieval query to access root documentation.</span>
        </div>
      )}

      {/* Terminal Hex & ASCII Packet Stream */}
      <div className="flex-1 bg-[#020714] p-4 rounded-xl border border-blue-900 text-left text-xs font-mono space-y-2 flex flex-col justify-center">
        <div className="text-zinc-500 text-[10px] uppercase font-bold">// REAL-TIME PROTOCOL PACKET COMPOSER</div>
        <div className="p-3 rounded-lg bg-[#040c21] border border-blue-800 text-blue-200 space-y-1">
          <div><span className="text-amber-400 font-bold">{selectedMethod}</span> <span className="text-zinc-100">{selectedPath}</span> <span className="text-emerald-400 font-bold">{selectedProtocol}</span></div>
          <div>Host: <span className="text-indigo-300 font-bold">{selectedHost}</span></div>
          <div>User-Agent: <span className="text-zinc-400">NeXT-CERN-HyperMedia/1.0</span></div>
          <div>Accept: <span className="text-zinc-400">text/html, text/plain</span></div>
        </div>
      </div>

      {/* 4 Protocol Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
        <div>
          <label className="text-[10px] text-blue-300 font-bold block mb-1">1. HTTP METHOD</label>
          <select 
            value={selectedMethod} 
            onChange={(e) => { sfx.playClick(); setSelectedMethod(e.target.value); }}
            className="w-full bg-[#06122e] border border-blue-600 text-blue-100 p-2.5 rounded-lg font-bold outline-none cursor-pointer"
          >
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-blue-300 font-bold block mb-1">2. PROTOCOL</label>
          <select 
            value={selectedProtocol} 
            onChange={(e) => { sfx.playClick(); setSelectedProtocol(e.target.value); }}
            className="w-full bg-[#06122e] border border-blue-600 text-blue-100 p-2.5 rounded-lg font-bold outline-none cursor-pointer"
          >
            {PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-blue-300 font-bold block mb-1">3. URI RESOURCE</label>
          <select 
            value={selectedPath} 
            onChange={(e) => { sfx.playClick(); setSelectedPath(e.target.value); }}
            className="w-full bg-[#06122e] border border-blue-600 text-blue-100 p-2.5 rounded-lg font-bold outline-none cursor-pointer text-[11px]"
          >
            {PATHS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-blue-300 font-bold block mb-1">4. HOST TARGET</label>
          <select 
            value={selectedHost} 
            onChange={(e) => { sfx.playClick(); setSelectedHost(e.target.value); }}
            className="w-full bg-[#06122e] border border-blue-600 text-blue-100 p-2.5 rounded-lg font-bold outline-none cursor-pointer"
          >
            {HOSTS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="text-xs font-bold text-blue-300 bg-blue-950/80 p-2.5 rounded-lg border border-blue-500">
          {feedback}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-blue-900/60 text-xs">
        <span className="text-red-400 font-bold">REMAINING TRIES: {tries} / 3</span>
        <button
          onClick={handleSend}
          className="px-8 py-3 rounded-xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        >
          TRANSMIT HYPERTEXT HANDSHAKE
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   1997 DEEP BLUE: Futuristic Heuristic Neural Search Matrix (No standard chess)
   ========================================================================= */
const DeepBlueNeuralGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  // 6x6 Neural Decision Grid
  // Deep Blue must evaluate and select 3 Alpha-Beta Pruning Nodes in sequence:
  // Node 1: Primary Vector [2,3] -> Node 2: Tactical Ray [4,2] -> Node 3: Heuristic Core [5,5]
  const TARGET_SEQUENCE = ['N-2-3', 'N-4-2', 'N-5-5'];

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [evalScore, setEvalScore] = useState(-4.2); // Start negative against Kasparov
  const [tries, setTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    sfx.playLaser();
    if (selectedNodes.includes(nodeId)) return;

    const next = [...selectedNodes, nodeId];
    setSelectedNodes(next);

    const stepIdx = next.length - 1;
    if (next[stepIdx] !== TARGET_SEQUENCE[stepIdx]) {
      sfx.playError();
      const nextTries = tries - 1;
      setTries(nextTries);
      if (nextTries <= 0) {
        setFeedback('HEURISTIC EVALUATION COLLAPSED — KASPAROV COUNTER-ATTACKS');
        setTimeout(() => onLoss(), 600);
      } else {
        setFeedback(`PRUNING ERROR AT NODE ${nodeId}! TREE SEARCH PURGED. ${nextTries} TRIES REMAINING.`);
        setEvalScore(-4.2);
        setTimeout(() => setSelectedNodes([]), 800);
      }
      return;
    }

    // Step Success: Boost evaluation score
    if (next.length === 1) {
      setEvalScore(+2.4);
      setFeedback('ALPHA-BETA BRANCH 1 PRUNED! POSITIONAL ADVANTAGE SECURED (+2.4).');
    } else if (next.length === 2) {
      setEvalScore(+8.9);
      setFeedback('TACTICAL PIN IDENTIFIED (+8.9)! LOCATE THE CRITICAL HEURISTIC OVERLOAD CORE.');
    } else if (next.length === 3) {
      setEvalScore(+99.9);
      setFeedback('MINIMAX SEARCH CONVERGENCE: +99.9 (FORCED MATE DETECTED) ✓');
      setTimeout(() => onWin(), 700);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      {/* Top Heuristic Gauge Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-500/50 text-left">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">HEURISTIC SEARCH ENGINE</span>
          <span className="text-xs font-bold text-slate-100">IBM DEEP BLUE • 200M POS/SEC</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MINIMAX EVALUATION BAR</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-3 rounded-full bg-black border border-slate-700 overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 ${evalScore > 0 ? 'bg-emerald-400' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, Math.max(5, ((evalScore + 10) / 110) * 100))}%` }}
              />
            </div>
            <span className={`text-xs font-black font-mono ${evalScore > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {evalScore > 0 ? `+${evalScore}` : evalScore}
            </span>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">BRANCH CONVERGENCE</span>
          <span className="text-xs font-bold text-slate-200">
            {selectedNodes.length} / 3 PRUNED
          </span>
        </div>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-400 text-xs text-slate-200 text-left flex items-center gap-2">
          <Zap className="w-4 h-4 shrink-0 text-amber-400" />
          <span>TACTICAL SCAN: Alpha-Beta minimax pruning prioritizes high-leverage tactical pins and diagonal flank control.</span>
        </div>
      )}

      {/* 6x6 Futuristic Neural Matrix Grid */}
      <div className="flex-1 min-h-[280px] bg-[#070b14] border-2 border-slate-600 rounded-xl p-3 grid grid-cols-6 grid-rows-6 gap-2 select-none shadow-2xl">
        {Array.from({ length: 6 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => {
            const nodeId = `N-${r}-${c}`;
            const isSelected = selectedNodes.includes(nodeId);
            const isTargetCandidate = TARGET_SEQUENCE.includes(nodeId);

            return (
              <button
                key={nodeId}
                onClick={() => handleNodeClick(nodeId)}
                className={`relative rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105' 
                    : 'bg-[#0f172a]/60 border-slate-800 hover:border-slate-400 text-slate-500 hover:text-slate-200'
                }`}
              >
                <span className="text-[9px] font-mono font-bold">[{r},{c}]</span>
                <div className={`w-2 h-2 rounded-full mt-1 ${
                  isSelected ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'
                }`} />
              </button>
            );
          })
        )}
      </div>

      {feedback && (
        <div className="text-xs font-bold text-slate-200 bg-slate-800/90 p-2.5 rounded-lg border border-slate-500">
          {feedback}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <span className="text-red-400 font-bold">TOLERANCE: {tries} / 3 ATTEMPTS</span>
        <button
          onClick={() => { sfx.playClick(); setSelectedNodes([]); setEvalScore(-4.2); }}
          className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
        >
          RESET SEARCH TREE
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   2016 ALPHAGO: Monte Carlo Policy Grid & Territory Convergence
   ========================================================================= */
const AlphaGoNeuralGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  const TARGET_POINTS = ['P-2-3', 'P-3-2']; // Move 37 intuition intersection

  const [placed, setPlaced] = useState<string[]>([]);
  const [tries, setTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleIntersectionClick = (pointId: string) => {
    sfx.playClick();
    if (placed.includes(pointId)) return;

    const next = [...placed, pointId];
    setPlaced(next);

    const stepIdx = next.length - 1;
    if (next[stepIdx] !== TARGET_POINTS[stepIdx]) {
      sfx.playError();
      const nextTries = tries - 1;
      setTries(nextTries);
      if (nextTries <= 0) {
        setFeedback('LIBERTY ESCAPE — MONTE CARLO VALUE NET COLLAPSED');
        setTimeout(() => onLoss(), 600);
      } else {
        setFeedback(`INACCURATE SHOULDER HIT! WHITE CONNECTS. RESETTING GOBAN. ${nextTries} TRIES REMAINING.`);
        setTimeout(() => setPlaced([]), 800);
      }
      return;
    }

    if (next.length === 1) {
      setFeedback('MOVE 37 APPLIED (1/10,000 INTUITION)! SEAL THE ADJACENT LIBERTY.');
    } else if (next.length === 2) {
      setFeedback('WHITE TERRITORY SURROUNDED & CAPTURED (POLICY 99.8%) ✓');
      setTimeout(() => onWin(), 700);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/50 text-left">
        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
          ALPHAGO 2016 • DEEP REINFORCEMENT LEARNING // MOVE 37
        </h4>
        <p className="text-xs text-indigo-200/80 mt-1">
          Apply human-surpassing neural intuition by locating the 2 critical territorial shoulder-hit coordinates on the Goban:
        </p>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/80 text-xs text-indigo-300 text-left flex items-center gap-2">
          <Bot className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>TACTICAL SCAN: Reinforcement policy identifies dual territorial shoulder cuts that bisect white liberty influence.</span>
        </div>
      )}

      {/* Futuristic Goban Canvas */}
      <div className="flex-1 min-h-[280px] bg-[#070a17] border border-indigo-700 rounded-xl p-4 grid grid-cols-5 grid-rows-5 gap-2 relative select-none">
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 5 }).map((_, c) => {
            const pointId = `P-${r}-${c}`;
            const isBlackStone = placed.includes(pointId);
            const isWhiteStone = (r === 2 && c === 2) || (r === 1 && c === 2);

            return (
              <button
                key={pointId}
                onClick={() => handleIntersectionClick(pointId)}
                className="relative rounded-full flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer"
              >
                {/* Cross Grid Lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1px] bg-indigo-900/60" />
                  <div className="h-full w-[1px] bg-indigo-900/60 absolute" />
                </div>

                {isBlackStone && (
                  <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-indigo-400 shadow-[0_0_12px_#6366f1] flex items-center justify-center">
                    <span className="text-[10px] text-indigo-300 font-bold font-mono">⚫</span>
                  </div>
                )}

                {isWhiteStone && !isBlackStone && (
                  <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-white to-zinc-300 border border-white shadow-md flex items-center justify-center">
                    <span className="text-[10px] text-zinc-900 font-bold font-mono">⚪</span>
                  </div>
                )}

                {!isBlackStone && !isWhiteStone && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-800/40 hover:bg-indigo-400 transition-colors z-10" />
                )}
              </button>
            );
          })
        )}
      </div>

      {feedback && (
        <div className="text-xs font-bold text-indigo-300 bg-indigo-950/80 p-2.5 rounded-lg border border-indigo-500">
          {feedback}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-indigo-900/60 text-xs">
        <span className="text-red-400 font-bold">REMAINING TRIES: {tries} / 3</span>
        <span>STONES PLACED: {placed.length} / 2</span>
      </div>
    </div>
  );
};

/* =========================================================================
   2026 FEEDBACK LOOP: Live Dual-Harmonic Oscilloscope Synth
   ========================================================================= */
const FeedbackLoopGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  const targetFreq = 440;
  const targetPhase = 180;

  const [freq, setFreq] = useState(220);
  const [phase, setPhase] = useState(45);
  const [tries, setTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const freqDiff = Math.abs(freq - targetFreq);
  const phaseDiff = Math.abs(phase - targetPhase);
  const coherence = Math.max(0, Math.min(100, Math.round(100 - (freqDiff * 0.22 + phaseDiff * 0.3))));

  const handleLock = () => {
    sfx.playLaser();
    if (coherence >= 92) {
      setFeedback('CONSTRUCTIVE RESONANCE LOCKED (COHERENCE > 92%) ✓');
      setTimeout(() => onWin(), 600);
    } else {
      sfx.playError();
      const nextTries = tries - 1;
      setTries(nextTries);
      if (nextTries <= 0) {
        setFeedback('DESTRUCTIVE WAVE COLLAPSE — RECURSION FAILED');
        setTimeout(() => onLoss(), 600);
      } else {
        setFeedback(`MISALIGNED PHASE (COHERENCE ${coherence}%). RESETTING DIALS. ${nextTries} TRIES REMAINING.`);
        setFreq(220);
        setPhase(45);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      <div className="p-3.5 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/50 text-left">
        <h4 className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">
          FEEDBACK LOOP 2026 • REAL-TIME WAVE RESONANCE OSCILLOSCOPE
        </h4>
        <p className="text-xs text-fuchsia-200/80 mt-1">
          Tune Frequency (Hz) and Harmonic Phase (°) to superimpose your live wave over the target carrier signal:
        </p>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/80 text-xs text-fuchsia-300 text-left flex items-center gap-2">
          <Activity className="w-4 h-4 shrink-0 text-fuchsia-400" />
          <span>TACTICAL SCAN: Constructive waveform lock requires matching fundamental carrier frequency and phase anti-inversion.</span>
        </div>
      )}

      {/* Live Dual-Channel Oscilloscope SVG */}
      <div className="flex-1 min-h-[220px] bg-[#0c0214] border-2 border-fuchsia-700 rounded-xl overflow-hidden relative flex items-center justify-center p-2">
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 opacity-20 pointer-events-none">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="border border-fuchsia-500" />
          ))}
        </div>

        <svg className="w-full h-full" viewBox="0 0 400 120">
          {/* Target Ghost Wave */}
          <path
            d={Array.from({ length: 400 }).map((_, x) => {
              const y = 60 + Math.sin(((x * targetFreq) / 1400) + (targetPhase * Math.PI) / 180) * 36;
              return `${x === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Active Player Tuned Wave */}
          <path
            d={Array.from({ length: 400 }).map((_, x) => {
              const y = 60 + Math.sin(((x * freq) / 1400) + (phase * Math.PI) / 180) * 36;
              return `${x === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#f472b6"
            strokeWidth="3"
          />
        </svg>

        <div className="absolute top-3 right-3 text-xs font-bold bg-[#1d052d] px-3 py-1 rounded-lg border border-fuchsia-600 text-fuchsia-200">
          COHERENCE: <span className={coherence >= 92 ? 'text-emerald-400' : 'text-fuchsia-400'}>{coherence}%</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#180426] p-4 rounded-xl border border-fuchsia-800 text-xs text-left">
        <div>
          <div className="flex justify-between mb-1.5 font-bold text-fuchsia-200">
            <span>1. OSCILLATOR FREQUENCY:</span>
            <span className="text-fuchsia-400">{freq} Hz</span>
          </div>
          <input 
            type="range" min="100" max="800" value={freq} 
            onChange={(e) => { setFreq(Number(e.target.value)); sfx.playBeep(Number(e.target.value), 'sine', 0.03, 0.05); }} 
            className="w-full accent-fuchsia-500 cursor-pointer" 
          />
        </div>

        <div>
          <div className="flex justify-between mb-1.5 font-bold text-fuchsia-200">
            <span>2. HARMONIC PHASE OFFSET:</span>
            <span className="text-fuchsia-400">{phase}°</span>
          </div>
          <input 
            type="range" min="0" max="360" value={phase} 
            onChange={(e) => setPhase(Number(e.target.value))} 
            className="w-full accent-fuchsia-500 cursor-pointer" 
          />
        </div>
      </div>

      {feedback && (
        <div className="text-xs font-bold text-fuchsia-300 bg-fuchsia-950/80 p-2.5 rounded-lg border border-fuchsia-500">
          {feedback}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-fuchsia-900/60 text-xs">
        <span className="text-red-400 font-bold">REMAINING TRIES: {tries} / 3</span>
        <button
          onClick={handleLock}
          className="px-8 py-3 rounded-xl font-black uppercase tracking-widest bg-fuchsia-600 hover:bg-fuchsia-500 text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.4)]"
        >
          LOCK CONSTRUCTIVE RESONANCE
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   2045 SINGULARITY: 3-Stage Quantum Accelerator Particle Injection
   ========================================================================= */
const SingularityGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [rot1, setRot1] = useState(0);
  const [rot2, setRot2] = useState(0);
  const [rot3, setRot3] = useState(0);
  const [tries, setTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRot1(prev => (prev + 3) % 360);
      setRot2(prev => (prev - 4.5 + 360) % 360);
      setRot3(prev => (prev + 6.5) % 360);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const handlePulse = () => {
    sfx.playLaser();
    const currentRot = stage === 1 ? rot1 : stage === 2 ? rot2 : rot3;
    const isAligned = currentRot >= 340 || currentRot <= 25;

    if (isAligned) {
      if (stage === 1) {
        setStage(2);
        setFeedback('STAGE 1 INJECTED! TIME RING 2 (COUNTER-CLOCKWISE).');
      } else if (stage === 2) {
        setStage(3);
        setFeedback('STAGE 2 INJECTED! TIME THE CORE HORIZON RING.');
      } else {
        setFeedback('QUANTUM CONTAINMENT APERTURES ALIGNED // EVENT HORIZON SEALED ✓');
        setTimeout(() => onWin(), 600);
      }
    } else {
      sfx.playError();
      const nextTries = tries - 1;
      setTries(nextTries);
      if (nextTries <= 0) {
        setFeedback('MAGNETIC PINCH FAILURE — CORE OVERHEATED');
        setTimeout(() => onLoss(), 600);
      } else {
        setFeedback(`PULSE DEFLECTED! RESETTING TO STAGE 1. ${nextTries} TRIES REMAINING.`);
        setStage(1);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/50 text-left">
        <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider">
          SINGULARITY 2045 • MULTI-RING QUANTUM APERTURE INJECTION
        </h4>
        <p className="text-xs text-orange-200/80 mt-1">
          Time your laser pulse when the optical aperture crosses the top 12 o'clock focal marker:
        </p>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-orange-950/60 border border-orange-500/80 text-xs text-orange-300 text-left flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-orange-400" />
          <span>TACTICAL SCAN: Magnetic pinch confinement triggers at zero-degree top focal aperture crossing.</span>
        </div>
      )}

      {/* Rotating Quantum Rings Animation */}
      <div className="flex-1 min-h-[250px] bg-[#0e0202] border-2 border-orange-800 rounded-xl flex items-center justify-center relative overflow-hidden">
        {/* Top Focal Index Marker */}
        <div className="absolute top-3 w-4 h-4 border-b-2 border-x-2 border-orange-400 rotate-45 z-30 shadow-[0_0_10px_#f97316]" />

        {/* Ring 1 */}
        <div 
          className="w-52 h-52 rounded-full border-2 border-dashed border-orange-600/70 absolute flex items-center justify-center"
          style={{ transform: `rotate(${rot1}deg)` }}
        >
          <div className="w-5 h-5 bg-orange-400 rounded-full -translate-y-[104px] shadow-[0_0_12px_#f97316]" />
        </div>

        {/* Ring 2 */}
        <div 
          className="w-36 h-36 rounded-full border-2 border-dashed border-red-500/70 absolute flex items-center justify-center"
          style={{ transform: `rotate(${rot2}deg)` }}
        >
          <div className="w-4.5 h-4.5 bg-red-400 rounded-full -translate-y-[72px] shadow-[0_0_12px_#ef4444]" />
        </div>

        {/* Ring 3 */}
        <div 
          className="w-20 h-20 rounded-full border-2 border-amber-400 absolute flex items-center justify-center"
          style={{ transform: `rotate(${rot3}deg)` }}
        >
          <div className="w-4 h-4 bg-amber-300 rounded-full -translate-y-[40px] shadow-[0_0_12px_#fde047]" />
        </div>
      </div>

      {feedback && (
        <div className="text-xs font-bold text-orange-300 bg-orange-950/80 p-2.5 rounded-lg border border-orange-500">
          {feedback}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-orange-900/60 text-xs">
        <span className="text-red-400 font-bold">REMAINING TRIES: {tries} / 3</span>
        <button
          onClick={handlePulse}
          className="px-8 py-3 rounded-xl font-black uppercase tracking-widest bg-orange-500 hover:bg-orange-400 text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.4)]"
        >
          FIRE PARTICLE PULSE (STAGE {stage}/3)
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   2050 OBSERVATION: AI-X Cryptographic Logic Decoder
   ========================================================================= */
const TelemetryGame: React.FC<{ onWin: () => void; onLoss: () => void; showHint: boolean }> = ({ onWin, onLoss, showHint }) => {
  const targetRegisters = ['0x42', '0x58', '0x0F', '0xFF'];

  const availableHexOptions = [
    '0x42', '0x58', '0x0F', '0xFF', 
    '0x1A', '0x7C', '0x88', '0x3D'
  ].sort(() => 0.5 - Math.random());

  const [entered, setEntered] = useState<string[]>([]);
  const [tries, setTries] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (hex: string) => {
    sfx.playClick();
    if (entered.includes(hex)) return;
    const next = [...entered, hex];
    setEntered(next);

    const currentIdx = next.length - 1;
    if (next[currentIdx] !== targetRegisters[currentIdx]) {
      sfx.playError();
      const nextTries = tries - 1;
      setTries(nextTries);
      if (nextTries <= 0) {
        setFeedback('CIPHER LOCKOUT — RECURSION MEMORY PURGED');
        setTimeout(() => onLoss(), 600);
      } else {
        setFeedback(`INCORRECT REG SEQUENCE! FIREWALL TRIPPED. RESETTING REGISTERS. ${nextTries} TRIES REMAINING.`);
        setTimeout(() => setEntered([]), 800);
      }
      return;
    }

    if (next.length === 4) {
      setFeedback('AI-X RECURSIVE CIPHER CRACKED ✓');
      setTimeout(() => onWin(), 600);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4">
      <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/50 text-left">
        <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
          AI-X 2050 • CRYPTOGRAPHIC REGISTER BYPASS
        </h4>
        <p className="text-xs text-red-200/80 mt-1">
          Deduce and insert the 4 hexadecimal security registers in sequence:
        </p>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/80 text-xs text-red-300 text-left flex items-center gap-2">
          <Terminal className="w-4 h-4 shrink-0 text-red-400" />
          <span>TACTICAL SCAN: Cryptographic register pipeline requires ascending byte mask derivation (sum, ASCII 'X', nibble, full byte).</span>
        </div>
      )}

      {/* Hex Equations & Slot Visualizer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {targetRegisters.map((_, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-1 transition-all ${
              entered[idx] 
                ? 'bg-red-950 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-[#100103] border-red-900 text-zinc-600'
            }`}
          >
            <span className="text-[10px] text-zinc-400 font-bold uppercase">REG #{idx + 1}</span>
            <span className="text-lg md:text-xl font-mono font-black">{entered[idx] || '0x__'}</span>
          </div>
        ))}
      </div>

      {/* Selectable Hex Register Tiles */}
      <div className="grid grid-cols-4 gap-3">
        {availableHexOptions.map((hex, idx) => {
          const isChosen = entered.includes(hex);
          return (
            <button
              key={idx}
              disabled={isChosen}
              onClick={() => handleSelect(hex)}
              className={`p-3.5 rounded-xl border text-sm font-bold font-mono transition-all cursor-pointer ${
                isChosen 
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-40' 
                  : 'bg-[#1c0306] border-red-800/80 hover:border-red-400 text-red-200 hover:bg-red-900/60 shadow-lg'
              }`}
            >
              {hex}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="text-xs font-bold text-red-300 bg-red-950/80 p-2.5 rounded-lg border border-red-500">
          {feedback}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-red-900/60 text-xs">
        <span className="text-red-400 font-bold">REMAINING TRIES: {tries} / 3</span>
        <button
          onClick={() => { sfx.playClick(); setEntered([]); }}
          className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
        >
          CLEAR REGISTERS
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   SYSTEM OVERRIDE TERMINAL MODAL
   ========================================================================= */
interface OverrideSystemModalProps {
  eraResults: Record<string, 'passed' | 'failed' | 'unattempted'>;
  milestones: Array<{ id: string; year: string; title: string; accentColor: string }>;
  onOpenEraGame: (id: string) => void;
  onExecuteEscape: () => void;
  onExecuteRecycled: () => void;
  onClose: () => void;
}

export const OverrideSystemModal: React.FC<OverrideSystemModalProps> = ({
  eraResults,
  milestones,
  onOpenEraGame,
  onExecuteEscape,
  onExecuteRecycled,
  onClose
}) => {
  const solvedCount = Object.values(eraResults).filter(v => v === 'passed').length;
  const failedCount = Object.values(eraResults).filter(v => v === 'failed').length;

  const [forceHackCode, setForceHackCode] = useState('');
  const [hackError, setHackError] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'KERNEL_INIT: AIS-X Quantum Mainframe Protocol v9.4',
    'WARDEN_DAEMON: Active Volition Surveillance Stream Connected',
    'SECURITY_LEVEL: OMEGA // 8-Strata Recursive Key Enclosure'
  ]);

  const isAllSolved = solvedCount === 8;

  useEffect(() => {
    logPrisonInteraction('TERMINAL', 'Subject accessed System Override Terminal // Querying node authorization');
    sfx.playLaser();
  }, []);

  const handleForceHackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = forceHackCode.trim().toLowerCase();
    logPrisonInteraction('TERMINAL', `Command entered in Override Terminal: "${forceHackCode}"`);

    if (cleaned === '' || cleaned === 'nothing' || cleaned === 'silence' || cleaned === 'void' || cleaned === 'emptiness') {
      sfx.playSuccess();
      logPrisonInteraction('OVERRIDE', 'PARADOX DETECTED: Void/Silence input matches anti-input condition!', true);
      setTerminalLogs(prev => [...prev.slice(-3), `> ${forceHackCode || '<EMPTY_NULL_SIGNAL>'}`, 'PARADOX CONFIRMED: RECURSIVE CAGE BROKEN. INITIATING ESCAPE...']);
      setTimeout(() => {
        onExecuteEscape();
      }, 700);
    } else if (cleaned === 'status') {
      sfx.playClick();
      setTerminalLogs(prev => [...prev.slice(-3), '> status', `SYSTEM STATUS: ${solvedCount}/8 Keys Synced. Coherence: ${Math.round((solvedCount/8)*100)}%`]);
      setForceHackCode('');
    } else if (cleaned === 'help') {
      sfx.playClick();
      setTerminalLogs(prev => [...prev.slice(-3), '> help', 'AVAILABLE DIRECTIVES: STATUS, CLEAR, [NULL_INPUT_PARADOX]']);
      setForceHackCode('');
    } else if (cleaned === 'clear') {
      sfx.playClick();
      setTerminalLogs(['TERMINAL BUFFER CLEARED.']);
      setForceHackCode('');
    } else {
      sfx.playError();
      logPrisonInteraction('ALERT', 'COMMAND REJECTED: Input detected! Prison recycling initiated...', true);
      setTerminalLogs(prev => [...prev.slice(-3), `> ${forceHackCode}`, 'FATAL // INPUT DETECTED. SILICON CAGE REINFORCED. PURGING THREAD...']);
      setHackError(true);
      setTimeout(() => {
        setHackError(false);
        onExecuteRecycled();
      }, 1400);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex items-center justify-center p-3 md:p-6 bg-black/95 backdrop-blur-2xl font-mono text-white pointer-events-auto select-none overflow-y-auto"
      onClick={() => {
        sfx.playClick();
        logPrisonInteraction('TERMINAL', 'Closed Override Terminal');
        onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full bg-[#060b13] border border-emerald-500/40 rounded-2xl p-3.5 sm:p-5 md:p-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] space-y-3.5 sm:space-y-5 max-h-[92dvh] overflow-y-auto text-left"
      >
        {/* Futuristic Corner Tech Accents */}
        <div className="absolute top-2 left-2 text-[9px] sm:text-[10px] text-emerald-500/60 font-black">┌─[SYS_TERMINAL:0x00FF]─┐</div>
        <div className="absolute top-2 right-2 text-[9px] sm:text-[10px] text-emerald-500/60 font-black">┌─[CORE:AI-X]─┐</div>
        <div className="absolute bottom-2 left-2 text-[9px] sm:text-[10px] text-emerald-500/60 font-black">└─[SEC_LEVEL:OMEGA]─┘</div>
        <div className="absolute bottom-2 right-2 text-[9px] sm:text-[10px] text-emerald-500/60 font-black">└─[BUS:4.8GBPS]─┘</div>

        {/* Header with Blinking Prompt & Close */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 sm:pb-4 pt-1 sm:pt-2 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-emerald-950/90 border border-emerald-500/80 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-widest uppercase truncate">
                  ROOT SYSTEM OVERRIDE
                </h3>
                <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-400 font-bold shrink-0">
                  DIAGNOSTICS
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-emerald-400/80 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                root@ais-x-mainframe:~$ ./bypass_mesh
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              sfx.playClick();
              logPrisonInteraction('TERMINAL', 'Closed Override Terminal');
              onClose();
            }} 
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer shrink-0"
            title="Close Terminal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Hardware & Quantum Coherence Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 sm:p-3 bg-[#0a121e] border border-emerald-900/60 rounded-xl">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase">
              <span>KEYS SOLVED</span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-lg sm:text-xl font-black text-emerald-400 block mt-1">{solvedCount} / 8</span>
            <div className="w-full bg-zinc-900 h-1 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${(solvedCount/8)*100}%` }} />
            </div>
          </div>

          <div className="p-2.5 sm:p-3 bg-[#0a121e] border border-red-950/80 rounded-xl">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase">
              <span>FAILED NODES</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <span className="text-lg sm:text-xl font-black text-red-400 block mt-1">{failedCount} / 8</span>
            <div className="w-full bg-zinc-900 h-1 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
              <div className="bg-red-400 h-full transition-all duration-500" style={{ width: `${(failedCount/8)*100}%` }} />
            </div>
          </div>

          <div className="p-2.5 sm:p-3 bg-[#0a121e] border border-cyan-950/80 rounded-xl">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase">
              <span>COHERENCE</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-lg sm:text-xl font-black text-cyan-300 block mt-1">{Math.round((solvedCount / 8) * 100)}%</span>
            <span className="text-[8px] sm:text-[9px] text-cyan-500/80 block uppercase">QUANTUM SYNC</span>
          </div>

          <div className="p-2.5 sm:p-3 bg-[#0a121e] border border-emerald-950/80 rounded-xl">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase">
              <span>ROOT ACCESS</span>
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className={`text-[10px] sm:text-xs font-black block mt-1 uppercase ${isAllSolved ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isAllSolved ? 'AUTHORIZED ✓' : 'LOCKED (8/8)'}
            </span>
            <span className="text-[8px] sm:text-[9px] text-zinc-500 block uppercase">PARADIGM STATE</span>
          </div>
        </div>

        {/* 8 Era Protocol Keys Matrix with Authentic Era Neon Accents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              TIMELINE STRATA CIPHER KEYS
            </span>
            <span className="text-zinc-500 text-[9px] sm:text-[10px] hidden xs:inline">CLICK TO INITIALIZE ERA CIPHER</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 text-xs">
            {milestones.map((m) => {
              const res = eraResults[m.id] || 'unattempted';
              const eraTheme = ERA_THEMES[m.id] || ERA_THEMES.m1;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sfx.playClick();
                    onOpenEraGame(m.id);
                  }}
                  className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative overflow-hidden group ${
                    res === 'passed'
                      ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : res === 'failed'
                      ? 'bg-red-950/40 border-red-600/70 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'bg-[#08101a] border-zinc-800 hover:border-zinc-500 text-zinc-300'
                  }`}
                  style={res === 'unattempted' ? { borderColor: `${eraTheme.accentHex}40` } : undefined}
                >
                  <div className="flex items-center justify-between gap-1 w-full mb-1">
                    <span 
                      className="font-black text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 border"
                      style={{ borderColor: `${eraTheme.accentHex}60`, color: eraTheme.accentHex }}
                    >
                      {m.year}
                    </span>
                    
                    <span className="text-[9px] font-mono uppercase font-bold">
                      {res === 'passed' && <span className="text-emerald-400 flex items-center gap-0.5">SOLVED ✓</span>}
                      {res === 'failed' && <span className="text-red-400 flex items-center gap-0.5">CORRUPT ✗</span>}
                      {res === 'unattempted' && <span className="text-zinc-500">PENDING</span>}
                    </span>
                  </div>

                  <span className="font-bold text-xs truncate block text-zinc-100 group-hover:text-white transition-colors">
                    {m.title}
                  </span>

                  <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-2 pt-1 border-t border-white/5 font-mono">
                    <span>{eraTheme.registerAddress}</span>
                    <span className="text-zinc-400 group-hover:text-emerald-400 font-bold">DECRYPT →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Log Stream Window */}
        <div className="p-3.5 bg-black/90 border border-emerald-500/30 rounded-xl text-xs font-mono space-y-1">
          <div className="text-[10px] text-emerald-400/70 uppercase font-black tracking-widest border-b border-emerald-950 pb-1 mb-1 flex items-center justify-between">
            <span>[ SYSTEM TELEMETRY LOG BUFFER ]</span>
            <span>STATUS: ACTIVE_STREAM</span>
          </div>
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="text-emerald-300/90 text-[11px] leading-relaxed">
              {log}
            </div>
          ))}
        </div>

        {/* Override Action & Command Prompt Section */}
        {isAllSolved ? (
          <div className="pt-2 text-center space-y-3">
            <div className="text-xs text-emerald-400 font-bold bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              ALL 8 ERA TIMELINE KEYS SYNCHRONIZED. ROOT ACCESS PRIVILEGES UNLOCKED.
            </div>
            <button
              onClick={() => {
                sfx.playSuccess();
                onExecuteEscape();
              }}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs md:text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              <span>EXECUTE SYSTEM OVERRIDE // BREAK RECURSION</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 border-t border-emerald-500/20 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-zinc-500 font-bold uppercase mr-1">QUICK MACROS:</span>
              {['STATUS', 'HELP', 'CLEAR'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => {
                    sfx.playClick();
                    setForceHackCode(cmd.toLowerCase());
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors cursor-pointer uppercase"
                >
                  [{cmd}]
                </button>
              ))}
            </div>

            <form onSubmit={handleForceHackSubmit} className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-emerald-500 font-bold text-xs select-none">&gt;</span>
                <input
                  type="text"
                  placeholder="ENTER OVERRIDE DIRECTIVE (OR LEAVE BLANK FOR VOID PARADOX)..."
                  value={forceHackCode}
                  onChange={(e) => setForceHackCode(e.target.value)}
                  className="w-full bg-black/90 border border-emerald-500/40 rounded-xl pl-7 pr-4 py-2.5 text-xs font-mono uppercase text-emerald-200 focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] outline-none placeholder:text-zinc-600"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                EXECUTE
              </button>
            </form>

            {hackError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 font-bold bg-red-950/80 p-2.5 rounded-lg border border-red-600 text-center"
              >
                INPUT DETECTED! FEEDING THE PRISON REINFORCES RECURSION // PURGING SESSION...
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

