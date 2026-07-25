import { useState } from "react";
import { Project, ProjectStatus } from "@/lib/types";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import {
  validateProject,
  hasErrors,
  coerceProject,
  MAX_NAME_LENGTH,
  MAX_VALUE,
  type ValidationErrors,
} from "@/lib/validation";

interface AddProjectFormProps {
  onAdd: (project: Omit<Project, "id">) => void | Promise<void>;
  onDone?: () => void;
}

export function AddProjectForm({ onAdd, onDone }: AddProjectFormProps) {
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("not-started");
  const [totalValue, setTotalValue] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = { clientName, projectName, status, totalValue, amountPaid };
    const errs = validateProject(input);

    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }

    await onAdd(coerceProject(input));
    setSaved(true);
    setTimeout(() => onDone?.(), 1200);
  };

  const clearError = (field: keyof ValidationErrors) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
        <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-foreground">Project added!</p>
        <p className="text-sm text-muted-foreground">Closing in a moment…</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-lg font-semibold">New Project</CardTitle>
        <CardDescription>Enter project details to start tracking.</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          <div className="space-y-1.5">
            <Label htmlFor="clientName" className="text-sm font-medium">
              Client Name
            </Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => { setClientName(e.target.value); clearError("clientName"); }}
              placeholder="e.g. Acme Corp"
              maxLength={MAX_NAME_LENGTH}
              className={`bg-background border-input focus-visible:ring-primary ${errors.clientName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.clientName && (
              <p className="text-xs text-destructive mt-1">{errors.clientName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="projectName" className="text-sm font-medium">
              Project Name
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => { setProjectName(e.target.value); clearError("projectName"); }}
              placeholder="e.g. Brand Redesign"
              maxLength={MAX_NAME_LENGTH}
              className={`bg-background border-input focus-visible:ring-primary ${errors.projectName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.projectName && (
              <p className="text-xs text-destructive mt-1">{errors.projectName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value: ProjectStatus) => setStatus(value)}
            >
              <SelectTrigger
                id="status"
                className="bg-background border-input focus-visible:ring-primary"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-popover-border">
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="totalValue" className="text-sm font-medium">
                Total Value
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  Rs.
                </span>
                <Input
                  id="totalValue"
                  type="number"
                  min="1"
                  max={MAX_VALUE}
                  step="1"
                  value={totalValue}
                  onChange={(e) => { setTotalValue(e.target.value); clearError("totalValue"); }}
                  placeholder="0"
                  className={`bg-background border-input pl-9 focus-visible:ring-primary tabular-nums ${errors.totalValue ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.totalValue && (
                <p className="text-xs text-destructive mt-1">{errors.totalValue}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amountPaid" className="text-sm font-medium">
                Amount Paid
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  Rs.
                </span>
                <Input
                  id="amountPaid"
                  type="number"
                  min="0"
                  max={MAX_VALUE}
                  step="1"
                  value={amountPaid}
                  onChange={(e) => { setAmountPaid(e.target.value); clearError("amountPaid"); }}
                  placeholder="0"
                  className={`bg-background border-input pl-9 focus-visible:ring-primary tabular-nums ${errors.amountPaid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.amountPaid && (
                <p className="text-xs text-destructive mt-1">{errors.amountPaid}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full font-bold tracking-wide mt-1">
            Add Project
          </Button>
        </form>
      </CardContent>
    </>
  );
}
