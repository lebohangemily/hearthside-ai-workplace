import { useEffect, useState } from "react";

export type ToolKey = "email" | "meetings" | "planner" | "research" | "chat";
export interface Activity { tool: ToolKey; label: string; at: number }
interface Usage { counts: Record<ToolKey, number>; activity: Activity[] }

const KEY = "awpa-usage";
const empty: Usage = { counts: { email: 0, meetings: 0, planner: 0, research: 0, chat: 0 }, activity: [] };

// Estimated minutes saved per generation (demo heuristic).
export const MINUTES_SAVED: Record<ToolKey, number> = { email: 8, meetings: 15, planner: 12, research: 20, chat: 3 };

function read(): Usage {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...empty, ...JSON.parse(raw) } : empty; } catch { return empty; }
}

export function recordUsage(tool: ToolKey, label: string) {
  const u = read();
  u.counts = { ...u.counts, [tool]: (u.counts[tool] ?? 0) + 1 };
  u.activity = [{ tool, label: label.slice(0, 80), at: Date.now() }, ...u.activity].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new Event("awpa-usage"));
}

export function useUsage() {
  const [u, setU] = useState<Usage>(empty);
  useEffect(() => {
    const sync = () => setU(read());
    sync();
    window.addEventListener("awpa-usage", sync);
    return () => window.removeEventListener("awpa-usage", sync);
  }, []);
  return u;
}

export function useLocalState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setV(JSON.parse(raw)); } catch { /* ignore */ }
    setLoaded(true);
  }, [key]);
  useEffect(() => { if (loaded) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, loaded]);
  return [v, setV] as const;
}
