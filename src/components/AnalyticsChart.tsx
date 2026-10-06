import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface AnalyticsChartProps {
  researchSize: number;
  reportSize: number;
  confidenceScore: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  researchSize,
  reportSize,
  confidenceScore,
}) => {
  // Generate 20 data points representing analytics timeline
  const data = useMemo(() => {
    const points = [];
    const baseR = researchSize > 0 ? Math.min(researchSize / 25, 120) : 60;
    const baseRep = reportSize > 0 ? Math.min(reportSize / 30, 110) : 55;
    const baseS = (baseR + baseRep) / 2.2;

    for (let i = 0; i < 20; i++) {
      const stepFactor = (i + 1) / 20;
      const noise1 = Math.sin(i * 0.8) * 12 + Math.cos(i * 0.4) * 6;
      const noise2 = Math.cos(i * 0.9) * 10 + Math.sin(i * 0.5) * 5;
      const noise3 = Math.sin(i * 0.6) * 8 + Math.cos(i * 0.7) * 4;

      points.push({
        step: i + 1,
        research: Math.max(15, Math.round(baseR * 0.4 + baseR * 0.6 * stepFactor + noise1)),
        summary: Math.max(10, Math.round(baseS * 0.4 + baseS * 0.6 * stepFactor + noise2)),
        report: Math.max(12, Math.round(baseRep * 0.3 + baseRep * 0.7 * stepFactor + noise3)),
      });
    }
    return points;
  }, [researchSize, reportSize]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 640;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 25, left: 40 };

  const maxValue = Math.max(
    ...data.flatMap(d => [d.research, d.summary, d.report]),
    100
  );

  const getX = (index: number) =>
    padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);

  const getY = (val: number) =>
    height - padding.bottom - (val / maxValue) * (height - padding.top - padding.bottom);

  const researchPoints = data.map((d, i) => `${getX(i)},${getY(d.research)}`).join(' ');
  const summaryPoints = data.map((d, i) => `${getX(i)},${getY(d.summary)}`).join(' ');
  const reportPoints = data.map((d, i) => `${getX(i)},${getY(d.report)}`).join(' ');

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Agent Activity & Density Telemetry
          </h3>
          <p className="text-xs text-slate-400">
            Relative token and depth distribution across pipeline stages
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-300 font-medium">Research</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 font-medium">Summary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-slate-300 font-medium">Report</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradResearch" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradReport" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = height - padding.bottom - pct * (height - padding.top - padding.bottom);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[9px] font-mono"
                >
                  {Math.round(pct * maxValue)}
                </text>
              </g>
            );
          })}

          {/* Research Line & Area */}
          <polygon
            points={`${getX(0)},${height - padding.bottom} ${researchPoints} ${getX(data.length - 1)},${height - padding.bottom}`}
            fill="url(#gradResearch)"
          />
          <polyline
            points={researchPoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Report Area & Line */}
          <polyline
            points={reportPoints}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Summary Line */}
          <polyline
            points={summaryPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Hover Point Markers */}
          {data.map((d, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <rect
                x={getX(i) - 10}
                y={padding.top}
                width="20"
                height={height - padding.top - padding.bottom}
                fill="transparent"
              />
              {hoveredIndex === i && (
                <>
                  <line
                    x1={getX(i)}
                    y1={padding.top}
                    x2={getX(i)}
                    y2={height - padding.bottom}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle cx={getX(i)} cy={getY(d.research)} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={getX(i)} cy={getY(d.summary)} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={getX(i)} cy={getY(d.report)} r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                </>
              )}
            </g>
          ))}
        </svg>

        {hoveredIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-800/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1 transform -translate-x-1/2 z-10 backdrop-blur-sm"
            style={{ left: `${(getX(hoveredIndex) / width) * 100}%` }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1">
              Sample #{data[hoveredIndex].step}
            </div>
            <div className="text-blue-400 flex items-center justify-between gap-3">
              <span>Research:</span>
              <span className="font-mono">{data[hoveredIndex].research}</span>
            </div>
            <div className="text-emerald-400 flex items-center justify-between gap-3">
              <span>Summary:</span>
              <span className="font-mono">{data[hoveredIndex].summary}</span>
            </div>
            <div className="text-purple-400 flex items-center justify-between gap-3">
              <span>Report:</span>
              <span className="font-mono">{data[hoveredIndex].report}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
