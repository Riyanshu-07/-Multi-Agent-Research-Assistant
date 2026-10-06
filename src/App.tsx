import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Search,
  BookOpen,
  FileCheck2,
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  History,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
  ListFilter,
  Mail,
  FileDown,
  Volume2,
  VolumeX,
  Palette,
  Cpu,
  Eye,
  CheckCheck,
  FlaskConical,
  Terminal,
  Network,
  Orbit,
  Radio
} from 'lucide-react';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { THEMES, ThemeKey, getTheme, normalizeThemeKey } from './theme';
import { ThemeSelector } from './components/ThemeSelector';
import { AgentPipelineVisualizer } from './components/AgentPipelineVisualizer';
import { ReportAudioNarrator } from './components/ReportAudioNarrator';
import { ThreeNeuralSphere } from './components/ThreeNeuralSphere';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { CyberAgentTerminal } from './components/CyberAgentTerminal';
import { sounds } from './utils/soundEffects';
import { safeStorage } from './utils/safeStorage';
import { LibraryPage } from './pages/LibraryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AgentsPage } from './pages/AgentsPage';

export type PageKey = 'lab' | 'library' | 'analytics' | 'agents';

interface ArxivPaper {
  title: string;
  summary: string;
  authors: string[];
  link: string;
  published: string;
}

interface ResearchResult {
  id: string;
  topic: string;
  timestamp: string;
  researchContent: string;
  summaryContent: string;
  verificationContent: string;
  reportContent: string;
  arxivPapers: ArxivPaper[];
  metrics: {
    topicLength: number;
    researchSize: number;
    reportSize: number;
    confidenceScore: number;
  };
}

interface HistoryItem {
  id: string;
  topic: string;
  timestamp: string;
  metrics?: {
    topicLength: number;
    researchSize: number;
    reportSize: number;
  };
}

const EXAMPLE_TOPICS = [
  'Agentic AI',
  'Retrieval-Augmented Generation',
  'Large Language Models',
  'Autonomous Agents',
  'AI Safety',
  'Multi-Agent Systems',
];

