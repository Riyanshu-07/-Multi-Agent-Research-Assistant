import React, { useState } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { THEMES, ThemeKey, getTheme } from '../theme';

interface ThemeSelectorProps {
  currentTheme: ThemeKey;
  onSelectTheme: (theme: ThemeKey) => void;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTheme = getTheme(currentTheme);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-200 transition-all shadow-sm cursor-pointer"
          title="Select theme palette"
        >
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shadow-sm flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.dotColor}, ${activeTheme.secondaryDotColor})`,
            }}
          />
          <span className="font-semibold hidden sm:inline">{activeTheme.name}</span>
          <Palette className="w-3.5 h-3.5 text-slate-400 ml-0.5 flex-shrink-0" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-2xl p-2 z-50 backdrop-blur-xl space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Creative Theme Studio</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeTheme.id === t.id
                      ? 'bg-slate-800 text-white font-semibold ring-1 ring-white/10'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-1 ring-white/20 flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${t.dotColor}, ${t.secondaryDotColor})`,
                      }}
                    />
                    <div className="text-left">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t.tagline}</div>
                    </div>
                  </div>
                  {activeTheme.id === t.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.dotColor }} />
          <span>Product Theme & Visual Atmosphere</span>
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          Active: <strong className="text-white">{activeTheme.name}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.values(THEMES).map(t => (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
              activeTheme.id === t.id
                ? 'bg-slate-800 border-slate-500 shadow-md ring-1 ring-white/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="w-4 h-4 rounded-full ring-2 ring-white/20"
                style={{
                  background: `linear-gradient(135deg, ${t.dotColor}, ${t.secondaryDotColor})`,
                }}
              />
              {activeTheme.id === t.id && (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <div className="text-xs font-bold text-white">{t.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{t.tagline}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
