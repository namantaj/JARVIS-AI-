import React from 'react';
import { ExternalLink, Globe, ShieldCheck, Tag } from 'lucide-react';

export default function SourcePanel({ sources = [] }) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
      <div className="flex items-center justify-between border-b border-[#1E2B45] pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Discovered Sources ({sources.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Search Agent + Tavily API
        </span>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sources.map((src, idx) => (
          <div
            key={src.id || idx}
            className="p-4 rounded-xl bg-[#090D15] border border-[#1E2B45] hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Header domain & relevance */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <Globe className="w-3 h-3 text-indigo-400" />
                  <span className="font-medium text-slate-300">{src.domain}</span>
                </div>

                {src.relevance && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Relevance: {src.relevance}%
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                {src.title}
              </h4>

              {/* Snippet */}
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {src.snippet}
              </p>
            </div>

            {/* Bottom URL Link */}
            <div className="mt-3 pt-2.5 border-t border-[#1E2B45]/60 flex items-center justify-between text-[11px]">
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {src.status || 'Verified'}
              </span>

              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <span>Open Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
