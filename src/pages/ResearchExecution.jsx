import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResearchStatus, getResearchResult } from '../api/researchApi';
import { useResearch } from '../context/ResearchContext';

import ResearchPipeline from '../components/research/ResearchPipeline';
import LiveActivityFeed from '../components/research/LiveActivityFeed';
import SourcePanel from '../components/research/SourcePanel';
import EvidencePanel from '../components/research/EvidencePanel';
import QualityScorePanel from '../components/research/QualityScorePanel';
import ReportViewer from '../components/report/ReportViewer';

import { ArrowLeft, AlertTriangle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ResearchExecution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addHistoryItem } = useResearch();

  const [statusState, setStatusState] = useState({
    status: 'running',
    current_agent: 'planner',
    progress: 10,
    message: 'Initializing research planner & search queries...'
  });

  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'report' | 'evidence' | 'sources'

  // Poll status while research is running
  useEffect(() => {
    let timer;
    let isCancelled = false;

    const pollStatus = async () => {
      try {
        const res = await getResearchStatus(id);
        if (isCancelled) return;

        setStatusState({
          status: res.status,
          current_agent: res.current_agent || 'planner',
          progress: res.progress || 10,
          message: res.message || 'Processing pipeline step...'
        });

        if (res.status === 'completed') {
          // Fetch final research result payload
          const finalResult = await getResearchResult(id);
          if (!isCancelled) {
            setResultData(finalResult);
            setActiveTab('report');
            addHistoryItem({
              id: finalResult.id || id,
              topic: finalResult.topic,
              status: 'completed',
              created_at: finalResult.created_at || new Date().toISOString(),
              sources_count: finalResult.sources ? finalResult.sources.length : 5,
              confidence_score: finalResult.quality ? finalResult.quality.overall_confidence : 91,
              duration_seconds: finalResult.duration_seconds || 18.4
            });
          }
        } else if (res.status === 'failed') {
          setError(res.message || 'Research execution could not be completed.');
        } else {
          // Continue polling every 1.5 seconds
          timer = setTimeout(pollStatus, 1500);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(`Communication failure: ${err.message}`);
        }
      }
    };

    pollStatus();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  const isCompleted = statusState.status === 'completed' || !!resultData;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E2B45]">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-[#0F1523] border border-[#1E2B45] hover:border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </button>

        {/* View Switcher Tabs (Visible when research finishes) */}
        {isCompleted && (
          <div className="flex items-center gap-1 bg-[#090D15] p-1 rounded-xl border border-[#1E2B45]">
            {[
              { id: 'report', label: 'Final Report' },
              { id: 'pipeline', label: 'Pipeline & Quality' },
              { id: 'evidence', label: 'Extracted Evidence' },
              { id: 'sources', label: 'Sources' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h4 className="font-semibold text-rose-300">Research could not be completed</h4>
            <p className="text-slate-300 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all mt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Research</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Execution View Switcher */}
      {(!isCompleted || activeTab === 'pipeline') && (
        <div className="space-y-6">
          {/* Visual Agent Pipeline */}
          <ResearchPipeline
            currentAgentId={statusState.current_agent}
            progress={statusState.progress}
            message={statusState.message}
            isCompleted={isCompleted}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Critic Quality Score (if complete) or Discovered Sources */}
            <div className="lg:col-span-2 space-y-6">
              {resultData?.quality && (
                <QualityScorePanel quality={resultData.quality} />
              )}
              {resultData?.sources && (
                <SourcePanel sources={resultData.sources} />
              )}
            </div>

            {/* Right Col: Live Agent Activity Feed */}
            <div>
              <LiveActivityFeed
                currentAgentId={statusState.current_agent}
                message={statusState.message}
                progress={statusState.progress}
                isCompleted={isCompleted}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Final Report */}
      {isCompleted && activeTab === 'report' && resultData && (
        <ReportViewer researchData={resultData} />
      )}

      {/* Tab 3: Extracted Evidence */}
      {isCompleted && activeTab === 'evidence' && resultData?.evidence && (
        <EvidencePanel evidence={resultData.evidence} />
      )}

      {/* Tab 4: Sources Only */}
      {isCompleted && activeTab === 'sources' && resultData?.sources && (
        <SourcePanel sources={resultData.sources} />
      )}
    </div>
  );
}
