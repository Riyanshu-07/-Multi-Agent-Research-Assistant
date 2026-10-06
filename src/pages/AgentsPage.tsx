import React from 'react';
import { Cpu, ShieldCheck, Sparkles, BookOpen, FileText, Palette, Sliders, Check } from 'lucide-react';
import { THEMES, ThemeConfig, ThemeKey } from '../theme';

interface AgentsPageProps {
  confidenceScore: number;
  onConfidenceChange: (score: number) => void;
  currentTheme: ThemeKey;
  onThemeSelect: (theme: ThemeKey) => void;
  theme: ThemeConfig;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  confidenceScore,
  onConfidenceChange,
  currentTheme,
  onThemeSelect,
  theme,
}) => {
  const agents = [
    {
      id: 1,
      name: 'Research Agent',
      badge: 'Information Gathering',
      icon: BookOpen,
      iconColor: 'text-blue-400',
      role: 'Collects scholarly publications from arXiv, queries external web knowledge, and gathers empirical findings.',
      tools: ['arXiv Atom API', 'DuckDuckGo Tool', 'Google Grounding'],
      model: 'gemini-3.8-flash',
    },
    {
      id: 2,
      name: 'Summarizer Agent',
      badge: 'Synthesis & Distillation',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
      role: 'Produces concise executive summaries, isolates architectural patterns, and synthesizes key insights.',
      tools: ['Neural Abstraction', 'Structural Extractor'],
      model: 'gemini-3.8-flash',
    },
    {
      id: 3,
      name: 'Fact Checker Agent',
      badge: 'Claim Verification',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      role: 'Audits factual claims, detects unsupported statements, cross-references citations, and enforces confidence thresholds.',
      tools: ['Claim Auditor', 'Confidence Filter', 'Citation Validator'],
      model: 'gemini-3.8-flash',
    },
    {
      id: 4,
      name: 'Writer Agent',
      badge: 'Executive Publication',
      icon: FileText,
      iconColor: 'text-purple-400',
      role: 'Generates professional Markdown publications complete with Introduction, Technical Findings, Strategic Insights, and APA references.',
      tools: ['Markdown Compiler', 'Citation Formatter'],
      model: 'gemini-3.8-flash',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Cpu className="w-6 h-6" style={{ color: theme.dotColor }} />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Agent Architecture & Configuration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Inspect autonomous agent parameters, verify tools, and customize appearance themes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>4 Autonomous Nodes Active</span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((ag) => {
          const Icon = ag.icon;
          return (
            <div
              key={ag.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${ag.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{ag.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{ag.model}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {ag.badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {ag.role}
              </p>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Active Tools
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ag.tools.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Controls & Sliders */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: theme.dotColor }} />
            <span>Fact-Checking & Audit Controls</span>
          </h2>
          <p className="text-xs text-slate-400">
            Calibrate the Fact Checker Agent's strictness when reviewing claims.
          </p>
        </div>

        <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Fact Verification Confidence Threshold</span>
            <span className="font-mono text-base font-extrabold" style={{ color: theme.dotColor }}>
              {confidenceScore}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={confidenceScore}
            onChange={(e) => onConfidenceChange(Number(e.target.value))}
            className="w-full cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            style={{ accentColor: theme.dotColor }}
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Permissive (Speed-optimized)</span>
            <span>Balanced (Default 75%)</span>
            <span>Strict (Academic rigor 95%+)</span>
          </div>
        </div>
      </div>

      {/* Theme Palettes Showcase */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: theme.dotColor }} />
            <span>Theme & Visual Styling Palettes</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select your preferred interface color system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeSelect(t.id)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative ${
                currentTheme === t.id
                  ? 'bg-slate-850 border-slate-500 shadow-xl ring-1 ring-white/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-4 h-4 rounded-full ring-2 ring-white/20 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${t.dotColor}, ${t.secondaryDotColor})`,
                  }}
                />
                {currentTheme === t.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white mb-0.5">{t.name}</h4>
              <p className="text-xs text-slate-400">{t.tagline}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
