import { Project } from "@/lib/types";
import { FadeIn } from "@/components/ui/fade-in";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface ScorecardProps {
  metrics: {
    totalRevenue: number;
    amountCollected: number;
    outstandingBalance: number;
    activeProjects: number;
  };
  projects: Project[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(v);

interface KpiCardProps {
  label: string;
  value: string | number;
  sub1?: string;
  sub2?: string;
  delay?: number;
  icon: React.ReactNode;
  accent: string;
  progress?: number;
}

function KpiCard({ label, value, sub1, sub2, delay, icon, accent, progress }: KpiCardProps) {
  const textColor = accent.replace("bg-", "text-");
  const bgColor = accent.replace("bg-", "bg-").replace("-500", "-500/10");

  return (
    <FadeIn delay={delay} direction="up" className="min-w-0">
      <div className="bg-card rounded-lg p-5 flex flex-col gap-3 shadow-sm border border-border/40 h-full relative overflow-hidden transition-shadow hover:shadow-md">
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground font-semibold leading-none">{label}</p>
          <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${bgColor} ${textColor}`}>
            <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums leading-none truncate mt-1">
          {value}
        </p>
        {progress !== undefined && (
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all ${accent}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
        <div className="flex flex-col gap-0.5 mt-auto pt-2">
          {sub1 && <p className="text-xs text-muted-foreground leading-snug">{sub1}</p>}
          {sub2 && <p className="text-xs text-muted-foreground leading-snug">{sub2}</p>}
        </div>
      </div>
    </FadeIn>
  );
}

export function Scorecard({ metrics, projects }: ScorecardProps) {
  const collectionRate =
    metrics.totalRevenue > 0
      ? Math.round((metrics.amountCollected / metrics.totalRevenue) * 100)
      : 0;

  const completed = projects.filter((p) => p.status === "completed").length;
  const notStarted = projects.filter((p) => p.status === "not-started").length;
  const completionRate = projects.length > 0 ? Math.round((completed / projects.length) * 100) : 0;
  const activeRate = projects.length > 0 ? Math.round((metrics.activeProjects / projects.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      <KpiCard
        label="Revenue"
        value={fmt(metrics.totalRevenue)}
        sub1={`${projects.length} project${projects.length !== 1 ? "s" : ""} total`}
        sub2={`VAT PKR 0`}
        delay={0}
        icon={<DollarSign />}
        accent="bg-blue-500"
        progress={100}
      />
      <KpiCard
        label="Collected"
        value={fmt(metrics.amountCollected)}
        sub1={`${collectionRate}% collection rate`}
        sub2={`${completed} paid in full`}
        delay={0.05}
        icon={<TrendingUp />}
        accent="bg-emerald-500"
        progress={collectionRate}
      />
      <KpiCard
        label="Outstanding"
        value={fmt(metrics.outstandingBalance)}
        sub1="Pending balance"
        sub2={`${notStarted} not started`}
        delay={0.1}
        icon={<AlertCircle />}
        accent="bg-amber-500"
        progress={metrics.totalRevenue > 0 ? Math.round((metrics.outstandingBalance / metrics.totalRevenue) * 100) : 0}
      />
      <KpiCard
        label="Collection Rate"
        value={`${collectionRate}%`}
        sub1={`${fmt(metrics.amountCollected)} collected`}
        sub2={`${fmt(metrics.outstandingBalance)} pending`}
        delay={0.15}
        icon={<TrendingUp />}
        accent={collectionRate >= 80 ? "bg-emerald-500" : collectionRate >= 50 ? "bg-amber-500" : "bg-rose-500"}
        progress={collectionRate}
      />
      <KpiCard
        label="Active Projects"
        value={metrics.activeProjects}
        sub1="Currently in progress"
        sub2={`of ${projects.length} total`}
        delay={0.2}
        icon={<Activity />}
        accent="bg-blue-500"
        progress={activeRate}
      />
      <KpiCard
        label="Completed"
        value={completed}
        sub1={`${completionRate}% completion rate`}
        sub2={`${notStarted} not yet started`}
        delay={0.25}
        icon={completed > 0 ? <CheckCircle2 /> : <Clock />}
        accent="bg-emerald-500"
        progress={completionRate}
      />
    </div>
  );
}
