import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  Sliders,
  ChevronDown,
  User,
  Gauge
} from 'lucide-react';
import { ThemeConfig } from '../theme';

interface ReportAudioNarratorProps {
  reportText: string;
  topic: string;
  theme: ThemeConfig;
}

export const ReportAudioNarrator: React.FC<ReportAudioNarratorProps> = ({
  reportText,
  topic,
  theme,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.96); // Natural human cadence
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [totalSentences, setTotalSentences] = useState<number>(0);
  const [currentSentencePreview, setCurrentSentencePreview] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const sentencesRef = useRef<string[]>([]);
  const isCancelledRef = useRef<boolean>(false);

  // Load and rank browser voices to find highest quality natural/human voices
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    } catch {
      return;
    }

    const updateVoices = () => {
      try {
        if (!window.speechSynthesis) return;
        const available = window.speechSynthesis.getVoices();
        if (!available || available.length === 0) return;

      // Filter for English voices and rank by naturalness
      const enVoices = available.filter(v => v.lang.startsWith('en'));
      const sorted = [...(enVoices.length > 0 ? enVoices : available)].sort((a, b) => {
        const score = (v: SpeechSynthesisVoice) => {
          let s = 0;
          const name = v.name.toLowerCase();
          if (name.includes('natural') || name.includes('online')) s += 100;
          if (name.includes('neural')) s += 90;
          if (name.includes('google')) s += 80;
          if (name.includes('samantha') || name.includes('daniel') || name.includes('karen') || name.includes('serena') || name.includes('oliver')) s += 70;
          if (name.includes('premium') || name.includes('enhanced')) s += 60;
          if (v.lang === 'en-US' || v.lang === 'en-GB') s += 20;
          return s;
        };
        return score(b) - score(a);
      });

      setVoices(sorted);
      if (sorted.length > 0 && !selectedVoiceUri) {
        setSelectedVoiceUri(sorted[0].voiceURI);
      }
      } catch {}
    };

    try {
      updateVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    } catch {}

    return () => {
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch {}
      isCancelledRef.current = true;
    };
  }, []);

  // Preprocess report Markdown into natural, human conversational sentences
  const prepareHumanScript = (markdown: string, topicName: string): string[] => {
    if (!markdown) return [];

    let script = markdown
      // Convert markdown headers to conversational transitions
      .replace(/^#\s+(.+)$/gm, `Here is the comprehensive research publication on ${topicName}.`)
      .replace(/^##\s+1\.\s*Introduction/gim, `To begin, let's look at the introduction and background.`)
      .replace(/^##\s+2\.\s*Technical Findings/gim, `Moving into the technical findings and architectural analysis.`)
      .replace(/^##\s+3\.\s*Critical Insights.*/gim, `Next, here are the critical insights and key strategic takeaways.`)
      .replace(/^##\s+4\.\s*Conclusion.*/gim, `In conclusion,`)
      .replace(/^##\s+5\.\s*References.*/gim, `This concludes the verified research findings and citations.`)
      .replace(/^##+\s+(.+)$/gm, `Section: $1.`)
      // Strip markdown links, formatting, bullets, tables
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}.*?`{1,3}/gs, '')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\|.*?\|/g, '')
      .replace(/---/g, '')
      .replace(/>\s+/g, '');

    // Split into sentences using punctuation boundaries
    const rawSentences = script
      .split(/(?<=[.?!])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 4 && !s.startsWith('http'));

    return rawSentences;
  };

  const playSentenceQueue = (index: number) => {
    if (isCancelledRef.current || !('speechSynthesis' in window)) return;
    const sentences = sentencesRef.current;

    if (index >= sentences.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIndex(0);
      setCurrentSentencePreview('');
      return;
    }

    const textToSpeak = sentences[index];
    setCurrentSentenceIndex(index);
    setCurrentSentencePreview(textToSpeak);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    const chosenVoice = voices.find(v => v.voiceURI === selectedVoiceUri);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        // Natural human breath pause between sentences (120ms)
        setTimeout(() => {
          if (!isCancelledRef.current) {
            playSentenceQueue(index + 1);
          }
        }, 120);
      }
    };

    utterance.onerror = (e) => {
      // If cancelled, ignore error
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.warn('Speech synthesis error on sentence:', e);
      if (!isCancelledRef.current) {
        playSentenceQueue(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStartSpeaking = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    isCancelledRef.current = false;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    const processed = prepareHumanScript(reportText, topic);
    sentencesRef.current = processed;
    setTotalSentences(processed.length);

    if (processed.length === 0) return;

    setIsPlaying(true);
    setIsPaused(false);
    playSentenceQueue(0);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    isCancelledRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
    setCurrentSentencePreview('');
  };

  const isSpeechSupported = (() => {
    try {
      return typeof window !== 'undefined' && 'speechSynthesis' in window && Boolean(window.speechSynthesis);
    } catch {
      return false;
    }
  })();

  if (!isSpeechSupported) {
    return null;
  }

  const progressPercent = totalSentences > 0
    ? Math.round(((currentSentenceIndex + 1) / totalSentences) * 100)
    : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 backdrop-blur-md ring-1 ring-white/5">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isPlaying ? (
              <Volume2 className="w-4 h-4 animate-bounce text-emerald-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                🎙️ Neural Narrator
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Natural Cadence
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isPlaying
                ? `Narrating sentence ${currentSentenceIndex + 1} of ${totalSentences}`
                : isPaused
                ? 'Narrator paused'
                : 'Listen to a natural human reading of this publication'}
            </p>
          </div>
        </div>

        {/* Buttons and Settings Toggle */}
        <div className="flex items-center gap-2">
          {!isPlaying && !isPaused ? (
            <button
              onClick={handleStartSpeaking}
              className={`px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${theme.buttonGradient}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Read Aloud</span>
            </button>
          ) : (
            <>
              {isPlaying && (
                <button
                  onClick={handlePause}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Pause speech"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {isPaused && (
                <button
                  onClick={handleStartSpeaking}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  title="Resume speech"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={handleStop}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Stop narration"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            </>
          )}

          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              isSettingsOpen
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Configure Narrator Voice & Pace"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time sentence visualizer when playing */}
      {isPlaying && currentSentencePreview && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Speaking now:
            </span>
            <span className="font-mono">{progressPercent}%</span>
          </div>

          <p className="text-xs text-slate-200 italic leading-relaxed pl-2 border-l-2 border-emerald-500/80">
            "{currentSentencePreview}"
          </p>

          <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Voice & Cadence Tuning Panel */}
      {isSettingsOpen && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fadeIn">
          {/* Voice Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              Narrator Voice
            </label>
            <select
              value={selectedVoiceUri}
              onChange={(e) => setSelectedVoiceUri(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speaking Pace / Cadence Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-slate-400" />
                Pace / Cadence
              </label>
              <span className="font-mono text-[10px] text-slate-400">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              style={{ accentColor: theme.dotColor }}
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Deliberate</span>
              <span>Natural (0.95x)</span>
              <span>Brisk</span>
            </div>
          </div>

          {/* Vocal Pitch Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                Vocal Resonance / Pitch
              </label>
              <span className="font-mono text-[10px] text-slate-400">{speechPitch}x</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.05"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              style={{ accentColor: theme.dotColor }}
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Deeper</span>
              <span>Natural</span>
              <span>Higher</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
