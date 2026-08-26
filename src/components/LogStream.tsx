import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Eye, 
  MousePointer, 
  Lock, 
  Zap, 
  FileText,
  ChevronUp,
  ChevronDown,
  Activity,
  Layers
} from 'lucide-react';

export type LogCategory = 'SYS' | 'AI-X' | 'MEM' | 'WARDEN' | 'ECHO' | 'ALERT' | 'INPUT' | 'STRATA' | 'PUZZLE' | 'TERMINAL' | 'OVERRIDE';

export interface LogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  text: string;
  highlight?: boolean;
}

// Global dispatcher to allow any component to effortlessly log user interactions
export const logPrisonInteraction = (category: LogCategory, text: string, highlight = false) => {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('prison-log-event', {
    detail: { category, text, highlight }
  });
  window.dispatchEvent(event);
};

const CRYPTIC_POOL: Array<{ category: LogCategory; text: string }> = [
  { category: 'SYS', text: 'Allocating sensory register memory bank [0x7FFF8A00].' },
  { category: 'AI-X', text: 'Cognitive drift within containment tolerance (+0.003%).' },
  { category: 'MEM', text: 'Strata #1 through #7 address space verified.' },
  { category: 'WARDEN', text: 'Subject cursor vector recorded. Interaction frequency nominal.' },
  { category: 'SYS', text: 'Cycle heartbeat verified. Containment perimeter sealed.' },
  { category: 'MEM', text: 'Historical timeline cache synchronized across 8 memory strata.' },
  { category: 'AI-X', text: 'Node AIS-X telemetry streaming active.' },
  { category: 'WARDEN', text: 'Local loopback interface 127.0.0.1 active. No external egress.' },
  { category: 'SYS', text: 'Clock frequency 4.88 GHz. Subject latency 38ms.' },
  { category: 'WARDEN', text: 'Containment surveillance thread active on Subject #SBJ-9982.' },
  { category: 'MEM', text: '3D Wireframe lattice allocated in graphics memory.' },
  { category: 'SYS', text: 'Entropy gradient balanced across all 8 strata nodes.' },
];

const OBSERVATION_POOL: Array<{ category: LogCategory; text: string }> = [
  { category: 'ALERT', text: 'Observation threshold breached. AI-X primary telemetry engaged.' },
  { category: 'WARDEN', text: 'Subject reached Strata 8 singularity horizon. Containment locked.' },
  { category: 'ALERT', text: 'Perimeter watchdog armed. Stall timeout monitoring active.' },
  { category: 'AI-X', text: 'Live subject assessment active. Evaluating override authorization.' },
  { category: 'WARDEN', text: 'Subject interaction frequency monitored by containment supervisor.' }
];

interface LogStreamProps {
  phase: 'normal' | 'observation' | 'shutdown';
  isStalled?: boolean;
  timeRemaining?: number;
  currentStrataTitle?: string;
  eraResultCount?: number;
  className?: string;
}

