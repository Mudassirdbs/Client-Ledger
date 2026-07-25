import { useState } from "react";
import { Tool } from "@/lib/types";
import { validateTool, hasErrors, coerceTool, type ValidationErrors } from "@/lib/validation";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface AddToolFormProps {
  onAdd: (tool: Omit<Tool, "id">) => void | Promise<void>;
  onDone?: () => void;
}

export function AddToolForm({ onAdd, onDone }: AddToolFormProps) {
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = { appName, description, url };
    const errs = validateTool(input);

    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(coerceTool(input));
      setSaved(true);
      setTimeout(() => onDone?.(), 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const clearError = (field: keyof ValidationErrors) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
        <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-foreground">Tool added!</p>
        <p className="text-sm text-muted-foreground">Closing in a moment…</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-lg font-semibold">New Tool</CardTitle>
        <CardDescription>Add an app or tool you've built.</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          <div className="space-y-1.5">
            <Label htmlFor="appName" className="text-sm font-medium">App Name</Label>
            <Input
              id="appName"
              value={appName}
              onChange={(e) => { setAppName(e.target.value); clearError("appName"); }}
              placeholder="e.g. Invoice Generator"
              className={`bg-background border-input focus-visible:ring-primary ${errors.appName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.appName && <p className="text-xs text-destructive mt-1">{errors.appName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="toolDescription" className="text-sm font-medium">Description</Label>
            <Input
              id="toolDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of what this tool does"
              className="bg-background border-input focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="toolUrl" className="text-sm font-medium">URL</Label>
            <Input
              id="toolUrl"
              value={url}
              onChange={(e) => { setUrl(e.target.value); clearError("url"); }}
              placeholder="https://my-tool.vercel.app"
              className={`bg-background border-input focus-visible:ring-primary ${errors.url ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.url && <p className="text-xs text-destructive mt-1">{errors.url}</p>}
          </div>

          <Button type="submit" className="w-full font-bold tracking-wide mt-1" disabled={submitting}>
            {submitting ? "Adding…" : "Add Tool"}
          </Button>
        </form>
      </CardContent>
    </>
  );
}
