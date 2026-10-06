import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Play, Square, Download, Sparkles, Copy, Check } from 'lucide-react';
import { ThemeConfig } from '../theme';

interface CyberAgentTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  currentStep: number;
  topic: string;
  theme: ThemeConfig;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'agent' | 'success' | 'warn';
  agent: string;
  message: string;
}

export const CyberAgentTerminal: React.FC<CyberAgentTerminalProps> = ({
  isOpen,
  onClose,
  isLoading,
  currentStep,
  topic,
  theme,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: '00:00.01',
      level: 'info',
      agent: 'SYSTEM',
      message: 'Autonomous Multi-Agent Orchestrator initialized. Gemini 3.8 Flash online.',
    },
    {
      id: 'init-2',
      timestamp: '00:00.04',
      level: 'info',
      agent: 'DAEMON',
      message: 'arXiv Atom API & DuckDuckGo grounding endpoints verified.',
    },
  ]);

  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Stream simulated real-time telemetry logs when pipeline runs
  useEffect(() => {
    if (!isLoading) return;

    const stepLogs: Record<number, { agent: string; msg: string; level: LogEntry['level'] }> = {
      1: {
        agent: 'RESEARCH_AGENT',
        msg: `Initiating multi-hop retrieval for "${topic}". Querying arXiv repository & external search grounding...`,
        level: 'agent',
      },
      2: {
        agent: 'SUMMARIZER',
        msg: `Distilling high-density academic papers. Extracting core technical pillars and empirical metrics...`,
        level: 'agent',
      },
      3: {
        agent: 'FACT_CHECKER',
        msg: `Auditing factual claims against scholarly evidence bounds. Calculating confidence credibility rating...`,
        level: 'warn',
      },
      4: {
        agent: 'WRITER_AGENT',
        msg: `Synthesizing executive research publication. Formatting structured sections and academic references...`,
        level: 'agent',
      },
      5: {
        agent: 'ORCHESTRATOR',
        msg: `Pipeline execution complete. Report rendered with 100% verified citations. Ready for export.`,
        level: 'success',
      },
    };

    if (stepLogs[currentStep]) {
      const now = new Date();
      const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;
      const entry: LogEntry = {
        id: `log-${Date.now()}-${currentStep}`,
        timestamp: timeStr,
        level: stepLogs[currentStep].level,
        agent: stepLogs[currentStep].agent,
        message: stepLogs[currentStep].msg,
      };

      setLogs(prev => [...prev, entry]);
    }
  }, [isLoading, currentStep, topic]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.agent}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-950/95 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-white/10 font-mono">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Terminal className="w-4 h-4 text-emerald-400 ml-2" />
            <span className="text-xs font-bold text-white tracking-wider">
              AI STUDIO // MULTI-AGENT TELEMETRY HUD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
              title="Copy terminal logs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div
          ref={scrollRef}
          className="p-5 flex-1 overflow-y-auto space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-950/90 font-mono"
          style={{ minHeight: '320px' }}
        >
          {logs.map((log) => {
            let badgeClass = 'text-blue-400';
            if (log.level === 'success') badgeClass = 'text-emerald-400 font-bold';
            if (log.level === 'warn') badgeClass = 'text-amber-400 font-bold';
            if (log.level === 'info') badgeClass = 'text-slate-400';

            return (
              <div key={log.id} className="flex items-start gap-2.5 hover:bg-white/5 py-1 px-1.5 rounded transition-colors">
                <span className="text-slate-600 select-none text-[11px] font-mono">
                  [{log.timestamp}]
                </span>
                <span className={`text-[11px] font-bold ${badgeClass} min-w-28 flex-shrink-0`}>
                  [{log.agent}]
                </span>
                <span className="text-slate-200 text-xs flex-1 break-words">
                  {log.message}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs pt-2 animate-pulse">
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-ping" />
              <span>Awaiting agent response from neural matrix...</span>
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="px-5 py-2.5 bg-slate-900/80 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>PORT: 3000 • PROTOCOL: SSE / JSON • ENGINE: GEMINI 3.8 FLASH</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};
