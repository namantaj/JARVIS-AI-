import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkBackendHealth = async () => {
  try {
    const res = await api.get('/api/health', { timeout: 5000 });
    return { reachable: res.status === 200, data: res.data };
  } catch (err) {
    return { reachable: false, error: err.message };
  }
};

export const startResearch = async (topic, options = {}) => {
  const response = await api.post('/api/research', { topic, ...options });
  return response.data;
};

export const getResearchStatus = async (research_id) => {
  const response = await api.get(`/api/research/${research_id}/status`);
  return response.data;
};

export const getResearchResult = async (research_id) => {
  const response = await api.get(`/api/research/${research_id}`);
  return response.data;
};

export const getResearchHistory = async () => {
  const response = await api.get('/api/research/history');
  return { data: response.data };
};

export const checkSupabaseHealth = async () => {
  try {
    const response = await api.get('/api/supabase/status', { timeout: 5000 });
    return response.data;
  } catch (err) {
    return { connected: false, mode: 'Offline', error: err.message };
  }
};

export const fetchSavedReports = async () => {
  try {
    const response = await api.get('/api/saved');
    return response.data;
  } catch (err) {
    return [];
  }
};

export const saveReportToSupabase = async (report) => {
  try {
    const response = await api.post('/api/saved', report);
    return response.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deleteSavedReportFromSupabase = async (report_id) => {
  try {
    const response = await api.delete(`/api/saved/${report_id}`);
    return response.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
};

