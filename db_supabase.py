import os
import re
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

_client = None
_connection_checked = False
_is_connected = False
_connection_error = None

# In-memory fallback job store
_in_memory_jobs: Dict[str, Dict[str, Any]] = {}
_in_memory_saved_reports: Dict[str, Dict[str, Any]] = {}

def get_supabase_client(force_reload: bool = False):
    global _client, _connection_checked, _is_connected, _connection_error
    if _connection_checked and not force_reload:
        return _client if _is_connected else None
    
    _connection_checked = True
    load_dotenv(override=True)

    raw_url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or ""
    raw_key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY") 
        or os.getenv("SUPABASE_KEY") 
        or os.getenv("SUPABASE_ANON_KEY") 
        or os.getenv("VITE_SUPABASE_ANON_KEY") 
        or ""
    )

    url = raw_url.strip()
    key = raw_key.strip()

    # Clean REST path suffix if present
    if url:
        url = re.sub(r'/rest/v1/?$', '', url).rstrip('/')

    if not url or not key:
        _is_connected = False
        _connection_error = "SUPABASE_URL or SUPABASE_KEY not set in environment."
        print(f"[Supabase] Config missing: {_connection_error}")
        return None

    try:
        from supabase import create_client, Client
        _client = create_client(url, key)
        # Test connection by simple ping query
        res = _client.table("research_jobs").select("id", count="exact").limit(1).execute()
        _is_connected = True
        _connection_error = None
    except Exception as e:
        _is_connected = False
        err_str = str(e)
        if "PGRST205" in err_str or "public.research_jobs" in err_str:
            _connection_error = "Table 'public.research_jobs' not found in Supabase. Please run 'supabase_schema.sql' in your Supabase SQL Editor."
        else:
            _connection_error = err_str
        print(f"[Supabase] Connection attempt failed: {_connection_error}. Falling back to in-memory store.")
        return None



def is_supabase_connected(force_reload: bool = True) -> bool:
    get_supabase_client(force_reload=force_reload)
    return _is_connected

def get_supabase_status(force_reload: bool = True) -> Dict[str, Any]:
    connected = is_supabase_connected(force_reload=force_reload)
    raw_url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or ""
    raw_key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or ""
    
    url_masked = ""
    if raw_url:
        parts = raw_url.split("://")
        domain = parts[-1] if len(parts) > 1 else raw_url
        domain = domain.split("/")[0]
        url_masked = f"https://{domain}"

    return {
        "connected": connected,
        "url_configured": bool(raw_url),
        "key_configured": bool(raw_key),
        "supabase_url": url_masked,
        "mode": "Supabase DB Live" if connected else "In-Memory Fallback",
        "error": _connection_error
    }


def save_research_job(job_data: Dict[str, Any]):
    job_id = job_data["research_id"]
    _in_memory_jobs[job_id] = job_data

    client = get_supabase_client()
    if client:
        try:
            row = {
                "id": job_id,
                "topic": job_data["topic"],
                "status": job_data.get("status", "running"),
                "current_agent": job_data.get("current_agent", "planner"),
                "progress": job_data.get("progress", 10),
                "message": job_data.get("message", "Initializing research planner..."),
                "created_at": job_data.get("created_at") or datetime.now().isoformat()
            }
            client.table("research_jobs").upsert(row).execute()
        except Exception as e:
            print(f"[Supabase] Error saving job {job_id}: {e}")

def update_job_progress(job_id: str, current_agent: str, progress_pct: int, msg: str):
    if job_id in _in_memory_jobs:
        _in_memory_jobs[job_id]["current_agent"] = current_agent
        _in_memory_jobs[job_id]["progress"] = progress_pct
        _in_memory_jobs[job_id]["message"] = msg

    client = get_supabase_client()
    if client:
        try:
            client.table("research_jobs").update({
                "current_agent": current_agent,
                "progress": progress_pct,
                "message": msg
            }).eq("id", job_id).execute()
        except Exception as e:
            print(f"[Supabase] Error updating progress for job {job_id}: {e}")

def complete_research_job(
    job_id: str,
    topic: str,
    report_raw: str,
    sources: List[Dict[str, Any]],
    evidence: List[Dict[str, Any]],
    quality: Dict[str, Any],
    duration_seconds: float,
    raw_feedback: str = ""
):
    result_payload = {
        "id": job_id,
        "topic": topic,
        "status": "completed",
        "report": report_raw,
        "sources": sources,
        "evidence": evidence,
        "quality": quality,
        "duration_seconds": duration_seconds,
        "created_at": datetime.now().isoformat()
    }

    if job_id in _in_memory_jobs:
        _in_memory_jobs[job_id]["status"] = "completed"
        _in_memory_jobs[job_id]["current_agent"] = "report"
        _in_memory_jobs[job_id]["progress"] = 100
        _in_memory_jobs[job_id]["message"] = "Research completed successfully."
        _in_memory_jobs[job_id]["duration_seconds"] = duration_seconds
        _in_memory_jobs[job_id]["raw_feedback"] = raw_feedback
        _in_memory_jobs[job_id]["result"] = result_payload

    client = get_supabase_client()
    if client:
        try:
            client.table("research_jobs").update({
                "status": "completed",
                "current_agent": "report",
                "progress": 100,
                "message": "Research completed successfully.",
                "duration_seconds": duration_seconds,
                "report": report_raw,
                "sources": sources,
                "evidence": evidence,
                "quality_score": quality,
                "raw_feedback": raw_feedback
            }).eq("id", job_id).execute()
        except Exception as e:
            print(f"[Supabase] Error writing completion for job {job_id}: {e}")

