import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResearchInput from '../components/research/ResearchInput';
import { startResearch } from '../api/researchApi';
import { useResearch } from '../context/ResearchContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { setActiveResearchId, addHistoryItem } = useResearch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartResearch = async ({ topic, options }) => {
    setIsSubmitting(true);
    try {
      const res = await startResearch(topic, options);
      const researchId = res.research_id || `res-${Date.now()}`;
      
      setActiveResearchId(researchId);

      // Track in local history state
      addHistoryItem({
        id: researchId,
        topic,
        status: 'running',
        created_at: new Date().toISOString(),
        sources_count: 3,
        confidence_score: 91,
        duration_seconds: 0
      });

      navigate(`/research/${researchId}`);
    } catch (err) {
      console.error('Failed to start research:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <ResearchInput onStartResearch={handleStartResearch} isSubmitting={isSubmitting} />
    </div>
  );
}
