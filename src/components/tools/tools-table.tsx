import { useState } from "react";
import { Tool } from "@/lib/types";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Pencil, Check, X, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolsTableProps {
  tools: Tool[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Omit<Tool, "id">) => void;
}

type EditForm = Omit<Tool, "id">;

export function ToolsTable({ tools, onDelete, onUpdate }: ToolsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    appName: "",
    description: "",
    url: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null);

  const startEdit = (tool: Tool) => {
    setEditingId(tool.id);
    setEditForm({
      appName: tool.appName,
      description: tool.description,
      url: tool.url,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editForm.appName || !editForm.url) {
      return;
    }
    onUpdate(editingId, editForm);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <>
      {/* ── Mobile stacked cards (below md) ── */}
      <div className="md:hidden space-y-3">
        {tools.length === 0 ? (
          <Card className="bg-card border-card-border p-8 text-center text-muted-foreground shadow-sm rounded-lg">
            No tools yet. Add one to get started.
          </Card>
        ) : (
          tools.map((tool) => {
            const isEditing = editingId === tool.id;

            if (isEditing) {
              return (
                <Card key={tool.id} className="bg-card border-primary/30 border-2 rounded-lg shadow-sm p-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">App Name</label>
                    <Input
                      value={editForm.appName}
                      onChange={(e) => setEditForm({ ...editForm, appName: e.target.value })}
                      className="h-9 text-sm font-semibold bg-background"
                      placeholder="App name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Description</label>
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="h-9 text-sm bg-background"
                      placeholder="Description"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">URL</label>
                    <Input
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="h-9 text-sm bg-background font-mono"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button variant="ghost" size="sm" onClick={saveEdit} className="flex-1 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                      <Check className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted">
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={tool.id} className="bg-card border-card-border rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-foreground leading-tight">{tool.appName}</span>
                    <span className="text-sm text-muted-foreground leading-tight line-clamp-2">{tool.description || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(tool)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(tool)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/60">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-mono truncate max-w-full"
                  >
                    {tool.url.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ── Desktop table (md and above) ── */}
      <Card className="hidden md:block bg-card border-card-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider pl-5 whitespace-nowrap">
                  App Name
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  Description
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  URL
                </TableHead>
                <TableHead className="w-[80px] h-11" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.length === 0 ? (
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No tools yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tools.map((tool, index) => {
                  const isEditing = editingId === tool.id;

                  if (isEditing) {
                    return (
                      <TableRow
                        key={tool.id}
                        className="border-primary/20 bg-primary/5 hover:bg-primary/5"
                      >
                        <TableCell className="py-2.5 pl-5">
                          <Input
                            value={editForm.appName}
                            onChange={(e) => setEditForm({ ...editForm, appName: e.target.value })}
                            className="h-7 text-sm font-semibold bg-background"
                            placeholder="App name"
                          />
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="h-7 text-sm bg-background"
                            placeholder="Description"
                          />
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Input
                            value={editForm.url}
                            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                            className="h-7 text-sm bg-background font-mono"
                            placeholder="https://..."
                          />
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
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEdit}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <TableRow
                      key={tool.id}
                      className={cn(
                        "border-card-border transition-colors group",
                        index % 2 === 0
                          ? "bg-background/50 hover:bg-muted/40"
                          : "bg-muted/10 hover:bg-muted/40"
                      )}
                    >
                      <TableCell className="py-4 pl-5 whitespace-nowrap">
                        <span className="font-semibold text-foreground leading-tight">
                          {tool.appName}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground max-w-xs whitespace-nowrap">
                        <span className="line-clamp-2">{tool.description || "—"}</span>
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-mono truncate max-w-[250px]"
                        >
                          {tool.url.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell className="py-4 pr-3">
                        <div className="flex items-center gap-1 justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(tool)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(tool)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tool?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.appName}</strong> will be permanently removed.
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
                  toast.success("Tool deleted successfully.");
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
}
