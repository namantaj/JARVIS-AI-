import React from 'react';
import { ExternalLink, Globe, ShieldCheck } from 'lucide-react';

export default function SourceList({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-[#1E2B45]">
      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
        <Globe className="w-4 h-4 text-indigo-400" />
        Cited Sources ({sources.length})
      </h3>

      <div className="space-y-2.5">
        {sources.map((src) => (
          <div
            key={src.id}
            id={`source-item-${src.id}`}
            className="p-3.5 rounded-xl bg-[#090D15] border border-[#1E2B45] hover:border-indigo-500/40 transition-all space-y-1.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  [{src.id}]
                </span>
                <h4 className="text-xs font-semibold text-slate-200">
                  {src.title}
                </h4>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium shrink-0"
              >
                <span>{src.domain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {src.snippet && (
              <p className="text-[11px] text-slate-400 pl-8 leading-relaxed">
                "{src.snippet}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
