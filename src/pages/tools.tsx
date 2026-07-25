import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ToolsTable } from "@/components/tools/tools-table";
import { AddToolForm } from "@/components/tools/add-tool-form";
import { useTools } from "@/lib/tools-context";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Tools() {
  const { tools, addTool, updateTool, deleteTool } = useTools();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <AppShell>
      <header className="h-16 pl-16 pr-6 md:px-8 flex items-center justify-between border-b border-border bg-background shrink-0 gap-4">
        <h1 className="text-2xl font-bold tracking-tight">My Tools</h1>
        <div className="flex items-center gap-2 ml-auto">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-lg font-semibold">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Tool</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-card-border rounded-2xl">
              <AddToolForm onAdd={addTool} onDone={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-8 py-6 md:py-8 space-y-8 max-w-[1400px] mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                All Tools
              </span>
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs text-muted-foreground tabular-nums">{tools.length} total</span>
            </div>
            <ToolsTable tools={tools} onDelete={deleteTool} onUpdate={updateTool} />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
