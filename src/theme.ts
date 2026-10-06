export type ThemeKey = 'aurora' | 'synthwave' | 'bioluminescent' | 'solarpunk' | 'amethyst' | 'obsidian';

export interface ThemeConfig {
  id: ThemeKey;
  name: string;
  tagline: string;
  dotColor: string;
  secondaryDotColor: string;
  ambientGlow: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentGlow: string;
  primaryGradient: string;
  buttonGradient: string;
  activeTabBg: string;
  tagBg: string;
  cardHighlight: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  aurora: {
    id: 'aurora',
    name: 'Cosmic Aurora',
    tagline: 'Ethereal Bioluminescent Borealis',
    dotColor: '#10b981',
    secondaryDotColor: '#8b5cf6',
    ambientGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16, 185, 129, 0.18), rgba(139, 92, 246, 0.14), transparent 70%)',
    accentBg: 'bg-emerald-500/15',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    accentGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    primaryGradient: 'from-emerald-400 via-teal-400 to-indigo-500',
    buttonGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    activeTabBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    tagBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60',
    cardHighlight: 'border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  synthwave: {
    id: 'synthwave',
    name: 'Neon Synthwave',
    tagline: 'Cyberpunk Magenta & Retro Wave',
    dotColor: '#ec4899',
    secondaryDotColor: '#06b6d4',
    ambientGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(236, 72, 153, 0.2), rgba(6, 182, 212, 0.15), transparent 70%)',
    accentBg: 'bg-pink-500/15',
    accentText: 'text-pink-400',
    accentBorder: 'border-pink-500/40',
    accentGlow: 'shadow-[0_0_25px_rgba(236,72,153,0.3)]',
    primaryGradient: 'from-pink-500 via-purple-500 to-cyan-400',
    buttonGradient: 'bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    activeTabBg: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]',
    tagBg: 'bg-pink-950/60 text-pink-300 border-pink-700/60',
    cardHighlight: 'border-pink-500/30 hover:border-pink-400/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]',
  },
  bioluminescent: {
    id: 'bioluminescent',
    name: 'Abyssal Cyan',
    tagline: 'Deep Sea Phosphor & Quantum Crystal',
    dotColor: '#06b6d4',
    secondaryDotColor: '#3b82f6',
    ambientGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(6, 182, 212, 0.22), rgba(59, 130, 246, 0.15), transparent 70%)',
    accentBg: 'bg-cyan-500/15',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-500/40',
    accentGlow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    primaryGradient: 'from-cyan-400 via-teal-400 to-blue-500',
    buttonGradient: 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    activeTabBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    tagBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60',
    cardHighlight: 'border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
  },
  solarpunk: {
    id: 'solarpunk',
    name: 'Solar Flare',
    tagline: 'Molten Amber & Radiant Starlight',
    dotColor: '#f59e0b',
    secondaryDotColor: '#f97316',
    ambientGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(245, 158, 11, 0.22), rgba(249, 115, 22, 0.14), transparent 70%)',
    accentBg: 'bg-amber-500/15',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/40',
    accentGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    primaryGradient: 'from-amber-400 via-orange-400 to-rose-500',
    buttonGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    activeTabBg: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    tagBg: 'bg-amber-950/60 text-amber-300 border-amber-700/60',
    cardHighlight: 'border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Celestial Amethyst',
    tagline: 'Galactic Nebula & Electric Lilac',
    dotColor: '#a855f7',
    secondaryDotColor: '#6366f1',
    ambientGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(168, 85, 247, 0.22), rgba(99, 102, 241, 0.15), transparent 70%)',
    accentBg: 'bg-purple-500/15',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500/40',
    accentGlow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    primaryGradient: 'from-purple-400 via-violet-400 to-indigo-500',
    buttonGradient: 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    activeTabBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    tagBg: 'bg-purple-950/60 text-purple-300 border-purple-700/60',
    cardHighlight: 'border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Stealth Titanium',
    tagline: 'Monochrome Matrix & Hyper Platinum',
    dotColor: '#e2e8f0',
    secondaryDotColor: '#94a3b8',
    ambientGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(226, 232, 240, 0.12), rgba(148, 163, 184, 0.08), transparent 70%)',
    accentBg: 'bg-slate-500/15',
    accentText: 'text-slate-200',
    accentBorder: 'border-slate-500/40',
    accentGlow: 'shadow-[0_0_25px_rgba(226,232,240,0.15)]',
    primaryGradient: 'from-slate-100 via-slate-300 to-slate-500',
    buttonGradient: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 hover:from-white hover:to-slate-300 text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.25)] font-bold',
    activeTabBg: 'bg-slate-200 text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.3)] font-bold',
    tagBg: 'bg-slate-800 text-slate-200 border-slate-600',
    cardHighlight: 'border-slate-600 hover:border-slate-400 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
  },
};

// Legacy alias mappings for seamless backwards compatibility
const THEME_ALIASES: Record<string, ThemeKey> = {
  indigo: 'amethyst',
  ocean: 'bioluminescent',
  emerald: 'aurora',
  amber: 'solarpunk',
  rose: 'synthwave',
};

export function getTheme(key?: string | null): ThemeConfig {
  if (!key) return THEMES.aurora;
  if (key in THEMES) return THEMES[key as ThemeKey];
  if (key in THEME_ALIASES) return THEMES[THEME_ALIASES[key]];
  return THEMES.aurora;
}

export function normalizeThemeKey(key?: string | null): ThemeKey {
  if (!key) return 'aurora';
  if (key in THEMES) return key as ThemeKey;
  if (key in THEME_ALIASES) return THEME_ALIASES[key];
  return 'aurora';
}
