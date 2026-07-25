import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useProjects } from "@/lib/projects-context";
import { useInvoices } from "@/lib/invoices-context";
import { AddProjectForm } from "@/components/dashboard/add-project-form";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Project, ProjectStatus } from "@/lib/types";
import { Plus, Pencil, Trash2, Check, X, Calendar } from "lucide-react";
import { cn, fmt } from "@/lib/utils";
import {
  validateProject,
  hasErrors,
  coerceProject,
  MAX_NAME_LENGTH,
  MAX_VALUE,
  type ValidationErrors,
} from "@/lib/validation";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  completed:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "in-progress":"bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "not-started":"bg-muted text-muted-foreground",
};
const STATUS_DOT: Record<ProjectStatus, string> = {
  completed:    "bg-emerald-500",
  "in-progress":"bg-amber-500",
  "not-started":"bg-zinc-400",
};

type FilterStatus = "all" | ProjectStatus;

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", STATUS_STYLES[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {status === "in-progress" ? "In Progress" : status === "not-started" ? "Not Started" : "Completed"}
    </span>
  );
}

interface EditState {
  clientName: string;
  projectName: string;
  status: ProjectStatus;
  totalValue: string;
  amountPaid: string;
}

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { invoices } = useInvoices();
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterClient, setFilterClient] = useState("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editErrors, setEditErrors] = useState<ValidationErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const clients = useMemo(() => Array.from(new Set(projects.map((p) => p.clientName))).sort(), [projects]);

  const filtered = useMemo(() =>
    projects.filter((p) =>
      (filterStatus === "all" || p.status === filterStatus) &&
      (filterClient === "all" || p.clientName === filterClient)
    ),
    [projects, filterStatus, filterClient]
  );

  const startEdit = (p: Project) => {
    setEditId(p.id);
    setEditState({
      clientName: p.clientName,
      projectName: p.projectName,
      status: p.status,
      totalValue: String(p.totalValue),
      amountPaid: String(p.amountPaid),
    });
    setEditErrors({});
  };

  const saveEdit = (id: string) => {
    if (!editState) return;
    const errs = validateProject(editState);
    if (hasErrors(errs)) {
      setEditErrors(errs);
      return;
    }
    updateProject(id, coerceProject(editState));
    setEditId(null);
    setEditState(null);
    setEditErrors({});
  };

  const cancelEdit = () => { setEditId(null); setEditState(null); setEditErrors({}); };

  const clearError = (field: keyof ValidationErrors) =>
    setEditErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const filterBtnClass = (active: boolean) => cn(
    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

  return (
    <AppShell>
      <header className="h-16 pl-16 pr-6 md:px-8 flex items-center justify-between border-b border-border bg-background shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{isAdmin ? "Projects" : "My Projects"}</h1>
          <p className="text-xs text-muted-foreground">{filtered.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-lg font-semibold">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-card-border rounded-2xl">
              <AddProjectForm onAdd={(p) => { addProject(p); setIsFormOpen(false); }} />
            </DialogContent>
          </Dialog>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto space-y-4">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2">
            <div className="flex items-center gap-1 bg-card border border-card-border rounded-xl p-1 overflow-x-auto max-w-full scrollbar-hide">
              {(["all", "in-progress", "completed", "not-started"] as FilterStatus[]).map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)} className={cn(filterBtnClass(filterStatus === s), "whitespace-nowrap")}>
                  {s === "all" ? "All" : s === "in-progress" ? "In Progress" : s === "not-started" ? "Not Started" : "Completed"}
                </button>
              ))}
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1 bg-card border border-card-border rounded-xl p-1 overflow-x-auto max-w-full scrollbar-hide">
                <button onClick={() => setFilterClient("all")} className={cn(filterBtnClass(filterClient === "all"), "whitespace-nowrap")}>All Clients</button>
                {clients.map((c) => (
                  <button key={c} onClick={() => setFilterClient(c)} className={cn(filterBtnClass(filterClient === c), "whitespace-nowrap")}>{c}</button>
                ))}
              </div>
            )}
          </div>

          {/* ── Mobile stacked cards (below md) ── */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-card border border-card-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
                No projects match the current filters
              </div>
            ) : (
              filtered.map((p) => {
                const balance = p.totalValue - p.amountPaid;
                const isEditing = editId === p.id;

                if (isEditing && editState) {
                  return (
                    <div key={p.id} className="bg-card border-2 border-primary/30 rounded-2xl p-4 space-y-3">
                      <div className="space-y-2">
                        <input
                          className={cn("w-full bg-muted rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary", editErrors.clientName && "ring-1 ring-destructive")}
                          value={editState.clientName}
                          onChange={(e) => { setEditState({ ...editState, clientName: e.target.value }); clearError("clientName"); }}
                          placeholder="Client name"
                          maxLength={MAX_NAME_LENGTH}
                        />
                        {editErrors.clientName && <p className="text-[11px] text-destructive">{editErrors.clientName}</p>}
                        <input
                          className={cn("w-full bg-muted rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary", editErrors.projectName && "ring-1 ring-destructive")}
                          value={editState.projectName}
                          onChange={(e) => { setEditState({ ...editState, projectName: e.target.value }); clearError("projectName"); }}
                          placeholder="Project name"
                          maxLength={MAX_NAME_LENGTH}
                        />
                        {editErrors.projectName && <p className="text-[11px] text-destructive">{editErrors.projectName}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium">Status</label>
                        <select
                          className="w-full bg-muted rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          value={editState.status}
                          onChange={(e) => setEditState({ ...editState, status: e.target.value as ProjectStatus })}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium">Value</label>
                          <input
                            className={cn("w-full bg-muted rounded-md px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary", editErrors.totalValue && "ring-1 ring-destructive")}
                            value={editState.totalValue}
                            onChange={(e) => { setEditState({ ...editState, totalValue: e.target.value }); clearError("totalValue"); }}
                            type="number" min="1" max={MAX_VALUE} step="1"
                          />
                          {editErrors.totalValue && <p className="text-[11px] text-destructive">{editErrors.totalValue}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium">Paid</label>
                          <input
                            className={cn("w-full bg-muted rounded-md px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary", editErrors.amountPaid && "ring-1 ring-destructive")}
                            value={editState.amountPaid}
                            onChange={(e) => { setEditState({ ...editState, amountPaid: e.target.value }); clearError("amountPaid"); }}
                            type="number" min="0" max={MAX_VALUE} step="1"
                          />
                          {editErrors.amountPaid && <p className="text-[11px] text-destructive">{editErrors.amountPaid}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                        <button onClick={() => saveEdit(p.id)} className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-sm font-medium transition-colors">
                          <Check className="h-3.5 w-3.5" /> Save
                        </button>
                        <button onClick={cancelEdit} className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-sm font-medium transition-colors">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={p.id} className="bg-card border border-card-border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-foreground leading-tight truncate">{p.clientName}</span>
                        <span className="text-sm text-muted-foreground leading-tight truncate">{p.projectName}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => startEdit(p)} className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => { if (editId === p.id) cancelEdit(); setDeleteTarget(p); }}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div><StatusBadge status={p.status} /></div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">Value</span>
                        <span className="tabular-nums font-medium">{fmt(p.totalValue)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">Paid</span>
                        <span className="tabular-nums text-muted-foreground">{fmt(p.amountPaid)}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-border/60 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Balance</span>
                        <span className={cn("font-semibold tabular-nums", balance > 0 ? "text-amber-500" : "text-emerald-500")}>
                          {balance > 0 ? fmt(balance) : "Paid"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Desktop table (md and above) ── */}
          <div className="hidden md:block bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Client & Project</th>
                    <th className="text-left px-4 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Status</th>
                    <th className="text-right px-4 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Value</th>
                    <th className="text-right px-4 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Paid</th>
                    <th className="text-right px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Balance</th>
                    {isAdmin && <th className="px-4 py-3.5 w-20 whitespace-nowrap" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                        No projects match the current filters
                      </td>
                    </tr>
                  ) : filtered.map((p) => {
                    const balance = p.totalValue - p.amountPaid;
                    const isEditing = editId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors group">
                        {isEditing && editState ? (
                          <>
                            <td className="px-5 py-3 space-y-1 min-w-[200px]">
                              <input
                                className={cn("w-full bg-muted rounded-md px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary", editErrors.clientName && "ring-1 ring-destructive")}
                                value={editState.clientName}
                                onChange={(e) => { setEditState({ ...editState, clientName: e.target.value }); clearError("clientName"); }}
                                placeholder="Client name"
                                maxLength={MAX_NAME_LENGTH}
                              />
                              {editErrors.clientName && <p className="text-[11px] text-destructive">{editErrors.clientName}</p>}
                              <input
                                className={cn("w-full bg-muted rounded-md px-2 py-1 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary", editErrors.projectName && "ring-1 ring-destructive")}
                                value={editState.projectName}
                                onChange={(e) => { setEditState({ ...editState, projectName: e.target.value }); clearError("projectName"); }}
                                placeholder="Project name"
                                maxLength={MAX_NAME_LENGTH}
                              />
                              {editErrors.projectName && <p className="text-[11px] text-destructive">{editErrors.projectName}</p>}
                            </td>
                            <td className="px-4 py-3 min-w-[140px]">
                              <select
                                className="bg-muted rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-full"
                                value={editState.status}
                                onChange={(e) => setEditState({ ...editState, status: e.target.value as ProjectStatus })}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-right min-w-[120px]">
                              <input
                                className={cn("w-24 bg-muted rounded-md px-2 py-1 text-xs text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-primary inline-block", editErrors.totalValue && "ring-1 ring-destructive")}
                                value={editState.totalValue}
                                onChange={(e) => { setEditState({ ...editState, totalValue: e.target.value }); clearError("totalValue"); }}
                                type="number" min="1" max={MAX_VALUE} step="1"
                              />
                              {editErrors.totalValue && <p className="text-[11px] text-destructive text-right">{editErrors.totalValue}</p>}
                            </td>
                            <td className="px-4 py-3 text-right min-w-[120px]">
                              <input
                                className={cn("w-24 bg-muted rounded-md px-2 py-1 text-xs text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-primary inline-block", editErrors.amountPaid && "ring-1 ring-destructive")}
                                value={editState.amountPaid}
                                onChange={(e) => { setEditState({ ...editState, amountPaid: e.target.value }); clearError("amountPaid"); }}
                                type="number" min="0" max={MAX_VALUE} step="1"
                              />
                              {editErrors.amountPaid && <p className="text-[11px] text-destructive text-right">{editErrors.amountPaid}</p>}
                            </td>
                            <td className="px-5 py-3 min-w-[100px]" />
                            <td className="px-4 py-3 min-w-[80px]">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => saveEdit(p.id)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={cancelEdit} className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="font-semibold text-sm">{p.clientName}</p>
                              <p className="text-xs text-muted-foreground">{p.projectName}</p>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                            <td className="px-4 py-4 text-right font-medium tabular-nums whitespace-nowrap">{fmt(p.totalValue)}</td>
                            <td className="px-4 py-4 text-right tabular-nums text-muted-foreground whitespace-nowrap">{fmt(p.amountPaid)}</td>
                            <td className={cn("px-5 py-4 text-right font-semibold tabular-nums whitespace-nowrap", balance > 0 ? "text-amber-500" : "text-emerald-500")}>
                              {balance > 0 ? fmt(balance) : "Paid"}
                            </td>
                            {isAdmin && (
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(p)} className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => { if (editId === p.id) cancelEdit(); setDeleteTarget(p); }}
                                    className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Invoices Section (Only visible for clients) */}
          {!isAdmin && invoices && invoices.length > 0 && (
            <div className="mt-12 space-y-4 pt-8">
              <h2 className="text-xl font-bold tracking-tight">My Invoices</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-5 border rounded-xl bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setLocation("/invoices")}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-lg">{inv.invoiceNumber}</span>
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                        PKR {inv.total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1">{inv.projectName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{inv.invoiceDate || "No date"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.projectName}</strong> for{" "}
                  <strong>{deleteTarget.clientName}</strong> will be permanently removed.
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteProject(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
