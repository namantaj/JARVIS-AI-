import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ExternalLink, Trash2, Download, Printer, Globe } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import EmptyState from '../components/research/EmptyState';

export default function SavedReports() {
  const navigate = useNavigate();
  const { savedReports, toggleSaveReport } = useResearch();

  if (savedReports.length === 0) {
    return (
      <EmptyState
        type="saved"
        title="No saved reports yet"
        description="Bookmark reports while reviewing research outputs to store them here permanently."
        actionText="Explore Workspace"
        actionLink="/"
      />
    );
  }

  const handleDownloadMarkdown = (reportItem) => {
    const element = document.createElement("a");
    const file = new Blob([reportItem.report || ''], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${reportItem.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-saved-report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="pb-4 border-b border-[#1E2B45]">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          Saved Reports ({savedReports.length})
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Your bookmarked research reports and exportable artifacts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedReports.map((item) => (
          <div
            key={item.id}
            className="glass-card rounded-2xl p-5 border border-[#1E2B45] space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  {item.sources ? item.sources.length : 5} Sources
                </span>
                <span>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Saved'}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-100 line-clamp-2">
                {item.topic}
              </h3>
            </div>

            <div className="pt-3 border-t border-[#1E2B45] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadMarkdown(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0F1523] border border-[#1E2B45] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>MD</span>
                </button>

                <button
                  onClick={() => navigate(`/research/${item.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => toggleSaveReport(item)}
                title="Remove from saved"
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
