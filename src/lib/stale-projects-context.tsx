import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useProjects } from "./projects-context";
import { Project } from "./types";

const SEEN_KEY = "client-ledger-stale-seen";
const THRESHOLD_KEY = "client-ledger-stale-threshold";
export const DEFAULT_THRESHOLD = 7;
export const THRESHOLD_OPTIONS = [3, 7, 14, 30];

interface StaleProjectsCtx {
  staleProjects: Project[];
  staleCount: number;
  threshold: number;
  setThreshold: (n: number) => void;
}

const StaleProjectsContext = createContext<StaleProjectsCtx | null>(null);

export function StaleProjectsProvider({ children }: { children: React.ReactNode }) {
  const { projects } = useProjects();

  const [threshold, setThresholdState] = useState<number>(() => {
    const stored = localStorage.getItem(THRESHOLD_KEY);
    return stored ? Number(stored) : DEFAULT_THRESHOLD;
  });

  const [seen, setSeen] = useState<Record<string, number>>(() =>
    JSON.parse(localStorage.getItem(SEEN_KEY) || "{}")
  );

  const setThreshold = (n: number) => {
    localStorage.setItem(THRESHOLD_KEY, String(n));
    setThresholdState(n);
  };

  useEffect(() => {
    setSeen((prev) => {
      const next = { ...prev };
      const now = Date.now();
      let changed = false;

      projects.forEach((p) => {
        if (p.status === "in-progress" && p.amountPaid === 0) {
          if (!next[p.id]) {
            next[p.id] = now;
            changed = true;
          }
        } else if (next[p.id]) {
          delete next[p.id];
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, [projects]);

  const staleProjects = useMemo(() => {
    const thresholdMs = threshold * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return projects.filter((p) => {
      if (p.status !== "in-progress" || p.amountPaid !== 0) return false;
      const firstSeen = seen[p.id];
      if (!firstSeen) return false;
      return now - firstSeen >= thresholdMs;
    });
  }, [projects, seen, threshold]);

  return (
    <StaleProjectsContext.Provider
      value={{ staleProjects, staleCount: staleProjects.length, threshold, setThreshold }}
    >
      {children}
    </StaleProjectsContext.Provider>
  );
}

export function useStaleProjects() {
  const ctx = useContext(StaleProjectsContext);
  if (!ctx) throw new Error("useStaleProjects must be inside StaleProjectsProvider");
  return ctx;
}