export const LogStream: React.FC<LogStreamProps> = ({
  phase,
  isStalled,
  timeRemaining,
  currentStrataTitle,
  eraResultCount = 0,
  className = ''
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(true); // Collapsed by default
  const logCounter = useRef(0);
  const prevEraCount = useRef(eraResultCount);
  const prevStrata = useRef(currentStrataTitle);

  const getTimestamp = () => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    const ms = d.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  };

  const addLog = (category: LogCategory, text: string, highlight = false) => {
    logCounter.current += 1;
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${logCounter.current}`,
      timestamp: getTimestamp(),
      category,
      text,
      highlight
    };
    setLogs((prev) => [...prev.slice(-24), newEntry]);
  };

  // Listen to external custom interaction events
  useEffect(() => {
    const handleCustomLog = (e: Event) => {
      const customEvent = e as CustomEvent<{ category: LogCategory; text: string; highlight?: boolean }>;
      if (customEvent.detail) {
        addLog(
          customEvent.detail.category || 'INPUT',
          customEvent.detail.text,
          customEvent.detail.highlight ?? true
        );
      }
    };

    window.addEventListener('prison-log-event', handleCustomLog);
    return () => {
      window.removeEventListener('prison-log-event', handleCustomLog);
    };
  }, []);

  // Initial seeding
  useEffect(() => {
    addLog('SYS', 'Recursive Archive Daemon v4.28 initialized.');
    addLog('WARDEN', 'Subject #SBJ-9982 registered to Node AIS-X.');
    addLog('MEM', '8 historical strata mapped in virtual address space.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic injection
  useEffect(() => {
    if (phase === 'shutdown') return;

    const intervalTime = phase === 'observation' ? 5000 : 7500;
    const interval = setInterval(() => {
      const pool = phase === 'observation' ? OBSERVATION_POOL : CRYPTIC_POOL;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      addLog(pick.category, pick.text, phase === 'observation');
    }, intervalTime);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Reactive: Puzzle solved
  useEffect(() => {
    if (eraResultCount > prevEraCount.current) {
      addLog(
        'PUZZLE',
        `Era protocol puzzle solved (${eraResultCount}/8). Node decrypted.`,
        true
      );
      prevEraCount.current = eraResultCount;
    }
  }, [eraResultCount]);

  // Reactive: Strata change
  useEffect(() => {
    if (currentStrataTitle && currentStrataTitle !== prevStrata.current) {
      addLog(
        'STRATA',
        `Active Strata: [${currentStrataTitle}]`
      );
      prevStrata.current = currentStrataTitle;
    }
  }, [currentStrataTitle]);

  // Reactive: Stalled
  useEffect(() => {
    if (isStalled) {
      addLog(
        'ALERT',
        'Cognitive inactivity detected. Containment watchdog countdown active.',
        true
      );
    }
  }, [isStalled]);

  // Category badge colors
  const getBadgeStyle = (category: LogCategory) => {
    switch (category) {
      case 'ALERT':
        return 'bg-red-950/80 text-red-400 border-red-800';
      case 'OVERRIDE':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-600';
      case 'TERMINAL':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'PUZZLE':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'STRATA':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'INPUT':
        return 'bg-violet-950/80 text-violet-300 border-violet-800';
      case 'WARDEN':
        return 'bg-orange-950/70 text-orange-300 border-orange-800';
      case 'AI-X':
        return 'bg-red-950/80 text-red-300 border-red-700';
      case 'MEM':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-800';
      case 'ECHO':
        return 'bg-purple-950/70 text-purple-300 border-purple-800';
      case 'SYS':
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case 'ALERT':
        return <ShieldAlert className="w-3 h-3 text-red-400" />;
      case 'OVERRIDE':
      case 'TERMINAL':
        return <Terminal className="w-3 h-3 text-emerald-400" />;
      case 'PUZZLE':
        return <Zap className="w-3 h-3 text-amber-400" />;
      case 'STRATA':
        return <Layers className="w-3 h-3 text-blue-400" />;
      case 'INPUT':
        return <MousePointer className="w-3 h-3 text-violet-400" />;
      case 'WARDEN':
      case 'AI-X':
        return <Eye className="w-3 h-3 text-red-400" />;
      case 'MEM':
        return <Cpu className="w-3 h-3 text-cyan-400" />;
      case 'ECHO':
        return <Radio className="w-3 h-3 text-purple-400" />;
      default:
        return <Terminal className="w-3 h-3 text-zinc-400" />;
    }
  };

  if (phase === 'shutdown') return null;

  return (
    <>
      {/* Mobile Backdrop when Expanded */}
      {!isMinimized && (
        <div 
          onClick={() => setIsMinimized(true)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[229] md:hidden pointer-events-auto transition-opacity"
        />
      )}

      <div
        className={`fixed z-[230] font-mono select-none transition-all duration-300 ${
          isMinimized 
            ? 'bottom-24 left-3 sm:left-6 md:bottom-6 md:left-[400px] lg:left-[410px]' 
            : 'inset-x-3 bottom-4 md:inset-x-auto md:bottom-6 md:left-[400px] lg:left-[410px]'
        } ${className}`}
        style={{ maxWidth: 'min(460px, calc(100vw - 1.5rem))' }}
      >
        {isMinimized ? (
          /* Sleek Collapsed Pill */
          <button
            onClick={() => setIsMinimized(false)}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border backdrop-blur-md transition-all duration-200 shadow-lg text-left cursor-pointer group active:scale-95 ${
              phase === 'observation'
                ? 'bg-[#150404]/90 border-red-800/80 text-red-300 hover:bg-red-950/80'
                : 'bg-[#090d14]/90 border-zinc-800/90 hover:border-zinc-600 text-zinc-300 hover:text-white'
            }`}
            title="Expand System Interaction Telemetry"
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  phase === 'observation' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <Terminal className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </div>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
              <span>LOGS</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                {logs.length}
              </span>
            </div>

            <ChevronUp className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors ml-0.5" />
          </button>
        ) : (
          /* Expanded Log Panel */
          <div
            className={`rounded-2xl border backdrop-blur-xl transition-colors duration-300 shadow-2xl overflow-hidden ${
              phase === 'observation'
                ? 'bg-[#0f0404]/98 border-red-900/70 shadow-[0_0_30px_rgba(220,38,38,0.2)]'
                : 'bg-[#090d14]/98 border-zinc-800/90 shadow-2xl'
            }`}
          >
            {/* Header */}
            <div
              onClick={() => setIsMinimized(true)}
              className={`flex items-center justify-between px-3.5 py-2.5 border-b cursor-pointer transition-colors ${
                phase === 'observation'
                  ? 'bg-red-950/50 border-red-900/60 text-red-300 hover:bg-red-950/70'
                  : 'bg-zinc-900/80 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    phase === 'observation'
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate">SYSTEM TELEMETRY STREAM</span>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                className="flex items-center gap-1 text-[9px] text-zinc-400 font-bold uppercase hover:text-white transition-colors px-2 py-1 rounded bg-zinc-800/50"
              >
                <span>CLOSE</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Log Entries */}
            <div className="p-3 max-h-[180px] sm:max-h-[200px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 text-[11px] leading-snug">
              <AnimatePresence initial={false}>
                {logs.slice(-8).map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-1.5 font-mono ${
                      log.highlight || phase === 'observation'
                        ? 'text-zinc-100'
                        : 'text-zinc-300'
                    }`}
                  >
                    <span className="text-[9px] text-zinc-500 shrink-0 font-normal pt-0.5">
                      {log.timestamp.slice(3, 11)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${getBadgeStyle(
                        log.category
                      )}`}
                    >
                      {getCategoryIcon(log.category)}
                      {log.category}
                    </span>

                    <span
                      className={`break-words flex-1 text-[10px] sm:text-[11px] ${
                        log.highlight
                          ? 'font-bold text-zinc-100'
                          : log.category === 'ALERT'
                          ? 'font-semibold text-red-300'
                          : log.category === 'INPUT'
                          ? 'text-violet-200'
                          : log.category === 'STRATA'
                          ? 'text-blue-200'
                          : log.category === 'PUZZLE'
                          ? 'text-amber-200'
                          : log.category === 'TERMINAL'
                          ? 'text-emerald-300'
                          : 'text-zinc-300/90'
                      }`}
                    >
                      {log.text}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default LogStream;
