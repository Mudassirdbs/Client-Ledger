import { useState } from "react";
import { VpsServer } from "@/lib/types";
import { validateVps, hasErrors, coerceVps, type ValidationErrors } from "@/lib/validation";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface AddVpsFormProps {
  onAdd: (vps: Omit<VpsServer, "id">) => void | Promise<void>;
  onDone?: () => void;
}

export function AddVpsForm({ onAdd, onDone }: AddVpsFormProps) {
  const [company, setCompany] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deployedItems, setDeployedItems] = useState("");
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = { company, ipAddress, username, password, deployedItems, clientName };
    const errs = validateVps(input);

    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(coerceVps(input));
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
        <p className="text-base font-semibold text-foreground">Server added!</p>
        <p className="text-sm text-muted-foreground">Closing in a moment…</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-lg font-semibold">New VPS Server</CardTitle>
        <CardDescription>Enter server details to track.</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          <div className="space-y-1.5">
            <Label htmlFor="company" className="text-sm font-medium">Company / Provider</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => { setCompany(e.target.value); clearError("company"); }}
              placeholder="e.g. DigitalOcean, AWS"
              className={`bg-background border-input focus-visible:ring-primary ${errors.company ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ipAddress" className="text-sm font-medium">IP Address</Label>
              <Input
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => { setIpAddress(e.target.value); clearError("ipAddress"); }}
                placeholder="0.0.0.0"
                className={`bg-background border-input focus-visible:ring-primary ${errors.ipAddress ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.ipAddress && <p className="text-xs text-destructive mt-1">{errors.ipAddress}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-sm font-medium">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => { setClientName(e.target.value); }}
                placeholder="Optional client association"
                className="bg-background border-input focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
                placeholder="root"
                className={`bg-background border-input focus-visible:ring-primary ${errors.username ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                placeholder="SuperSecret"
                className={`bg-background border-input focus-visible:ring-primary ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deployedItems" className="text-sm font-medium">Deployed Items</Label>
            <Input
              id="deployedItems"
              value={deployedItems}
              onChange={(e) => { setDeployedItems(e.target.value); }}
              placeholder="e.g. Acme Website, API, DB"
              className="bg-background border-input focus-visible:ring-primary"
            />
          </div>

          <Button type="submit" className="w-full font-bold tracking-wide mt-1" disabled={submitting}>
            {submitting ? "Adding…" : "Add Server"}
          </Button>
        </form>
      </CardContent>
    </>
  );
}
