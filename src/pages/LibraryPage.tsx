import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCheck,
  Eye,
  FileDown,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { ThemeConfig } from '../theme';

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

interface LibraryPageProps {
  historyList: HistoryItem[];
  readSessionIds: Set<string>;
  onSelectSession: (id: string) => void;
  onToggleRead: (id: string, e?: React.MouseEvent) => void;
  onMarkAllRead: () => void;
  onExportJson: () => void;
  isExporting: boolean;
  theme: ThemeConfig;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  historyList,
  readSessionIds,
  onSelectSession,
  onToggleRead,
  onMarkAllRead,
  onExportJson,
  isExporting,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredItems = historyList.filter(item => {
    const matchesSearch = item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const isRead = readSessionIds.has(item.id);
    if (!matchesSearch) return false;
    if (filter === 'unread') return !isRead;
    if (filter === 'read') return isRead;
    return true;
  });

  const unreadCount = historyList.filter(h => !readSessionIds.has(h.id)).length;
  const readCount = historyList.length - unreadCount;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">📚</span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Research Library & Archives
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Review past multi-agent publications, track read status, and manage backups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onExportJson}
            disabled={isExporting || historyList.length === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Download full JSON backup of all research sessions"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span>{isExporting ? 'Exporting...' : 'Export Backup (JSON)'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-4 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Reviewed</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search saved research reports..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Reports ({historyList.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              filter === 'unread'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.dotColor }}
              />
            )}
            <span>({unreadCount})</span>
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'read'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reviewed ({readCount})
          </button>
        </div>
      </div>

      {/* Grid of Sessions */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-xl text-slate-500">
            🔍
          </div>
          <h3 className="text-base font-semibold text-slate-200">No research reports found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No reports matched "${searchQuery}". Try a different keyword.`
              : 'Launch your first research inquiry in the Research Lab to populate your archive.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const isRead = readSessionIds.has(item.id);
            const dateStr = item.timestamp
              ? new Date(item.timestamp).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Session';

            return (
              <div
                key={item.id}
                onClick={() => onSelectSession(item.id)}
                className={`group rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl ${
                  isRead
                    ? 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-600 shadow-lg ring-1 ring-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        isRead
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                          : `${theme.tagBg} font-semibold`
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isRead ? '#10b981' : theme.dotColor }}
                      />
                      <span>{isRead ? 'Reviewed' : 'Unread'}</span>
                    </span>

                    <button
                      onClick={e => onToggleRead(item.id, e)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title={isRead ? 'Mark as Unread' : 'Mark as Reviewed'}
                    >
                      {isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors mb-2 line-clamp-1">
                    {item.topic}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 py-2 my-2 border-y border-slate-800/60 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Topic Len</span>
                      <span className="font-mono text-slate-200 font-semibold">{item.metrics?.topicLength || item.topic.length} chars</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Corpus</span>
                      <span className="font-mono text-slate-200 font-semibold">{item.metrics?.researchSize ? `${item.metrics.researchSize}c` : 'Audited'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Publication</span>
                      <span className="font-mono text-slate-200 font-semibold">{item.metrics?.reportSize ? `${item.metrics.reportSize}c` : 'Ready'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {dateStr}
                  </span>

                  <span className="font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: theme.dotColor }}>
                    <span>Open Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
