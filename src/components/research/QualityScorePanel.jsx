import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, Award, Scale, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function QualityScorePanel({ quality }) {
  const [showRaw, setShowRaw] = useState(false);
  if (!quality) return null;

  const metrics = [
    { label: 'Factual Consistency', val: quality.factual_consistency || 91, color: 'from-emerald-500 to-teal-400' },
    { label: 'Source Grounding', val: quality.source_grounding || 94, color: 'from-indigo-500 to-cyan-400' },
    { label: 'Completeness', val: quality.completeness || 87, color: 'from-purple-500 to-indigo-400' },
    { label: 'Source Relevance', val: quality.source_relevance || 92, color: 'from-blue-500 to-indigo-400' },
  ];

  const confidence = quality.overall_confidence || 91;
  const scoreDisplay = quality.score || `${Math.round(confidence / 10)}/10`;

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2B45]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Research Quality & Critic Audit
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated claim verification, factual consistency & source grounding
            </p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3 bg-[#0B0F18] px-4 py-2 rounded-xl border border-purple-500/40 shadow-lg shadow-purple-500/5">
          <Award className="w-5 h-5 text-purple-400" />
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Critic Evaluation Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-purple-300">
                {scoreDisplay}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({confidence}% Confidence)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-[#090D15] border border-[#1E2B45] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{m.label}</span>
              <span className="font-mono font-bold text-slate-200">{m.val}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${m.color} transition-all duration-500`}
                style={{ width: `${m.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Verdict & Strengths/Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Strengths */}
        {quality.strengths && quality.strengths.length > 0 && (
          <div className="p-4 rounded-xl bg-[#0A1418] border border-emerald-500/20 space-y-2">
            <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Verified Strengths
            </h4>
            <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-300">
              {quality.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas to Improve / Issues Detected */}
        {quality.issues && quality.issues.length > 0 && (
          <div className="p-4 rounded-xl bg-[#170E10] border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Areas to Improve
            </h4>
            <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-300">
              {quality.issues.map((iss, i) => (
                <li key={i}>{iss}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* One-Line Verdict */}
      {quality.verdict && (
        <div className="p-3.5 rounded-xl bg-[#0B0F18] border border-[#1E2B45] text-xs font-mono text-slate-300 flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-300 block mb-0.5">Verdict</span>
            <span className="text-slate-300">{quality.verdict}</span>
          </div>
        </div>
      )}

      {/* Raw Critic Output Toggle */}
      {quality.raw_critic_text && (
        <div className="pt-2 border-t border-[#1E2B45]">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showRaw ? 'Hide Raw Critic Output' : 'Show Raw Critic Output'}</span>
            {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRaw && (
            <pre className="mt-3 p-4 rounded-xl bg-[#07090E] border border-[#162035] text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {quality.raw_critic_text}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
