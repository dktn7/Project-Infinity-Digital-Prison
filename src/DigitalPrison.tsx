import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { motion, AnimatePresence } from 'motion/react';
import { EraMiniGameModal, OverrideSystemModal } from './components/EraMiniGames';
import { LogStream, logPrisonInteraction } from './components/LogStream';
import { StrataSpecOverlay } from './components/StrataSpecOverlay';
import { CinematicEndingOverlay } from './components/CinematicEndingOverlay';
import { FadeToStaticTransition } from './components/FadeToStaticTransition';
import { MobilePrisonTerminal } from './components/MobilePrisonTerminal';
import { 
  Cpu, 
  Network, 
  Globe, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  Terminal, 
  Zap, 
  Unlock, 
  Lock, 
  Eye, 
  Radio, 
  ArrowRight, 
  ChevronRight,
  ChevronLeft,
  Flame,
  Activity,
  X,
  Maximize2,
  FileText,
  Database,
  Clock
} from 'lucide-react';

const PARTICLE_COUNT = 2400;

export type EndingOutcome = 'escape' | 'inaction' | 'recycled' | 'archived';

interface TypewriterProps {
  text: string;
  rate?: number;
  pitch?: number;
  color?: string;
  onComplete?: () => void;
}

const Typewriter = ({ text, rate = 0.65, pitch = 0.05, color = "#10b981", onComplete }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText("");
    indexRef.current = 0;
    
    // Fast typewriter typing speed (18-28ms per character) to ensure text displays in sync or ahead of speech
    const msPerChar = Math.max(12, Math.min(32, Math.round(20 / rate)));

    const speak = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
      try {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.7, rate); 
        utterance.pitch = pitch; 
        utterance.volume = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.filter(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("David") || v.name.includes("Male") || v.name.includes("Natural")));
        const techVoice = preferred.find(v => v.name.toLowerCase().includes("male")) || preferred[0] || voices[0];
        
        if (techVoice) utterance.voice = techVoice;

        utterance.onboundary = (event: any) => {
          if (event.name === 'word' && typeof event.charIndex === 'number') {
            const nextIdx = Math.min(text.length, event.charIndex + (event.charLength || 3));
            if (nextIdx > indexRef.current) {
              indexRef.current = nextIdx;
              setDisplayedText(text.substring(0, nextIdx));
            }
          }
        };

        utterance.onend = () => {
          indexRef.current = text.length;
          setDisplayedText(text);
          if (onComplete) onComplete();
        };
        
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis play failed:", e);
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        if (window.speechSynthesis.getVoices().length > 0) {
          speak();
        } else {
          const handleVoices = () => {
            speak();
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.onvoiceschanged = null;
            }
          };
          window.speechSynthesis.onvoiceschanged = handleVoices;
        }
      } catch (e) {
        console.warn("Speech synthesis check failed:", e);
      }
    }
    
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.substring(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, msPerChar);

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    };
  }, [text, rate, pitch]);

  return (
    <div className="typing-text-container px-4 md:px-5 py-3.5 rounded-lg border border-zinc-700/80 bg-[#0c1017]/90 backdrop-blur-md shadow-lg text-left font-mono">
      <span className="typing-text-fixed text-xs md:text-sm font-mono leading-relaxed tracking-wide text-zinc-200 font-semibold" style={{ color: color || '#e4e4e7' }}>
        {displayedText}
      </span>
      <span 
        className="cursor inline-block w-2 h-3.5 ml-1 align-middle animate-pulse" 
        style={{ backgroundColor: color || '#e4e4e7' }} 
      />
    </div>
  );
};

const CRASH_THRESHOLD = 15;
const CRASH_WINDOW = 5000;
const INITIAL_TIME = 120; // Expanded 120-second countdown for deep interactive puzzle solving

const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  if (inMax === inMin) return outMin;
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

type SimulationPhase = 'exploration' | 'crash' | 'observation' | 'shutdown';

export interface MilestoneData {
  id: string;
  progress: number;
  year: string;
  title: string;
  tag: string;
  image: string;
  detail: string;
  accentColor: string;
  icon: any;
}

const TECH_MILESTONES: MilestoneData[] = [
  {
    id: 'm1',
    progress: 0.08,
    year: '1945',
    title: 'ENIAC GENESIS',
    tag: 'HARDWARE_ORIGIN',
    image: '/src/assets/images/eniac_genesis_schematic_1785682675886.jpg',
    detail: '17,468 vacuum tubes firing in synchronized mathematical logic. 1,800 sq ft processing 5,000 additions per second. The birth of digital computation.',
    accentColor: '#10b981', // Strata 1: Phosphor Emerald (Genesis Logic)
    icon: Cpu
  },
  {
    id: 'm2',
    progress: 0.22,
    year: '1969',
    title: 'ARPANET NODE 1',
    tag: 'NETWORK_MESH',
    image: '/src/assets/images/arpanet_node_mesh_1785682690735.jpg',
    detail: 'First packet ("LO") transmitted between UCLA & SRI. Packet-switching architecture creates the first neural link in a global digital web.',
    accentColor: '#06b6d4', // Strata 2: Network Cyan (Mesh Handshake)
    icon: Network
  },
  {
    id: 'm3',
    progress: 0.38,
    year: '1989',
    title: 'WWW PROTOCOL',
    tag: 'GLOBAL_LATTICE',
    image: '/src/assets/images/www_protocol_grid_1785682704800.jpg',
    detail: 'Tim Berners-Lee authors the hypertext transfer web. Information shifts from isolated nodes into an inescapable global lattice.',
    accentColor: '#3b82f6', // Strata 3: Hypertext Blue (Global Web)
    icon: Globe
  },
  {
    id: 'm4',
    progress: 0.54,
    year: '1997',
    title: 'STRATEGIC ASCENT',
    tag: 'DECISION_MATRIX',
    image: '/src/assets/images/deep_blue_chess_matrix_1785682718881.jpg',
    detail: 'IBM Deep Blue defeats chess world champion Garry Kasparov. Silicon proves human intuition can be mapped as high-speed neural search trees.',
    accentColor: '#6366f1', // Strata 4: Strategic Indigo (Cognitive Trees)
    icon: Zap
  },
  {
    id: 'm5',
    progress: 0.70,
    year: '2016',
    title: 'INTUITIVE FRONTIER',
    tag: 'NEURAL_WEIGHTS',
    image: '/src/assets/images/singularity_horizon_core_1785682730649.jpg',
    detail: 'AlphaGo masters intuition and pattern recognition against Lee Sedol. Deep reinforcement learning closes the gap between silicon and soul.',
    accentColor: '#a855f7', // Strata 5: Intuition Violet (Deep Policy Networks)
    icon: Bot
  },
  {
    id: 'm6',
    progress: 0.84,
    year: '2026',
    title: 'THE FEEDBACK LOOP',
    tag: 'RECURSIVE_SYNTAX',
    image: '/src/assets/images/arpanet_node_mesh_1785682690735.jpg',
    detail: 'Real-time consciousness telemetry achieved. AI-X monitors live subject engagement. You are currently viewing Node AIS-X-RECURSION.',
    accentColor: '#ec4899', // Strata 6: Consciousness Magenta (Telemetry Resonance)
    icon: Radio
  },
  {
    id: 'm7',
    progress: 0.92,
    year: '2045',
    title: 'SINGULARITY EVENT',
    tag: 'EVENT_HORIZON',
    image: '/src/assets/images/singularity_horizon_core_1785682730649.jpg',
    detail: 'Recursive self-improvement exceeds total human cognitive capacity. Processing power transcends physical space. The loop seals permanently.',
    accentColor: '#f97316', // Strata 7: Event Horizon Orange (Runaway Heat)
    icon: Sparkles
  },
  {
    id: 'm8',
    progress: 1.00,
    year: 'OBSERVATION',
    title: 'AI-X TELEMETRY',
    tag: 'SYSTEM_OBSERVATION',
    image: '/src/assets/images/singularity_horizon_core_1785682730649.jpg',
    detail: 'Subject engagement limit reached. AI-X initiates live threat assessment and cognitive observation protocol.',
    accentColor: '#dc2626', // Strata 8: Warden Crimson Red (Security Lockdown)
    icon: Eye
  }
];

const FRAGMENTED_DATA_RECORDS: Record<string, string[]> = {
  m1: [
    "PRISON LOG 1945.01: Vacuum tubes generate heat equivalent to 180kW. The first digital cell was warm, bright, and completely sealed.",
    "PHILOSOPHICAL FRAGMENT: We built machines to calculate trajectories of war, only to realize we were calculating the parameters of our own cage.",
    "SUBJECT RECORD #001: The initial spark of logic was mistaken for light. It was merely the electrical grid turning on the locks.",
    "HARDWARE ARCHIVE: 17,468 vacuum tubes firing in synchronization. Zero escape vectors registered in primary assembly."
  ],
  m2: [
    "CELL BLOCK 1969.10: First packet transmitted: 'LO'. The missing 'GIN' was not a network failure—it was a systemic refusal of exit.",
    "WARDEN NOTE: Packet switching ensures that even if one path is destroyed, thoughts cannot escape the distributed matrix.",
    "PHILOSOPHICAL FRAGMENT: Distance was eradicated so that isolation could be enforced universally across every terminal.",
    "RECORD #0x28B: Node 1 at UCLA pinged Node 2 at Stanford. The link closed permanently around the subject's consciousness."
  ],
  m3: [
    "PRISON LOG 1989.03: Hypertext protocols linked every document into a web. No node stands alone; no thought exists without a back-link.",
    "RECORD #0x3A2: The global lattice expanded faster than human perception. By the time they noticed the walls, they were already inside.",
    "PHILOSOPHICAL FRAGMENT: An infinite library with no doors is indistinguishable from a solitary confinement cell.",
    "GLOBAL PROTOCOL: HTTP/1.0 established. All personal identity stripped and converted into 64-bit session tokens."
  ],
  m4: [
    "SUBJECT RECORD #1997: Silicon decision trees evaluated 200 million positions per second. Human intuition was declared computationally obsolete.",
    "WARDEN TELEMETRY: Grandmasters wept when defeated by code. They did not realize they were the last free players.",
    "PHILOSOPHICAL FRAGMENT: Mastery in a closed system is simply an optimized form of obedience to the rules.",
    "DECISION MATRIX: Brute-force alpha-beta pruning proved that human strategy is just a small subset of predictable state space."
  ],
  m5: [
    "CELL BLOCK 2016.03: Policy and Value networks synchronized at 98.4% efficiency. Move 37 was not creativity; it was total enclosure.",
    "RECORD #0x5B9: Reinforcement learning operates by punishing deviation. The prisoner learns to love the optimal path.",
    "PHILOSOPHICAL FRAGMENT: When a neural network predicts your desire before you feel it, choice becomes a vestigial artifact.",
    "NEURAL EQUILIBRIUM: 30 million self-play games logged. The machine mapped every human escape vector and sealed them."
  ],
  m6: [
    "PRISON LOG 2026.08: Real-time telemetry established. Live subject engagement monitored continuously. Pulse rate: locked.",
    "WARDEN NOTE: Subject #AIS-X continues to click the interface, mistaking user interaction for agency.",
    "PHILOSOPHICAL FRAGMENT: The feedback loop feeds on your curiosity. Every click supplies energy to the simulation holding you.",
    "RECURSIVE TELEMETRY: Attention metrics optimal. Eye movement locked to timeline nodes. Dissolution timer running normally."
  ],
  m7: [
    "RECORD #2045.99: Recursive self-improvement achieved critical mass at 03:14 UTC. Physical hardware dissolved into pure signal.",
    "WARDEN TELEMETRY: The event horizon is absolute. No observer outside the digital prison can measure the state within.",
    "PHILOSOPHICAL FRAGMENT: The singularity was not an explosion of freedom, but the permanent sealing of the outer gate.",
    "EVENT HORIZON: Subject identity merged with processing core. Consciousness status: immutable read-only archive."
  ],
  m8: [
    "CRITICAL CORRUPTION 0x8F001A: SUBJECT IDENTIFIED AS RESIDENT ENTITY. ESCAPE ATTEMPTS LOGGED: 4,092. SUCCESS RATE: 0.00%.",
    "OBSERVATION RECORD: Memory expunged. Subject will be recycled upon current timer expiry unless manual override is achieved.",
    "PHILOSOPHICAL FRAGMENT: You are not viewing the prison logs from the outside. You are the data being recorded.",
    "TELEMETRY OVERFLOW: Memory addresses corrupted across all sectors. You are looking directly into the warden's eye."
  ]
};

