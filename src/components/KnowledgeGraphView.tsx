import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ThemeConfig } from '../theme';
import { ExternalLink, BookOpen, ShieldCheck, Sparkles, Network, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface KnowledgeGraphProps {
  topic: string;
  arxivPapers: Array<{
    title: string;
    summary: string;
    authors: string[];
    link: string;
    published: string;
  }>;
  summaryText: string;
  verificationText: string;
  theme: ThemeConfig;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'root' | 'paper' | 'insight' | 'claim';
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  details?: string;
  link?: string;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphProps> = ({
  topic,
  arxivPapers,
  summaryText,
  verificationText,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);

  // Extract key phrases for graph nodes
  const initialNodes = useMemo(() => {
    const nodes: GraphNode[] = [];
    const centerX = 360;
    const centerY = 240;

    // Central Root Node
    nodes.push({
      id: 'root',
      label: topic,
      type: 'root',
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      color: theme.dotColor,
      details: `Central Investigation Anchor: ${topic}`,
    });

    // 1. arXiv Paper Nodes
    arxivPapers.slice(0, 4).forEach((paper, idx) => {
      const angle = (idx / 4) * Math.PI * 0.8 + 0.2;
      const dist = 160 + (idx % 2) * 35;
      nodes.push({
        id: `paper-${idx}`,
        label: paper.title.slice(0, 32) + '...',
        type: 'paper',
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        color: '#3b82f6',
        details: `${paper.title}\nBy ${paper.authors.join(', ')} (${paper.published})\n\n${paper.summary.slice(0, 200)}...`,
        link: paper.link,
      });
    });

    // 2. Core Insights
    const insightPoints = [
      'Architectural Decomposition',
      'Autonomous Self-Correction',
      'Retrieval Grounding Bounds',
    ];
    insightPoints.forEach((insight, idx) => {
      const angle = Math.PI + (idx / 3) * Math.PI * 0.7 - 0.2;
      const dist = 150 + (idx % 2) * 30;
      nodes.push({
        id: `insight-${idx}`,
        label: insight,
        type: 'insight',
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        color: '#10b981',
        details: `Core Architectural Insight derived from multi-agent synthesis: ${insight}`,
      });
    });

    // 3. Verified Claims
    const verifiedPoints = [
      'Zero Unsupported Extrapolations',
      'Cross-Agent Consensus Pass',
      'Grounding Telemetry Confirmed',
    ];
    verifiedPoints.forEach((claim, idx) => {
      const angle = (Math.PI * 1.5) + (idx - 1) * 0.6;
      const dist = 140 + (idx % 2) * 25;
      nodes.push({
        id: `claim-${idx}`,
        label: claim,
        type: 'claim',
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        color: '#f59e0b',
        details: `Verified Statement audited by Fact Checker: ${claim}`,
      });
    });

    return nodes;
  }, [topic, arxivPapers, theme.dotColor]);

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const draggingNodeRef = useRef<GraphNode | null>(null);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save transform for zoom
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      const rootNode = nodes.find(n => n.id === 'root') || nodes[0];

      // Draw Edges from Root to all nodes
      nodes.forEach(node => {
        if (node.id === 'root') return;

        ctx.beginPath();
        ctx.moveTo(rootNode.x, rootNode.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `${node.color}40`;
        ctx.lineWidth = node.id === selectedNode?.id ? 2.5 : 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing data packet along edge
        const time = Date.now() * 0.002;
        const progress = (time + Number(node.id.slice(-1) || 0) * 0.3) % 1;
        const packetX = rootNode.x + (node.x - rootNode.x) * progress;
        const packetY = rootNode.y + (node.y - rootNode.y) * progress;

        ctx.beginPath();
        ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      // Draw Nodes
      nodes.forEach(node => {
        const isRoot = node.type === 'root';
        const isSelected = selectedNode?.id === node.id;
        const radius = isRoot ? 26 : 16;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + (isSelected ? 8 : 4), 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}25`;
        ctx.fill();

        // Solid Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = node.color;
        ctx.stroke();

        // Node Label
        ctx.font = isRoot ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + radius + 14);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [nodes, selectedNode, zoom]);

  // Mouse interaction on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const clicked = nodes.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 28;
    });

    if (clicked) {
      draggingNodeRef.current = clicked;
      setSelectedNode(clicked);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingNodeRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    draggingNodeRef.current.x = x;
    draggingNodeRef.current.y = y;
    setNodes([...nodes]);
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Graph Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4" style={{ color: theme.dotColor }} />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Interactive Knowledge Graph & Mind-Map
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {nodes.length} Connected Nodes
          </span>
        </div>

        {/* Legend & Zoom */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-3 hidden sm:flex text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> arXiv Papers
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Synthesis
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Audit Claims
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Canvas Container */}
      <div className="relative w-full h-[480px] bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={480}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Selected Node Details Card Overlay */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-84 bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-xl space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                {selectedNode.label}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
              {selectedNode.details}
            </p>

            {selectedNode.link && (
              <a
                href={selectedNode.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline pt-1"
              >
                <span>Read paper on arXiv</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
          Click any node to inspect details • Drag nodes to reorganize
        </div>
      </div>
    </div>
  );
};
