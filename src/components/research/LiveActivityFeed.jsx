import React from 'react';
import { Terminal, CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';
import { AGENT_STAGES } from '../../api/agentStages';

export default function LiveActivityFeed({ currentAgentId, message, progress = 0, isCompleted = false }) {
  const currentIndex = isCompleted
    ? AGENT_STAGES.length - 1
    : AGENT_STAGES.findIndex(s => s.id === currentAgentId);

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
      <div className="flex items-center justify-between border-b border-[#1E2B45] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">Live Agent Stream</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {isCompleted ? 'Pipeline Complete' : `Active Step ${Math.max(1, currentIndex + 1)} / ${AGENT_STAGES.length}`}
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs max-h-72 overflow-y-auto pr-1">
        {AGENT_STAGES.map((stage, idx) => {
          const isDone = isCompleted || idx < currentIndex;
          const isRunning = !isCompleted && idx === currentIndex;

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-lg border transition-colors flex items-start gap-3 ${
                isRunning
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                  : isDone
                  ? 'bg-[#0B0F18]/80 border-[#1A243A] text-slate-300'
                  : 'bg-[#07090E]/50 border-transparent text-slate-500'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isRunning ? (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>

              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200">
                    {stage.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isDone ? 'Finished' : isRunning ? 'In Progress' : 'Queued'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {isRunning && message ? message : stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
