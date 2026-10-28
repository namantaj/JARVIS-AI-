import React from 'react';
import { AGENT_STAGES } from '../../api/agentStages';
import AgentStatusCard from './AgentStatusCard';
import { ArrowDown, Cpu, Activity, CheckCircle, RefreshCw } from 'lucide-react';

export default function ResearchPipeline({ currentAgentId, progress = 0, message, isCompleted = false }) {
  // Determine status for each agent stage
  const getStageStatus = (stageId, index) => {
    if (isCompleted) return 'completed';
    if (!currentAgentId) return index === 0 ? 'running' : 'waiting';

    const currentIndex = AGENT_STAGES.findIndex(s => s.id === currentAgentId);
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'running';
    return 'waiting';
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-6">
      
      {/* Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2B45]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Multi-Agent Orchestration Pipeline
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {message || (isCompleted ? 'Research execution complete' : 'Agent step processing...')}
            </p>
          </div>
        </div>

        {/* Overall Percentage Progress */}
        <div className="flex items-center gap-3 bg-[#0B0F18] px-4 py-2 rounded-xl border border-[#1E2B45]">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Progress
            </span>
            <span className="text-sm font-bold font-mono text-indigo-400">
              {isCompleted ? '100%' : `${progress}%`}
            </span>
          </div>

          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${isCompleted ? 100 : progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {AGENT_STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id, idx);
          return (
            <AgentStatusCard
              key={stage.id}
              stage={stage}
              status={status}
              isCurrent={stage.id === currentAgentId}
              detailMessage={stage.id === currentAgentId ? message : null}
            />
          );
        })}
      </div>
    </div>
  );
}
