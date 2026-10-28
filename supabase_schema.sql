-- ==============================================================================
-- Multi-Agent Research System - Supabase Schema
-- Run this entire script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Research Jobs Table
CREATE TABLE IF NOT EXISTS public.research_jobs (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
    current_agent TEXT DEFAULT 'planner',
    progress INTEGER DEFAULT 10,
    message TEXT DEFAULT 'Initializing research planner...',
    search_depth TEXT DEFAULT 'deep',
    num_sources INTEGER DEFAULT 5,
    date_range TEXT DEFAULT 'year',
    research_mode TEXT DEFAULT 'analytical',
    duration_seconds NUMERIC(10, 2),
    report TEXT,
    quality_score JSONB,
    sources JSONB,
    evidence JSONB,
    raw_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast history lookup ordered by recency
CREATE INDEX IF NOT EXISTS idx_research_jobs_created_at ON public.research_jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_jobs_status ON public.research_jobs (status);

-- 2. Create Saved Reports Table
CREATE TABLE IF NOT EXISTS public.saved_reports (
    id TEXT PRIMARY KEY,
    research_id TEXT REFERENCES public.research_jobs(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    report TEXT NOT NULL,
    quality_score JSONB,
    sources JSONB,
    duration_seconds NUMERIC(10, 2),
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_reports_saved_at ON public.saved_reports (saved_at DESC);

-- 3. Row Level Security (RLS) Setup
ALTER TABLE public.research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Allow anonymous read access to research_jobs" ON public.research_jobs;
DROP POLICY IF EXISTS "Allow anonymous insert/update access to research_jobs" ON public.research_jobs;
DROP POLICY IF EXISTS "Allow anonymous read access to saved_reports" ON public.saved_reports;
DROP POLICY IF EXISTS "Allow anonymous insert/update/delete access to saved_reports" ON public.saved_reports;

-- Create RLS Policies
CREATE POLICY "Allow anonymous read access to research_jobs"
    ON public.research_jobs FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous insert/update access to research_jobs"
    ON public.research_jobs FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to saved_reports"
    ON public.saved_reports FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous insert/update/delete access to saved_reports"
    ON public.saved_reports FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_research_jobs_modtime ON public.research_jobs;

CREATE TRIGGER update_research_jobs_modtime
    BEFORE UPDATE ON public.research_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 5. Enable Realtime publication for live UI updates
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'research_jobs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.research_jobs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'saved_reports') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_reports;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
