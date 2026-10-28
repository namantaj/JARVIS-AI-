import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { SAMPLE_TOPICS } from '../../api/agentStages';

export default function ResearchInput({ onStartResearch, isSubmitting = false }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim() || isSubmitting) return;
    
    onStartResearch({
      topic: topic.trim(),
      options: {}
    });
  };

  const handleSelectExample = (example) => {
    setTopic(example);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="text-center space-y-2 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Agent Research Pipeline</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
          AI Research Workspace
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Investigate a topic using autonomous search, extraction, analysis, and critic verification.
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4 sm:p-6 space-y-5 border border-[#1E2B45] shadow-xl shadow-black/40">
        
        {/* Input Textarea Area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            What would you like to research?
          </label>
          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a research topic or question... (e.g. Impact of AI on software engineering jobs)"
              rows={4}
              className="w-full bg-[#090D14] border border-[#1E2B45] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl p-4 text-slate-100 placeholder-slate-400 text-sm sm:text-base resize-none outline-none transition-all"
            />
            {topic && (
              <span className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-400">
                {topic.length} chars
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={!topic.trim() || isSubmitting}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
              !topic.trim() || isSubmitting
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-indigo-500/50 border border-indigo-400/30 active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Initializing Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Start Research</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Topics Chips */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Try an example research topic:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TOPICS.map((exampleTopic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectExample(exampleTopic)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#0F1523] hover:bg-[#182238] text-slate-300 hover:text-white border border-[#1E2B45] hover:border-indigo-500/40 transition-all text-left truncate max-w-xs"
            >
              {exampleTopic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