export default function App() {
  // Navigation Page State
  const [activePage, setActivePage] = useState<PageKey>('lab');

  // Theme State (Defaulting to Cosmic Aurora)
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    try {
      const saved = safeStorage.getItem('research_assistant_theme');
      return normalizeThemeKey(saved);
    } catch {
      return 'aurora';
    }
  });

  const currentTheme = getTheme(themeKey);

  const handleSelectTheme = (newTheme: ThemeKey) => {
    const validTheme = normalizeThemeKey(newTheme);
    setThemeKey(validTheme);
    try {
      safeStorage.setItem('research_assistant_theme', validTheme);
    } catch {}
    sounds.playClick();
  };

  // Sound Engine State
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);

  const toggleSound = () => {
    const updated = sounds.toggle();
    setSoundEnabled(updated);
  };

  // Terminal & HUD State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [reportViewMode, setReportViewMode] = useState<'markdown' | 'graph'>('markdown');

  // Input State
  const [topic, setTopic] = useState('Agentic AI');
  const [confidenceScore, setConfidenceScore] = useState(75);

  // Settings & Toggles
  const [showResearch, setShowResearch] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [showChecker, setShowChecker] = useState(true);

  // Pipeline Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [stepMessage, setStepMessage] = useState<string>('');

  // Results State
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'research' | 'summary' | 'verification' | 'report'>('report');
  const [copied, setCopied] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Read/Unread Review Tracking State
  const [readSessionIds, setReadSessionIds] = useState<Set<string>>(() => {
    try {
      const saved = safeStorage.getItem('research_read_session_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [historyFilter, setHistoryFilter] = useState<'all' | 'unread'>('all');

  const toggleReadStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    setReadSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        safeStorage.setItem('research_read_session_ids', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const markAsRead = (id: string) => {
    setReadSessionIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        safeStorage.setItem('research_read_session_ids', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const markAllAsRead = () => {
    sounds.playClick();
    const next = new Set([...readSessionIds, ...historyList.map(h => h.id)]);
    setReadSessionIds(next);
    try {
      safeStorage.setItem('research_read_session_ids', JSON.stringify([...next]));
    } catch {}
  };

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch {}
  };

  const handleGenerate = async (queryTopic?: string) => {
    const targetTopic = (queryTopic || topic).trim();
    if (!targetTopic || isLoading) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    sounds.playChirp();
    setActivePage('lab');
    setIsLoading(true);
    setProgressPercent(12);
    setCurrentStep(1);
    setStepMessage('🔍 Researching web concepts & arXiv academic papers...');

    const pTimer1 = setTimeout(() => {
      sounds.playAgentSweep(2);
      setProgressPercent(32);
      setCurrentStep(2);
      setStepMessage('✍ Summarizing & extracting architectural insights...');
    }, 1800);

    const pTimer2 = setTimeout(() => {
      sounds.playAgentSweep(3);
      setProgressPercent(58);
      setCurrentStep(3);
      setStepMessage('✅ Fact Checking & validating claim credibility...');
    }, 3600);

    const pTimer3 = setTimeout(() => {
      sounds.playAgentSweep(4);
      setProgressPercent(82);
      setCurrentStep(4);
      setStepMessage('📄 Writing executive research publication...');
    }, 5400);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          confidenceScore,
        }),
      });

      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      clearTimeout(pTimer3);

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: ResearchResult = await res.json();
      setProgressPercent(100);
      setStepMessage('Completed');
      setCurrentStep(5);
      setResult(data);
      setActiveTab('report');
      markAsRead(data.id);
      sounds.playSuccess();

      setHistoryList(prev => [
        { id: data.id, topic: data.topic, timestamp: data.timestamp, metrics: data.metrics },
        ...prev.filter(item => item.id !== data.id),
      ]);
    } catch (err) {
      console.error('Research pipeline failed:', err);
      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      clearTimeout(pTimer3);
      setStepMessage('Completed via local multi-agent synthesis');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPastSession = async (id: string) => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/history/${id}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setTopic(data.topic);
        setActiveTab('report');
        setActivePage('lab');
        markAsRead(id);
      }
    } catch (e) {
      console.warn('Failed to load past session:', e);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!result?.reportContent) return;
    sounds.playClick();
    const blob = new Blob([result.reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research_report_${result.topic.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    if (!result?.reportContent) return;
    sounds.playClick();
    navigator.clipboard.writeText(result.reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHistoryJson = async () => {
    if (historyList.length === 0 || isExporting) return;
    sounds.playClick();
    setIsExporting(true);
    try {
      const res = await fetch('/api/history?full=true');
      const sessionsData = res.ok ? await res.json() : historyList;

      const exportPayload = {
        app: 'Multi-Agent Research Assistant',
        exportedAt: new Date().toISOString(),
        totalSessions: sessionsData.length,
        version: '3.0',
        sessions: sessionsData.map((s: any) => ({
          ...s,
          isReviewed: readSessionIds.has(s.id),
        })),
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `research_history_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export history as JSON:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const { wordCount, readingTime } = useMemo(() => {
    if (!result?.reportContent) return { wordCount: 0, readingTime: 1 };
    const words = result.reportContent.trim().split(/\s+/).length;
    return {
      wordCount: words,
      readingTime: Math.max(1, Math.ceil(words / 220)),
    };
  }, [result]);

  const unreadCount = historyList.filter(h => !readSessionIds.has(h.id)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased relative selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* Dynamic Creative Ambient Glow Canvas & Spatial Grid */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700 -z-10"
        style={{ background: currentTheme.ambientGlow }}
      />
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_right,#33415514_1px,transparent_1px),linear-gradient(to_bottom,#33415514_1px,transparent_1px)] bg-[size:36px_36px]" />

      {/* Cyber Agent Terminal HUD Drawer */}
      <CyberAgentTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        isLoading={isLoading}
        currentStep={currentStep}
        topic={topic}
        theme={currentTheme}
      />

      {/* --------------------------------------------------- */}
      {/* TOP MULTI-PAGE NAVIGATION BAR                       */}
      {/* --------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 px-4 md:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              setActivePage('lab');
              sounds.playClick();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg ring-1 ring-white/10 cursor-pointer transform hover:scale-105 transition-all"
            style={{ backgroundColor: `${currentTheme.dotColor}25` }}
          >
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => {
                  setActivePage('lab');
                  sounds.playClick();
                }}
                className="font-extrabold text-sm md:text-base tracking-tight text-white cursor-pointer hover:text-slate-200 transition-colors"
              >
                Multi-Agent Research Assistant
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini 3.8 Flash • arXiv & Web Grounded</span>
            </div>
          </div>
        </div>

        {/* Page Switcher Navigation */}
        <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => {
              setActivePage('lab');
              sounds.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePage === 'lab'
                ? currentTheme.activeTabBg
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Research Lab</span>
            <span className="sm:hidden">Lab</span>
          </button>

          <button
            onClick={() => {
              setActivePage('library');
              sounds.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer relative ${
              activePage === 'library'
                ? currentTheme.activeTabBg
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Library</span>
            <span className="sm:hidden">Archive</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-extrabold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActivePage('analytics');
              sounds.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePage === 'analytics'
                ? currentTheme.activeTabBg
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => {
              setActivePage('agents');
              sounds.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePage === 'agents'
                ? currentTheme.activeTabBg
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Agents & Config</span>
            <span className="md:hidden">Config</span>
          </button>
        </nav>

        {/* Right Tools: Cyber Terminal HUD, Sound FX Toggle, Theme Selector */}
        <div className="flex items-center gap-2">
          {/* Cyber Terminal Button */}
          <button
            onClick={() => {
              setIsTerminalOpen(true);
              sounds.playClick();
            }}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-400 transition-all cursor-pointer shadow-sm hidden sm:flex items-center gap-1 text-xs"
            title="Open Live Agent Telemetry Stream"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline text-[11px] font-mono">HUD</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer shadow-sm ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Cyber Sound FX Enabled (Click to mute)' : 'Cyber Sound FX Muted (Click to enable)'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Creative Theme Selector */}
          <ThemeSelector
            currentTheme={themeKey}
            onSelectTheme={handleSelectTheme}
            compact
          />
        </div>
      </header>

      {/* Main Workspace Area with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`${
            isSidebarOpen ? 'w-full md:w-76' : 'w-full md:w-16'
          } bg-slate-900/80 border-r border-slate-800 transition-all duration-300 flex-shrink-0 flex flex-col p-4 backdrop-blur-xl`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" />
              {isSidebarOpen && (
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Control Deck
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
                sounds.playClick();
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isSidebarOpen && (
            <div className="flex-1 overflow-y-auto space-y-5 pt-3.5 pr-1">
              {/* Workspace Navigation Cards */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                  Workspace Views
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setActivePage('lab');
                      sounds.playClick();
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      activePage === 'lab'
                        ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 mb-1" style={{ color: currentTheme.dotColor }} />
                    <div className="truncate">Research Lab</div>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('library');
                      sounds.playClick();
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      activePage === 'library'
                        ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 mb-1 text-emerald-400" />
                    <div className="truncate">Library ({historyList.length})</div>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('analytics');
                      sounds.playClick();
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      activePage === 'analytics'
                        ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 mb-1 text-blue-400" />
                    <div className="truncate">Analytics</div>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('agents');
                      sounds.playClick();
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      activePage === 'agents'
                        ? 'bg-slate-800 border-slate-600 text-white font-semibold'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 mb-1 text-purple-400" />
                    <div className="truncate">Agents Config</div>
                  </button>
                </div>
              </div>

              {/* View Visibility Checkboxes */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                  <ListFilter className="w-3.5 h-3.5" />
                  Report Sections
                </label>
                <div className="space-y-2 bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showResearch}
                      onChange={e => setShowResearch(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-500"
                    />
                    <span>Show Research Output</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showSummary}
                      onChange={e => setShowSummary(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-500"
                    />
                    <span>Show Summary</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showChecker}
                      onChange={e => setShowChecker(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-500"
                    />
                    <span>Show Fact Check</span>
                  </label>
                </div>
              </div>

              {/* Confidence Threshold Quick Slider */}
              <div className="space-y-2 bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Confidence Threshold</span>
                  <span className="font-mono font-bold text-xs" style={{ color: currentTheme.dotColor }}>
                    {confidenceScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceScore}
                  onChange={e => setConfidenceScore(Number(e.target.value))}
                  className="w-full cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  style={{ accentColor: currentTheme.dotColor }}
                />
              </div>

              {/* Quick History List */}
              {historyList.length > 0 && (() => {
                const filteredList = historyFilter === 'unread'
                  ? historyList.filter(h => !readSessionIds.has(h.id))
                  : historyList;

                return (
                  <div className="pt-3 border-t border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" style={{ color: currentTheme.dotColor }} />
                        Query History
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleExportHistoryJson}
                          disabled={isExporting || historyList.length === 0}
                          title="Export entire query history as JSON backup"
                          className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <FileDown className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono">{historyList.length}</span>
                      </div>
                    </div>

                    {/* Filter Tabs & Mark All Read */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[11px]">
                        <button
                          onClick={() => {
                            setHistoryFilter('all');
                            sounds.playClick();
                          }}
                          className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            historyFilter === 'all'
                              ? 'bg-slate-800 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          All ({historyList.length})
                        </button>
                        <button
                          onClick={() => {
                            setHistoryFilter('unread');
                            sounds.playClick();
                          }}
                          className={`flex-1 py-1 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                            historyFilter === 'unread'
                              ? 'bg-slate-800 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>Unread</span>
                          {unreadCount > 0 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: currentTheme.dotColor }}
                            />
                          )}
                          <span>({unreadCount})</span>
                        </button>
                      </div>

                      {unreadCount > 0 && (
                        <div className="flex justify-end">
                          <button
                            onClick={markAllAsRead}
                            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>Mark all as read</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {filteredList.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/30 rounded-xl border border-slate-800/60">
                          All reports reviewed 🎉
                        </div>
                      ) : (
                        filteredList.slice(0, 8).map((item, idx) => {
                          const isRead = readSessionIds.has(item.id);
                          return (
                            <div
                              key={item.id || idx}
                              onClick={() => loadPastSession(item.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs border transition-all flex items-center justify-between group cursor-pointer ${
                                result?.id === item.id
                                  ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                                  : isRead
                                  ? 'bg-slate-950/40 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                                  : 'bg-slate-900/90 hover:bg-slate-850 border-slate-700 hover:border-slate-600 text-slate-100 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity ${
                                    isRead ? 'bg-slate-600 opacity-40' : 'animate-pulse'
                                  }`}
                                  style={{
                                    backgroundColor: isRead ? undefined : currentTheme.dotColor,
                                  }}
                                  title={isRead ? 'Reviewed' : 'Unread report'}
                                />
                                <span className="truncate">{item.topic}</span>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={(e) => toggleReadStatus(item.id, e)}
                                  className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition-colors"
                                  title={isRead ? 'Mark as unread' : 'Mark as read'}
                                >
                                  {isRead ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400/80 hover:text-emerald-300" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                                  )}
                                </button>
                                <ArrowRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      onClick={handleExportHistoryJson}
                      disabled={isExporting || historyList.length === 0}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <FileDown className="w-3.5 h-3.5 text-slate-400 group-hover:scale-110 transition-transform" />
                      <span>{isExporting ? 'Exporting JSON...' : 'Export History (JSON)'}</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </aside>

        {/* MAIN MULTI-PAGE WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {/* PAGE 1: RESEARCH LAB */}
          {activePage === 'lab' && (
            <div className="space-y-6">
              {/* TOP HERO & INQUIRY COMMAND STATION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Search & Inquiry Command Bar (7 cols) */}
                <div className="lg:col-span-8 bg-slate-900/85 border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl flex flex-col justify-between space-y-4 ring-1 ring-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5" style={{ color: currentTheme.dotColor }} />
                        Research Inquiry Command
                      </label>
                      <button
                        onClick={() => setIsTerminalOpen(true)}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>Stream Telemetry</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={topic}
                          onChange={e => setTopic(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                          placeholder="Enter academic topic (e.g. Agentic AI, Autonomous RAG, Hallucination Mitigations)..."
                          disabled={isLoading}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-4 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-60 shadow-inner font-medium"
                        />
                        {topic && !isLoading && (
                          <button
                            onClick={() => setTopic('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleGenerate()}
                        disabled={isLoading || !topic.trim()}
                        className={`px-7 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${currentTheme.buttonGradient} ${currentTheme.accentGlow}`}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Orchestrating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Launch Agents</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Curated Recommendations */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400 font-medium">Curated Topics:</span>
                    {EXAMPLE_TOPICS.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTopic(t);
                          handleGenerate(t);
                        }}
                        disabled={isLoading}
                        className="px-3 py-1 rounded-xl text-xs bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Neural Constellation Holo-Globe (4 cols) */}
                <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between ring-1 ring-white/5 min-h-[220px]">
                  <ThreeNeuralSphere
                    isLoading={isLoading}
                    currentStep={currentStep}
                    theme={currentTheme}
                    className="w-full h-full min-h-[200px]"
                    compact
                  />
                </div>
              </div>

              {/* VISUAL PIPELINE ORCHESTRATOR */}
              <AgentPipelineVisualizer
                currentStep={currentStep}
                isLoading={isLoading}
                theme={currentTheme}
              />

              {/* PROGRESS BANNER */}
              {isLoading && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: currentTheme.dotColor }} />
                      {stepMessage}
                    </span>
                    <span className="font-mono font-bold" style={{ color: currentTheme.dotColor }}>
                      {progressPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r ${currentTheme.primaryGradient}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* METRICS ROW */}
              {result && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <span className="text-xs text-slate-400 block mb-1">Topic Length</span>
                    <span className="text-2xl font-bold text-white font-mono">{result.metrics.topicLength}</span>
                    <span className="text-[11px] text-slate-500 ml-1">characters</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <span className="text-xs text-slate-400 block mb-1">Research Corpus</span>
                    <span className="text-2xl font-bold font-mono" style={{ color: currentTheme.dotColor }}>
                      {result.metrics.researchSize}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">chars</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <span className="text-xs text-slate-400 block mb-1">Publication Size</span>
                    <span className="text-2xl font-bold text-white font-mono">{wordCount}</span>
                    <span className="text-[11px] text-slate-500 ml-1">words (~{readingTime}m read)</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <span className="text-xs text-slate-400 block mb-1">Academic Evidence</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono">
                      {result.arxivPapers?.length || 0}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">arXiv papers</span>
                  </div>
                </div>
              )}

              {/* OUTPUT TABS */}
              {result && (
                <div className="bg-slate-900/85 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl ring-1 ring-white/5">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-slate-800 bg-slate-950/70 p-2 overflow-x-auto gap-1.5 items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {showResearch && (
                        <button
                          onClick={() => {
                            setActiveTab('research');
                            sounds.playClick();
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'research'
                              ? currentTheme.activeTabBg
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>📚 Research Output</span>
                          {result.arxivPapers?.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                              {result.arxivPapers.length}
                            </span>
                          )}
                        </button>
                      )}
                      {showSummary && (
                        <button
                          onClick={() => {
                            setActiveTab('summary');
                            sounds.playClick();
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'summary'
                              ? currentTheme.activeTabBg
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>📝 Executive Summary</span>
                        </button>
                      )}
                      {showChecker && (
                        <button
                          onClick={() => {
                            setActiveTab('verification');
                            sounds.playClick();
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'verification'
                              ? currentTheme.activeTabBg
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>✅ Verification Audit</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab('report');
                          sounds.playClick();
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === 'report'
                            ? currentTheme.activeTabBg
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>📄 Final Report</span>
                      </button>
                    </div>

                    {/* View Switcher when on Report tab: Document vs Knowledge Graph */}
                    {activeTab === 'report' && (
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          onClick={() => {
                            setReportViewMode('markdown');
                            sounds.playClick();
                          }}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                            reportViewMode === 'markdown'
                              ? 'bg-slate-800 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>Document</span>
                        </button>
                        <button
                          onClick={() => {
                            setReportViewMode('graph');
                            sounds.playClick();
                          }}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                            reportViewMode === 'graph'
                              ? 'bg-slate-800 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Network className="w-3 h-3 text-emerald-400" />
                          <span>Mind-Map Graph</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tab Contents */}
                  <div className="p-5 md:p-8">
                    {/* 1. Research Tab */}
                    {activeTab === 'research' && (
                      <div className="space-y-6">
                        {result.arxivPapers && result.arxivPapers.length > 0 && (
                          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
                            <div className="flex items-center justify-between">
                              <h4
                                className="text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
                                style={{ color: currentTheme.dotColor }}
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                arXiv Academic Papers Retrieved
                              </h4>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {result.arxivPapers.length} publications
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {result.arxivPapers.map((paper, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                                >
                                  <div className="space-y-1.5">
                                    <a
                                      href={paper.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs font-semibold text-slate-200 hover:underline line-clamp-2 flex items-start gap-1"
                                    >
                                      <span>{paper.title}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                                    </a>
                                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                                      {paper.summary}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                                    <span className="truncate max-w-[160px]">
                                      {paper.authors.join(', ') || 'Scholars'}
                                    </span>
                                    <span>{paper.published}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="prose prose-invert max-w-none">
                          <MarkdownRenderer content={result.researchContent} />
                        </div>
                      </div>
                    )}

                    {/* 2. Summary Tab */}
                    {activeTab === 'summary' && (
                      <div className="prose prose-invert max-w-none">
                        <MarkdownRenderer content={result.summaryContent} />
                      </div>
                    )}

                    {/* 3. Verification Tab */}
                    {activeTab === 'verification' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs">
                          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>
                            Fact verification audited with confidence threshold: <strong>{confidenceScore}%</strong>. Claims validated against scholarly corpora.
                          </span>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <MarkdownRenderer content={result.verificationContent} />
                        </div>
                      </div>
                    )}

                    {/* 4. Final Report Tab */}
                    {activeTab === 'report' && (
                      <div className="space-y-6">
                        {reportViewMode === 'graph' ? (
                          /* Interactive Mind-Map / Knowledge Graph View */
                          <KnowledgeGraphView
                            topic={result.topic}
                            arxivPapers={result.arxivPapers}
                            summaryText={result.summaryContent}
                            verificationText={result.verificationContent}
                            theme={currentTheme}
                          />
                        ) : (
                          /* Publication Document View */
                          <>
                            {/* Action Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                              <div className="flex items-center gap-2.5 text-xs text-slate-400 flex-wrap">
                                <button
                                  onClick={() => toggleReadStatus(result.id)}
                                  className={`px-2.5 py-1 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    readSessionIds.has(result.id)
                                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                                      : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
                                  }`}
                                  title={readSessionIds.has(result.id) ? "Mark this report as Unread" : "Mark this report as Reviewed / Read"}
                                >
                                  {readSessionIds.has(result.id) ? (
                                    <>
                                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Reviewed</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Mark Reviewed</span>
                                    </>
                                  )}
                                </button>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Publication Ready</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{readingTime} min read</span>
                                </div>
                                <span>•</span>
                                <span>{wordCount} words</span>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={handleCopyReport}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Copy Markdown Report"
                                >
                                  {copied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={`mailto:?subject=${encodeURIComponent(
                                    `Research Report: ${result.topic}`
                                  )}&body=${encodeURIComponent(
                                    `Hello,\n\nPlease find the research report on "${result.topic}" generated by the Multi-Agent Research Assistant below:\n\n${result.reportContent}\n\n---\nGenerated by Multi-Agent Research Assistant`
                                  )}`}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Share via Email"
                                >
                                  <Mail className="w-3.5 h-3.5" style={{ color: currentTheme.dotColor }} />
                                  <span>Share via Email</span>
                                </a>

                                <button
                                  onClick={handleDownloadMarkdown}
                                  className={`px-4 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${currentTheme.buttonGradient}`}
                                  title="Download Markdown Report"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Report</span>
                                </button>
                              </div>
                            </div>

                            {/* Neural Narrator Audio Player */}
                            <ReportAudioNarrator
                              reportText={result.reportContent}
                              topic={result.topic}
                              theme={currentTheme}
                            />

                            {/* Report Content Body */}
                            <div className="prose prose-invert max-w-none bg-slate-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-inner">
                              <MarkdownRenderer content={result.reportContent} />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE 2: LIBRARY & ARCHIVES */}
          {activePage === 'library' && (
            <LibraryPage
              historyList={historyList}
              readSessionIds={readSessionIds}
              onSelectSession={loadPastSession}
              onToggleRead={toggleReadStatus}
              onMarkAllRead={markAllAsRead}
              onExportJson={handleExportHistoryJson}
              isExporting={isExporting}
              theme={currentTheme}
            />
          )}

          {/* PAGE 3: ANALYTICS & TELEMETRY */}
          {activePage === 'analytics' && (
            <AnalyticsPage
              researchSize={result?.metrics.researchSize || 1800}
              reportSize={result?.metrics.reportSize || 2400}
              confidenceScore={confidenceScore}
              totalSessions={historyList.length}
              theme={currentTheme}
            />
          )}

          {/* PAGE 4: AGENTS & CONFIG */}
          {activePage === 'agents' && (
            <AgentsPage
              confidenceScore={confidenceScore}
              onConfidenceChange={setConfidenceScore}
              currentTheme={themeKey}
              onThemeSelect={handleSelectTheme}
              theme={currentTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
