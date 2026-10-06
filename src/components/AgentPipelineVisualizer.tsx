import React from 'react';
import { Search, Sparkles, ShieldCheck, FileText, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { ThemeConfig } from '../theme';

interface AgentPipelineVisualizerProps {
  currentStep: number; // 0: idle, 1: researching, 2: summarizing, 3: checking, 4: writing, 5: done
  isLoading: boolean;
  theme: ThemeConfig;
}

export const AgentPipelineVisualizer: React.FC<AgentPipelineVisualizerProps> = ({
  currentStep,
  isLoading,
  theme,
}) => {
  const steps = [
    {
      id: 1,
      name: 'Research Agent',
      icon: Search,
      badge: 'arXiv + Web',
      desc: 'Retrieves peer-reviewed papers & live concepts',
      tools: ['arXiv API', 'DuckDuckGo'],
    },
    {
      id: 2,
      name: 'Summarizer',
      icon: Sparkles,
      badge: 'Synthesis',
      desc: 'Distills architectural pillars & key insights',
      tools: ['Neural Abstraction'],
    },
    {
      id: 3,
      name: 'Fact Checker',
      icon: ShieldCheck,
      badge: 'Auditor',
      desc: 'Validates claims & cross-references citations',
      tools: ['Claim Audit', 'Confidence Bounds'],
    },
    {
      id: 4,
      name: 'Writer Agent',
      icon: FileText,
      badge: 'Publisher',
      desc: 'Compiles executive research publication',
      tools: ['Markdown Engine', 'APA Citations'],
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.dotColor }} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Multi-Agent Cognitive Pipeline
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {isLoading
            ? `Active: ${steps[Math.max(0, currentStep - 1)]?.name || 'Initializing...'}`
            : 'Autonomous Orchestration'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = isLoading && currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? `bg-slate-800/90 border-slate-600 shadow-lg ${theme.accentGlow} ring-1 ring-white/10`
                  : isCompleted
                  ? 'bg-slate-900/90 border-slate-700/60 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-white text-slate-950 shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isActive
                        ? `${theme.tagBg} font-semibold`
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white mb-0.5">{step.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 flex-wrap">
                {step.tools.map((tool, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/40"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
