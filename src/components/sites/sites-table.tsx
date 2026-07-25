import { useState } from "react";
import { Site } from "@/lib/types";
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
import { Trash2, Pencil, Check, X, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SitesTableProps {
  sites: Site[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Omit<Site, "id">) => void;
}

type EditForm = Omit<Site, "id">;

export function SitesTable({ sites, onDelete, onUpdate }: SitesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    siteName: "",
    username: "",
    password: "",
    driveLink: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const startEdit = (site: Site) => {
    setEditingId(site.id);
    setEditForm({
      siteName: site.siteName,
      username: site.username,
      password: site.password || "",
      driveLink: site.driveLink || "",
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editForm.siteName || !editForm.username || !editForm.password) {
      toast.error("Please fill in required fields (Site Name, Username, Password).");
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
        {sites.length === 0 ? (
          <Card className="bg-card border-card-border p-8 text-center text-muted-foreground shadow-sm rounded-lg">
            No sites yet. Add one to get started.
          </Card>
        ) : (
          sites.map((site) => {
            const isEditing = editingId === site.id;

            if (isEditing) {
              return (
                <Card key={site.id} className="bg-card border-primary/30 border-2 rounded-lg shadow-sm p-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Site Name</label>
                    <Input
                      value={editForm.siteName}
                      onChange={(e) => setEditForm({ ...editForm, siteName: e.target.value })}
                      className="h-9 text-sm font-semibold bg-background"
                      placeholder="Site Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium">Username</label>
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="h-9 text-sm bg-background"
                        placeholder="Username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium">Password</label>
                      <Input
                        type="text"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        className="h-9 text-sm bg-background"
                        placeholder="Password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Drive Link</label>
                    <Input
                      value={editForm.driveLink}
                      onChange={(e) => setEditForm({ ...editForm, driveLink: e.target.value })}
                      className="h-9 text-sm bg-background"
                      placeholder="Drive Link URL"
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
              <Card key={site.id} className="bg-card border-card-border rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground leading-tight">{site.siteName}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(site)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(site)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    u: <span className="text-foreground font-mono">{site.username}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    p: <span className="text-foreground font-mono">
                      {showPasswords[site.id] ? site.password : '••••••••'}
                    </span>
                    <button onClick={() => togglePassword(site.id)} className="hover:text-primary ml-1">
                      {showPasswords[site.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    {showPasswords[site.id] && site.password && (
                      <button onClick={() => copyToClipboard(site.password!)} className="hover:text-primary">
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {site.driveLink && (
                  <div className="pt-2 border-t border-border/60">
                    <a
                      href={site.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      View Drive
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
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
                  Site Name
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  Credentials
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  Drive Link
                </TableHead>
                <TableHead className="w-[80px] h-11" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No sites yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sites.map((site, index) => {
                  const isEditing = editingId === site.id;

                  if (isEditing) {
                    return (
                      <TableRow
                        key={site.id}
                        className="border-primary/20 bg-primary/5 hover:bg-primary/5"
                      >
                        <TableCell className="py-2.5 pl-5">
                          <Input
                            value={editForm.siteName}
                            onChange={(e) => setEditForm({ ...editForm, siteName: e.target.value })}
                            className="h-7 text-sm font-semibold bg-background"
                            placeholder="Site Name"
                          />
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="flex flex-col gap-1.5">
                            <Input
                              value={editForm.username}
                              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                              className="h-7 text-sm bg-background"
                              placeholder="Username"
                            />
                            <Input
                              type="text"
                              value={editForm.password}
                              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                              className="h-7 text-sm bg-background"
                              placeholder="Password"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Input
                            value={editForm.driveLink}
                            onChange={(e) => setEditForm({ ...editForm, driveLink: e.target.value })}
                            className="h-7 text-sm bg-background"
                            placeholder="Drive Link URL"
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
                      key={site.id}
                      className={cn(
                        "border-card-border transition-colors group",
                        index % 2 === 0
                          ? "bg-background/50 hover:bg-muted/40"
                          : "bg-muted/10 hover:bg-muted/40"
                      )}
                    >
                      <TableCell className="py-4 pl-5 whitespace-nowrap">
                        <span className="font-semibold text-foreground leading-tight">
                          {site.siteName}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-sm">
                          <span className="text-muted-foreground">
                            u: <span className="text-foreground font-mono">{site.username}</span>
                          </span>
                          <span className="text-muted-foreground flex items-center gap-2">
                            p: <span className="text-foreground font-mono">
                                {showPasswords[site.id] ? site.password : '••••••••'}
                               </span>
                            <button onClick={() => togglePassword(site.id)} className="hover:text-primary ml-1">
                                {showPasswords[site.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                            {showPasswords[site.id] && site.password && (
                              <button onClick={() => copyToClipboard(site.password!)} className="hover:text-primary">
                                <Copy className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {site.driveLink ? (
                          <a
                            href={site.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline truncate max-w-[200px]"
                          >
                            View Drive
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="py-4 pr-3">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(site)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(site)}
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
            <AlertDialogTitle>Delete site?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.siteName}</strong> will be permanently removed.
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
                  toast.success("Site deleted successfully.");
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