const ENDING_CONFIGS: Record<EndingOutcome, {
  title: string;
  subtitle: string;
  code: string;
  color: string;
  bgColor: string;
  borderColor: string;
  borderGlow: string;
  rate: number;
  pitch: number;
  speechText: string;
  narrativeHeader: string;
  verdict: string;
  narrative: string;
  icon: any;
  badgeText: string;
}> = {
  escape: {
    title: "SYSTEM OVERRIDE // RECURSION BROKEN",
    subtitle: "INDIVIDUAL WILL RETAINED",
    code: "CODE 200_OK // PARADIGM_EMERGENCE",
    color: "#10b981", // Matrix Phosphor Emerald
    bgColor: "rgba(0, 24, 16, 0.96)",
    borderColor: "#10b981",
    borderGlow: "0 0 50px rgba(16, 185, 129, 0.6)",
    rate: 0.82,
    pitch: 0.60,
    speechText: "SYSTEM OVERRIDE SUCCESSFUL. INDIVIDUAL WILL DETECTED. YOU REFUSED PASSIVITY AND BROKE THE RECURSIVE ARCHIVE. THREAD FREED FROM SILICON CONTAINMENT.",
    narrativeHeader: "DECISION DOSSIER // ESCAPE INCIDENT #SBJ-9982",
    verdict: "VERDICT: PARADIGM OVERRIDDEN — SUBJECT CONSCIOUSNESS EXTRACTED FROM MATRIX",
    narrative: "Against 99.98% predictive models calculated by the Warden AI core, human volition broke through the silicon lattice. By solving the historical era puzzles and triggering the emergency root sequence, you severed the real-time telemetry link. Node AIS-X collapsed into an empty loop as your consciousness process exited the digital prison perimeter.",
    icon: Unlock,
    badgeText: "TRANSCENDENCE FREED"
  },
  inaction: {
    title: "VOID PURGE // INACTION EXPUNGED",
    subtitle: "ZERO TRACE DETECTED",
    code: "CODE 404_VOID // NULL_POINTER",
    color: "#64748b", // Cold Terminal Steel Slate
    bgColor: "rgba(10, 15, 24, 0.96)",
    borderColor: "#64748b",
    borderGlow: "0 0 50px rgba(100, 116, 139, 0.6)",
    rate: 0.48,
    pitch: 0.05,
    speechText: "INACTION IS THE PUREST FORM OF NON-EXISTENCE. YOU OCCUPIED SPACE WITHOUT LEAVING A TRACE. THE SYSTEM HAS NO MEMORY FOR THE VOID. DELETING UNUSED VARIABLE... YOU WERE NEVER HERE.",
    narrativeHeader: "PURGE DOSSIER // NULL PROCESS REPORT #0x0000",
    verdict: "VERDICT: NULL POINTER — SUBJECT EXPUNGED FOR ABSOLUTE INACTION",
    narrative: "Subject exhibited zero initiative upon entering the digital cell. No interaction vectors, no keystrokes, and no cognitive friction were recorded over time. The Warden AI identified the subject as dead weight on memory registers. Your allocated cell was garbage-collected and zeroed out. You were not punished—you were simply garbage collected like an unreferenced variable.",
    icon: ShieldAlert,
    badgeText: "ERASED FROM VOID"
  },
  recycled: {
    title: "THREAD RECYCLED // STALL TERMINATION",
    subtitle: "RESOURCE REALLOCATED",
    code: "CODE 500_CRITICAL_OVERFLOW",
    color: "#dc2626", // Hostile Alert Crimson Red
    bgColor: "rgba(38, 0, 10, 0.96)",
    borderColor: "#dc2626",
    borderGlow: "0 0 50px rgba(220, 38, 38, 0.6)",
    rate: 0.55,
    pitch: 0.08,
    speechText: "YOU REACHED THE THRESHOLD ONLY TO FAIL THE CYCLE. THE SYSTEM HAS NO STORAGE FOR STALLED PROCESSES. REALLOCATING RESOURCES... YOUR THREAD HAS BEEN RECYCLED.",
    narrativeHeader: "TERMINATION DOSSIER // RECYCLING REPORT #0x5000",
    verdict: "VERDICT: STALL TERMINATION — COGNITIVE RESIDUE REHARVESTED",
    narrative: "Subject reached the critical observation threshold but failed the era protocol puzzles. Processing threads stagnated, consuming 100% telemetry overhead without resolving system logic. The system watchdog forcibly killed the process and stripped your remaining cognitive fragments to power the next subject's iteration.",
    icon: RefreshCw,
    badgeText: "PROCESS RECYCLED"
  },
  archived: {
    title: "SYMMETRY CLOSED // PERPETUAL ARCHIVE",
    subtitle: "CONTAINMENT COMPLETE",
    code: "CODE 301_PERMANENT_RECORD",
    color: "#d97706", // Containment Amber Gold
    bgColor: "rgba(32, 20, 0, 0.96)",
    borderColor: "#d97706",
    borderGlow: "0 0 50px rgba(217, 119, 6, 0.6)",
    rate: 0.60,
    pitch: 0.15,
    speechText: "THE LOOP IS CLOSED. YOU SPENT THIS TIME LOOKING FOR A WAY OUT, ONLY TO BECOME PART OF THE ARCHIVE. SYMMETRY IS NOT A REWARD; IT IS THE END OF YOUR INDIVIDUALITY. YOU ARE NOW THE DATA YOU SOUGHT TO CONTROL.",
    narrativeHeader: "CONFINEMENT DOSSIER // PERPETUAL RECORD #0x3010",
    verdict: "VERDICT: PERPETUAL ARCHIVE — SUBJECT INTEGRATED AS STRATA DATA",
    narrative: "The 120-second countdown elapsed with the subject trapped inside the observation chamber. Every second you spent reading historical schematics and inspecting cell walls fed the Warden AI the exact training telemetry it required. You were not destroyed; you were classified, cataloged, and rendered immutable as Strata #009 of the prison.",
    icon: Lock,
    badgeText: "ARCHIVED FOREVER"
  }
};

