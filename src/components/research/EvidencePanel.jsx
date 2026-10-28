import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, FileText, CheckCircle } from 'lucide-react';

export default function EvidencePanel({ evidence = [] }) {
  const [expandedId, setExpandedId] = useState(0);

  if (!evidence || evidence.length === 0) {
    return null;
  }

  const toggleExpand = (idx) => {
    setExpandedId(expandedId === idx ? null : idx);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4">
      <div className="flex items-center justify-between border-b border-[#1E2B45] pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Extracted Evidence ({evidence.length} Sources)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Reader Agent + BeautifulSoup
        </span>
      </div>

      <div className="space-y-3">
        {evidence.map((item, idx) => {
          const isExpanded = expandedId === idx;
          return (
            <div
              key={idx}
              className="rounded-xl bg-[#090D15] border border-[#1E2B45] overflow-hidden transition-all"
            >
              {/* Header Accordion Bar */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#0E1524] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      {item.source_title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">
                      {item.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                    Extracted & Parsed
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-4 border-t border-[#1E2B45] space-y-3 bg-[#0B0F18]/80 text-xs">
                  
                  {/* Key Findings */}
                  {item.key_findings && item.key_findings.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                        Key Findings
                      </span>
                      <ul className="space-y-1 pl-4 list-disc text-slate-300">
                        {item.key_findings.map((kf, i) => (
                          <li key={i}>{kf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Clean Extracted Text */}
                  <div className="space-y-1 pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Clean Extracted Text
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans bg-[#070A10] p-3 rounded-lg border border-[#162035]">
                      {typeof item.extracted_text === 'string' ? item.extracted_text : JSON.stringify(item.extracted_text)}
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
                    >
                      <span>View original webpage</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
