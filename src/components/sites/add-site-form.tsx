import { useState } from "react";
import { Site } from "@/lib/types";
import { validateSite, hasErrors, coerceSite, type ValidationErrors } from "@/lib/validation";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface AddSiteFormProps {
  onAdd: (site: Omit<Site, "id">) => void | Promise<void>;
  onDone?: () => void;
}

export function AddSiteForm({ onAdd, onDone }: AddSiteFormProps) {
  const [siteName, setSiteName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = { siteName, username, password, driveLink };
    const errs = validateSite(input);

    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(coerceSite(input));
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
        <p className="text-base font-semibold text-foreground">Site added!</p>
        <p className="text-sm text-muted-foreground">Closing in a moment…</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-lg font-semibold">New Site</CardTitle>
        <CardDescription>Add credentials and details for a site.</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          <div className="space-y-1.5">
            <Label htmlFor="siteName" className="text-sm font-medium">Site Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => { setSiteName(e.target.value); clearError("siteName"); }}
              placeholder="e.g. My Awesome Site"
              className={`bg-background border-input focus-visible:ring-primary ${errors.siteName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.siteName && <p className="text-xs text-destructive mt-1">{errors.siteName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
              placeholder="admin@example.com"
              className={`bg-background border-input focus-visible:ring-primary ${errors.username ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
              placeholder="••••••••"
              className={`bg-background border-input focus-visible:ring-primary ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="driveLink" className="text-sm font-medium">Drive Link (Optional)</Label>
            <Input
              id="driveLink"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="bg-background border-input focus-visible:ring-primary"
            />
          </div>

          <Button type="submit" className="w-full font-bold tracking-wide mt-1" disabled={submitting}>
            {submitting ? "Adding…" : "Add Site"}
          </Button>
        </form>
      </CardContent>
    </>
  );
}
