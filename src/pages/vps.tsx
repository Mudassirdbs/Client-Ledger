import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/layout/app-shell";
import { VpsTable } from "@/components/vps/vps-table";
import { AddVpsForm } from "@/components/vps/add-vps-form";
import { useVpsServers } from "@/lib/vps-context";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function VpsServers() {
  const { vpsServers, addVpsServer, updateVpsServer, deleteVpsServer } = useVpsServers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return vpsServers;
    return vpsServers.filter(
      (s) =>
        s.company.toLowerCase().includes(query) ||
        s.ipAddress.toLowerCase().includes(query) ||
        s.username.toLowerCase().includes(query) ||
        (s.clientName || "").toLowerCase().includes(query) ||
        (s.deployedItems || "").toLowerCase().includes(query)
    );
  }, [vpsServers, searchQuery]);

  return (
    <AppShell>
      <header className="h-16 pl-16 pr-6 md:px-8 flex items-center justify-between border-b border-border bg-background shrink-0 gap-4">
        <h1 className="text-2xl font-bold tracking-tight">VPS Servers</h1>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[150px] sm:w-[250px] pl-9 bg-muted/50 focus-visible:bg-background"
            />
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-lg font-semibold">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Server</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-card-border rounded-2xl">
              <AddVpsForm onAdd={addVpsServer} onDone={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-8 py-6 md:py-8 space-y-8 max-w-[1400px] mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                All Servers
              </span>
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs text-muted-foreground tabular-nums">{filteredServers.length} total</span>
            </div>
            <VpsTable servers={filteredServers} onDelete={deleteVpsServer} onUpdate={updateVpsServer} />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
