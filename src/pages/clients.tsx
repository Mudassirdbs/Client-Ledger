import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useProjects } from "@/lib/projects-context";
import { AddProjectForm } from "@/components/dashboard/add-project-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, CheckCircle2, Clock, Circle, Users, Sparkles } from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import { FadeIn } from "@/components/ui/fade-in";
import { ClientAiModal } from "@/components/ai/client-ai-modal";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Clients() {
  const { projects, addProject } = useProjects();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const clients = useMemo(() => {
    const map = new Map<string, typeof projects>();
    projects.forEach((p) => map.set(p.clientName, [...(map.get(p.clientName) ?? []), p]));
    return Array.from(map.entries())
      .map(([name, projs]) => {
        const total     = projs.reduce((s, p) => s + p.totalValue, 0);
        const collected = projs.reduce((s, p) => s + p.amountPaid, 0);
        const rate      = total > 0 ? Math.round((collected / total) * 100) : 0;
        const completed  = projs.filter((p) => p.status === "completed").length;
        const active     = projs.filter((p) => p.status === "in-progress").length;
        const notStarted = projs.filter((p) => p.status === "not-started").length;
        return { name, projects: projs, total, collected, outstanding: total - collected, rate, completed, active, notStarted };
      })
      .sort((a, b) => b.total - a.total);
  }, [projects]);

  // Handle responsive layout & auto-selection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On desktop, auto-select the first client if none is selected
  const activeSelected = selected || (!isMobile && clients.length > 0 ? clients[0].name : null);
  const selectedClient = activeSelected ? clients.find((c) => c.name === activeSelected) : null;

  return (
    <AppShell>
      <header className="h-16 pl-16 pr-6 md:px-8 flex items-center justify-between border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button for mobile when a client is selected */}
          {isMobile && selected && (
            <button 
              onClick={() => setSelected(null)}
              className="md:hidden h-8 w-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground mr-1"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">Clients</h1>
            <p className="text-xs text-muted-foreground">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-lg font-semibold">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-card-border rounded-2xl">
            <AddProjectForm onAdd={addProject} onDone={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto h-full min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row gap-6 h-full">

            {/* Client list - hidden on mobile if a client is selected */}
            <div className={cn(
              "w-full md:w-[340px] shrink-0 space-y-3",
              isMobile && selected ? "hidden" : "block"
            )}>
              {clients.length === 0 ? (
                <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">No clients yet</h3>
                  <p className="text-sm text-muted-foreground">Add a project to create your first client.</p>
                </div>
              ) : (
                clients.map((c, i) => (
                  <FadeIn key={c.name} delay={i * 0.05} direction="up">
                    <button
                      onClick={() => setSelected(c.name)}
                      className={cn(
                        "w-full text-left bg-card rounded-2xl p-4 transition-all duration-200 border",
                        activeSelected === c.name
                          ? "border-primary/50 shadow-[0_4px_20px_-4px_rgba(var(--primary),0.15)] ring-1 ring-primary/20 scale-[1.01]"
                          : "border-card-border hover:border-muted-foreground/30 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-inner", avatarColor(c.name))}>
                          {initials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[15px] truncate text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.projects.length} project{c.projects.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[15px] font-bold tabular-nums text-foreground">{fmt(c.total)}</p>
                          {c.outstanding > 0 ? (
                            <p className="text-[11px] font-medium text-amber-500 tabular-nums mt-0.5">{fmt(c.outstanding)} due</p>
                          ) : (
                            <p className="text-[11px] font-medium text-emerald-500 mt-0.5">Paid up</p>
                          )}
                        </div>
                      </div>
                      {/* collection bar */}
                      <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500", 
                            c.rate === 100 ? "bg-emerald-500" : "bg-primary"
                          )} 
                          style={{ width: `${Math.max(c.rate, 2)}%` }} 
                        />
                      </div>
                    </button>
                  </FadeIn>
                ))
              )}
            </div>

            {/* Client detail panel - hidden on mobile if NO client is selected */}
            <div className={cn(
              "flex-1 min-w-0 flex flex-col gap-5",
              isMobile && !selected ? "hidden" : "flex"
            )}>
              {selectedClient ? (
                <>
                  {/* Header Card */}
                  <FadeIn delay={0}>
                    <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 flex items-center gap-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <TrendingUp className="w-48 h-48" />
                      </div>
                      <div className={cn("h-20 w-20 rounded-[1.25rem] flex items-center justify-center text-3xl font-black text-white shrink-0 shadow-lg", avatarColor(selectedClient.name))}>
                        {initials(selectedClient.name)}
                      </div>
                      <div className="flex-1 relative z-10 flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{selectedClient.name}</h2>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                              {selectedClient.projects.length} Project{selectedClient.projects.length !== 1 ? "s" : ""}
                            </span>
                            {selectedClient.rate === 100 && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" /> Fully Paid
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => setAiModalOpen(true)}
                          className="gap-2 bg-gradient-to-r from-primary via-indigo-600 to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white font-bold rounded-2xl shadow-md text-xs h-10 px-4 shrink-0"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>AI Insights & Summary</span>
                        </Button>
                      </div>
                    </div>
                  </FadeIn>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { label: "Total Value",   value: fmt(selectedClient.total),       icon: TrendingUp,   color: "text-blue-500", bg: "bg-blue-500/10" },
                      { label: "Collected",      value: fmt(selectedClient.collected),   icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                      { label: "Outstanding",    value: fmt(selectedClient.outstanding), icon: Clock,        color: "text-amber-500", bg: "bg-amber-500/10" },
                      { label: "Collection Rate",value: `${selectedClient.rate}%`,       icon: TrendingUp,   color: "text-violet-500", bg: "bg-violet-500/10" },
                    ].map(({ label, value, icon: Icon, color, bg }, i) => (
                      <FadeIn key={label} delay={0.1 + (i * 0.1)} className="h-full">
                        <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md h-full">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", bg, color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
                          </div>
                          <p className="text-xl md:text-2xl font-black tabular-nums tracking-tight text-foreground">{value}</p>
                        </div>
                      </FadeIn>
                    ))}
                  </div>

                  {/* Project list */}
                  <FadeIn delay={0.4} className="flex-1 flex flex-col">
                    <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm flex-1 flex flex-col">
                      <div className="px-6 py-4 border-b border-card-border bg-muted/20 shrink-0">
                        <h3 className="font-bold text-foreground">Project Details</h3>
                      </div>
                      <div className="divide-y divide-border overflow-auto">
                        {selectedClient.projects.map((p) => {
                          const balance = p.totalValue - p.amountPaid;
                          const rate = p.totalValue > 0 ? Math.round((p.amountPaid / p.totalValue) * 100) : 0;
                          return (
                            <div key={p.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/10 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold truncate text-foreground">{p.projectName}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden w-24 md:w-32">
                                    <div 
                                      className={cn("h-full rounded-full", rate === 100 ? "bg-emerald-500" : "bg-primary")} 
                                      style={{ width: `${Math.max(rate, 5)}%` }} 
                                    />
                                  </div>
                                  <span className="text-[10px] font-semibold text-muted-foreground">{rate}%</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 shrink-0">
                                <div className="flex items-center gap-1.5 bg-background border px-2.5 py-1 rounded-md">
                                  {p.status === "completed"   && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                  {p.status === "in-progress" && <Clock        className="h-3.5 w-3.5 text-amber-500" />}
                                  {p.status === "not-started" && <Circle       className="h-3.5 w-3.5 text-muted-foreground" />}
                                  <span className="text-[11px] font-semibold text-foreground capitalize">{p.status.replace("-", " ")}</span>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-base font-black tabular-nums text-foreground">{fmt(p.totalValue)}</p>
                                  {balance > 0
                                    ? <p className="text-[11px] font-bold text-amber-500 tabular-nums tracking-wide">{fmt(balance)} DUE</p>
                                    : <p className="text-[11px] font-bold text-emerald-500 tracking-wide">PAID</p>
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </FadeIn>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-card border border-dashed border-border rounded-3xl p-8">
                  <div className="text-center text-muted-foreground max-w-sm">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-semibold text-foreground">Select a client</p>
                    <p className="text-sm mt-1.5">Choose a client from the list to view their detailed performance and project history.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedClient && (
        <ClientAiModal
          open={aiModalOpen}
          onOpenChange={setAiModalOpen}
          clientName={selectedClient.name}
          projects={selectedClient.projects}
        />
      )}
    </AppShell>
  );
}
