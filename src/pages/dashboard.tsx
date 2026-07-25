import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/layout/app-shell";
import { Scorecard } from "@/components/dashboard/scorecard";
import { ProjectTable } from "@/components/dashboard/project-table";
import { AddProjectForm } from "@/components/dashboard/add-project-form";
import { ClientCard } from "@/components/dashboard/client-card";
import { RevenueByClient } from "@/components/dashboard/charts/revenue-by-client";
import { PaymentAlerts } from "@/components/dashboard/payment-alerts";
import { StaleProjectsAlert } from "@/components/dashboard/stale-projects-alert";
import { useProjects } from "@/lib/projects-context";
import { useAuth } from "@/lib/auth-context";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/fade-in";
import { Project } from "@/lib/types";
import { toast } from "sonner";

export default function Dashboard() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { profile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const toastedRef = useRef(false);

  // Fire once-per-session toasts for payment issues
  useEffect(() => {
    if (toastedRef.current || projects.length === 0) return;
    const completedUnpaid = projects.filter(
      (p) => p.status === "completed" && p.amountPaid < p.totalValue
    );
    const stalledInProgress = projects.filter(
      (p) => p.status === "in-progress" && p.amountPaid === 0
    );
    if (completedUnpaid.length > 0) {
      toast.error(
        `${completedUnpaid.length} completed project${completedUnpaid.length !== 1 ? "s" : ""} with outstanding payment`,
        { description: "Payment has not been fully received. Check the alerts below." }
      );
    }
    if (stalledInProgress.length > 0) {
      toast.warning(
        `${stalledInProgress.length} in-progress project${stalledInProgress.length !== 1 ? "s" : ""} with no payment collected`,
        { description: "These active projects have zero payment received." }
      );
    }
    toastedRef.current = true;
  }, [projects]);



  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return projects;
    return projects.filter(
      (p) =>
        p.clientName.toLowerCase().includes(query) ||
        p.projectName.toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const metrics = useMemo(() =>
    filteredProjects.reduce(
      (acc, p) => {
        acc.totalRevenue      += p.totalValue;
        acc.amountCollected   += p.amountPaid;
        acc.outstandingBalance += p.totalValue - p.amountPaid;
        if (p.status === "in-progress") acc.activeProjects += 1;
        return acc;
      },
      { totalRevenue: 0, amountCollected: 0, outstandingBalance: 0, activeProjects: 0 }
    ),
    [filteredProjects]
  );

  const clientGroups = useMemo(() => {
    const map = new Map<string, typeof filteredProjects>();
    filteredProjects.forEach((p) => map.set(p.clientName, [...(map.get(p.clientName) ?? []), p]));
    return Array.from(map.entries())
      .map(([name, projs]) => ({ name, projects: projs }))
      .sort(
        (a, b) =>
          b.projects.length - a.projects.length ||
          b.projects.reduce((s, p) => s + p.totalValue, 0) -
            a.projects.reduce((s, p) => s + p.totalValue, 0)
      );
  }, [filteredProjects]);

  const revenueChartData = useMemo(() =>
    clientGroups.slice(0, 8).map(({ name, projects: cp }) => ({
      name: name.length > 12 ? name.slice(0, 12) + "…" : name,
      collected: cp.reduce((s, p) => s + p.amountPaid, 0),
      outstanding: cp.reduce((s, p) => s + (p.totalValue - p.amountPaid), 0),
    })),
    [clientGroups]
  );

  const handleAdd = useCallback(async (p: Omit<Project, "id">) => {
    await addProject(p);
  }, [addProject]);

  const handleUpdate = useCallback(async (id: string, updates: Omit<Project, "id">) => {
    await updateProject(id, updates);
  }, [updateProject]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteProject(id);
  }, [deleteProject]);

  return (
    <AppShell>
      {/* Top bar */}
      <header className="h-16 pl-16 pr-6 md:px-8 flex items-center justify-between border-b border-border/40 bg-card shadow-sm shrink-0 gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{new Date().getFullYear()}</h1>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[150px] sm:w-[250px] pl-9 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:border-primary/30 rounded-full transition-colors"
            />
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-lg font-semibold">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-card-border rounded-2xl">
              <AddProjectForm onAdd={handleAdd} onDone={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-8 py-6 md:py-8 space-y-8 max-w-[1400px] mx-auto">

          <PaymentAlerts projects={projects} />
          <StaleProjectsAlert />

          <Scorecard metrics={metrics} projects={filteredProjects} />

          {/* Revenue chart */}
          {revenueChartData.length > 0 && (
            <FadeIn delay={0.1} direction="up">
              <RevenueByClient data={revenueChartData} />
            </FadeIn>
          )}

          {/* Client overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Client Overview
              </span>
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {clientGroups.length} client{clientGroups.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {clientGroups.map(({ name, projects: cp }, i) => (
                <FadeIn key={name} delay={i * 0.08}>
                  <ClientCard clientName={name} projects={cp} />
                </FadeIn>
              ))}
            </div>
          </div>

          {/* All projects table */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                All Projects
              </span>
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs text-muted-foreground tabular-nums">{filteredProjects.length} total</span>
            </div>
            <FadeIn delay={0.2} direction="up">
              <ProjectTable
                projects={filteredProjects}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                searchQuery={searchQuery || undefined}
              />
            </FadeIn>
          </div>

        </div>
      </main>
    </AppShell>
  );
}
