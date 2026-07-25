// UI/UX Fix applied: Fix 1 — Mobile-responsive stacked card layout + success toast on saveEdit
import { useState, memo } from "react";
import { fmt as formatCurrency } from "@/lib/utils";
import { Project, ProjectStatus } from "@/lib/types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Trash2, Pencil, Check, X, AlertTriangle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  validateProject,
  hasErrors,
  coerceProject,
  MAX_NAME_LENGTH,
  MAX_VALUE,
  type ValidationErrors,
} from "@/lib/validation";

interface ProjectTableProps {
  projects: Project[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Omit<Project, "id">) => void;
  searchQuery?: string;
}

type EditForm = { clientName: string; projectName: string; status: ProjectStatus; totalValue: string; amountPaid: string };

export const ProjectTable = memo(function ProjectTable({ projects, onDelete, onUpdate, searchQuery }: ProjectTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    clientName: "",
    projectName: "",
    status: "not-started",
    totalValue: "",
    amountPaid: "",
  });
  const [editErrors, setEditErrors] = useState<ValidationErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);


  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditForm({
      clientName: project.clientName,
      projectName: project.projectName,
      status: project.status,
      totalValue: String(project.totalValue),
      amountPaid: String(project.amountPaid),
    });
    setEditErrors({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    const errs = validateProject(editForm);
    if (hasErrors(errs)) {
      setEditErrors(errs);
      return;
    }
    onUpdate(editingId, coerceProject(editForm));
    setEditingId(null);
    setEditErrors({});
    toast.success("Project updated successfully");
  };

  const cancelEdit = () => { setEditingId(null); setEditErrors({}); };

  const clearError = (field: keyof ValidationErrors) =>
    setEditErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "completed":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Completed
          </div>
        );
      case "in-progress":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            In Progress
          </div>
        );
      case "not-started":
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            Not Started
          </div>
        );
    }
  };

  return (
    <>
      {/* ── Mobile stacked cards (below md) ── */}
      <div className="md:hidden space-y-3">
        {projects.length === 0 ? (
          <Card className="bg-card border-border/40 p-8 text-center text-muted-foreground shadow-sm rounded-lg">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "No projects yet. Add one to get started."}
          </Card>
        ) : (
          projects.map((project) => {
            const isEditing = editingId === project.id;
            const balance = project.totalValue - project.amountPaid;
            const editTotal = Number(editForm.totalValue);
            const editPaid = Number(editForm.amountPaid);
            const editBalance = editTotal - editPaid;

            if (isEditing) {
              return (
                <Card key={project.id} className="bg-card border-primary/30 border-2 rounded-lg shadow-sm p-4 space-y-3">
                  <div className="space-y-2">
                    <Input
                      value={editForm.clientName}
                      onChange={(e) => {
                        setEditForm((f) => ({ ...f, clientName: e.target.value }));
                        clearError("clientName");
                      }}
                      className={cn("h-9 text-sm font-semibold bg-background", editErrors.clientName && "border-destructive")}
                      placeholder="Client name"
                      maxLength={MAX_NAME_LENGTH}
                    />
                    {editErrors.clientName && <p className="text-[11px] text-destructive">{editErrors.clientName}</p>}
                    <Input
                      value={editForm.projectName}
                      onChange={(e) => {
                        setEditForm((f) => ({ ...f, projectName: e.target.value }));
                        clearError("projectName");
                      }}
                      className={cn("h-9 text-sm bg-background", editErrors.projectName && "border-destructive")}
                      placeholder="Project name"
                      maxLength={MAX_NAME_LENGTH}
                    />
                    {editErrors.projectName && <p className="text-[11px] text-destructive">{editErrors.projectName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Status</label>
                    <Select
                      value={editForm.status}
                      onValueChange={(v) =>
                        setEditForm((f) => ({ ...f, status: v as ProjectStatus }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-popover-border">
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Value</label>
                      <Input
                        type="number"
                        min="1"
                        max={MAX_VALUE}
                        step="1"
                        value={editForm.totalValue}
                        onChange={(e) => {
                          setEditForm((f) => ({ ...f, totalValue: e.target.value }));
                          clearError("totalValue");
                        }}
                        className={cn("h-9 text-sm tabular-nums bg-background", editErrors.totalValue && "border-destructive")}
                      />
                      {editErrors.totalValue && <p className="text-[11px] text-destructive">{editErrors.totalValue}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Paid</label>
                      <Input
                        type="number"
                        min="0"
                        max={MAX_VALUE}
                        step="1"
                        value={editForm.amountPaid}
                        onChange={(e) => {
                          setEditForm((f) => ({ ...f, amountPaid: e.target.value }));
                          clearError("amountPaid");
                        }}
                        className={cn("h-9 text-sm tabular-nums bg-background", editErrors.amountPaid && "border-destructive")}
                      />
                      {editErrors.amountPaid && <p className="text-[11px] text-destructive">{editErrors.amountPaid}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground">Balance</span>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        isNaN(editBalance) || editBalance > 0
                          ? "text-amber-600 dark:text-amber-500"
                          : "text-emerald-600 dark:text-emerald-500"
                      )}
                    >
                      {isNaN(editBalance) ? "—" : formatCurrency(editBalance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveEdit}
                      className="flex-1 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </Card>
              );
            }

            const isCompletedUnpaid = project.status === "completed" && project.amountPaid < project.totalValue;
            const isStalledInProgress = project.status === "in-progress" && project.amountPaid === 0;

            return (
              <Card
                key={project.id}
                className={cn(
                  "rounded-lg shadow-sm p-4 space-y-3",
                  isCompletedUnpaid
                    ? "bg-rose-500/5 border-rose-500/20"
                    : isStalledInProgress
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-card border-border/40"
                )}
              >
                {/* Header: project name + actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    {(isCompletedUnpaid || isStalledInProgress) && (
                      <div className={cn("mt-0.5 shrink-0", isCompletedUnpaid ? "text-rose-500" : "text-amber-500")}>
                        {isCompletedUnpaid
                          ? <XCircle className="h-3.5 w-3.5" />
                          : <AlertTriangle className="h-3.5 w-3.5" />
                        }
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-foreground leading-tight truncate">
                        {project.clientName}
                      </span>
                      <span className="text-sm text-muted-foreground leading-tight truncate">
                        {project.projectName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(project)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(project)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>

                {/* Status badge */}
                <div>{getStatusBadge(project.status)}</div>

                {/* 2-col grid of key-value pairs */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">Value</span>
                    <span className="tabular-nums text-muted-foreground">{formatCurrency(project.totalValue)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">Paid</span>
                    <span className="tabular-nums text-muted-foreground">{formatCurrency(project.amountPaid)}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Balance</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        balance > 0
                          ? "text-amber-600 dark:text-amber-500"
                          : "text-emerald-600 dark:text-emerald-500"
                      )}
                    >
                      {formatCurrency(balance)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ── Desktop table (md and above) ── */}
      <Card className="hidden md:block bg-card border-border/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border/40">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider pl-5 whitespace-nowrap">
                  Client & Project
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider text-right whitespace-nowrap">
                  Value
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider text-right whitespace-nowrap">
                  Paid
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider text-right whitespace-nowrap">
                  Balance
                </TableHead>
                <TableHead className="w-[80px] h-11" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No projects yet. Add one to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project, index) => {
                  const isEditing = editingId === project.id;
                  const balance = project.totalValue - project.amountPaid;
                  const editTotal = Number(editForm.totalValue);
                  const editPaid = Number(editForm.amountPaid);
                  const editBalance = editTotal - editPaid;

                  if (isEditing) {
                    return (
                      <TableRow
                        key={project.id}
                        className="border-primary/20 bg-primary/5 hover:bg-primary/5"
                      >
                        <TableCell className="py-2.5 pl-5">
                          <div className="flex flex-col gap-1.5">
                            <Input
                              value={editForm.clientName}
                              onChange={(e) => {
                                setEditForm((f) => ({ ...f, clientName: e.target.value }));
                                clearError("clientName");
                              }}
                              className={cn("h-7 text-sm font-semibold bg-background", editErrors.clientName && "border-destructive")}
                              placeholder="Client name"
                              maxLength={MAX_NAME_LENGTH}
                            />
                            {editErrors.clientName && <p className="text-[11px] text-destructive">{editErrors.clientName}</p>}
                            <Input
                              value={editForm.projectName}
                              onChange={(e) => {
                                setEditForm((f) => ({ ...f, projectName: e.target.value }));
                                clearError("projectName");
                              }}
                              className={cn("h-7 text-sm bg-background", editErrors.projectName && "border-destructive")}
                              placeholder="Project name"
                              maxLength={MAX_NAME_LENGTH}
                            />
                            {editErrors.projectName && <p className="text-[11px] text-destructive">{editErrors.projectName}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Select
                            value={editForm.status}
                            onValueChange={(v) =>
                              setEditForm((f) => ({ ...f, status: v as ProjectStatus }))
                            }
                          >
                            <SelectTrigger className="h-7 text-xs w-36 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-popover-border">
                              <SelectItem value="not-started">Not Started</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <Input
                              type="number"
                              min="1"
                              max={MAX_VALUE}
                              step="1"
                              value={editForm.totalValue}
                              onChange={(e) => {
                                setEditForm((f) => ({ ...f, totalValue: e.target.value }));
                                clearError("totalValue");
                              }}
                              className={cn("h-7 text-sm text-right w-28 ml-auto tabular-nums bg-background", editErrors.totalValue && "border-destructive")}
                            />
                            {editErrors.totalValue && <p className="text-[11px] text-destructive text-right">{editErrors.totalValue}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <Input
                              type="number"
                              min="0"
                              max={MAX_VALUE}
                              step="1"
                              value={editForm.amountPaid}
                              onChange={(e) => {
                                setEditForm((f) => ({ ...f, amountPaid: e.target.value }));
                                clearError("amountPaid");
                              }}
                              className={cn("h-7 text-sm text-right w-28 ml-auto tabular-nums bg-background", editErrors.amountPaid && "border-destructive")}
                            />
                            {editErrors.amountPaid && <p className="text-[11px] text-destructive text-right">{editErrors.amountPaid}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <span
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              isNaN(editBalance) || editBalance > 0
                                ? "text-amber-600 dark:text-amber-500"
                                : "text-emerald-600 dark:text-emerald-500"
                            )}
                          >
                            {isNaN(editBalance) ? "—" : formatCurrency(editBalance)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 pr-3">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={saveEdit}
                              className="h-7 w-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="sr-only">Save</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEdit}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  const isCompletedUnpaid = project.status === "completed" && project.amountPaid < project.totalValue;
                  const isStalledInProgress = project.status === "in-progress" && project.amountPaid === 0;
                  const hasPaymentWarning = isCompletedUnpaid || isStalledInProgress;

                  return (
                    <TableRow
                      key={project.id}
                      className={cn(
                        "border-border/40 transition-colors group",
                        isCompletedUnpaid
                          ? "bg-rose-500/3 hover:bg-rose-500/6"
                          : isStalledInProgress
                          ? "bg-amber-500/3 hover:bg-amber-500/6"
                          : index % 2 === 0
                          ? "bg-background/50 hover:bg-muted/40"
                          : "bg-muted/10 hover:bg-muted/40"
                      )}
                    >
                      <TableCell className="py-4 pl-5 whitespace-nowrap">
                        <div className="flex items-start gap-2">
                          {hasPaymentWarning && (
                            <div className={cn("mt-0.5 shrink-0", isCompletedUnpaid ? "text-rose-500" : "text-amber-500")}>
                              {isCompletedUnpaid
                                ? <XCircle className="h-3.5 w-3.5" />
                                : <AlertTriangle className="h-3.5 w-3.5" />
                              }
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground leading-tight">
                              {project.clientName}
                            </span>
                            <span className="text-sm text-muted-foreground leading-tight">
                              {project.projectName}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">{getStatusBadge(project.status)}</TableCell>
                      <TableCell className="py-4 text-right tabular-nums text-muted-foreground text-sm whitespace-nowrap">
                        {formatCurrency(project.totalValue)}
                      </TableCell>
                      <TableCell className="py-4 text-right tabular-nums text-muted-foreground text-sm whitespace-nowrap">
                        {formatCurrency(project.amountPaid)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-4 text-right tabular-nums font-semibold text-sm whitespace-nowrap",
                          balance > 0
                            ? "text-amber-600 dark:text-amber-500"
                            : "text-emerald-600 dark:text-emerald-500"
                        )}
                      >
                        {formatCurrency(balance)}
                      </TableCell>
                      <TableCell className="py-4 pr-3">
                        <div className="flex items-center gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(project)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(project)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            data-testid={`button-delete-${project.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete confirmation dialog */}
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
                  if (editingId === deleteTarget.id) cancelEdit();
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                  toast.success("Project deleted successfully.");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
