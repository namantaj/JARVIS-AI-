import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles, 
  PlusCircle, 
  History, 
  Bookmark, 
  Settings, 
  Activity, 
  Server,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';

export default function Sidebar({ isOpen, onClose }) {
  const { backendStatus } = useResearch();

  const navItems = [
    { label: 'New Research', path: '/', icon: PlusCircle },
    { label: 'Research History', path: '/history', icon: History },
    { label: 'Saved Reports', path: '/saved', icon: Bookmark },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-[#090D14] border-r border-[#1E2B45] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="p-5 border-b border-[#1E2B45] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-100 tracking-tight text-base leading-tight">
                  ResearchAI
                </h1>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Multi-Agent System
                </p>
              </div>
            </div>
            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2E]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: System Status & API info */}
        <div className="p-3 border-t border-[#1E2B45] space-y-2">
          <div className="p-3 rounded-lg bg-[#0E1422] border border-[#1B2740]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-medium">
                System Status
              </span>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Backend connection badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className={`relative flex h-2.5 w-2.5`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendStatus.reachable ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  backendStatus.reachable ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="text-xs font-medium text-slate-300 truncate">
                {backendStatus.reachable ? 'Backend Connected' : 'Mock Mode Active'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
              {backendStatus.reachable ? 'FastAPI @ localhost:8000' : 'Client simulation ready'}
            </p>
          </div>

          <div className="px-3 py-2 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>v1.0.0 — Production</span>
            <span className="flex items-center gap-1 text-indigo-400">
              <Zap className="w-3 h-3" /> LCEL
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
