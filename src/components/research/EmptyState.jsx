import React from 'react';
import { Sparkles, ArrowRight, FolderSearch, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  type = 'research', 
  title = "Start your first research", 
  description = "Give ResearchAI a topic and let the multi-agent system investigate it.",
  actionText = "Start Research",
  actionLink = "/"
}) {
  return (
    <div className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-[#1E2B45] space-y-5 max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        {type === 'saved' ? (
          <Bookmark className="w-7 h-7" />
        ) : (
          <Sparkles className="w-7 h-7" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-100">
          {title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div>
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-lg shadow-indigo-600/20"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
