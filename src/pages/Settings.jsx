import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Globe, 
  Shield, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Terminal
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

export default function Settings() {
  const { backendStatus, supabaseStatus, pingBackend } = useResearch();
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearCache = () => {
    if (confirm('Clear local history and saved reports?')) {
      localStorage.removeItem('research_ai_history');
      localStorage.removeItem('research_ai_saved_reports');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="pb-4 border-b border-[#1E2B45]">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          System Settings & Database Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure backend API endpoints, Supabase Postgres database, and monitor system health.
        </p>
      </div>

      {/* Card 1: Backend Connection Status */}
      <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Python Backend Connection Status
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {backendStatus.message}
              </p>
            </div>
          </div>

          <button
            onClick={pingBackend}
            className="px-3 py-1.5 rounded-lg bg-[#0F1523] hover:bg-[#162035] border border-[#1E2B45] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test Connection</span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2B45] text-xs space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-400">REST API Base URL:</span>
            <span className="text-indigo-300">{apiUrl}</span>
          </div>

          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-400">Operational Mode:</span>
            <span className={backendStatus.reachable ? "text-emerald-400" : "text-amber-400"}>
              {backendStatus.reachable ? "FastAPI Live Endpoint" : "Client Mock Simulation"}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Supabase Database Integration */}
      <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Supabase Postgres Database
                {supabaseStatus.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                    Connected (Live DB)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400">
                    In-Memory Fallback
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {supabaseStatus.mode}
              </p>
            </div>
          </div>

          <button
            onClick={pingBackend}
            className="px-3 py-1.5 rounded-lg bg-[#0F1523] hover:bg-[#162035] border border-[#1E2B45] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Check DB</span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2B45] text-xs space-y-2 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Supabase URL:</span>
            <span className="text-emerald-300">
              {supabaseStatus.supabase_url || 'Not configured in .env'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Database Tables:</span>
            <span className="text-slate-300">research_jobs, saved_reports</span>
          </div>

          {!supabaseStatus.connected && (
            <div className="mt-2 pt-2 border-t border-[#1E2B45] text-[11px] text-amber-300/80 leading-relaxed font-sans">
              To connect Supabase, add <code className="font-mono text-amber-200">SUPABASE_URL</code> and <code className="font-mono text-amber-200">SUPABASE_KEY</code> to your <code className="font-mono text-amber-200">.env</code> file, then run <code className="font-mono text-amber-200">supabase_schema.sql</code> in your Supabase SQL Editor.
            </div>
          )}
        </div>
      </div>


      {/* Card 2: Architecture & Security Credentials Notice */}
      <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              API Keys & Security Isolation
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Zero-Trust Client Architecture
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090D15] border border-[#1E2B45] text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong className="text-slate-100">API Key Isolation:</strong> All sensitive credentials (such as Google Gemini API keys and Tavily Web Search API keys) reside exclusively on your local Python backend (<code className="font-mono text-indigo-300">.env</code>).
          </p>
          <p className="text-slate-400">
            The React client never exposes or stores API secrets in browser storage or network payloads.
          </p>
        </div>
      </div>

      {/* Card 3: Multi-Agent System Pipeline Specs */}
      <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Active Agent Pipeline Specifications
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              LangChain LCEL / Runnables Architecture
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2B45] space-y-1">
            <span className="text-slate-400 font-mono text-[11px]">Primary LLM:</span>
            <p className="font-semibold text-slate-200">Google Gemini 3.1 Flash</p>
          </div>

          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2B45] space-y-1">
            <span className="text-slate-400 font-mono text-[11px]">Web Search Engine:</span>
            <p className="font-semibold text-slate-200">Tavily Client API (5 Results/query)</p>
          </div>

          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2B45] space-y-1">
            <span className="text-slate-400 font-mono text-[11px]">Extraction Engine:</span>
            <p className="font-semibold text-slate-200">BeautifulSoup4 HTML Parser</p>
          </div>

          <div className="p-3 rounded-xl bg-[#090D15] border border-[#1E2B45] space-y-1">
            <span className="text-slate-400 font-mono text-[11px]">Verification Pipeline:</span>
            <p className="font-semibold text-slate-200">Critic Chain Verification Audit</p>
          </div>
        </div>
      </div>

      {/* Card 4: Local Storage Data Management */}
      <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Local Data Management
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Clear cached history and saved artifacts
              </p>
            </div>
          </div>

          <button
            onClick={handleClearCache}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium transition-all"
          >
            Clear Local Cache
          </button>
        </div>
      </div>

    </div>
  );
}
