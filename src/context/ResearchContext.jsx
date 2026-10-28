import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  checkBackendHealth, 
  getResearchHistory, 
  checkSupabaseHealth, 
  fetchSavedReports, 
  saveReportToSupabase, 
  deleteSavedReportFromSupabase 
} from '../api/researchApi';

const ResearchContext = createContext(null);

export const ResearchProvider = ({ children }) => {
  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    reachable: false,
    isMockMode: true,
    message: 'Checking backend...'
  });

  const [supabaseStatus, setSupabaseStatus] = useState({
    connected: false,
    mode: 'Checking Supabase...',
    url_configured: false,
    key_configured: false
  });

  const [activeResearchId, setActiveResearchId] = useState(null);
  const [activeResearchData, setActiveResearchData] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('research_ai_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedReports, setSavedReports] = useState(() => {
    try {
      const saved = localStorage.getItem('research_ai_saved_reports');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Verify backend and Supabase health periodically
  const pingBackend = useCallback(async () => {
    const res = await checkBackendHealth();
    if (res.reachable) {
      setBackendStatus({
        checked: true,
        reachable: true,
        isMockMode: false,
        message: 'Backend Connected (Python FastAPI)'
      });
      if (res.data && res.data.supabase) {
        setSupabaseStatus(res.data.supabase);
      } else {
        const supaRes = await checkSupabaseHealth();
        setSupabaseStatus(supaRes);
      }
    } else {
      setBackendStatus({
        checked: true,
        reachable: false,
        isMockMode: true,
        message: 'Mock Mode (Backend Offline)'
      });
    }
  }, []);

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 15000);
    return () => clearInterval(interval);
  }, [pingBackend]);

  // Load history from API / Supabase DB
  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getResearchHistory();
      if (res.data && res.data.length > 0) {
        setHistory(res.data);
      }
    };
    fetchHistory();
  }, []);

  // Load saved reports from API / Supabase DB
  useEffect(() => {
    const fetchSaved = async () => {
      const dbSaved = await fetchSavedReports();
      if (dbSaved && dbSaved.length > 0) {
        setSavedReports(dbSaved);
      }
    };
    fetchSaved();
  }, []);

  // Save history & reports to local storage
  useEffect(() => {
    try {
      localStorage.setItem('research_ai_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('research_ai_saved_reports', JSON.stringify(savedReports));
    } catch (e) {}
  }, [savedReports]);

  const addHistoryItem = (item) => {
    setHistory((prev) => [item, ...prev.filter((h) => h.id !== item.id)]);
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleSaveReport = async (reportItem) => {
    const exists = savedReports.some((r) => r.id === reportItem.id);
    if (exists) {
      setSavedReports((prev) => prev.filter((r) => r.id !== reportItem.id));
      await deleteSavedReportFromSupabase(reportItem.id);
    } else {
      setSavedReports((prev) => [reportItem, ...prev]);
      await saveReportToSupabase(reportItem);
    }
  };

  const isReportSaved = (id) => {
    return savedReports.some((r) => r.id === id);
  };

  return (
    <ResearchContext.Provider
      value={{
        backendStatus,
        supabaseStatus,
        pingBackend,
        activeResearchId,
        setActiveResearchId,
        activeResearchData,
        setActiveResearchData,
        history,
        addHistoryItem,
        deleteHistoryItem,
        savedReports,
        toggleSaveReport,
        isReportSaved
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};


export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
};