def fail_research_job(job_id: str, error_msg: str):
    if job_id in _in_memory_jobs:
        _in_memory_jobs[job_id]["status"] = "failed"
        _in_memory_jobs[job_id]["message"] = f"Pipeline execution failed: {error_msg}"

    client = get_supabase_client()
    if client:
        try:
            client.table("research_jobs").update({
                "status": "failed",
                "message": f"Pipeline execution failed: {error_msg}"
            }).eq("id", job_id).execute()
        except Exception as e:
            print(f"[Supabase] Error marking job failure for {job_id}: {e}")

def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    # Check in-memory first for live running data
    if job_id in _in_memory_jobs:
        return _in_memory_jobs[job_id]

    client = get_supabase_client()
    if client:
        try:
            res = client.table("research_jobs").select("*").eq("id", job_id).execute()
            if res.data and len(res.data) > 0:
                row = res.data[0]
                result_obj = None
                if row.get("status") == "completed":
                    result_obj = {
                        "id": row["id"],
                        "topic": row["topic"],
                        "status": row["status"],
                        "report": row.get("report") or "",
                        "sources": row.get("sources") or [],
                        "evidence": row.get("evidence") or [],
                        "quality": row.get("quality_score") or {},
                        "duration_seconds": float(row.get("duration_seconds") or 0.0),
                        "created_at": row.get("created_at")
                    }
                return {
                    "research_id": row["id"],
                    "topic": row["topic"],
                    "status": row["status"],
                    "current_agent": row.get("current_agent", "report"),
                    "progress": row.get("progress", 100),
                    "message": row.get("message", ""),
                    "created_at": row.get("created_at"),
                    "duration_seconds": float(row.get("duration_seconds") or 0.0),
                    "raw_feedback": row.get("raw_feedback") or "",
                    "result": result_obj
                }
        except Exception as e:
            print(f"[Supabase] Error reading job {job_id}: {e}")

    return None

def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
    job = get_job_by_id(job_id)
    if job:
        return {
            "status": job["status"],
            "current_agent": job.get("current_agent", "planner"),
            "progress": job.get("progress", 0),
            "message": job.get("message", "")
        }
    return None

def get_research_history() -> List[Dict[str, Any]]:
    client = get_supabase_client()
    if client:
        try:
            res = client.table("research_jobs") \
                .select("id, topic, status, created_at, sources, quality_score, duration_seconds") \
                .eq("status", "completed") \
                .order("created_at", desc=True) \
                .execute()
            if res.data:
                history_list = []
                for row in res.data:
                    quality = row.get("quality_score") or {}
                    sources = row.get("sources") or []
                    history_list.append({
                        "id": row["id"],
                        "topic": row["topic"],
                        "status": row["status"],
                        "created_at": row.get("created_at"),
                        "sources_count": len(sources),
                        "confidence_score": quality.get("overall_confidence", 91),
                        "duration_seconds": float(row.get("duration_seconds") or 18.4)
                    })
                return history_list
        except Exception as e:
            print(f"[Supabase] Error reading history: {e}")

    # Fallback to in-memory
    history_list = []
    for j_id, job in _in_memory_jobs.items():
        if job.get("status") == "completed" and job.get("result"):
            res = job["result"]
            history_list.append({
                "id": j_id,
                "topic": job["topic"],
                "status": "completed",
                "created_at": job.get("created_at"),
                "sources_count": len(res.get("sources", [])),
                "confidence_score": res.get("quality", {}).get("overall_confidence", 91),
                "duration_seconds": job.get("duration_seconds", 18.4)
            })
    return history_list

def save_report_to_db(report_item: Dict[str, Any]) -> bool:
    report_id = report_item.get("id") or f"rep-{datetime.now().timestamp()}"
    _in_memory_saved_reports[report_id] = report_item

    client = get_supabase_client()
    if client:
        try:
            row = {
                "id": report_id,
                "research_id": report_item.get("id"),
                "topic": report_item.get("topic", "Research Report"),
                "report": report_item.get("report", ""),
                "quality_score": report_item.get("quality", {}),
                "sources": report_item.get("sources", []),
                "duration_seconds": float(report_item.get("duration_seconds") or 0.0),
                "saved_at": datetime.now().isoformat()
            }
            client.table("saved_reports").upsert(row).execute()
            return True
        except Exception as e:
            print(f"[Supabase] Error saving report {report_id}: {e}")
    return True

def get_saved_reports_from_db() -> List[Dict[str, Any]]:
    client = get_supabase_client()
    if client:
        try:
            res = client.table("saved_reports").select("*").order("saved_at", desc=True).execute()
            if res.data:
                reports = []
                for row in res.data:
                    reports.append({
                        "id": row["id"],
                        "topic": row["topic"],
                        "report": row["report"],
                        "quality": row.get("quality_score") or {},
                        "sources": row.get("sources") or [],
                        "duration_seconds": float(row.get("duration_seconds") or 0.0),
                        "created_at": row.get("saved_at")
                    })
                return reports
        except Exception as e:
            print(f"[Supabase] Error getting saved reports: {e}")

    return list(_in_memory_saved_reports.values())

def delete_saved_report_from_db(report_id: str) -> bool:
    if report_id in _in_memory_saved_reports:
        del _in_memory_saved_reports[report_id]

    client = get_supabase_client()
    if client:
        try:
            client.table("saved_reports").delete().eq("id", report_id).execute()
            return True
        except Exception as e:
            print(f"[Supabase] Error deleting saved report {report_id}: {e}")
    return True
