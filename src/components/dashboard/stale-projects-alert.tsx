import { memo, useState } from "react";
import { Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils";
import { useStaleProjects, THRESHOLD_OPTIONS } from "@/lib/stale-projects-context";

export const StaleProjectsAlert = memo(function StaleProjectsAlert() {
  const { staleProjects, staleCount, threshold, setThreshold } = useStaleProjects();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (staleCount === 0 || dismissed) return null;

  return (
    <div className="rounded-xl border px-4 py-3 bg-violet-500/8 border-violet-500/25 dark:bg-violet-500/10">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 text-violet-500">
          <Clock className="h-[18px] w-[18px]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold leading-snug text-violet-700 dark:text-violet-400">
              {staleCount} project{staleCount !== 1 ? "s" : ""} stalled for {threshold}+ days
            </p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-violet-500 text-white">
              {staleCount}
            </span>
          </div>
          <p className="text-xs mt-0.5 leading-snug text-violet-600/80 dark:text-violet-400/70">
            In-progress with no payment collected yet. Consider following up.
          </p>

          {/* Threshold selector */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-violet-500/70 font-medium">Alert after:</span>
            {THRESHOLD_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setThreshold(d)}
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors",
                  threshold === d
                    ? "bg-violet-500 text-white"
                    : "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
                )}
              >
                {d}d
              </button>
            ))}
          </div>

          {/* Expandable list */}
          {expanded && (
            <div className="mt-2.5 space-y-1.5">
              {staleProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 text-xs rounded-lg px-3 py-2 border border-violet-500/15 text-violet-700 dark:text-violet-300 bg-violet-500/5"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold truncate block">{p.projectName}</span>
                    <span className="opacity-70">{p.clientName}</span>
                  </div>
                  <span className="font-bold tabular-nums shrink-0">
                    {fmt(p.totalValue)} total
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 text-[11px] font-medium flex items-center gap-0.5 transition-colors text-violet-500/70 hover:text-violet-600"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide projects
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show {staleCount} project{staleCount !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 mt-0.5 transition-colors text-violet-400 hover:text-violet-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
