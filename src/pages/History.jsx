import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  Globe, 
  Award, 
  Clock, 
  CheckCircle2, 
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import EmptyState from '../components/research/EmptyState';

export default function History() {
  const navigate = useNavigate();
  const { history, deleteHistoryItem } = useResearch();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'confidence'

  const filtered = history.filter((item) =>
    item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'confidence') return (b.confidence_score || 0) - (a.confidence_score || 0);
    return 0;
  });

  if (history.length === 0) {
    return (
      <EmptyState
        title="No research history yet"
        description="Your past research investigations will appear here automatically."
        actionText="Start First Research"
        actionLink="/"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2B45]">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Research History ({history.length})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review past multi-agent research executions, sources, and reports.
          </p>
        </div>

        {/* Filter and Sort Inputs */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#090D15] border border-[#1E2B45] focus:border-indigo-500 rounded-lg text-xs text-slate-200 placeholder-slate-400 outline-none w-48 sm:w-60"
            />
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#090D15] border border-[#1E2B45] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="confidence">Highest Confidence</option>
          </select>
        </div>
      </div>

      {/* History Items Grid */}
      <div className="space-y-3">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-xl p-4 border border-[#1E2B45] hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            {/* Left Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {item.status || 'Completed'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                {item.topic}
              </h3>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-0.5">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  {item.sources_count || 5} sources
                </span>

                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-purple-400" />
                  {item.confidence_score || 91}% confidence
                </span>

                {item.duration_seconds && (
                  <span className="flex items-center gap-1 hidden sm:inline-flex">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {item.duration_seconds}s
                  </span>
                )}
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/research/${item.id}`)}
                className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <span>View Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => deleteHistoryItem(item.id)}
                title="Delete from history"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
