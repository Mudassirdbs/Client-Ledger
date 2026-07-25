import { useState, memo } from "react";
import { useLocation } from "wouter";
import { Project } from "@/lib/types";
import { fmt } from "@/lib/utils";
import { AlertTriangle, XCircle, X, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentAlertsProps {
  projects: Project[];
}

interface AlertGroup {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  items: Project[];
  variant: "error" | "warning";
}

function AlertBanner({
  group,
  onDismiss,
  onGenerateInvoice,
}: {
  group: AlertGroup;
  onDismiss: (key: string) => void;
  onGenerateInvoice?: (p: Project) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isError = group.variant === "error";
  const styles = isError
    ? {
        wrapper: "bg-rose-500/8 border-rose-500/25 dark:bg-rose-500/10",
        icon: "text-rose-500",
        title: "text-rose-700 dark:text-rose-400",
        desc: "text-rose-600/80 dark:text-rose-400/70",
        badge: "bg-rose-500 text-white",
        item: "border-rose-500/15 text-rose-700 dark:text-rose-300",
        dismiss: "text-rose-400 hover:text-rose-600",
        toggle: "text-rose-500/70 hover:text-rose-600",
      }
    : {
        wrapper: "bg-amber-500/8 border-amber-500/25 dark:bg-amber-500/10",
        icon: "text-amber-500",
        title: "text-amber-700 dark:text-amber-400",
        desc: "text-amber-600/80 dark:text-amber-400/70",
        badge: "bg-amber-500 text-white",
        item: "border-amber-500/15 text-amber-700 dark:text-amber-300",
        dismiss: "text-amber-400 hover:text-amber-600",
        toggle: "text-amber-500/70 hover:text-amber-600",
      };

  return (
    <div className={cn("rounded-xl border px-4 py-3", styles.wrapper)}>
      <div className="flex items-start gap-3">
        <div className={cn("shrink-0 mt-0.5", styles.icon)}>
          {isError ? (
            <XCircle className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          ) : (
            <AlertTriangle className="h-[18px] w-[18px]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn("text-sm font-semibold leading-snug", styles.title)}>
              {group.title}
            </p>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0", styles.badge)}>
              {group.items.length}
            </span>
          </div>
          <p className={cn("text-xs mt-0.5 leading-snug", styles.desc)}>{group.description}</p>

          {/* Expandable project list */}
          {expanded && (
            <div className="mt-2.5 space-y-1.5">
              {group.items.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between gap-2 text-xs rounded-lg px-3 py-2 border",
                    styles.item,
                    isError ? "bg-rose-500/5" : "bg-amber-500/5"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold truncate block">{p.projectName}</span>
                    <span className="opacity-70">{p.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold tabular-nums">
                      {fmt(p.totalValue - p.amountPaid)} due
                    </span>
                    {isError && onGenerateInvoice && (
                      <button
                        onClick={() => onGenerateInvoice(p)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500 text-white font-semibold text-[10px] hover:bg-rose-600 transition-colors whitespace-nowrap"
                      >
                        <FileText className="h-3 w-3" />
                        Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn("mt-1.5 text-[11px] font-medium flex items-center gap-0.5 transition-colors", styles.toggle)}
          >
            {expanded ? (
              <>Hide projects <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Show {group.items.length} project{group.items.length !== 1 ? "s" : ""} <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        </div>

        <button
          onClick={() => onDismiss(group.key)}
          className={cn("shrink-0 mt-0.5 transition-colors", styles.dismiss)}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const PaymentAlerts = memo(function PaymentAlerts({ projects }: PaymentAlertsProps) {
  const [, navigate] = useLocation();

  const completedUnpaid = projects.filter(
    (p) => p.status === "completed" && p.amountPaid < p.totalValue
  );
  const stalledInProgress = projects.filter(
    (p) => p.status === "in-progress" && p.amountPaid === 0
  );

  const allGroups: AlertGroup[] = ([
    {
      key: "completed-unpaid",
      icon: <XCircle />,
      title: "Payment pending on completed projects",
      description:
        "These projects are marked completed but the full payment has not been received yet.",
      items: completedUnpaid,
      variant: "error",
    },
    {
      key: "stalled-inprogress",
      icon: <AlertTriangle />,
      title: "In-progress projects with no payment",
      description:
        "These projects are active but no payment has been collected yet.",
      items: stalledInProgress,
      variant: "warning",
    },
  ] as AlertGroup[]).filter((g) => g.items.length > 0);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = allGroups.filter((g) => !dismissed.has(g.key));

  const handleGenerateInvoice = (p: Project) => {
    const outstanding = p.totalValue - p.amountPaid;
    navigate(
      `/invoices?project=${encodeURIComponent(p.projectName)}&client=${encodeURIComponent(p.clientName)}&amount=${outstanding}`
    );
  };

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((group) => (
        <AlertBanner
          key={group.key}
          group={group}
          onDismiss={(key) => setDismissed((prev) => new Set([...prev, key]))}
          onGenerateInvoice={group.variant === "error" ? handleGenerateInvoice : undefined}
        />
      ))}
    </div>
  );
});
