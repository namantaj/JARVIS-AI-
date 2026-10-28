import React from 'react';
import { Menu, Cpu, Globe, Shield, RefreshCw } from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';

export default function Header({ onOpenMobileMenu, title = "AI Research Workspace" }) {
  const { backendStatus, pingBackend } = useResearch();

  return (
    <header className="h-16 border-b border-[#1E2B45] bg-[#090D14]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-[#141C2E] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
            {title}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Autonomous multi-agent discovery, extraction, analysis & verification
          </p>
        </div>
      </div>

      {/* Right System Info & Badges */}
      <div className="flex items-center gap-3">
        {/* Model stack badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F1523] border border-[#1E2B45] text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gemini 3.1 Flash</span>
          <span className="text-slate-600">•</span>
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tavily</span>
          <span className="text-slate-600">•</span>
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Critic</span>
        </div>

        {/* Backend Status quick pill */}
        <button
          onClick={pingBackend}
          title="Click to re-check backend connection"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F1523] border border-[#1E2B45] hover:border-slate-700 text-xs transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${backendStatus.reachable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="font-mono text-[11px] text-slate-300">
            {backendStatus.reachable ? 'API Live' : 'Mock Mode'}
          </span>
          <RefreshCw className="w-3 h-3 text-slate-400 hover:text-slate-200 transition-transform active:rotate-180" />
        </button>
      </div>
    </header>
  );
}
