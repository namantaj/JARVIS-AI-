import React from 'react';
import { 
  Brain, 
  Search, 
  Globe, 
  BookOpen, 
  FileText, 
  PenTool, 
  ShieldCheck, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2
} from 'lucide-react';

const ICON_MAP = {
  Brain,
  Search,
  Globe,
  BookOpen,
  FileText,
  PenTool,
  ShieldCheck,
  CheckCircle2
};

export default function AgentStatusCard({ stage, status = 'waiting', isCurrent = false, detailMessage }) {
  const Icon = ICON_MAP[stage.icon] || Brain;

  const statusConfig = {
    waiting: {
      badge: 'Waiting',
      badgeClass: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
      iconClass: 'text-slate-500',
      cardClass: 'border-[#1B253B] bg-[#0A0E18]/60 opacity-60'
    },
    running: {
      badge: 'Running',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse',
      iconClass: 'text-indigo-400 animate-spin-slow',
      cardClass: 'border-indigo-500/50 bg-[#0E1527] shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
    },
    completed: {
      badge: 'Completed',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      iconClass: 'text-emerald-400',
      cardClass: 'border-emerald-500/20 bg-[#0A131F]'
    },
    warning: {
      badge: 'Warning',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      iconClass: 'text-amber-400',
      cardClass: 'border-amber-500/30 bg-[#16130D]'
    },
    failed: {
      badge: 'Failed',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      iconClass: 'text-rose-400',
      cardClass: 'border-rose-500/30 bg-[#170B0E]'
    }
  };

  const config = statusConfig[status] || statusConfig.waiting;

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${config.cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        
        {/* Left Icon & Title */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-[#0F172A] border border-[#1E2B45]`}>
            {status === 'running' ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            ) : status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : status === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : status === 'failed' ? (
              <XCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <Icon className={`w-5 h-5 ${config.iconClass}`} />
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              {stage.name}
              <span className="text-[10px] font-normal text-slate-400 font-mono">
                ({stage.role})
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Right Status Badge */}
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${config.badgeClass}`}>
          {config.badge}
        </span>
      </div>

      {/* Live execution detail snippet if running or completed */}
      {(status === 'running' || status === 'completed') && (
        <div className="mt-3 pt-2.5 border-t border-[#1E2B45]/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate pr-2">
            {detailMessage || stage.detail}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
            <Clock className="w-3 h-3" />
            {status === 'completed' ? 'Done' : 'Processing'}
          </span>
        </div>
      )}
    </div>
  );
}
