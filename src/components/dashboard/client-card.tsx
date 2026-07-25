// UI/UX Fix applied: Fix 3 — Replaced hardcoded hex colors in Recharts with CSS variable-based theme colors
import { memo, useMemo } from "react";
import { Project } from "@/lib/types";
import { fmt } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ClientCardProps {
  clientName: string;
  projects: Project[];
  featured?: boolean;
}



const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500",
];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/** Build spike data: each project creates one spike point */
function buildSpikeData(projects: Project[]) {
  const pts: { x: number; revenue: number; expenses: number }[] = [];
  // leading flat
  pts.push({ x: 0, revenue: 0, expenses: 0 });

  projects.forEach((p, i) => {
    const base = i * 5;
    pts.push({ x: base + 1, revenue: 0, expenses: 0 });
    pts.push({ x: base + 2, revenue: p.amountPaid, expenses: p.totalValue - p.amountPaid });
    pts.push({ x: base + 3, revenue: 0, expenses: 0 });
  });

  // trailing flat
  pts.push({ x: pts[pts.length - 1].x + 2, revenue: 0, expenses: 0 });
  return pts;
}

function SpikeTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const rev = payload.find((p: any) => p.dataKey === "revenue")?.value ?? 0;
  const exp = payload.find((p: any) => p.dataKey === "expenses")?.value ?? 0;
  if (rev === 0 && exp === 0) return null;
  return (
    <div className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg space-y-0.5">
      {rev > 0 && <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="font-semibold">{fmt(rev)}</span></div>}
      {exp > 0 && <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /><span className="font-semibold">{fmt(exp)}</span></div>}
    </div>
  );
}

/** Read a CSS custom property from the document root */
const getCssVar = (variable: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

export const ClientCard = memo(function ClientCard({ clientName, projects, featured = false }: ClientCardProps) {
  const totalRevenue    = projects.reduce((s, p) => s + p.totalValue, 0);
  const totalCollected  = projects.reduce((s, p) => s + p.amountPaid, 0);
  const totalOutstanding = totalRevenue - totalCollected;
  const completed = projects.filter((p) => p.status === "completed").length;
  const active    = projects.filter((p) => p.status === "in-progress").length;

  const spikeData = buildSpikeData(projects);

  const avatarColor = getAvatarColor(clientName);

  // Resolve chart stroke colors from the theme CSS variables
  const { collectedStroke, outstandingStroke } = useMemo(() => {
    const successRaw = getCssVar("--color-success");
    const collectedStroke = successRaw ? `hsl(${successRaw})` : `hsl(${getCssVar("--primary")})`;
    const outstandingStroke = `hsl(${getCssVar("--destructive")})`;
    return { collectedStroke, outstandingStroke };
  }, []);

  return (
    <div
      className={
        featured
          ? "bg-card border-2 border-primary/30 rounded-lg p-5 shadow-md flex flex-col gap-3 ring-1 ring-primary/10 transition-shadow hover:shadow-lg"
          : "bg-card border border-border/40 rounded-lg p-5 shadow-sm flex flex-col gap-3 transition-shadow hover:shadow-md"
      }
    >
      {/* Header: name + count badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg leading-tight tracking-tight">{clientName}</h3>
        <div className="h-6 min-w-6 px-2 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {projects.length}
        </div>
      </div>

      {/* Avatar stack */}
      <div className="flex items-center">
        {projects.slice(0, 3).map((p, i) => (
          <div
            key={p.id}
            title={p.projectName}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-card ${
              AVATAR_COLORS[(AVATAR_COLORS.indexOf(avatarColor) + i) % AVATAR_COLORS.length]
            } ${i > 0 ? "-ml-2.5" : ""}`}
          >
            {p.projectName.slice(0, 2).toUpperCase()}
          </div>
        ))}
        {projects.length > 3 && (
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground bg-muted ring-2 ring-card -ml-2.5">
            +{projects.length - 3}
          </div>
        )}
      </div>

      {/* Revenue + collection rate progress */}
      <div className="space-y-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Revenue
          </p>
          <p className="text-2xl font-bold tracking-tight tabular-nums leading-none">
            {fmt(totalRevenue)}
          </p>
        </div>
        {totalRevenue > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(100, Math.round((totalCollected / totalRevenue) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {Math.round((totalCollected / totalRevenue) * 100)}% collected
            </p>
          </div>
        )}
      </div>

      {/* Spike chart */}
      <div className="h-20 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spikeData} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
            <XAxis dataKey="x" hide />
            <YAxis hide domain={[0, "dataMax"]} />
            <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />
            <Tooltip content={<SpikeTip />} cursor={false} />
            <Line
              type="linear"
              dataKey="revenue"
              stroke={collectedStroke}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: collectedStroke }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="expenses"
              stroke={outstandingStroke}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: outstandingStroke }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue / Expenses summary row */}
      <div className="grid grid-cols-2 gap-x-4 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-[9px]">Collected</span>
          </div>
          <p className="font-bold tabular-nums">{fmt(totalCollected)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-[9px]">Outstanding</span>
          </div>
          <p className="font-bold tabular-nums">{fmt(totalOutstanding)}</p>
        </div>
      </div>

      {/* Stats list */}
      <div className="border-t border-border/60 pt-3 space-y-1.5">
        {[
          { label: "Projects",  value: projects.length },
          { label: "Completed", value: `${completed} · ${completed} paid` },
          { label: "Active",    value: active },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold tabular-nums text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
