import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useProjects } from "@/lib/projects-context";
import { useAuth } from "@/lib/auth-context";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, Circle } from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import { FadeIn } from "@/components/ui/fade-in";

const DONUT_COLORS = { completed: "#10b981", "in-progress": "#f59e0b", "not-started": "#6b7280" };

export default function Reports() {
  const { projects } = useProjects();
  const { isAdmin } = useAuth();

  const totalRevenue   = projects.reduce((s, p) => s + p.totalValue, 0);
  const totalCollected = projects.reduce((s, p) => s + p.amountPaid, 0);
  const outstanding    = totalRevenue - totalCollected;
  const rate           = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;

  /* Revenue by Client */
  const clientData = useMemo(() => {
    const map = new Map<string, { collected: number; outstanding: number }>();
    projects.forEach((p) => {
      const e = map.get(p.clientName) ?? { collected: 0, outstanding: 0 };
      e.collected    += p.amountPaid;
      e.outstanding  += p.totalValue - p.amountPaid;
      map.set(p.clientName, e);
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, total: v.collected + v.outstanding }))
      .sort((a, b) => b.total - a.total);
  }, [projects]);

  /* Status distribution */
  const statusData = useMemo(() => {
    const counts = { completed: 0, "in-progress": 0, "not-started": 0 };
    projects.forEach((p) => counts[p.status]++);
    return [
      { name: "Completed",   value: counts.completed,    key: "completed"    },
      { name: "In Progress", value: counts["in-progress"],key: "in-progress"  },
      { name: "Not Started", value: counts["not-started"],key: "not-started"  },
    ].filter((d) => d.value > 0);
  }, [projects]);

  /* Top clients */
  const topClients = useMemo(() =>
    clientData.slice(0, 5).map((c) => ({
      ...c,
      rate: c.total > 0 ? Math.round((c.collected / c.total) * 100) : 0,
      projects: projects.filter((p) => p.clientName === c.name).length,
    })),
    [clientData, projects]
  );

  return (
    <AppShell>
      <header className="h-16 pl-16 pr-6 md:px-8 flex items-center border-b border-border bg-background shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reports</h1>
          <p className="text-xs text-muted-foreground">Analytics across {projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto space-y-6">

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Revenue",    value: fmt(totalRevenue),   icon: TrendingUp,   color: "text-blue-500",    bg: "bg-blue-500/10"    },
              { label: "Collected",         value: fmt(totalCollected), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Outstanding",       value: fmt(outstanding),    icon: Clock,        color: "text-amber-500",   bg: "bg-amber-500/10"   },
              { label: "Collection Rate",   value: `${rate}%`,          icon: Circle,       color: "text-violet-500",  bg: "bg-violet-500/10"  },
            ].map(({ label, value, icon: Icon, color, bg }, i) => (
              <FadeIn key={label} delay={i * 0.1}>
                <div className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3 h-full">
                  <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-black tabular-nums leading-tight">{value}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Revenue by Client bar chart */}
            <FadeIn delay={0.2} className="lg:col-span-2">
              <div className="bg-card border border-card-border rounded-2xl p-5 h-full">
                <p className="text-sm font-bold mb-0.5">Revenue by Client</p>
                <p className="text-xs text-muted-foreground mb-5">Collected vs outstanding per client</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={clientData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <RechartTooltip
                      formatter={(val: any, name: any) => [fmt(Number(val || 0)), name === "collected" ? "Collected" : "Outstanding"]}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Bar dataKey="collected"   name="Collected"   stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="outstanding" name="Outstanding" stackId="a" fill="#f59e0b" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Collected</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Outstanding</span>
                </div>
              </div>
            </FadeIn>
            
            {/* Status donut */}
            <FadeIn delay={0.3}>
              <div className="bg-card border border-card-border rounded-2xl p-5 h-full">
                <p className="text-sm font-bold mb-0.5">Project Status</p>
                <p className="text-xs text-muted-foreground mb-3">Distribution across all projects</p>
                {projects.length === 0 ? (
                  <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No projects yet</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                          {statusData.map((entry) => (
                            <Cell key={entry.key} fill={DONUT_COLORS[entry.key as keyof typeof DONUT_COLORS]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-1">
                      {statusData.map((entry) => (
                        <div key={entry.key} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: DONUT_COLORS[entry.key as keyof typeof DONUT_COLORS] }} />
                            <span className="text-muted-foreground">{entry.name}</span>
                          </span>
                          <span className="font-semibold tabular-nums">
                            {entry.value} <span className="text-muted-foreground font-normal">({Math.round((entry.value / projects.length) * 100)}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Top Clients */}
          {isAdmin && (
            <FadeIn delay={0.4}>
              <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-card-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Top Clients</p>
                    <p className="text-xs text-muted-foreground">Ranked by total project value</p>
                  </div>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {topClients.map((c, i) => (
                    <div key={c.name} className="px-4 py-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-muted-foreground shrink-0">#{i + 1}</span>
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                        </div>
                        <p className="text-sm font-bold tabular-nums shrink-0">{fmt(c.total)}</p>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.rate}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.rate}% collected</span>
                        <span>{c.projects} proj{c.projects !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  ))}
                  {topClients.length === 0 && (
                    <div className="px-5 py-12 text-center text-muted-foreground text-sm">No data yet — add some projects to see rankings</div>
                  )}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block divide-y divide-border">
                  {topClients.map((c, i) => (
                    <div key={c.name} className="px-5 py-4 flex items-center gap-4">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold">{c.name}</p>
                          <p className="text-sm font-bold tabular-nums">{fmt(c.total)}</p>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.rate}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-xs text-muted-foreground tabular-nums">{c.rate}%</p>
                        <p className="text-[10px] text-muted-foreground">{c.projects} proj{c.projects !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  ))}
                  {topClients.length === 0 && (
                    <div className="px-5 py-12 text-center text-muted-foreground text-sm">No data yet — add some projects to see rankings</div>
                  )}
                </div>
              </div>
            </FadeIn>
          )}

        </div>
      </main>
    </AppShell>
  );
}
