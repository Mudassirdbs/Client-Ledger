import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { supabase, Profile } from "@/lib/supabase";
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
import { CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/ui/fade-in";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PendingUser = Profile & { assignedName?: string };

export default function Approvals() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientNames, setClientNames] = useState<string[]>([]);
  const [approving, setApproving] = useState<PendingUser | null>(null);
  const [assignedName, setAssignedName] = useState("");
  const [rejectTarget, setRejectTarget] = useState<Profile | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: projects }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "client").order("created_at", { ascending: false }),
      supabase.from("projects").select("client_name"),
    ]);
    setUsers((profiles as Profile[]) ?? []);
    const names = [...new Set((projects ?? []).map((p: { client_name: string }) => p.client_name))].sort();
    setClientNames(names);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async () => {
    if (!approving || !assignedName.trim()) return;
    await supabase.from("profiles").update({
      status: "approved",
      assigned_client_name: assignedName.trim(),
    }).eq("id", approving.id);
    setApproving(null);
    setAssignedName("");
    fetchAll();
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    await supabase.from("profiles").update({ status: "rejected" }).eq("id", rejectTarget.id);
    setRejectTarget(null);
    fetchAll();
  };

  const pending  = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const rejected = users.filter((u) => u.status === "rejected");

  // Client names already assigned to approved users — exclude from dropdown
  const assignedNames = new Set(
    approved.map((u) => u.assigned_client_name).filter(Boolean)
  );
  const availableClientNames = clientNames.filter((n) => !assignedNames.has(n));

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Approved</span>;
    if (status === "pending")  return <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />Pending</span>;
    return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium"><span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />Rejected</span>;
  };

  return (
    <AppShell>
      <header className="h-16 pl-16 pr-6 md:px-8 flex items-center justify-between border-b border-border bg-background shrink-0">
        <div>
          <h1 className="text-xl font-black tracking-tight">Client Approvals</h1>
          <p className="text-xs text-muted-foreground">
            {pending.length} pending · {approved.length} approved · {rejected.length} rejected
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-8 py-6 md:py-8 max-w-[900px] mx-auto space-y-6">

          {/* Pending */}
          <FadeIn delay={0}>
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold">Pending Requests</span>
                {pending.length > 0 && (
                  <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pending.length}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
              ) : pending.length === 0 ? (
                <div className="bg-card border border-card-border rounded-xl px-5 py-8 text-center text-muted-foreground text-sm">
                  No pending requests
                </div>
              ) : (
                <div className="bg-card border border-card-border rounded-2xl overflow-hidden divide-y divide-border">
                  {pending.map((u) => (
                    <div key={u.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-amber-600">
                            {u.full_name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none h-8 gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => setRejectTarget(u)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-none h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => { setApproving(u); setAssignedName(u.full_name ?? ""); }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </FadeIn>

          {/* All clients */}
          {(approved.length > 0 || rejected.length > 0) && (
            <FadeIn delay={0.2} direction="up">
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold">All Clients</span>
                </div>
                <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-border">
                    {[...approved, ...rejected].map((u) => (
                      <div key={u.id} className={cn("px-4 py-4 space-y-2", u.status === "rejected" && "opacity-50")}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{u.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {statusBadge(u.status)}
                            {u.status === "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setRejectTarget(u)}
                                title="Revoke Access"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {u.assigned_client_name && (
                          <p className="text-xs text-muted-foreground">
                            Assigned to: <span className="text-foreground font-medium">{u.assigned_client_name}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Name</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Email</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Assigned To</th>
                          <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Status</th>
                          <th className="w-12 px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[...approved, ...rejected].map((u) => (
                          <tr key={u.id} className={cn("hover:bg-muted/30 transition-colors", u.status === "rejected" && "opacity-50")}>
                            <td className="px-5 py-3.5 font-medium whitespace-nowrap">{u.full_name}</td>
                            <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{u.email}</td>
                            <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{u.assigned_client_name ?? "—"}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap">{statusBadge(u.status)}</td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              {u.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setRejectTarget(u)}
                                  title="Revoke Access"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </FadeIn>
          )}
        </div>
      </main>

      {/* Approve dialog */}
      <AlertDialog open={!!approving} onOpenChange={(open) => { if (!open) { setApproving(null); setAssignedName(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {approving?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Assign this client to a project group. They will only see projects matching this name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium">Assigned Client Name</label>
            {availableClientNames.length > 0 ? (
              <div className="space-y-3">
                <Select
                  value={availableClientNames.includes(assignedName) ? assignedName : ""}
                  onValueChange={setAssignedName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select existing client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClientNames.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-background px-2 text-muted-foreground">Or type custom name</span>
                  </div>
                </div>
                <Input
                  value={assignedName}
                  onChange={(e) => setAssignedName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>
            ) : (
              <Input
                value={assignedName}
                onChange={(e) => setAssignedName(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            )}
            <p className="text-xs text-muted-foreground">
              This must match the <em>Client Name</em> used in their projects exactly.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleApprove}
              disabled={!assignedName.trim()}
            >
              Approve & Grant Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject/Revoke dialog */}
      <AlertDialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) setRejectTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {rejectTarget?.status === "approved" ? "Revoke access for" : "Reject"} {rejectTarget?.full_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will not be able to access the client portal. This can be reversed by approving them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleReject}
            >
              {rejectTarget?.status === "approved" ? "Revoke Access" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
