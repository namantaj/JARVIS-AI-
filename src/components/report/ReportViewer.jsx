import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Bookmark, 
  Check, 
  Clock, 
  Globe, 
  Cpu, 
  Printer,
  Sparkles,
  Share2
} from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';
import Citation from './Citation';
import SourceList from './SourceList';
import QualityScorePanel from '../research/QualityScorePanel';

export default function ReportViewer({ researchData }) {
  const { toggleSaveReport, isReportSaved } = useResearch();
  const [copied, setCopied] = useState(false);

  if (!researchData) return null;

  const {
    id,
    topic,
    report,
    sources = [],
    quality,
    created_at,
    duration_seconds,
    sources_count,
    agents_used = ["Search Agent", "Reader Agent", "Writer Pipeline", "Critic Pipeline"]
  } = researchData;

  const saved = isReportSaved(id);

  // Copy raw report markdown
  const handleCopy = () => {
    navigator.clipboard.writeText(report || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([report || ''], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Print / PDF download trigger
  const handlePrintPDF = () => {
    window.print();
  };

  // Parse text inline and replace [1], [2] with Citation components
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-slate-100 mt-6 mb-3 tracking-tight border-b border-[#1E2B45] pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-semibold text-indigo-300 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('---')) {
        return <hr key={idx} className="my-6 border-[#1E2B45]" />;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-sm my-1 leading-relaxed">
            {parseInlineCitations(line.substring(2))}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-slate-300 text-sm leading-relaxed my-2">
          {parseInlineCitations(line)}
        </p>
      );
    });
  };

  // Regex replacer for citations [1], [2], etc.
  const parseInlineCitations = (text) => {
    const parts = [];
    const regex = /\[(\d+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseBoldAndItalic(text.substring(lastIndex, match.index), `text-${lastIndex}`));
      }
      const citationId = match[1];
      parts.push(<Citation key={`cite-${match.index}`} id={citationId} label={citationId} />);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(parseBoldAndItalic(text.substring(lastIndex), `text-${lastIndex}`));
    }

    return parts;
  };

  // Simple formatter for **bold** and *italic*
  const parseBoldAndItalic = (str, keyPrefix) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIdx = 0;
    let m;

    while ((m = boldRegex.exec(str)) !== null) {
      if (m.index > lastIdx) {
        parts.push(str.substring(lastIdx, m.index));
      }
      parts.push(<strong key={`${keyPrefix}-b-${m.index}`} className="font-semibold text-slate-100">{m[1]}</strong>);
      lastIdx = boldRegex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }

    return parts;
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-[#1E2B45] space-y-6 shadow-2xl">
      
      {/* Header & Meta Bar */}
      <div className="space-y-4 pb-6 border-b border-[#1E2B45]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Finalized Research Report</span>
          </div>

          {/* Actions: Save, Copy, Download, Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveReport(researchData)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                saved
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-[#0F1523] text-slate-300 hover:text-white border border-[#1E2B45] hover:border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-400' : ''}`} />
              <span>{saved ? 'Saved' : 'Save Report'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0F1523] text-slate-300 hover:text-white border border-[#1E2B45] hover:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0F1523] text-slate-300 hover:text-white border border-[#1E2B45] hover:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Markdown</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0F1523] text-slate-300 hover:text-white border border-[#1E2B45] hover:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Topic Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-snug">
          {topic}
        </h1>

        {/* Metadata Chips */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{created_at ? new Date(created_at).toLocaleDateString() : 'Just now'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sources_count || sources.length} Sources Investigated</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duration: {duration_seconds || '18.4'}s</span>
          </div>
        </div>
      </div>

      {/* Structured Report Document Body */}
      <div className="prose prose-invert max-w-none space-y-4">
        {renderFormattedContent(report)}
      </div>

      {/* Critic Quality Evaluation Panel */}
      {quality && (
        <div className="pt-4 border-t border-[#1E2B45]">
          <QualityScorePanel quality={quality} />
        </div>
      )}

      {/* Sources List */}
      <SourceList sources={sources} />
    </div>
  );
}