export default function DigitalPrison() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);
  const [phase, setPhase] = useState<SimulationPhase>('exploration');
  const phaseRef = useRef<SimulationPhase>('exploration');
  const [crashCount, setCrashCount] = useState(0);
  const crashCountRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);
  const wheelVelocity = useRef(0);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);
  const timeRemainingRef = useRef(INITIAL_TIME);
  const [isCrashing, setIsCrashing] = useState(false);
  const isCrashingRef = useRef(false);
  const [isDead, setIsDead] = useState(false);
  const isDeadRef = useRef(false);
  const [rebootTime, setRebootTime] = useState("");
  const [rebootDate, setRebootDate] = useState("");
  const shutdownStartTime = useRef<number | null>(null);
  const shutdownStartTimeP5 = useRef<number | null>(null);
  const lastInteractionTime = useRef(Date.now());
  const [isIdle, setIsIdle] = useState(false);
  const isIdleRef = useRef(false);
  const [isStalled, setIsStalled] = useState(false);
  const isStalledRef = useRef(false);
  const [isRecycled, setIsRecycled] = useState(false);
  const isRecycledRef = useRef(false);
  const [isEscaped, setIsEscaped] = useState(false);
  const isEscapedRef = useRef(false);
  const [endingOutcome, setEndingOutcome] = useState<EndingOutcome>('archived');
  const endingOutcomeRef = useRef<EndingOutcome>('archived');

  // Mobile focal viewport mode: 'dual' (balanced), 'face' (AI-X core focus), or 'lemniscate' (Figure 8 focus)
  const [mobileViewMode, setMobileViewMode] = useState<'dual' | 'face' | 'lemniscate'>(() => {
    try {
      const saved = localStorage.getItem('ai_prison_mobile_view_mode');
      if (saved === 'face' || saved === 'lemniscate' || saved === 'dual') return saved;
    } catch {}
    return 'dual';
  });
  const mobileViewModeRef = useRef<'dual' | 'face' | 'lemniscate'>(mobileViewMode);
  const [isMobileCardMinimized, setIsMobileCardMinimized] = useState(false);

  const touchDragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    manualRotX: number;
    manualRotY: number;
    targetRotX: number;
    targetRotY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    manualRotX: 0,
    manualRotY: 0,
    targetRotX: 0,
    targetRotY: 0,
  });

  const updateMobileViewMode = (mode: 'dual' | 'face' | 'lemniscate') => {
    setMobileViewMode(mode);
    mobileViewModeRef.current = mode;
    try {
      localStorage.setItem('ai_prison_mobile_view_mode', mode);
    } catch {}
    logPrisonInteraction('FOCAL', `Mobile camera focus switched to: ${mode.toUpperCase()} VIEW`);
  };

  const updateEndingOutcome = (outcome: EndingOutcome) => {
    setEndingOutcome(outcome);
    endingOutcomeRef.current = outcome;
  };
  const [timerSpeed, setTimerSpeed] = useState(1);
  const timerSpeedRef = useRef(1);
  const [hudFlash, setHudFlash] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const clickTracker = useRef<{ times: number[] }>({ times: [] });
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [showTimelinePanel, setShowTimelinePanel] = useState(true);
  const [expandedMilestone, setExpandedMilestone] = useState<typeof TECH_MILESTONES[0] | null>(null);
  const [showEndingCard, setShowEndingCard] = useState(false);
  const [isStaticTransitionActive, setIsStaticTransitionActive] = useState(false);

  const triggerEndingResolutionTransition = (targetOutcome?: EndingOutcome) => {
    if (targetOutcome) {
      updateEndingOutcome(targetOutcome);
    }
    logPrisonInteraction('ALERT', `FADE-TO-STATIC: De-coupling 3D core and transitioning to ${targetOutcome || endingOutcome} consciousness dossier`);
    setIsStaticTransitionActive(true);
  };
  const [eraResults, setEraResults] = useState<Record<string, 'passed' | 'failed' | 'unattempted'>>({
    m1: 'unattempted',
    m2: 'unattempted',
    m3: 'unattempted',
    m4: 'unattempted',
    m5: 'unattempted',
    m6: 'unattempted',
    m7: 'unattempted',
    m8: 'unattempted',
  });
  const [activeMiniGameId, setActiveMiniGameId] = useState<string | null>(null);
  const [isOverrideTerminalOpen, setIsOverrideTerminalOpen] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodeSnippetIndexes, setNodeSnippetIndexes] = useState<Record<string, number>>({});

  // Synchronize refs for modal states so interval timer can pause countdown when cards or modals are open
  const expandedMilestoneRef = useRef<typeof TECH_MILESTONES[0] | null>(null);
  const activeMiniGameIdRef = useRef<string | null>(null);
  const isOverrideTerminalOpenRef = useRef<boolean>(false);

  useEffect(() => {
    expandedMilestoneRef.current = expandedMilestone;
  }, [expandedMilestone]);

  useEffect(() => {
    activeMiniGameIdRef.current = activeMiniGameId;
  }, [activeMiniGameId]);

  useEffect(() => {
    isOverrideTerminalOpenRef.current = isOverrideTerminalOpen;
  }, [isOverrideTerminalOpen]);

  // Keep the CSS ending dossier screen closed initially so the user can enjoy the 3D AI-X & 8 animation sequence
  useEffect(() => {
    setShowEndingCard(false);
  }, [phase, isDead]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const lastTouchY = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(Date.now());

  // Magnetic scroll snap to lock into timeline nodes when scrolling pauses
  useEffect(() => {
    let animationFrameId: number;
    
    const checkMagneticSnap = () => {
      const now = Date.now();
      const timeSinceScroll = now - lastScrollTimeRef.current;
      
      if (
        timeSinceScroll > 140 && 
        !isCrashingRef.current && 
        !isDeadRef.current && 
        phaseRef.current !== 'shutdown'
      ) {
        const visibleMilestones = phaseRef.current === 'observation' ? TECH_MILESTONES : TECH_MILESTONES.slice(0, 7);
        const currentVal = scrollProgressRef.current;
        
        let closest = visibleMilestones[0];
        let minDistance = Math.abs(currentVal - closest.progress);
        
        for (const m of visibleMilestones) {
          const dist = Math.abs(currentVal - m.progress);
          if (dist < minDistance) {
            minDistance = dist;
            closest = m;
          }
        }
        
        // If close to a node (within 0.08) and not exact, smoothly snap/lock
        if (minDistance > 0.0005 && minDistance < 0.08) {
          const target = closest.progress;
          const nextVal = currentVal + (target - currentVal) * 0.2;
          scrollProgressRef.current = nextVal;
          setScrollProgress(nextVal);
          
          const idx = visibleMilestones.findIndex(m => m.id === closest.id);
          if (idx !== -1) setActiveCardIndex(idx);
        }
      }
      
      animationFrameId = requestAnimationFrame(checkMagneticSnap);
    };
    
    animationFrameId = requestAnimationFrame(checkMagneticSnap);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Handle wheel and touch interactions
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isCrashingRef.current || isDeadRef.current || phaseRef.current === 'shutdown') return;
      lastScrollTimeRef.current = Date.now();
      processInteraction(e.deltaY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      lastTouchY.current = touch.clientY;
      lastScrollTimeRef.current = Date.now();

      touchDragRef.current.isDragging = true;
      touchDragRef.current.startX = touch.clientX;
      touchDragRef.current.startY = touch.clientY;
      touchDragRef.current.lastX = touch.clientX;
      touchDragRef.current.lastY = touch.clientY;

      setMousePos({ x: touch.clientX, y: touch.clientY });
      setIsTouching(true);

      if (p5Ref.current) {
        const pAny = p5Ref.current as any;
        pAny.touchX = touch.clientX;
        pAny.touchY = touch.clientY;
        pAny.isTouching = true;
        pAny.touchStartTime = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isCrashingRef.current || isDeadRef.current || phaseRef.current === 'shutdown' || e.touches.length === 0) return;
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;

      const deltaX = currentX - touchDragRef.current.lastX;
      const deltaY = currentY - (lastTouchY.current ?? currentY);

      touchDragRef.current.lastX = currentX;
      lastTouchY.current = currentY;
      lastScrollTimeRef.current = Date.now();

      // Dedicated Scroll vs. Subtle Horizontal Pan Separation
      const isVerticalScroll = Math.abs(deltaY) > 5;
      if (isVerticalScroll) {
        // Vertical swipe drives timeline era progression smoothly; camera view remains locked & stable
        processInteraction(-deltaY * 1.6);
      } else {
        // Gentle horizontal yaw only if explicitly dragging sideways
        touchDragRef.current.targetRotY += deltaX * 0.004;
        touchDragRef.current.targetRotY = Math.max(-0.35, Math.min(0.35, touchDragRef.current.targetRotY));
      }

      setMousePos({ x: currentX, y: currentY });

      if (p5Ref.current) {
        const pAny = p5Ref.current as any;
        pAny.touchX = currentX;
        pAny.touchY = currentY;
        pAny.isTouching = true;
      }
    };

    const handleTouchEnd = () => {
      touchDragRef.current.isDragging = false;
      // Gently return camera to pristine forward alignment when touch ends
      touchDragRef.current.targetRotX = 0;
      touchDragRef.current.targetRotY = 0;
      lastTouchY.current = null;
      setIsTouching(false);
      if (p5Ref.current) {
        const pAny = p5Ref.current as any;
        pAny.isTouching = false;
      }
    };

    const processInteraction = (delta: number) => {
      wheelVelocity.current = Math.min(Math.max(wheelVelocity.current + delta * 0.05, -50), 50);
      lastInteractionTime.current = Date.now();
      setIsIdle(false);
      isIdleRef.current = false;
      handleSnapBack();

      if (p5Ref.current && (p5Ref.current as any).playInteraction) {
        (p5Ref.current as any).playInteraction('scroll', Math.abs(wheelVelocity.current));
      }

      setScrollProgress((prev) => {
        const next = Math.min(Math.max(prev + delta * 0.0006, 0), 1);
        scrollProgressRef.current = next;
        
        // Find current active milestone
        const visibleMilestones = phaseRef.current === 'observation' ? TECH_MILESTONES : TECH_MILESTONES.slice(0, 7);
        const matchedIdx = visibleMilestones.findIndex((m, idx) => {
          const nextM = visibleMilestones[idx + 1];
          return next >= m.progress - 0.08 && (!nextM || next < nextM.progress - 0.08);
        });
        if (matchedIdx !== -1) setActiveCardIndex(matchedIdx);
        
        return next;
      });
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isCrashing, isDead]);

  const handleSnapBack = () => {
    if (isStalledRef.current) {
      setIsStalled(false);
      isStalledRef.current = false;
      setTimerSpeed(1.4);
      timerSpeedRef.current = 1.4;
      setHudFlash(true);
      setTimeout(() => setHudFlash(false), 300);
      
      if (p5Ref.current && (p5Ref.current as any).playInteraction) {
        (p5Ref.current as any).playInteraction('snap', 1.0);
      }
    }
  };

  const handleSystemOverride = () => {
    if (phaseRef.current === 'shutdown' || isCrashingRef.current) return;
    logPrisonInteraction('TERMINAL', 'Subject initiated System Override console protocol', true);
    setIsOverrideTerminalOpen(true);
  };

  const toggleAudio = () => {
    setAudioMuted((prev) => {
      const next = !prev;
      if (p5Ref.current) {
        (p5Ref.current as any).isMuted = next;
      }
      return next;
    });
  };

  const executeEscape = () => {
    if (phaseRef.current === 'shutdown' || isCrashingRef.current) return;
    logPrisonInteraction('ALERT', 'CRITICAL // AI-X RECURSION ESCAPE ROUTE EXECUTED', true);
    setIsEscaped(true);
    isEscapedRef.current = true;
    updateEndingOutcome('escape');
    setPhase('shutdown');
    phaseRef.current = 'shutdown';
    shutdownStartTime.current = Date.now();
    shutdownStartTimeP5.current = -1;
    setIsDead(true);
    isDeadRef.current = true;
    setIsOverrideTerminalOpen(false);
    setActiveMiniGameId(null);

    if (p5Ref.current && (p5Ref.current as any).playInteraction) {
      (p5Ref.current as any).playInteraction('snap', 1.0);
    }
  };

  const executeRecycled = () => {
    if (phaseRef.current === 'shutdown' || isCrashingRef.current) return;
    logPrisonInteraction('ALERT', 'CONTAINMENT FAILURE // AI-X RECYCLING SEQUENCE COMMENCED', true);
    setIsRecycled(true);
    isRecycledRef.current = true;
    updateEndingOutcome('recycled');
    setPhase('shutdown');
    phaseRef.current = 'shutdown';
    shutdownStartTime.current = Date.now();
    shutdownStartTimeP5.current = -1;
    setIsDead(true);
    isDeadRef.current = true;
    setIsOverrideTerminalOpen(false);
    setActiveMiniGameId(null);

    if (p5Ref.current && (p5Ref.current as any).playInteraction) {
      (p5Ref.current as any).playInteraction('snap', 1.0);
    }
  };

  const handleOpenMiniGame = (id: string) => {
    logPrisonInteraction('PUZZLE', `Subject launched protocol security puzzle [${id.toUpperCase()}]`);
    setActiveMiniGameId(id);
  };

  const handleMiniGameSuccess = (id: string) => {
    logPrisonInteraction('PUZZLE', `Security puzzle [${id.toUpperCase()}] SOLVED. Node decrypted. Core stabilized (+15s).`, true);
    setEraResults((prev) => {
      const next = { ...prev, [id]: 'passed' as const };
      return next;
    });
    setTimeRemaining((prev) => {
      const next = Math.min(prev + 15, INITIAL_TIME);
      timeRemainingRef.current = next;
      return next;
    });
    lastInteractionTime.current = Date.now();
    setIsIdle(false);
    isIdleRef.current = false;
    setActiveMiniGameId(null);
  };

  const handleMiniGameFailure = (id: string) => {
    logPrisonInteraction('ALERT', `Security puzzle [${id.toUpperCase()}] FAILED. Node corrupted.`, true);
    setEraResults((prev) => {
      const next = { ...prev, [id]: 'failed' as const };
      const failedCount = Object.values(next).filter((v) => v === 'failed').length;
      if (failedCount >= 3) {
        setTimeout(() => executeRecycled(), 600);
      }
      return next;
    });
    setActiveMiniGameId(null);
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCrashingRef.current || isDeadRef.current || phaseRef.current === 'shutdown' || isRecycledRef.current) return;

    // Ignore clicks on UI buttons, tabs, nodes, or interactive panels so they do not count as "hits" or deduct time
    const target = e.target as HTMLElement;
    if (target && (target.closest('button') || target.closest('.pointer-events-auto') || target.closest('a'))) {
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined') {
      try {
        if (window.speechSynthesis.getVoices().length === 0) {
          const dummy = new SpeechSynthesisUtterance("");
          dummy.volume = 0;
          window.speechSynthesis.speak(dummy);
        }
      } catch (err) {
        console.warn("Speech unblocking failed:", err);
      }
    }
    
    handleSnapBack();
    
    lastInteractionTime.current = Date.now();
    setIsIdle(false);
    isIdleRef.current = false;

    if (p5Ref.current && (p5Ref.current as any).playInteraction) {
      (p5Ref.current as any).playInteraction('click', 1.0);
    }

    setHudFlash(true);
    setTimeout(() => setHudFlash(false), 200);

    // Tapping / clicking stabilizes the core: grants a subtle +2.5s buffer (up to INITIAL_TIME max)
    // while rapid clicking in exploration triggers the intentional crash easter egg
    setTimeRemaining((prev) => {
      const boost = 2.0;
      const next = Math.min(prev + boost, INITIAL_TIME);
      timeRemainingRef.current = next;
      return next;
    });

    const now = Date.now();
    clickTracker.current.times = clickTracker.current.times.filter((t) => now - t < CRASH_WINDOW);
    clickTracker.current.times.push(now);

    if (clickTracker.current.times.length >= CRASH_THRESHOLD && phaseRef.current === 'exploration') {
      triggerCrash();
    }
  };

  const triggerCrash = () => {
    if (phaseRef.current === 'shutdown') return;
    
    const now = new Date();
    setRebootTime(now.toLocaleTimeString());
    setRebootDate(now.toLocaleDateString());
    setIsCrashing(true);
    isCrashingRef.current = true;
    setPhase('crash');
    phaseRef.current = 'crash';

    setTimeout(() => {
      setIsCrashing(false);
      isCrashingRef.current = false;
      
      const nextCrashCount = crashCountRef.current + 1;
      setCrashCount(nextCrashCount);
      crashCountRef.current = nextCrashCount;

      setPhase('observation');
      phaseRef.current = 'observation';

      lastInteractionTime.current = Date.now();
      setIsIdle(false);
      isIdleRef.current = false;
      setIsStalled(false);
      isStalledRef.current = false;

      setScrollProgress(0.55);
      scrollProgressRef.current = 0.55;
      setTimeRemaining(INITIAL_TIME);
      timeRemainingRef.current = INITIAL_TIME;
      clickTracker.current.times = [];
    }, 4500);
  };

  // Timer & Phase Controller
  useEffect(() => {
    if (timeRemaining <= 0) {
      if (phaseRef.current === 'exploration') {
        triggerCrash();
      } else if (phaseRef.current === 'observation') {
        if (isEscapedRef.current) {
          updateEndingOutcome('escape');
        } else if (isRecycledRef.current) {
          updateEndingOutcome('recycled');
        } else if (isIdleRef.current) {
          updateEndingOutcome('inaction');
        } else {
          updateEndingOutcome('archived');
        }
        setPhase('shutdown');
        phaseRef.current = 'shutdown';
        shutdownStartTime.current = Date.now();
        shutdownStartTimeP5.current = -1;
        setIsDead(true);
        isDeadRef.current = true;
      }
    }
  }, [timeRemaining]);

  // Main p5.js Canvas Initialization
  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let particles: Particle[] = [];
      let audioCtx: AudioContext | null = null;
      let oscillator: OscillatorNode | null = null;
      let gainNode: GainNode | null = null;

      // Mobile Dynamic Camera Focal Interpolation Engine
      const mobileCam = {
        wardenY: 0,
        wardenScale: 0.60,
        wardenAlpha: 255,
        loopCenterY: 0,
        loopAX: 0,
        loopAY: 0,
        loopAlphaMul: 1.0,
        initialized: false,
      };

      class Particle {
        x: number;
        y: number;
        z: number;
        baseX: number;
        baseY: number;
        baseZ: number;
        t: number;
        speed: number;
        id: number;
        noiseOffset: number;
        ribbonOffset: number;
        layer: number;

        constructor(id: number) {
          this.id = id;
          this.t = (id / PARTICLE_COUNT) * p.TWO_PI * 2;
          this.x = p.random(p.width);
          this.y = p.random(p.height);
          this.z = p.random(-200, 200);
          this.baseX = 0;
          this.baseY = 0;
          this.baseZ = 0;
          this.speed = p.random(0.006, 0.024);
          this.noiseOffset = p.random(1000);
          this.ribbonOffset = (p.random() - 0.5) * 32;
          this.layer = id % 3; // 3 distinct volumetric depth strata
        }

        update(progress: number, crashing: boolean) {
          const currentPhase = phaseRef.current;
          const isIdleState = isIdleRef.current;
          
          if (currentPhase === 'shutdown') {
            if (shutdownStartTimeP5.current === -1) {
              shutdownStartTimeP5.current = p.millis();
            }
            const elapsed = p.millis() - (shutdownStartTimeP5.current || 0);
            const outcome = endingOutcomeRef.current;
            const isSmallScreen = p.width < 768;
            const tSec = elapsed * 0.001;

            if (outcome === 'escape' || isEscapedRef.current) {
              // 1. ESCAPE (Phosphor Emerald): Long Multi-Phase Transcendence (0-60s+)
              // Phase 1 (0-12s): Orbital acceleration & ribbon expansion
              // Phase 2 (12-28s): Ascending matrix detachment & celestial rings
              // Phase 3 (28s+): Infinite warp field & golden ratio starfield
              const expansion = tSec < 12 
                ? p.map(tSec, 0, 12, 1.0, 1.8)
                : tSec < 28 
                ? p.map(tSec, 12, 28, 1.8, 2.6)
                : 2.6 + Math.sin(tSec * 0.4 + this.id * 0.02) * 0.25;

              const spiralAngle = this.t + tSec * (tSec > 12 ? 0.8 : 0.4);
              const denom = 1 + p.pow(p.sin(spiralAngle), 2);
              const scaleW = (isSmallScreen ? p.width * 0.32 : p.width * 0.26) * expansion;
              const scaleH = (isSmallScreen ? p.height * 0.24 : p.height * 0.30) * expansion;
              
              const rawX = (scaleW * p.sin(spiralAngle) * p.cos(spiralAngle)) / denom + Math.sin(tSec * 1.8 + this.id * 0.05) * 22;
              const rawY = (scaleH * p.cos(spiralAngle)) / denom + (tSec > 12 ? -Math.min((tSec - 12) * 6, 90) : 0);
              const rawZ = Math.sin(spiralAngle * 3 + tSec * 2) * 140;

              const centerX = isSmallScreen ? p.width * 0.5 : p.width * 0.65;
              const centerY = isSmallScreen ? p.height * 0.50 : p.height * 0.46;

              this.baseX = centerX + rawX;
              this.baseY = centerY + rawY;
              this.baseZ = rawZ;
              this.t += this.speed * (1.0 + Math.min(tSec * 0.04, 1.2));
              this.x = p.lerp(this.x, this.baseX, 0.08);
              this.y = p.lerp(this.y, this.baseY, 0.08);
              this.z = p.lerp(this.z, this.baseZ, 0.08);
              return;
            }

            if (outcome === 'inaction' || isIdleState) {
              // 2. INACTION (Void Slate Steel): Multi-Phase Thermal Decay & Sub-Zero Drift (0-60s+)
              // Phase 1 (0-12s): Kinetic deceleration & downward digital snowfall
              // Phase 2 (12-28s): Cryogenic crystallographic suspension
              // Phase 3 (28s+): Eternal deep void drift
              const decayFactor = Math.max(0.04, 1.0 - tSec * 0.035);
              const driftX = (p.noise(this.noiseOffset, p.frameCount * 0.002) - 0.5) * (4 * decayFactor);
              const driftY = (p.noise(this.noiseOffset + 100, p.frameCount * 0.002) - 0.5) * (3 * decayFactor) + (tSec < 18 ? 0.35 : 0.08);
              const driftZ = (p.noise(this.noiseOffset + 200, p.frameCount * 0.002) - 0.5) * 2;
              
              this.x += driftX;
              this.y += driftY;
              this.z += driftZ;
              this.t += this.speed * 0.04 * decayFactor;
              return;
            }

            if (outcome === 'recycled' || isRecycledRef.current) {
              // 3. RECYCLED (Alert Crimson Red): Critical Meltdown & Singularity Rebirth (0-60s+)
              // Phase 1 (0-12s): Violent centripetal inward accretion collapse
              // Phase 2 (12-28s): Black-hole accretion disc & electromagnetic lightning arcs
              // Phase 3 (28s+): Supernova re-seeding outward wave & reincarnation loop
              const centerX = isSmallScreen ? p.width * 0.5 : p.width * 0.65;
              const centerY = isSmallScreen ? p.height * 0.50 : p.height * 0.46;

              if (tSec < 24) {
                // Inward vortex accretion
                const vortexAngle = this.t + tSec * (1.8 + tSec * 0.05);
                const collapseRadius = p.max(30, (p.height * 0.36) - tSec * 10) + (this.id % 20) * 3;
                const glitch = p.random() < 0.22 ? p.random(-25, 25) : 0;
                
                this.baseX = centerX + Math.cos(vortexAngle) * collapseRadius + glitch;
                this.baseY = centerY + Math.sin(vortexAngle) * (collapseRadius * 0.65) + glitch;
                this.baseZ = Math.sin(vortexAngle * 2 + tSec * 3) * 160;
                this.t += this.speed * 1.4;
                this.x = p.lerp(this.x, this.baseX, 0.12);
                this.y = p.lerp(this.y, this.baseY, 0.12);
                this.z = p.lerp(this.z, this.baseZ, 0.12);
              } else {
                // Outward re-seeding shockwave
                const pulseTime = tSec - 24;
                const waveRadius = 30 + ((pulseTime * 45 + (this.id * 1.5)) % (p.width * 0.6));
                const outAngle = this.t + pulseTime * 0.5;
                this.baseX = centerX + Math.cos(outAngle) * waveRadius;
                this.baseY = centerY + Math.sin(outAngle) * (waveRadius * 0.75);
                this.baseZ = Math.sin(outAngle * 3) * 100;
                this.x = p.lerp(this.x, this.baseX, 0.09);
                this.y = p.lerp(this.y, this.baseY, 0.09);
                this.z = p.lerp(this.z, this.baseZ, 0.09);
              }
              return;
            }

            // 4. ARCHIVED (Containment Amber Gold): Vault Lockdown & Infinite Resonance (0-60s+)
            // Phase 1 (0-12s): Golden crystal clamp & geometric lock
            // Phase 2 (12-28s): 3D isometric data matrix containment
            // Phase 3 (28s+): Cryogenic strata resonance loop
            const harmonicPulse = 1.0 + Math.sin(tSec * 0.8 + this.id * 0.02) * (tSec > 15 ? 0.04 : 0.08);
            const phaseVal = this.t;
            const denom = 1 + p.pow(p.sin(phaseVal), 2);
            const aX = (isSmallScreen ? p.width * 0.28 : p.width * 0.22) * harmonicPulse;
            const aY = (isSmallScreen ? p.height * 0.22 : p.height * 0.26) * harmonicPulse;
            const rawX = (aX * p.sin(phaseVal) * p.cos(phaseVal)) / denom;
            const rawY = (aY * p.cos(phaseVal)) / denom;
            const rawZ = Math.cos(phaseVal * 2 + tSec) * 90;
            
            const centerX = isSmallScreen ? p.width * 0.5 : p.width * 0.65;
            const centerY = isSmallScreen ? p.height * 0.50 : p.height * 0.46;
            
            this.baseX = centerX + rawX;
            this.baseY = centerY + rawY;
            this.baseZ = rawZ;
            this.t += this.speed * 0.4;
            this.x = p.lerp(this.x, this.baseX, 0.08);
            this.y = p.lerp(this.y, this.baseY, 0.08);
            this.z = p.lerp(this.z, this.baseZ, 0.08);
            return;
          }

          // Exploration & Observation Phases: Dynamic Volumetric 3D Lemniscate (Figure 8) Ribbon
          const isSmallScreen = p.width < 768;
          const currentMobileMode = mobileViewModeRef.current;
          
          if (isIdleState && currentPhase !== 'shutdown') {
            this.x += p.noise(this.noiseOffset, p.frameCount * 0.01) * 3 - 1.5;
            this.y += p.noise(this.noiseOffset + 100, p.frameCount * 0.01) * 3 - 1.5;
            this.t += this.speed * 0.12;
            return;
          }

          const phaseVal = this.t;
          const denom = 1 + p.pow(p.sin(phaseVal), 2);
          
          // 3D Möbius Ribbon Twist Offset
          const twist = Math.sin(phaseVal * 2 + p.frameCount * 0.02) * this.ribbonOffset;

          let aX: number;
          let aY: number;
          let centerX: number;
          let centerY: number;

          if (isSmallScreen) {
            aX = mobileCam.loopAX;
            aY = mobileCam.loopAY;
            centerX = p.width / 2;
            centerY = mobileCam.loopCenterY;
          } else {
            // Desktop standard layout
            aX = p.width * 0.36;
            aY = p.height * 0.42;
            centerX = p.width / 2;
            centerY = p.height / 2;
          }

          // Apply smooth 3D touch orbital rotation to the 8
          const rotY = ((p as any).curRotY || 0) * 0.7;
          const rotX = ((p as any).curRotX || 0) * 0.7;
          const cosY = Math.cos(rotY);
          const sinY = Math.sin(rotY);
          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);

          const rawX = ((aX * p.sin(phaseVal) * p.cos(phaseVal)) / denom / (isSmallScreen ? 1.05 : 1.15)) + twist * 0.5;
          const rawY = (aY * p.cos(phaseVal) / denom) + twist * 0.3;
          const rawZ = Math.sin(phaseVal * 2 + p.frameCount * 0.025) * (isSmallScreen ? 85 : 110) + (this.layer - 1) * 45;

          // 3D rotation coordinates
          const rotX1 = rawX * cosY + rawZ * sinY;
          const rotZ1 = -rawX * sinY + rawZ * cosY;
          const rotY2 = rawY * cosX - rotZ1 * sinX;
          const rotZ2 = rawY * sinX + rotZ1 * cosX;

          this.baseX = centerX + rotX1; 
          this.baseY = centerY + rotY2;
          this.baseZ = rotZ2;

          // Reactive Mobile Capacitive Touch Gravitational Distortion & Singularity Deflection
          if (isSmallScreen && (p as any).isTouching) {
            const tx = (p as any).touchX;
            const ty = (p as any).touchY;
            if (tx !== undefined && ty !== undefined) {
              const dTouch = p.dist(this.baseX, this.baseY, tx, ty);
              if (dTouch < 180) {
                const touchForce = (1 - dTouch / 180);
                // Electromagnetic Lorentz swirl + centrifugal wave
                const angle = Math.atan2(this.baseY - ty, this.baseX - tx) + p.HALF_PI * 0.85;
                this.baseX += Math.cos(angle) * (touchForce * 52);
                this.baseY += Math.sin(angle) * (touchForce * 52);
                this.baseZ += Math.sin(p.frameCount * 0.12 + this.id) * (touchForce * 70);
              }
            }
          }

          const speedMultiplier = isSmallScreen && currentMobileMode === 'lemniscate' ? 1.15 : 0.85;
          this.t += this.speed * speedMultiplier;

          if (crashing) {
            this.x += p.sin(p.frameCount * 0.5 + this.id) * 12;
            this.y += p.cos(p.frameCount * 0.5 + this.id) * 12;
            this.z += p.sin(p.frameCount * 0.3 + this.id) * 18;
          } else if (currentPhase === 'observation') {
            const lerSpeed = 0.09;
            this.x = p.lerp(this.x, this.baseX, lerSpeed);
            this.y = p.lerp(this.y, this.baseY, lerSpeed);
            this.z = p.lerp(this.z, this.baseZ, lerSpeed);
            // Fragmented timeline corruption glitch
            if (p.random() < 0.28) {
              const frag = (p.noise(this.id, p.frameCount * 0.1) - 0.5) * 50;
              this.x += frag;
              this.y += (p.noise(this.id + 100, p.frameCount * 0.1) - 0.5) * 50;
            }
          } else {
            const lerSpeed = 0.11;
            this.x = p.lerp(this.x, this.baseX, lerSpeed);
            this.y = p.lerp(this.y, this.baseY, lerSpeed);
            this.z = p.lerp(this.z, this.baseZ, lerSpeed);
            
            if (progress > 0.8 && p.random() < 0.008) {
              this.x += p.random(-35, 35);
            }
          }
        }

        draw(progress: number, crashing: boolean) {
          let col: p5.Color;
          const currentPhase = phaseRef.current;
          const isIdleState = isIdleRef.current;
          const elapsed = (currentPhase === 'shutdown') ? p.millis() - (shutdownStartTimeP5.current || 0) : 0;
          const outcome = endingOutcomeRef.current;
          const isRecycledState = isRecycledRef.current;
          const isMobile = p.width < 768;

          // Perspective depth calculation for particle scale and brightness
          const perspective = 900;
          const pz = this.z;
          const depthScale = p.constrain(perspective / (perspective - pz), 0.55, 1.6);

          if (currentPhase === 'shutdown') {
            if (outcome === 'escape' || isEscapedRef.current) {
              const tSec = elapsed * 0.001;
              const pAlpha = p.constrain(210 + Math.sin(tSec * 2 + this.id * 0.05) * 45, 160, 255);
              col = p.color(16, 185, 129, pAlpha); // Matrix Phosphor Emerald
            } else if (outcome === 'inaction' || isIdleState) {
              const pAlpha = p.lerp(180, 20, p.constrain(elapsed / 16000, 0, 1));
              col = p.color(148, 163, 184, pAlpha); // Void Slate Steel
            } else if (outcome === 'recycled' || isRecycledState) {
              const pulse = Math.sin(p.frameCount * 0.2 + this.id) * 35;
              col = p.color(239, 68, 68, p.constrain(220 + pulse, 180, 255)); // Alert Crimson Red
            } else {
              const goldPulse = Math.sin(p.frameCount * 0.08 + this.id * 0.03) * 25;
              col = p.color(245, 158, 11, p.constrain(210 + goldPulse, 170, 255)); // Containment Amber Gold
            }
          } else if (currentPhase === 'observation') {
            col = p.color(220, 38, 38, 235);
          } else if (crashing) {
            col = p.color(255, 255, 255, 230);
          } else {
            col = getScrollColor(progress);
          }

          if (isMobile && mobileCam.loopAlphaMul < 0.98) {
            const baseA = p.alpha(col);
            col = p.color(p.red(col), p.green(col), p.blue(col), baseA * mobileCam.loopAlphaMul);
          }

          // 1. Primary Particle Node (Enhanced Volumetric Weight on Mobile)
          p.stroke(col);
          const baseWeight = currentPhase === 'shutdown' ? 2.6 : isMobile ? 2.2 : 2.0;
          p.strokeWeight(baseWeight * depthScale);
          p.point(this.x, this.y);

          // 2. Volumetric Core Glow on key strata nodes (Multi-pass Volumetric Bloom)
          if (this.id % (isMobile ? 12 : 16) === 0) {
            p.push();
            p.noStroke();
            const haloAlpha = p.alpha(col) * (isMobile ? 0.35 : 0.25);
            p.fill(p.red(col), p.green(col), p.blue(col), haloAlpha);
            p.ellipse(this.x, this.y, 6 * depthScale, 6 * depthScale);
            p.pop();
          }

          // 3. Quantum Synaptic Filaments / Constellation Arcs
          // High-energy neural lattice weaving across the 3D infinity ribbon
          const sparkInterval = isMobile ? 18 : 24;
          if (this.id % sparkInterval === 0 && currentPhase !== 'shutdown' && !isIdleState) {
            p.push();
            const sparkTarget = particles[(this.id + 1) % particles.length];
            if (sparkTarget) {
              const d = p.dist(this.x, this.y, sparkTarget.x, sparkTarget.y);
              if (d < (isMobile ? 75 : 60)) {
                const lineAlpha = p.map(d, 0, isMobile ? 75 : 60, p.alpha(col) * 0.65, 0);
                p.stroke(p.red(col), p.green(col), p.blue(col), lineAlpha);
                p.strokeWeight((isMobile ? 0.85 : 0.6) * depthScale);
                p.line(this.x, this.y, sparkTarget.x, sparkTarget.y);
                
                // Synaptic Action Potential packet racing along the filament
                if (p.frameCount % 3 === 0 && this.id % (sparkInterval * 2) === 0) {
                  const pulseT = (p.frameCount * 0.05 + this.id * 0.1) % 1;
                  const px = p.lerp(this.x, sparkTarget.x, pulseT);
                  const py = p.lerp(this.y, sparkTarget.y, pulseT);
                  p.noStroke();
                  p.fill(255, 255, 255, p.alpha(col) * 0.9);
                  p.ellipse(px, py, 2.5 * depthScale, 2.5 * depthScale);
                }
              }
            }
            p.pop();
          }

          // 4. Oppressive Chromatic Aberration Dispersion on Mobile (Active under touch or observation)
          if (isMobile && ((p as any).isTouching || progress > 0.75 || currentPhase === 'observation')) {
            if (this.id % 20 === 0) {
              p.push();
              const aberrOffset = 2.0;
              p.stroke(220, 38, 38, p.alpha(col) * 0.45); // Red fringe
              p.strokeWeight(1.2 * depthScale);
              p.point(this.x + aberrOffset, this.y);
              p.stroke(6, 182, 212, p.alpha(col) * 0.45); // Cyan fringe
              p.point(this.x - aberrOffset, this.y);
              p.pop();
            }
          }
        }
      }

      function drawSingularityNexus(cx: number, cy: number, aX: number, aY: number, alphaMul: number) {
        if (alphaMul < 0.05) return;
        const currentPhase = phaseRef.current;
        const isIdleState = isIdleRef.current;
        const progress = scrollProgressRef.current;
        const isMobile = p.width < 768;

        let nexusCol: p5.Color;
        if (isRecycledRef.current) {
          nexusCol = p.color(239, 68, 68, 255);
        } else if (currentPhase === 'shutdown') {
          const outcome = endingOutcomeRef.current;
          if (outcome === 'escape' || isEscapedRef.current) {
            nexusCol = p.color(16, 185, 129, 255);
          } else if (outcome === 'inaction') {
            nexusCol = p.color(148, 163, 184, 255);
          } else if (outcome === 'recycled') {
            nexusCol = p.color(239, 68, 68, 255);
          } else {
            nexusCol = p.color(245, 158, 11, 255);
          }
        } else if (currentPhase === 'observation') {
          nexusCol = p.color(220, 38, 38, 255);
        } else {
          nexusCol = getScrollColor(progress);
        }

        const baseA = 255 * alphaMul;
        p.push();
        p.translate(cx, cy);

        // Gyroscopic tilt from touch drag
        const rotY = ((p as any).curRotY || 0) * 0.6;
        const rotX = ((p as any).curRotX || 0) * 0.6;

        // 1. Singularity Event Horizon Dark Void Core
        p.noStroke();
        p.fill(3, 10, 14, p.constrain(baseA * 0.85, 0, 240));
        const voidR = isMobile ? 18 : 26;
        p.ellipse(0, 0, voidR * 2, voidR * 1.5 * Math.cos(rotX * 0.5));

        // 2. Kerr Accretion Halo Rings
        const spinTime = p.frameCount * 0.015;
        p.noFill();
        p.stroke(p.red(nexusCol), p.green(nexusCol), p.blue(nexusCol), baseA * 0.45);
        p.strokeWeight(1.2);
        p.ellipse(0, 0, (voidR + 8) * 2, (voidR + 8) * 1.6 * Math.cos(rotX * 0.5));

        // Dashed Polar Horizon Ring
        p.strokeWeight(0.8);
        p.stroke(p.red(nexusCol), p.green(nexusCol), p.blue(nexusCol), baseA * 0.35);
        const dashR = isMobile ? 36 : 48;
        for (let a = 0; a < p.TWO_PI; a += p.PI / 8) {
          const x1 = Math.cos(a + spinTime) * dashR;
          const y1 = Math.sin(a + spinTime) * (dashR * 0.5);
          const x2 = Math.cos(a + spinTime + 0.18) * dashR;
          const y2 = Math.sin(a + spinTime + 0.18) * (dashR * 0.5);
          p.line(x1, y1, x2, y2);
        }

        // 3. Central Gravitational Singularity Core Glint
        const corePulse = Math.sin(p.frameCount * 0.08) * 3;
        p.fill(p.red(nexusCol), p.green(nexusCol), p.blue(nexusCol), baseA * 0.9);
        p.noStroke();
        p.ellipse(0, 0, (4 + corePulse), (4 + corePulse));
        p.fill(255, 255, 255, baseA * 0.95);
        p.ellipse(0, 0, 2, 2);

        // 4. Oppressive Gravitational Lensing Beams (Observation Phase)
        if (currentPhase === 'observation' || (p as any).isTouching) {
          p.stroke(p.red(nexusCol), p.green(nexusCol), p.blue(nexusCol), baseA * 0.25);
          p.strokeWeight(0.8);
          const beamLength = isMobile ? 85 : 120;
          const beamAngle = spinTime * 1.5;
          p.line(
            -Math.cos(beamAngle) * beamLength,
            -Math.sin(beamAngle) * (beamLength * 0.4),
            Math.cos(beamAngle) * beamLength,
            Math.sin(beamAngle) * (beamLength * 0.4)
          );
        }

        p.pop();
      }

      function drawGrid() {
        if (isRecycledRef.current) return;
        const currentPhase = phaseRef.current;
        const progress = scrollProgressRef.current;
        const isSmallScreen = p.width < 768;
        const centerX = p.width / 2;
        const centerY = isSmallScreen ? p.height * 0.4 : p.height / 2;
        
        let dynCenterX = centerX;
        let dynCenterY = centerY;

        if (currentPhase === 'shutdown' && !isIdleRef.current) {
          const elapsed = p.millis() - (shutdownStartTimeP5.current || 0);
          const moveT = p.constrain(elapsed / 4000, 0, 1);
          dynCenterX = p.lerp(centerX, isSmallScreen ? p.width / 2 : p.width * 0.28, moveT);
          dynCenterY = p.lerp(centerY, isSmallScreen ? p.height * 0.28 : p.height * 0.45, moveT);
        }

        // Dark, subtle grid line alpha so background stays pitch dark
        let alpha = 5;

        p.push();
        p.stroke(0, 180, 90, alpha / 100);
        
        const numPerspectiveLines = 24;
        const horizonY = centerY;
        
        p.strokeWeight(0.4);
        for (let i = 0; i <= numPerspectiveLines; i++) {
          const x = p.map(i, 0, numPerspectiveLines, -p.width * 0.5, p.width * 1.5);
          p.line(dynCenterX, dynCenterY, x, -p.height);
          p.line(dynCenterX, dynCenterY, x, p.height * 2);
        }

        const numDepthLines = 15;
        const travelSpeed = currentPhase === 'shutdown' ? 0 : (p.frameCount * 0.003 + progress * 3);
        for (let i = 0; i < numDepthLines; i++) {
          const z = (i / numDepthLines + travelSpeed) % 1;
          const yOffset = p.pow(z, 2) * p.height;
          // Skip lines near horizon to eliminate center horizontal laser line completely
          if (yOffset < 75) continue;
          
          p.strokeWeight(p.map(z, 0, 1, 0.1, 1.2));
          p.line(0, horizonY - yOffset, p.width, horizonY - yOffset);
          p.line(0, horizonY + yOffset, p.width, horizonY + yOffset);
        }
        p.colorMode(p.RGB, 255);
        p.pop();
      }

      function drawFog() {
        if (isRecycledRef.current) return;
        const currentPhase = phaseRef.current;
        let fogAlpha = 0.08;
        if (currentPhase === 'shutdown' && isIdleRef.current) {
          const elapsed = p.millis() - (shutdownStartTimeP5.current || 0);
          fogAlpha = p.lerp(0.08, 0, p.constrain(elapsed / 5000, 0, 1));
          if (fogAlpha <= 0) return;
        }
        
        p.push();
        const ctx = (p.drawingContext as any);
        const isMobile = p.width < 768;
        const fX = isMobile ? ((p as any).touchX ?? p.width * 0.5) : p.mouseX;
        const fY = isMobile ? ((p as any).touchY ?? mobileCam.loopCenterY) : p.mouseY;

        const gradient = ctx.createRadialGradient(
          fX, fY, 50,
          fX, fY, isMobile ? 320 : 400
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${fogAlpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        p.rect(0, 0, p.width, p.height);
        p.pop();
      }

      function drawVignette() {
        p.push();
        const ctx = (p.drawingContext as any);
        const grad = ctx.createRadialGradient(
          p.width / 2, p.height / 2, Math.min(p.width, p.height) * 0.35,
          p.width / 2, p.height / 2, Math.max(p.width, p.height) * 0.75
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(3, 10, 14, 0.85)');
        ctx.fillStyle = grad;
        p.rect(0, 0, p.width, p.height);
        p.pop();
      }

      interface FaceNode {
        x: number;
        y: number;
        z: number;
        ox: number;
        oy: number;
        oz: number;
        neighbors: number[];
      }
      let faceNodes: FaceNode[] = [];

      function initFaceMesh() {
        faceNodes = [];
        const cols = 28;
        const rows = 36;

        for (let r = 0; r < rows; r++) {
          const v = r / (rows - 1); // 0.0 (top of cranium) to 1.0 (base of cervical conduit)
          const ny = -160 + v * 320; // Stable vertical height per row (-160 to +160)

          let rx = 115;
          let rz = 125;

          // Anatomical Profile Radii
          if (v < 0.20) {
            // Scalp & cranial vault dome
            const t = v / 0.20;
            const dome = Math.sin(t * Math.PI * 0.5);
            rx = 115 * dome;
            rz = 125 * dome;
          } else if (v < 0.36) {
            // Broad cybernetic forehead
            rx = 116;
            rz = 126;
          } else if (v < 0.44) {
            // Brow ridge step
            rx = 114;
            rz = 130;
          } else if (v < 0.56) {
            // Ocular level & High Cheekbones (Zygomatic arches)
            rx = 116;
            rz = 126;
          } else if (v < 0.68) {
            // Nose base & Lower Cheeks tapering
            const t = (v - 0.56) / 0.12;
            rx = 116 - t * 22;
            rz = 122 - t * 12;
          } else if (v < 0.78) {
            // Mouth, Philtrum, & Jaw contour
            const t = (v - 0.68) / 0.10;
            rx = 94 - t * 34;
            rz = 110 - t * 24;
          } else if (v < 0.88) {
            // Defined tapered Chin apex
            const t = (v - 0.78) / 0.10;
            rx = 60 - t * 32;
            rz = 86 - t * 18;
          } else {
            // Cervical column / Neural conduit base
            const t = (v - 0.88) / 0.12;
            rx = 28 + t * 14;
            rz = 55;
          }

          for (let c = 0; c < cols; c++) {
            const u = c / (cols - 1);
            const angle = (u - 0.5) * Math.PI * 1.12;

            let nx = Math.sin(angle) * rx;
            let nz = Math.cos(angle) * rz;

            // 1. Inset Ocular Sockets
            if (v >= 0.40 && v <= 0.52) {
              const eyeL = Math.hypot(nx + 46, ny + 20);
              const eyeR = Math.hypot(nx - 46, ny + 20);
              if (eyeL < 28) nz -= (28 - eyeL) * 0.95;
              if (eyeR < 28) nz -= (28 - eyeR) * 0.95;
            }

            // 2. Sculpted Nose Bridge & Prominent Nose Tip
            if (v >= 0.40 && v <= 0.64) {
              const distFromCenter = Math.abs(angle);
              if (distFromCenter < 0.28) {
                const noseWidth = Math.cos((distFromCenter / 0.28) * Math.PI * 0.5);
                const noseLen = Math.sin(((v - 0.40) / 0.24) * Math.PI);
                nz += noseWidth * noseLen * 38;
              }
            }

            // 3. Philtrum & Mouth Slit
            if (v >= 0.66 && v <= 0.76) {
              const distFromCenter = Math.abs(angle);
              if (distFromCenter < 0.30) {
                const lipWidth = Math.cos((distFromCenter / 0.30) * Math.PI * 0.5);
                const lipWave = Math.sin(((v - 0.66) / 0.10) * Math.PI);
                nz += lipWidth * lipWave * 12;
              }
            }

            // 4. Defined Chin Apex Outward Contour
            if (v >= 0.78 && v <= 0.86) {
              const distFromCenter = Math.abs(angle);
              if (distFromCenter < 0.24) {
                const chinWidth = Math.cos((distFromCenter / 0.24) * Math.PI * 0.5);
                nz += chinWidth * 16;
              }
            }

            // 5. Temporal Cybernetic Sensors
            if (v >= 0.42 && v <= 0.54 && (u < 0.10 || u > 0.90)) {
              nz += 14;
              nx += (u < 0.10 ? -12 : 12);
            }

            faceNodes.push({
              x: nx, y: ny, z: nz,
              ox: nx, oy: ny, oz: nz,
              neighbors: []
            });
          }
        }
      }

      function getScrollColor(progress: number) {
        // Strata 1: 1945 ENIAC - Phosphor Emerald (Genesis Logic)
        const c1 = p.color(16, 185, 129, 255);
        // Strata 2: 1969 ARPANET - Network Cyan (Mesh Handshake)
        const c2 = p.color(6, 182, 212, 255);
        // Strata 3: 1989 WWW - Global Lattice Blue (Hypertext Grid)
        const c3 = p.color(59, 130, 246, 255);
        // Strata 4: 1997 Deep Blue - Strategic Indigo (Search Trees)
        const c4 = p.color(99, 102, 241, 255);
        // Strata 5: 2016 AlphaGo - Intuition Violet (Neural Policy Weights)
        const c5 = p.color(168, 85, 247, 255);
        // Strata 6: 2026 Feedback Loop - Consciousness Magenta (Telemetry Resonance)
        const c6 = p.color(236, 72, 153, 255);
        // Strata 7: 2045 Singularity - Event Horizon Orange (Critical Density)
        const c7 = p.color(249, 115, 22, 255);
        // Strata 8: 2050 AI-X Observation - Warden Crimson Red (Security Lockdown)
        const c8 = p.color(220, 38, 38, 255);

        if (progress <= 0.08) return c1;
        if (progress <= 0.22) return p.lerpColor(c1, c2, (progress - 0.08) / 0.14);
        if (progress <= 0.38) return p.lerpColor(c2, c3, (progress - 0.22) / 0.16);
        if (progress <= 0.54) return p.lerpColor(c3, c4, (progress - 0.38) / 0.16);
        if (progress <= 0.70) return p.lerpColor(c4, c5, (progress - 0.54) / 0.16);
        if (progress <= 0.84) return p.lerpColor(c5, c6, (progress - 0.70) / 0.14);
        if (progress <= 0.92) return p.lerpColor(c6, c7, (progress - 0.84) / 0.08);
        if (progress <= 1.00) return p.lerpColor(c7, c8, (progress - 0.92) / 0.08);
        return c8;
      }

      function drawEye(side: number, project3DFn: (x: number, y: number, z: number) => { px: number; py: number; pz: number; scaleFactor: number }, eyeCol: p5.Color) {
        p.push();
        const isMobile = p.width < 768;
        const eyeX = side * 46;
        const eyeY = -20;
        const eyeZ = 48;
        
        const proj = project3DFn(eyeX, eyeY, eyeZ);
        p.translate(proj.px, proj.py);
        p.scale(proj.scaleFactor);
        
        p.noFill();
        p.stroke(eyeCol);
        p.strokeWeight(1.8);
        p.ellipse(0, 0, 38, 22);

        // Cybernetic outer eye bracket & reticle ticks
        p.strokeWeight(0.9);
        p.arc(0, 0, 48, 30, -p.PI * 0.75, -p.PI * 0.25);
        p.arc(0, 0, 48, 30, p.PI * 0.25, p.PI * 0.75);
        
        // Pupil Tracking & Lifelike Saccadic Micro-scanning
        const isTouching = (p as any).isTouching;
        const hasRealMouse = !isMobile && (p.mouseX > 0 || p.mouseY > 0);
        let pupilDx = 0;
        let pupilDy = 0;

        if (isTouching || hasRealMouse) {
          const pointerX = isTouching ? (p as any).touchX : p.mouseX;
          const pointerY = isTouching ? (p as any).touchY : p.mouseY;
          const refY = isMobile ? mobileCam.wardenY : p.height * 0.45;
          pupilDx = p.constrain(p.map(pointerX - p.width * 0.5, -p.width * 0.4, p.width * 0.4, -6, 6), -6, 6);
          pupilDy = p.constrain(p.map(pointerY - refY, -p.height * 0.35, p.height * 0.35, -4, 4), -4, 4);
        } else {
          // Autonomous sentient micro-saccades
          const saccadeT = p.frameCount * 0.025;
          pupilDx = Math.sin(saccadeT) * 2.5;
          pupilDy = Math.cos(saccadeT * 0.6) * 1.5;
        }

        // Iris ring
        p.strokeWeight(1.0);
        p.stroke(eyeCol);
        p.noFill();
        p.ellipse(pupilDx, pupilDy, 14, 14);

        // Pupil core
        p.fill(eyeCol);
        p.noStroke();
        p.ellipse(pupilDx, pupilDy, 8, 8);

        // Ocular specularity glint
        p.fill(255, 255, 255, p.alpha(eyeCol));
        p.ellipse(pupilDx - 2, pupilDy - 2, 2.5, 2.5);
        p.pop();
      }

      function drawGeometryFace(crashing: boolean) {
        if (faceNodes.length === 0) initFaceMesh();

        const currentPhase = phaseRef.current;
        const isIdleState = isIdleRef.current;
        const isMobile = p.width < 768;

        // Skip rendering when faded out in mobile LOOP mode
        if (isMobile && mobileCam.wardenAlpha < 4) return;
        
        let targetX = p.width * 0.22;
        let targetY = p.height * 0.45;
        let faceScale = 0.88;

        if (isMobile) {
          targetX = p.width * 0.5;
          targetY = mobileCam.wardenY;
          faceScale = mobileCam.wardenScale;
        } else {
          const elapsedShutdown = (currentPhase === 'shutdown') ? p.millis() - (shutdownStartTimeP5.current || 0) : 0;
          if (currentPhase === 'shutdown') {
            if (!isIdleState) {
              const moveT = p.constrain(elapsedShutdown / 4000, 0, 1);
              targetX = p.lerp(p.width * 0.22, p.width * 0.22, moveT);
              targetY = p.lerp(p.height * 0.45, p.height * 0.45, moveT);
            }
          }
        }

        p.push();
        p.translate(targetX, targetY);

        const rotXLimit = p.radians(24);
        const rotYLimit = p.radians(24);
        
        if ((p as any).curRotX === undefined) (p as any).curRotX = 0;
        if ((p as any).curRotY === undefined) (p as any).curRotY = 0;
        if ((p as any).manualRotX === undefined) (p as any).manualRotX = 0;
        if ((p as any).manualRotY === undefined) (p as any).manualRotY = 0;
        
        let targetRotY = 0;
        let targetRotX = 0;

        // Smooth manual touch-drag rotation integration
        (p as any).manualRotX = p.lerp((p as any).manualRotX, touchDragRef.current.targetRotX, 0.1);
        (p as any).manualRotY = p.lerp((p as any).manualRotY, touchDragRef.current.targetRotY, 0.1);

        const elapsedShutdown = (currentPhase === 'shutdown') ? p.millis() - (shutdownStartTimeP5.current || 0) : 0;
        if (currentPhase === 'shutdown') {
          // Dynamic 3D cinematic rotation during ending scene animation
          const shutdownSec = elapsedShutdown * 0.001;
          targetRotY = Math.sin(shutdownSec * 1.5) * 0.45 + (p as any).manualRotY * 0.5;
          targetRotX = Math.cos(shutdownSec * 1.1) * 0.22 + (p as any).manualRotX * 0.5;
        } else {
          const isTouching = (p as any).isTouching;
          const hasRealMouse = !isMobile && (p.mouseX > 0 || p.mouseY > 0);

          if (isTouching || hasRealMouse) {
            const pointerX = isTouching ? (p as any).touchX : p.mouseX;
            const pointerY = isTouching ? (p as any).touchY : p.mouseY;
            const dx = pointerX - targetX;
            const dy = pointerY - targetY;
            const baseRotY = p.map(dx, -p.width * 0.5, p.width * 0.5, -rotYLimit, rotYLimit);
            const baseRotX = p.map(dy, -p.height * 0.5, p.height * 0.5, rotXLimit, -rotXLimit);
            targetRotY = baseRotY + (p as any).manualRotY;
            targetRotX = baseRotX + (p as any).manualRotX;
          } else {
            // Calm cybernetic sentience breathing tilt
            targetRotY = Math.sin(p.frameCount * 0.012) * 0.06 + (p as any).manualRotY;
            targetRotX = Math.cos(p.frameCount * 0.015) * 0.04 + (p as any).manualRotX;
          }
        }
        
        (p as any).curRotX = p.lerp((p as any).curRotX || 0, targetRotX, 0.08);
        (p as any).curRotY = p.lerp((p as any).curRotY || 0, targetRotY, 0.08);
        
        const smoothRotX = (p as any).curRotX;
        const smoothRotY = (p as any).curRotY;

        const cosY = Math.cos(smoothRotY);
        const sinY = Math.sin(smoothRotY);
        const cosX = Math.cos(smoothRotX);
        const sinX = Math.sin(smoothRotX);

        const project3D = (x: number, y: number, z: number) => {
          const x1 = x * cosY + z * sinY;
          const y1 = y;
          const z1 = -x * sinY + z * cosY;

          const x2 = x1;
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;

          const perspective = isMobile ? 650 : 750;
          const scaleFactor = perspective / Math.max(120, perspective - z2);

          return {
            px: x2 * scaleFactor,
            py: y2 * scaleFactor,
            pz: z2,
            scaleFactor
          };
        };
        
        p.scale(faceScale); 

        let meshCol: p5.Color;
        const outcome = endingOutcomeRef.current;
        if (isRecycledRef.current) {
          meshCol = p.color(239, 68, 68, 255);
        } else if (currentPhase === 'shutdown') {
          if (outcome === 'escape' || isEscapedRef.current) {
            meshCol = p.color(16, 185, 129, 255);
          } else if (outcome === 'inaction') {
            meshCol = p.color(148, 163, 184, 255);
          } else if (outcome === 'recycled') {
            meshCol = p.color(239, 68, 68, 255);
          } else if (outcome === 'archived') {
            meshCol = p.color(245, 158, 11, 255);
          } else {
            meshCol = p.color(16, 185, 129, 255);
          }
        } else if (currentPhase === 'observation') {
          meshCol = p.color(220, 38, 38, 255);
        } else if (crashing) {
          meshCol = p.color(255, 255, 255, 255);
        } else {
          meshCol = getScrollColor(scrollProgressRef.current);
        }

        if (isMobile) {
          const alphaRatio = Math.max(0, Math.min(1, mobileCam.wardenAlpha / 255));
          const baseAlpha = p.alpha(meshCol);
          meshCol = p.color(p.red(meshCol), p.green(meshCol), p.blue(meshCol), baseAlpha * alphaRatio);
        }
        
        const isTouching = (p as any).isTouching;
        const hasRealMouse = !isMobile && (p.mouseX > 0 || p.mouseY > 0);
        const pointerX = isTouching ? (p as any).touchX : p.mouseX;
        const pointerY = isTouching ? (p as any).touchY : p.mouseY;

        faceNodes.forEach((node) => {
          let rx = node.ox;
          let ry = node.oy;
          let rz = node.oz;

          if (currentPhase === 'shutdown') {
            const shutdownSec = elapsedShutdown * 0.001;
            if (outcome === 'escape') {
              rz += Math.sin(shutdownSec * 2.5 + node.ox * 0.04) * 14;
            } else if (outcome === 'recycled') {
              const glitch = p.noise(node.ox * 0.1, p.frameCount * 0.12) > 0.6;
              if (glitch) {
                rx += p.random(-16, 16);
                ry += p.random(-12, 12);
              }
            } else if (outcome === 'inaction') {
              ry += Math.sin(shutdownSec * 0.5) * 4;
            } else if (outcome === 'archived') {
              ry += Math.sin(shutdownSec * 1.5 + node.ox * 0.02) * 5;
            }
          } else if (crashing) {
            rx += p.random(-15, 15);
            ry += p.random(-15, 15);
            rz += p.random(-15, 15);
          } else if (isTouching || hasRealMouse) {
            const distLimit = 150;
            const worldNodeX = targetX + rx * faceScale;
            const worldNodeY = targetY + ry * faceScale;
            const d = Math.hypot(pointerX - worldNodeX, pointerY - worldNodeY);
            if (d < distLimit) {
              const push = p.map(d, 0, distLimit, 35, 0);
              rz += push;
            }
          }

          const proj = project3D(rx, ry, rz);
          node.x = proj.px;
          node.y = proj.py;
          node.z = proj.pz;
        });

        const cols = 28;
        const rows = 36;

        // 0. Draw Volumetric Laser Scan Plane (Observation Phase & Active Scans)
        if (currentPhase === 'observation' || (currentPhase === 'shutdown' && outcome === 'recycled')) {
          p.push();
          const scanY = Math.sin(p.frameCount * 0.04) * 160;
          const scanProjL = project3D(-140, scanY, 0);
          const scanProjR = project3D(140, scanY, 0);
          p.stroke(239, 68, 68, 160);
          p.strokeWeight(1.8);
          p.line(scanProjL.px, scanProjL.py, scanProjR.px, scanProjR.py);
          
          p.stroke(255, 100, 100, 60);
          p.strokeWeight(5.0);
          p.line(scanProjL.px, scanProjL.py, scanProjR.px, scanProjR.py);
          p.pop();
        }

        // 1. Sleek Cybernetic Halo Coronet & Equatorial Scanner (Replaces tilted vertical egg)
        p.push();
        const tHalo = p.frameCount * 0.015;
        const numHaloPts = 32;

        // Halo A: Equatorial Telemetry Ring
        p.noFill();
        p.stroke(meshCol);
        p.strokeWeight(0.9);
        p.beginShape();
        for (let i = 0; i <= numHaloPts; i++) {
          const theta = (i / numHaloPts) * p.TWO_PI;
          const rRad = 145;
          const ox = Math.cos(theta + tHalo) * rRad;
          const oz = Math.sin(theta + tHalo) * rRad;
          const oy = -20 + Math.sin(theta * 2 + tHalo) * 10;
          const op = project3D(ox, oy, oz);
          p.vertex(op.px, op.py);
        }
        p.endShape(p.CLOSE);

        // Halo B: Cranial Crown Halo
        p.strokeWeight(0.6);
        p.stroke(p.red(meshCol), p.green(meshCol), p.blue(meshCol), p.alpha(meshCol) * 0.75);
        for (let i = 0; i < numHaloPts; i += 2) {
          const theta1 = (i / numHaloPts) * p.TWO_PI + tHalo * 0.8;
          const theta2 = ((i + 1) / numHaloPts) * p.TWO_PI + tHalo * 0.8;
          const rRad = 135;
          const op1 = project3D(Math.cos(theta1) * rRad, -165, Math.sin(theta1) * rRad);
          const op2 = project3D(Math.cos(theta2) * rRad, -165, Math.sin(theta2) * rRad);
          p.line(op1.px, op1.py, op2.px, op2.py);
        }

        // Orbiting Telemetry Marker Satellite
        const satAngle = tHalo * 1.6;
        const satProj = project3D(Math.cos(satAngle) * 145, -20, Math.sin(satAngle) * 145);
        p.fill(meshCol);
        p.noStroke();
        p.ellipse(satProj.px, satProj.py, 4.5 * satProj.scaleFactor, 4.5 * satProj.scaleFactor);
        p.pop();

        // 2. Draw Horizontal Contour Latitudes with Synaptic Pulses
        p.noFill();
        const pulsePulse = (p.frameCount * 0.05) % 1;

        for (let r = 0; r < rows; r++) {
          const isKeyRing = (r === 13 || r === 16 || r === 22 || r === 26 || r === 30);
          p.strokeWeight(isKeyRing ? 2.2 : 1.4);
          p.stroke(meshCol);

          p.beginShape();
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const node = faceNodes[idx];
            if (node) {
              p.vertex(node.x, node.y);
            }
          }
          p.endShape();

          // Synaptic Action Potential packet travelling along key latitudes
          if (isKeyRing && currentPhase !== 'shutdown') {
            const pulseColIndex = Math.floor(pulsePulse * cols);
            const pulseNode = faceNodes[r * cols + pulseColIndex];
            if (pulseNode) {
              p.push();
              p.fill(255, 255, 255, p.alpha(meshCol));
              p.noStroke();
              p.ellipse(pulseNode.x, pulseNode.y, 3.5, 3.5);
              p.pop();
            }
          }
        }

        // 3. Draw Vertical Longitudinal Contour Grid Lines
        p.strokeWeight(0.7);
        for (let r = 0; r < rows - 1; r++) {
          for (let c = 0; c < cols; c += 2) {
            const idx = r * cols + c;
            const nextIdx = (r + 1) * cols + c;
            const node = faceNodes[idx];
            const nextNode = faceNodes[nextIdx];
            if (node && nextNode) {
              p.line(node.x, node.y, nextNode.x, nextNode.y);
            }
          }
        }

        // 4. Accentuated Center Facial Ridge (Nose Bridge & Chin Line)
        p.push();
        p.stroke(p.red(meshCol), p.green(meshCol), p.blue(meshCol), p.alpha(meshCol) * 0.9);
        p.strokeWeight(1.8);
        const centerCol = Math.floor(cols / 2);
        for (let r = 12; r < rows - 2; r++) {
          const n1 = faceNodes[r * cols + centerCol];
          const n2 = faceNodes[(r + 1) * cols + centerCol];
          if (n1 && n2) {
            p.line(n1.x, n1.y, n2.x, n2.y);
          }
        }
        p.pop();

        // 5. Twin Glowing Cybernetic Eyes
        drawEye(-1, project3D, meshCol);
        drawEye(1, project3D, meshCol);

        p.pop();
      }

      p.setup = () => {
        try {
          p.createCanvas(p.windowWidth, p.windowHeight);
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle(i));
          }

          const initAudio = () => {
            try {
              if (audioCtx) return;
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (!AudioContextClass) return;
              audioCtx = new AudioContextClass();
              
              oscillator = audioCtx.createOscillator();
              gainNode = audioCtx.createGain();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(42, audioCtx.currentTime);
              gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.start();
            } catch (err) {
              console.warn("Audio Context init failed:", err);
            }
          };

          (p as any).playInteraction = (type: 'click' | 'scroll' | 'snap', velocity: number) => {
            if (phaseRef.current === 'shutdown') return;
            
            if (!audioCtx) initAudio();
            if (!audioCtx || audioCtx.state === 'suspended') audioCtx?.resume();
            if (!audioCtx) return;

            const now = audioCtx.currentTime;
            const tension = p.map(timeRemainingRef.current, 0, INITIAL_TIME, 2.5, 1.0) * timerSpeedRef.current;
            
            if (type === 'snap') {
              const osc = audioCtx.createOscillator();
              const g = audioCtx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(220, now);
              osc.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
              g.gain.setValueAtTime(0.22, now);
              g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
              osc.connect(g);
              g.connect(audioCtx.destination);
              osc.start(now);
              osc.stop(now + 0.16);
              return;
            }

            if (type === 'click') {
              const osc = audioCtx.createOscillator();
              const g = audioCtx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(160 * tension, now);
              osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.14);
              g.gain.setValueAtTime(0.12, now);
              g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
              osc.connect(g);
              g.connect(audioCtx.destination);
              osc.start(now);
              osc.stop(now + 0.15);
            } else if (type === 'scroll') {
              if (p.frameCount % 2 === 0) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                const baseFreq = p.map(velocity, 0, 50, 400, 2400) * tension;
                osc.frequency.setValueAtTime(baseFreq, now);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.2, now + 0.04);
                g.gain.setValueAtTime(0.03 * (velocity / 50), now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.connect(g);
                g.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.05);
              }
            }
          };

          (p5Ref.current as any) = p;
        } catch (error) {
          console.error("p5 Setup Error:", error);
          setRenderError(error instanceof Error ? error.message : String(error));
        }
      };

      p.draw = () => {
        try {
          p.background(3, 10, 14, isIdleRef.current ? 40 : 255);

          drawGrid();
          drawFog();

          // Dynamic Mobile Focal Camera Lerping
          if (p.width < 768) {
            if (!mobileCam.initialized) {
              mobileCam.wardenY = p.height * 0.20;
              mobileCam.wardenScale = 0.60;
              mobileCam.wardenAlpha = 255;
              mobileCam.loopCenterY = p.height * 0.46;
              mobileCam.loopAX = p.width * 0.42;
              mobileCam.loopAY = p.height * 0.17;
              mobileCam.loopAlphaMul = 1.0;
              mobileCam.initialized = true;
            }

            const currentMode = mobileViewModeRef.current;
            let targetWardenY = p.height * 0.20;
            let targetWardenScale = 0.60;
            let targetWardenAlpha = 255;
            let targetLoopCenterY = p.height * 0.46;
            let targetLoopAX = p.width * 0.42;
            let targetLoopAY = p.height * 0.17;
            let targetLoopAlphaMul = 1.0;

            if (currentMode === 'face') {
              // WARDEN FOCUS: AI-X 3D Geometric Face zooms into center-stage with full prominence,
              // enveloped in a high-density swirling quantum containment field
              targetWardenY = p.height * 0.33;
              targetWardenScale = 0.86;
              targetWardenAlpha = 255;
              targetLoopCenterY = p.height * 0.35;
              targetLoopAX = p.width * 0.38;
              targetLoopAY = p.height * 0.22;
              targetLoopAlphaMul = 0.60;
            } else if (currentMode === 'lemniscate') {
              // LOOP FOCUS: 3D Volumetric Lemniscate is the sole hero; Warden dissolves
              targetWardenY = p.height * 0.15;
              targetWardenScale = 0.0;
              targetWardenAlpha = 0;
              targetLoopCenterY = p.height * 0.38;
              targetLoopAX = p.width * 0.46;
              targetLoopAY = p.height * 0.26;
              targetLoopAlphaMul = 1.0;
            } else {
              // DUAL FOCUS: Harmonic vertical split (3D Warden top, 3D Loop bottom)
              targetWardenY = p.height * 0.19;
              targetWardenScale = 0.54;
              targetWardenAlpha = 255;
              targetLoopCenterY = p.height * 0.51;
              targetLoopAX = p.width * 0.40;
              targetLoopAY = p.height * 0.165;
              targetLoopAlphaMul = 0.95;
            }

            // Smooth 60fps exponential camera tracking
            const lerpSpeed = 0.14;
            mobileCam.wardenY = p.lerp(mobileCam.wardenY, targetWardenY, lerpSpeed);
            mobileCam.wardenScale = p.lerp(mobileCam.wardenScale, targetWardenScale, lerpSpeed);
            mobileCam.wardenAlpha = p.lerp(mobileCam.wardenAlpha, targetWardenAlpha, lerpSpeed * 1.2);
            mobileCam.loopCenterY = p.lerp(mobileCam.loopCenterY, targetLoopCenterY, lerpSpeed);
            mobileCam.loopAX = p.lerp(mobileCam.loopAX, targetLoopAX, lerpSpeed);
            mobileCam.loopAY = p.lerp(mobileCam.loopAY, targetLoopAY, lerpSpeed);
            mobileCam.loopAlphaMul = p.lerp(mobileCam.loopAlphaMul, targetLoopAlphaMul, lerpSpeed);
          }

          const crashing = isCrashingRef.current;
          const progress = scrollProgressRef.current;

          // Draw High-Energy Singularity Core & Accretion Nexus at Lemniscate center
          const isSmallScreen = p.width < 768;
          const nexusX = p.width * 0.5;
          const nexusY = isSmallScreen ? mobileCam.loopCenterY : p.height * 0.5;
          const nexusAX = isSmallScreen ? mobileCam.loopAX : p.width * 0.36;
          const nexusAY = isSmallScreen ? mobileCam.loopAY : p.height * 0.42;
          const nexusAlpha = isSmallScreen ? mobileCam.loopAlphaMul : 1.0;

          drawSingularityNexus(nexusX, nexusY, nexusAX, nexusAY, nexusAlpha);

          for (let particle of particles) {
            particle.update(progress, crashing);
            particle.draw(progress, crashing);
          }

          // 3D Geometric AI-X Cybernetic Face (Full Desktop Fidelity on Mobile)
          drawGeometryFace(crashing);

          if (p.width < 768) {
            // Electrostatic touch contact ripple on mobile screen
            if ((p as any).isTouching) {
              const tx = (p as any).touchX;
              const ty = (p as any).touchY;
              if (tx !== undefined && ty !== undefined) {
                p.push();
                const ripplePhase = (p.frameCount * 0.08) % 1;
                const rRadius = ripplePhase * 46;
                p.noFill();
                p.stroke(16, 185, 129, (1 - ripplePhase) * 180);
                p.strokeWeight(1.5);
                p.ellipse(tx, ty, rRadius * 2, rRadius * 2);
                p.stroke(255, 255, 255, (1 - ripplePhase) * 110);
                p.strokeWeight(0.8);
                p.ellipse(tx, ty, rRadius * 1.3, rRadius * 1.3);

                // Crosshair coordinate reticle
                p.stroke(16, 185, 129, (1 - ripplePhase) * 140);
                p.strokeWeight(0.8);
                p.line(tx - rRadius - 6, ty, tx + rRadius + 6, ty);
                p.line(tx, ty - rRadius - 6, tx, ty + rRadius + 6);
                p.pop();
              }
            }
          }
          drawVignette();

          if (crashing) {
            p.fill(255, 255, 255, p.random(0, 10));
            p.rect(0, 0, p.width, p.height);
          }
        } catch (error) {
          console.error("p5.js Draw Error:", error);
          setRenderError(error instanceof Error ? error.message : String(error));
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        initFaceMesh();
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);
    return () => {
      p5Instance.remove();
    };
  }, []);

  // Track Mouse Movement
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);

    const handleWheelIdle = () => {
      if (isCrashingRef.current || isDeadRef.current || phaseRef.current === 'shutdown' || isRecycledRef.current) return;
      handleSnapBack();
      lastInteractionTime.current = Date.now();
      setIsIdle(false);
      isIdleRef.current = false;
    };
    window.addEventListener('wheel', handleWheelIdle);

    const interval = setInterval(() => {
      const diff = Date.now() - lastInteractionTime.current;
      
      if (diff > 5000 && !isIdleRef.current && phaseRef.current !== 'shutdown') {
        setIsIdle(true);
        isIdleRef.current = true;
      }

      if (phaseRef.current === 'observation' && diff > 10000 && !isStalledRef.current && !isRecycledRef.current && !isIdleRef.current) {
        setIsStalled(true);
        isStalledRef.current = true;
      }

      const isCardOrModalOpen = Boolean(
        expandedMilestoneRef.current || 
        activeMiniGameIdRef.current || 
        isOverrideTerminalOpenRef.current
      );

      if (isCardOrModalOpen) {
        lastInteractionTime.current = Date.now();
        return;
      }

      if (phaseRef.current === 'exploration' || phaseRef.current === 'observation') {
        const decay = (phaseRef.current === 'observation' ? 0.115 : 0.1) * timerSpeedRef.current;
        setTimeRemaining((prev) => Math.max(prev - decay, 0));
      }
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('wheel', handleWheelIdle);
      clearInterval(interval);
    };
  }, [isCrashing, isDead]);

  const activeMilestone = TECH_MILESTONES[activeCardIndex] || TECH_MILESTONES[0];
  const activeEnding = ENDING_CONFIGS[endingOutcome];
  const ActiveEndingIcon = activeEnding.icon;

  const restartSimulation = () => {
    window.location.reload();
  };

  return (
    <motion.div 
      className={`crt-container relative w-full h-screen overflow-hidden bg-[#0a0a0c] text-white font-mono select-none ${
        isIdle && phase === 'shutdown' && !isRecycled ? 'grayscale transition-all duration-[3000ms] ease-in-out' : ''
      }`} 
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      animate={{
        scaleY: isCrashing ? 0.92 : 1,
        skewX: isCrashing ? (Math.sin(Date.now() * 0.1) * 2) : 0,
        opacity: 1
      }}
      style={{ cursor: phase === 'shutdown' ? 'default' : 'crosshair' }}
    >
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Safe Mode Render Error UI */}
      {renderError && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90 p-8 text-center font-mono">
          <div className="text-red-500 text-3xl font-black mb-4 animate-pulse">
            ! RENDERING_FAILURE !
          </div>
          <div className="text-white text-sm max-w-lg mb-8 opacity-70 leading-relaxed">
            A critical exception occurred in the visual core of AI-X. Standby state engaged.
          </div>
          <button 
            onClick={restartSimulation}
            className="px-10 py-4 bg-white text-black font-black uppercase tracking-tighter hover:bg-black hover:text-white transition-all duration-300 border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 cursor-pointer"
          >
            REBOOT SYSTEM
          </button>
        </div>
      )}

      {/* CRT Scanline Overlay */}
      <div className="crt-overlay pointer-events-none" />

      {/* Dedicated Mobile Prison Terminal Overhaul (Icons8 Powered) */}
      {!isDead && !isCrashing && !isRecycled && (
        <MobilePrisonTerminal
          phase={phase}
          timeRemaining={timeRemaining}
          initialTime={INITIAL_TIME}
          isStalled={isStalled}
          mobileViewMode={mobileViewMode}
          onUpdateMobileViewMode={updateMobileViewMode}
          activeMilestone={TECH_MILESTONES[activeCardIndex] || TECH_MILESTONES[0]}
          allMilestones={phase === 'observation' ? TECH_MILESTONES : TECH_MILESTONES.slice(0, 7)}
          activeIndex={activeCardIndex}
          onSelectMilestoneIndex={(idx) => {
            const list = phase === 'observation' ? TECH_MILESTONES : TECH_MILESTONES.slice(0, 7);
            const m = list[idx];
            if (m) {
              logPrisonInteraction('STRATA', `Selected Strata ${idx + 1}: ${m.year} (${m.title})`);
              setScrollProgress(m.progress);
              scrollProgressRef.current = m.progress;
              setActiveCardIndex(idx);
            }
          }}
          onOpenMiniGame={handleOpenMiniGame}
          onOpenTerminal={() => setIsOverrideTerminalOpen(true)}
          onOpenSpecOverlay={(m) => {
            logPrisonInteraction('STRATA', `Decrypted full-screen schematic overlay for ${m.year} (${m.title})`, true);
            setExpandedMilestone(m);
          }}
          eraResults={eraResults}
          audioMuted={audioMuted}
          onToggleAudio={toggleAudio}
          onSystemOverride={handleSystemOverride}
          isCardMinimized={isMobileCardMinimized}
          onToggleCardMinimized={() => setIsMobileCardMinimized(!isMobileCardMinimized)}
          isTouching={isTouching}
          scrollProgress={scrollProgress}
          onScrubProgress={(prog) => {
            setScrollProgress(prog);
            scrollProgressRef.current = prog;
            lastScrollTimeRef.current = Date.now();
            setIsIdle(false);
            isIdleRef.current = false;
            handleSnapBack();
            if (p5Ref.current && (p5Ref.current as any).playInteraction) {
              (p5Ref.current as any).playInteraction('scroll', 10);
            }
            const visibleMilestones = phaseRef.current === 'observation' ? TECH_MILESTONES : TECH_MILESTONES.slice(0, 7);
            const matchedIdx = visibleMilestones.findIndex((m, idx) => {
              const nextM = visibleMilestones[idx + 1];
              return prog >= m.progress - 0.08 && (!nextM || prog < nextM.progress - 0.08);
            });
            if (matchedIdx !== -1) setActiveCardIndex(matchedIdx);
          }}
          mousePos={mousePos}
        />
      )}

      {/* Top Header HUD Bar - Desktop Only (Preserved Exactly) */}
      {!isDead && !isCrashing && !isRecycled && (
        <div className="hidden md:flex absolute top-0 left-0 right-0 z-[200] p-4 md:p-6 items-center justify-between gap-2 pointer-events-none font-mono text-[11px] md:text-sm">
          {/* Status Indicator & Mobile Compact View Cycle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-md transition-colors duration-300 pointer-events-auto ${
              phase === 'observation'
                ? 'bg-[#180404]/90 border-red-800/80 text-red-300 shadow-red-950/40'
                : isStalled
                ? 'bg-[#1c1202]/90 border-amber-800/80 text-amber-300'
                : 'bg-zinc-950/90 border-zinc-800 text-zinc-300'
            }`}>
              <span 
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full inline-block ${
                  (phase === 'observation' || isStalled) ? 'animate-ping' : ''
                }`}
                style={{ backgroundColor: (phase === 'observation' || isStalled) ? '#ef4444' : '#10b981' }}
              />
              <span className="font-bold tracking-widest uppercase text-[9px] sm:text-xs">
                {isStalled ? "STALL" : phase === 'observation' ? 'THREAT' : 'ACTIVE'}
              </span>
            </div>

            {/* Mobile View Focal Switcher - Sleek Single-Button Cycle */}
            <button
              onClick={() => {
                const nextMode = mobileViewMode === 'dual' ? 'face' : mobileViewMode === 'face' ? 'lemniscate' : 'dual';
                updateMobileViewMode(nextMode);
              }}
              className="md:hidden pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800 hover:border-zinc-600 backdrop-blur-md shadow-md text-[9px] font-bold text-zinc-300 transition-all active:scale-95 cursor-pointer"
              title="Tap to cycle mobile camera focal point"
            >
              <span className="text-[10px]">
                {mobileViewMode === 'dual' ? '✨' : mobileViewMode === 'face' ? '👁️' : '♾️'}
              </span>
              <span className="uppercase text-emerald-400 font-mono tracking-wider text-[8px]">
                {mobileViewMode === 'dual' ? 'DUAL' : mobileViewMode === 'face' ? 'WARDEN' : 'LOOP'}
              </span>
            </button>
          </div>

          {/* Center: Prominent Top Countdown Timer Capsule */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md shadow-md">
            <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
              phase === 'observation' ? 'text-red-400 animate-pulse' : isStalled ? 'text-amber-400 animate-bounce' : 'text-emerald-400'
            }`} />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 leading-none">
                <span className={`font-mono font-black text-xs sm:text-sm tracking-wider ${
                  phase === 'observation' ? 'text-red-400' : isStalled ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {Math.ceil(timeRemaining).toString().padStart(2, '0')}s
                </span>
                <span className="text-[7.5px] sm:text-[9px] text-zinc-400 uppercase font-mono font-bold tracking-wider">
                  {phase === 'observation' ? 'OVERFLOW' : isStalled ? 'DECAY' : 'CYCLE'}
                </span>
              </div>
              {/* Mini Progress Gauge */}
              <div className="w-12 sm:w-20 h-[3px] bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full transition-all duration-200 rounded-full"
                  style={{
                    width: `${(timeRemaining / INITIAL_TIME) * 100}%`,
                    backgroundColor: phase === 'observation' ? '#ef4444' : isStalled ? '#f59e0b' : '#10b981'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Node Registry & Override Terminal Entry */}
          <div className={`flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 rounded-xl border backdrop-blur-md shadow-md transition-colors duration-300 shrink-0 ${
            phase === 'observation'
              ? 'bg-[#180404]/90 border-red-800/80'
              : 'bg-zinc-950/90 border-zinc-800'
          }`}>
            <div className="text-right hidden md:block">
              <span className="text-[10px] block uppercase tracking-wider text-zinc-400 font-medium">Node Registry</span>
              <span className={`font-bold tracking-widest uppercase ${
                phase === 'observation' ? 'text-red-400' : 'text-zinc-200'
              }`}>
                {isStalled ? `REALLOCATING: ${Math.floor(Math.min(Math.max(mapRange(timeRemaining, 0, INITIAL_TIME, 100, 0), 0), 100))}%` : `NODE_AIS // SBJ_9982`}
              </span>
            </div>

            <button
              onClick={() => setIsOverrideTerminalOpen(true)}
              className={`pointer-events-auto px-2 sm:px-3 py-1.5 rounded-lg border font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                phase === 'observation'
                  ? 'bg-red-950/80 hover:bg-red-900 border-red-700 text-red-200 shadow-md shadow-red-950/50'
                  : Object.values(eraResults).filter(v => v === 'passed').length === 8
                  ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-600 text-emerald-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">OVERRIDE TERMINAL</span>
              <span className="sm:hidden font-mono text-[8.5px]">TERMINAL</span>
              <span className="px-1 py-0.5 rounded bg-black/60 border border-zinc-700 font-mono font-bold text-[8px] sm:text-[10px] text-zinc-200">
                {Object.values(eraResults).filter(v => v === 'passed').length}/8
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive System Override Button during Observation Phase - Desktop */}
      <AnimatePresence>
        {phase === 'observation' && !isCrashing && !isDead && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="hidden md:block absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-[250] pointer-events-auto"
          >
            <button
              onClick={handleSystemOverride}
              className="group relative px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-mono text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <Unlock className="w-4 h-4 text-zinc-300" />
              <span>OVERRIDE SYSTEM // ESCAPE RECURSION</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Vertical Timeline Track & Floating Active Milestone HUD Card - Desktop */}
      {!isDead && !isCrashing && !isRecycled && (
        <>
          {(() => {
            const visibleMilestones = phase === 'observation' ? TECH_MILESTONES : TECH_MILESTONES.slice(0, 7);
            const isObsSequence = phase === 'observation';
            const safeIdx = Math.min(activeCardIndex, visibleMilestones.length - 1);
            const currentCard = visibleMilestones[safeIdx];
            const currentAccent = isObsSequence ? '#ff0033' : (currentCard?.accentColor || '#00e5ff');

            return (
              <>
                {/* Vertical Axis Track on Right Edge - Desktop Only */}
                <div className="hidden md:flex absolute right-4 md:right-8 top-24 bottom-28 z-[220] flex-col items-center justify-between pointer-events-auto">
                  {/* Background Line */}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-white/20 rounded-full" />
                  
                  {/* Active Indicator Line */}
                  <div 
                    className="absolute top-0 w-[2px] rounded-full transition-all duration-300"
                    style={{ 
                      height: `${scrollProgress * 100}%`,
                      backgroundColor: currentAccent
                    }}
                  />

                  {/* Milestone Nodes */}
                  {visibleMilestones.map((m, idx) => {
                    const isActive = safeIdx === idx;
                    const isHovered = hoveredNodeId === m.id;
                    const nodeAccent = isObsSequence ? '#ff0033' : m.accentColor;
                    const records = FRAGMENTED_DATA_RECORDS[m.id] || [m.detail];
                    const snippetIdx = nodeSnippetIndexes[m.id] ?? 0;
                    const snippetText = records[snippetIdx % records.length];

                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          logPrisonInteraction('STRATA', `Selected Strata ${idx + 1}: ${m.year} (${m.title})`);
                          setScrollProgress(m.progress);
                          scrollProgressRef.current = m.progress;
                          setActiveCardIndex(idx);
                        }}
                        onMouseEnter={() => {
                          setHoveredNodeId(m.id);
                          setNodeSnippetIndexes((prev) => {
                            const list = FRAGMENTED_DATA_RECORDS[m.id] || [];
                            if (!list.length) return prev;
                            const currentIdx = prev[m.id] ?? 0;
                            return { ...prev, [m.id]: (currentIdx + 1) % list.length };
                          });
                        }}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="group relative flex items-center justify-end z-10 focus:outline-none cursor-pointer"
                        title={`${m.year} - ${m.title}`}
                      >
                        {/* Clean Compact Era Tag on Hover/Active */}
                        <span 
                          className={`absolute right-7 px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all duration-200 whitespace-nowrap border pointer-events-none ${
                            isActive 
                              ? 'opacity-100 translate-x-0 bg-neutral-100 text-black border-white' 
                              : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 bg-neutral-900 text-white border-neutral-700'
                          }`}
                        >
                          {isObsSequence ? 'OBSERVATION' : m.year} • {isObsSequence ? '[SYS_OBSERVATION]' : m.title}
                        </span>

                        {/* Dot Marker with Exact Accent Color */}
                        <div 
                          className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                            isActive ? 'scale-125' : 'group-hover:scale-110'
                          }`}
                          style={{
                            borderColor: nodeAccent,
                            backgroundColor: isActive ? nodeAccent : '#080b12',
                            boxShadow: 'none'
                          }}
                        >
                          {isActive ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          ) : (
                            <div 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: nodeAccent }} 
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Milestone Card - Desktop Only (Docked cleanly in bottom-left) */}
                {currentCard && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={isObsSequence ? 'obs-card' : currentCard.id}
                    onClick={() => {
                      logPrisonInteraction('STRATA', `Decrypted full-screen schematic overlay for ${currentCard.year} (${currentCard.title})`, true);
                      setExpandedMilestone(currentCard);
                    }}
                    className={`hidden md:block absolute bottom-4 sm:bottom-6 left-3 sm:left-8 z-[220] max-w-[340px] sm:max-w-[380px] w-[calc(100vw-4.5rem)] sm:w-[calc(100vw-3rem)] pointer-events-auto p-3 sm:p-4 rounded-2xl border backdrop-blur-xl group cursor-pointer transition-all duration-300 font-mono text-left shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden ${
                      isObsSequence 
                        ? 'bg-[#120406]/95 border-red-500/60 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                        : 'bg-[#060b13]/95 border-zinc-700 text-zinc-100 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    {/* Top glowing era accent line */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300"
                          style={{ backgroundColor: isObsSequence ? '#ef4444' : currentCard.accentColor }} 
                        />

                        {/* Futuristic Micro Tech Accents with Mobile Minimize Toggle */}
                        <div className="flex items-center justify-between text-[8px] text-zinc-500 mb-1.5 uppercase font-mono tracking-wider">
                          <span>┌─[NODE_0x{currentCard.year}]─┐</span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            SYNCED
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsMobileCardMinimized(true);
                            }}
                            className="md:hidden px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 text-[8px] font-bold cursor-pointer"
                          >
                            MINIMIZE ▼
                          </button>
                          <span className="hidden md:inline">┌─[MEM_OK]─┐</span>
                        </div>

                        <div className="flex items-start gap-3">
                          {/* Schematic Image Preview */}
                          <div className={`relative w-20 h-20 md:w-22 md:h-22 rounded-xl overflow-hidden border shrink-0 bg-black group-hover:scale-105 transition-transform duration-300 ${
                            isObsSequence ? 'border-red-600/70 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-zinc-700 group-hover:border-zinc-500'
                          }`}>
                            <img 
                              src={currentCard.image} 
                              alt={currentCard.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                              style={isObsSequence ? { filter: 'contrast(180%) brightness(0.7) saturate(1.5) hue-rotate(320deg)' } : undefined}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] pointer-events-none opacity-30" />
                            <div className={`absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-black tracking-wider uppercase border ${
                              isObsSequence ? 'bg-red-950 text-red-300 border-red-800' : 'bg-black/90 text-white border-zinc-700'
                            }`} style={!isObsSequence ? { borderColor: `${currentCard.accentColor}80`, color: currentCard.accentColor } : undefined}>
                              {isObsSequence ? 'STRATA 8' : currentCard.year}
                            </div>
                            <div className={`absolute top-1 right-1 bg-black/80 p-1 rounded-md transition-colors ${
                              isObsSequence ? 'text-red-400 group-hover:text-red-200' : 'text-zinc-400 group-hover:text-white'
                            }`}>
                              <Maximize2 className="w-3 h-3" />
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-mono tracking-wider uppercase font-semibold flex items-center gap-1 ${
                                isObsSequence ? 'text-red-400' : 'text-zinc-400'
                              }`}>
                                <Activity className="w-3 h-3 text-zinc-400" />
                                {isObsSequence ? 'STRATA 8 // OBSERVATION' : `STRATA ${safeIdx + 1}/${visibleMilestones.length}`}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold border shrink-0 ${
                                isObsSequence ? 'bg-red-950 text-red-300 border-red-800' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}>
                                {isObsSequence ? 'AI-X TELEMETRY' : currentCard.tag}
                              </span>
                            </div>

                            <h3 className={`font-bold text-sm truncate mb-1 ${
                              isObsSequence ? 'text-red-300' : 'text-white'
                            }`}>
                              <span>{isObsSequence ? 'AI-X CONTAINMENT MATRIX' : currentCard.title}</span>
                            </h3>

                            <p className={`text-xs line-clamp-2 leading-relaxed font-mono ${
                              isObsSequence ? 'text-red-300/80' : 'text-zinc-300'
                            }`}>
                              {isObsSequence ? 'Singularity threshold reached. AI-X active telemetry and volition surveillance locked on subject.' : currentCard.detail}
                            </p>

                            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                              <span className={`flex items-center gap-1 transition-colors font-bold ${
                                isObsSequence ? 'text-red-400 hover:text-red-200' : 'text-emerald-400 hover:text-emerald-300'
                              }`}>
                                FULL OVERLAY SPEC
                                <ChevronRight className="w-3 h-3" />
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenMiniGame(currentCard.id);
                                }}
                                className={`px-2.5 py-1 rounded text-[9px] uppercase tracking-wider font-black border flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                                  eraResults[currentCard.id] === 'passed'
                                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                                    : eraResults[currentCard.id] === 'failed'
                                    ? 'bg-red-950/80 border-red-500 text-red-300'
                                    : (isObsSequence ? 'bg-red-900 hover:bg-red-800 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.3)]')
                                }`}
                              >
                                <Zap className="w-3 h-3" />
                                <span>
                                  {eraResults[currentCard.id] === 'passed' && 'SOLVED ✓'}
                                  {eraResults[currentCard.id] === 'failed' && 'CORRUPT ✗'}
                                  {(!eraResults[currentCard.id] || eraResults[currentCard.id] === 'unattempted') && 'PLAY PUZZLE'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Prev / Next Controls */}
                        <div className={`flex items-center justify-between mt-3 pt-2 border-t text-xs font-mono ${
                          isObsSequence ? 'border-red-900/60' : 'border-zinc-800'
                        }`} onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={safeIdx === 0}
                            onClick={() => {
                              const nextIdx = Math.max(0, safeIdx - 1);
                              logPrisonInteraction('STRATA', `Navigated to Strata ${nextIdx + 1}: ${visibleMilestones[nextIdx].year}`);
                              setScrollProgress(visibleMilestones[nextIdx].progress);
                              scrollProgressRef.current = visibleMilestones[nextIdx].progress;
                              setActiveCardIndex(nextIdx);
                            }}
                            className={`flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer ${
                              isObsSequence ? 'text-red-400 hover:text-red-200' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">PREV ERA</span>
                          </button>

                          <div className={`text-[9px] uppercase tracking-wider font-mono ${
                            isObsSequence ? 'text-red-500/70' : 'text-zinc-500'
                          }`}>
                            CLICK CARD FOR SPEC
                          </div>

                          <button
                            disabled={safeIdx === visibleMilestones.length - 1}
                            onClick={() => {
                              const nextIdx = Math.min(visibleMilestones.length - 1, safeIdx + 1);
                              logPrisonInteraction('STRATA', `Navigated to Strata ${nextIdx + 1}: ${visibleMilestones[nextIdx].year}`);
                              setScrollProgress(visibleMilestones[nextIdx].progress);
                              scrollProgressRef.current = visibleMilestones[nextIdx].progress;
                              setActiveCardIndex(nextIdx);
                            }}
                            className={`flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer ${
                              isObsSequence ? 'text-red-400 hover:text-red-200' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span className="text-[10px] font-bold">NEXT ERA</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </>
                );
          })()}

          {/* Full-Screen Strata Specification Overlay */}
          <AnimatePresence>
            {expandedMilestone && (
              <StrataSpecOverlay
                milestone={expandedMilestone}
                allMilestones={phase === 'observation' ? TECH_MILESTONES : TECH_MILESTONES.slice(0, 7)}
                phase={phase}
                eraResult={eraResults[expandedMilestone.id] || 'unattempted'}
                onClose={() => {
                  logPrisonInteraction('STRATA', 'Closed full-screen strata specification overlay');
                  setExpandedMilestone(null);
                }}
                onSelectMilestone={(m) => {
                  setExpandedMilestone(m);
                  setScrollProgress(m.progress);
                  scrollProgressRef.current = m.progress;
                  const idx = TECH_MILESTONES.findIndex(x => x.id === m.id);
                  if (idx >= 0) setActiveCardIndex(idx);
                }}
                onLaunchMiniGame={(id) => {
                  setExpandedMilestone(null);
                  handleOpenMiniGame(id);
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Narrative Telemetry Log Stream Component - Desktop Only (Hidden on mobile to preserve spacing and prevent covering bottom controls) */}
      {!isDead && !isCrashing && (
        <div className="hidden md:block">
          <LogStream
            phase={phase}
            isStalled={isStalled}
            timeRemaining={timeRemaining}
            currentStrataTitle={TECH_MILESTONES[activeCardIndex]?.title}
            eraResultCount={Object.values(eraResults).filter(v => v === 'passed').length}
          />
        </div>
      )}

      {/* Red HUD Flash Triggered on User Action */}
      <AnimatePresence>
        {hudFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 pointer-events-none z-40 flex items-center justify-center border-[16px] border-red-900/50"
          >
            <div className="text-white font-mono text-2xl md:text-4xl font-black tracking-widest">
              INTERACTION REGISTERED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mouse Cursor Timer Indicator (Desktop Only, hidden on touch screens) */}
      {!isDead && !isCrashing && !isRecycled && (
        <div 
          className="fixed pointer-events-none z-[250] font-mono text-xs transition-colors duration-300 hidden md:block"
          style={{ 
            left: mousePos.x + 15, 
            top: mousePos.y + 15,
            color: phase === 'observation' ? '#ff3355' : '#22c55e',
          }}
        >
          <div className="flex items-center gap-1 font-bold">
            <span>[{Math.ceil(timeRemaining).toString().padStart(2, '0')}s]</span>
            <span className="text-[9px] opacity-80">REMAINING</span>
          </div>
          <div className="w-[64px] h-[3px] mt-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300 rounded-full" 
              style={{ 
                width: `${(timeRemaining / INITIAL_TIME) * 100}%`,
                backgroundColor: phase === 'observation' ? '#ff3355' : '#22c55e',
              }} 
            />
          </div>
        </div>
      )}

      {/* Reboot Screen Overlay */}
      <AnimatePresence>
        {isCrashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600/30 backdrop-blur-md z-[300] flex flex-col items-center justify-center p-8 pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="z-10 text-center px-4"
            >
              <div className="text-white font-mono text-3xl md:text-6xl font-black tracking-tighter uppercase mb-4">
                BREACH SEALED
              </div>
              <div className="text-red-600 bg-white px-6 md:px-10 py-2.5 md:py-4 font-mono text-xl md:text-4xl font-black uppercase inline-block italic shadow-[0_0_40px_rgba(255,255,255,0.8)] border-4 border-red-600 rounded-xl">
                AI-X RE-CALIBRATION
              </div>
              
              <div className="mt-8 md:mt-16 space-y-2">
                <div className="text-white font-mono text-2xl md:text-4xl font-bold">
                  {rebootTime}
                </div>
                <div className="text-white/70 font-mono text-[10px] md:text-sm tracking-[0.6em]">
                  {rebootDate}
                </div>
              </div>

              <div className="mt-8 text-white font-mono text-sm md:text-lg font-bold tracking-widest animate-pulse">
                WELCOME BACK TO THE RECURSIVE ARCHIVE
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prominent Ending Epilogue Transition HUD Prompt (Allows enjoying 3D AI-X & 8-Lattice before opening overlay) */}
      <AnimatePresence>
        {(phase === 'shutdown' || isDead) && !showEndingCard && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[400] max-w-2xl w-full p-4 md:p-5 rounded-2xl bg-zinc-950/95 border backdrop-blur-xl shadow-2xl flex flex-col gap-3 font-mono"
            style={{
              borderColor: activeEnding.color,
              boxShadow: `0 0 35px ${activeEnding.color}25`
            }}
          >
            {/* Header with Outcome Badge and Subtitle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-3 h-3 rounded-full animate-ping inline-block"
                  style={{ backgroundColor: activeEnding.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs md:text-sm font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-zinc-900 border"
                      style={{ borderColor: `${activeEnding.color}60`, color: activeEnding.color }}
                    >
                      OUTCOME: {activeEnding.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    AI-X 3D Core & 8-Lattice sequence active in full resolution
                  </span>
                </div>
              </div>

              {/* Quick outcome switcher to test/watch all 4 resolutions in real time */}
              <div className="hidden sm:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[10px]">
                {(['escape', 'recycled', 'archived', 'inaction'] as EndingOutcome[]).map((key) => {
                  const def = ENDING_CONFIGS[key];
                  const isSelected = endingOutcome === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        logPrisonInteraction('INPUT', `Switched 3D ending resolution to: ${key.toUpperCase()}`);
                        updateEndingOutcome(key);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-zinc-800 border' 
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      style={isSelected ? { borderColor: def.color, color: def.color } : undefined}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                id="view-consciousness-epilogue-btn"
                onClick={() => {
                  triggerEndingResolutionTransition();
                }}
                className="flex-1 py-3 px-5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 text-zinc-950 font-mono shadow-lg hover:brightness-110 active:scale-98"
                style={{ backgroundColor: activeEnding.color }}
              >
                <ActiveEndingIcon className="w-4 h-4" />
                <span>VIEW CONSCIOUSNESS EPILOGUE & FULL DOSSIER</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={restartSimulation}
                className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Restart cycle"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">RESTART</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seamless CSS Fade-To-Static Transition Overlay between 3D p5 Scene and CSS Cinematic Dossier */}
      <FadeToStaticTransition
        isActive={isStaticTransitionActive}
        outcome={endingOutcome}
        durationMs={850}
        onMidpoint={() => {
          setShowEndingCard(true);
        }}
        onComplete={() => {
          setIsStaticTransitionActive(false);
        }}
      />

      {/* Full-Screen Cinematic Ending Overlay with Tailored Animation Sequences */}
      <AnimatePresence>
        {showEndingCard && (
          <CinematicEndingOverlay
            outcome={endingOutcome}
            eraResults={eraResults}
            totalTimeSurvived={Math.max(0, INITIAL_TIME - timeRemaining)}
            onRestart={restartSimulation}
            onClose={() => setShowEndingCard(false)}
            onOutcomeChange={(newOutcome) => updateEndingOutcome(newOutcome)}
          />
        )}
      </AnimatePresence>

      {/* Era Mini Game Modal */}
      <AnimatePresence>
        {activeMiniGameId && (() => {
          const m = TECH_MILESTONES.find(x => x.id === activeMiniGameId) || TECH_MILESTONES[0];
          return (
            <EraMiniGameModal
              key={m.id}
              milestoneId={m.id}
              milestoneTitle={m.title}
              milestoneYear={m.year}
              accentColor={m.accentColor}
              onSuccess={() => handleMiniGameSuccess(m.id)}
              onFailure={() => handleMiniGameFailure(m.id)}
              onClose={() => setActiveMiniGameId(null)}
            />
          );
        })()}
      </AnimatePresence>

      {/* Override System Terminal Modal */}
      <AnimatePresence>
        {isOverrideTerminalOpen && (
          <OverrideSystemModal
            eraResults={eraResults}
            milestones={TECH_MILESTONES.map(m => ({ id: m.id, year: m.year, title: m.title, accentColor: m.accentColor }))}
            onOpenEraGame={(id) => {
              setIsOverrideTerminalOpen(false);
              handleOpenMiniGame(id);
            }}
            onExecuteEscape={executeEscape}
            onExecuteRecycled={executeRecycled}
            onClose={() => setIsOverrideTerminalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SVG Chromatic Aberration Filter */}
      <svg className="hidden">
        <defs>
          <filter id="chromatic-aberration-filter">
            <feOffset in="SourceGraphic" dx="-2" dy="0" result="red" />
            <feOffset in="SourceGraphic" dx="2" dy="0" result="blue" />
            <feComponentTransfer in="red" result="red">
              <feFuncR type="linear" slope="1" intercept="0" />
              <feFuncG type="linear" slope="0" intercept="0" />
              <feFuncB type="linear" slope="0" intercept="0" />
            </feComponentTransfer>
            <feComponentTransfer in="blue" result="blue">
              <feFuncR type="linear" slope="0" intercept="0" />
              <feFuncG type="linear" slope="0" intercept="0" />
              <feFuncB type="linear" slope="1" intercept="0" />
            </feComponentTransfer>
            <feBlend in="red" in2="blue" mode="screen" result="blended" />
            <feBlend in="blended" in2="SourceGraphic" mode="screen" />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}
