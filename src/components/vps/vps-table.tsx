import { useState } from "react";
import { VpsServer } from "@/lib/types";
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
import { Trash2, Pencil, Check, X, Eye, EyeOff, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VpsTableProps {
  servers: VpsServer[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Omit<VpsServer, "id">) => void;
}

type EditForm = Omit<VpsServer, "id">;

export function VpsTable({ servers, onDelete, onUpdate }: VpsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    company: "",
    ipAddress: "",
    username: "",
    password: "",
    deployedItems: "",
    clientName: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<VpsServer | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const startEdit = (server: VpsServer) => {
    setEditingId(server.id);
    setEditForm({
      company: server.company,
      ipAddress: server.ipAddress,
      username: server.username,
      password: server.password,
      deployedItems: server.deployedItems,
      clientName: server.clientName,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editForm.company || !editForm.ipAddress || !editForm.username || !editForm.password) {
      alert("Please fill in all required fields (Company, IP, Username, Password).");
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
        {servers.length === 0 ? (
          <Card className="bg-card border-card-border p-8 text-center text-muted-foreground shadow-sm rounded-lg">
            No VPS servers yet. Add one to get started.
          </Card>
        ) : (
          servers.map((server) => {
            const isEditing = editingId === server.id;

            if (isEditing) {
              return (
                <Card key={server.id} className="bg-card border-primary/30 border-2 rounded-lg shadow-sm p-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Provider</label>
                    <Input
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      className="h-9 text-sm font-semibold bg-background"
                      placeholder="Provider"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">IP Address</label>
                    <Input
                      value={editForm.ipAddress}
                      onChange={(e) => setEditForm({ ...editForm, ipAddress: e.target.value })}
                      className="h-9 text-sm bg-background font-mono"
                      placeholder="IP Address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Client</label>
                    <Input
                      value={editForm.clientName}
                      onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                      className="h-9 text-sm bg-background"
                      placeholder="Client Name"
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
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        className="h-9 text-sm bg-background"
                        placeholder="Password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium">Deployed Items</label>
                    <Input
                      value={editForm.deployedItems}
                      onChange={(e) => setEditForm({ ...editForm, deployedItems: e.target.value })}
                      className="h-9 text-sm bg-background"
                      placeholder="Deployed items"
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
              <Card key={server.id} className="bg-card border-card-border rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-semibold text-foreground leading-tight truncate">{server.company}</span>
                    <span className="text-sm text-muted-foreground font-mono leading-tight flex items-center gap-2">
                      {server.ipAddress}
                      <button onClick={() => copyToClipboard(server.ipAddress)} className="hover:text-primary">
                        <Copy className="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(server)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(server)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">Client</span>
                    <span className="text-foreground">{server.clientName || <span className="text-muted-foreground italic">None</span>}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">Deployed</span>
                    <span className="text-muted-foreground">{server.deployedItems || "—"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-1">
                  <div className="text-sm text-muted-foreground">
                    u: <span className="text-foreground font-mono">{server.username}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    p: <span className="text-foreground font-mono">
                      {showPasswords[server.id] ? server.password : '••••••••'}
                    </span>
                    <button onClick={() => togglePassword(server.id)} className="hover:text-primary ml-1">
                      {showPasswords[server.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    {showPasswords[server.id] && (
                      <button onClick={() => copyToClipboard(server.password)} className="hover:text-primary">
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                  </div>
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
                  Provider & IP
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  Client
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  Credentials
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold h-11 text-xs uppercase tracking-wider whitespace-nowrap">
                  Deployed
                </TableHead>
                <TableHead className="w-[80px] h-11" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.length === 0 ? (
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No VPS servers yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                servers.map((server, index) => {
                  const isEditing = editingId === server.id;

                  if (isEditing) {
                    return (
                      <TableRow
                        key={server.id}
                        className="border-primary/20 bg-primary/5 hover:bg-primary/5"
                      >
                        <TableCell className="py-2.5 pl-5">
                          <div className="flex flex-col gap-1.5">
                            <Input
                              value={editForm.company}
                              onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                              className="h-7 text-sm font-semibold bg-background"
                              placeholder="Provider"
                            />
                            <Input
                              value={editForm.ipAddress}
                              onChange={(e) => setEditForm({ ...editForm, ipAddress: e.target.value })}
                              className="h-7 text-sm bg-background font-mono"
                              placeholder="IP Address"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Input
                            value={editForm.clientName}
                            onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                            className="h-7 text-sm bg-background"
                            placeholder="Client Name"
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
                              type="password"
                              value={editForm.password}
                              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                              className="h-7 text-sm bg-background"
                              placeholder="Password"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Input
                            value={editForm.deployedItems}
                            onChange={(e) => setEditForm({ ...editForm, deployedItems: e.target.value })}
                            className="h-7 text-sm bg-background"
                            placeholder="Deployed items"
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
                      key={server.id}
                      className={cn(
                        "border-card-border transition-colors group",
                        index % 2 === 0
                          ? "bg-background/50 hover:bg-muted/40"
                          : "bg-muted/10 hover:bg-muted/40"
                      )}
                    >
                      <TableCell className="py-4 pl-5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground leading-tight">
                            {server.company}
                          </span>
                          <span className="text-sm text-muted-foreground font-mono leading-tight flex items-center gap-2">
                            {server.ipAddress}
                            <button onClick={() => copyToClipboard(server.ipAddress)} className="hover:text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                              <Copy className="h-3 w-3" />
                            </button>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm whitespace-nowrap">
                        {server.clientName || <span className="text-muted-foreground italic">None</span>}
                      </TableCell>
                      <TableCell className="py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-sm">
                          <span className="text-muted-foreground">
                            u: <span className="text-foreground font-mono">{server.username}</span>
                          </span>
                          <span className="text-muted-foreground flex items-center gap-2">
                            p: <span className="text-foreground font-mono">
                                {showPasswords[server.id] ? server.password : '••••••••'}
                               </span>
                            <button onClick={() => togglePassword(server.id)} className="hover:text-primary ml-1">
                                {showPasswords[server.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                            {showPasswords[server.id] && (
                              <button onClick={() => copyToClipboard(server.password)} className="hover:text-primary">
                                <Copy className="h-3 w-3" />
                              </button>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {server.deployedItems || "—"}
                      </TableCell>
                      <TableCell className="py-4 pr-3">
                        <div className="flex items-center gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(server)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(server)}
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
            <AlertDialogTitle>Delete VPS server?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <strong>{deleteTarget.ipAddress}</strong> from{" "}
                  <strong>{deleteTarget.company}</strong> will be permanently removed.
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
                  toast.success("VPS server deleted successfully.");
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
