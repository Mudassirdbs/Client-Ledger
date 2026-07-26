import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GROQ_MODELS, getGroqApiKey, saveGroqApiKey, getGroqModel, saveGroqModel, testGroqKey, GroqModelId } from "@/lib/groq-service";
import { Key, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GroqSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function GroqSettingsModal({ open, onOpenChange, onSaved }: GroqSettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<GroqModelId>("gemini-1.5-flash");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (open) {
      setApiKey(getGroqApiKey());
      setModel(getGroqModel());
      setTestResult(null);
    }
  }, [open]);

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API Key to test");
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testGroqKey(apiKey, model);
    setTesting(false);
    setTestResult(res);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleSave = () => {
    saveGroqApiKey(apiKey);
    saveGroqModel(model);
    toast.success("AI Settings saved!");
    if (onSaved) onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-card-border rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">AI Engine Settings</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect Google Gemini (or Groq / xAI) to power client payment insights, invoice auto-fill, and your ledger copilot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="groq-key-input" className="text-sm font-semibold flex items-center gap-1.5">
                <Key className="h-4 w-4 text-muted-foreground" /> AI API Key
              </Label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Get free Gemini key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Input
              id="groq-key-input"
              type="password"
              placeholder="Paste Gemini, Groq (gsk_...), or xAI (xai-...) key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Supports Google Gemini, Groq, or xAI keys. Saved locally in your browser.
            </p>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">AI Model</Label>
            <Select value={model} onValueChange={(val) => setModel(val as GroqModelId)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent>
                {GROQ_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex flex-col text-left py-0.5">
                      <span className="font-semibold text-xs">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">{m.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Connection Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2.5 border ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleTest} disabled={testing || !apiKey} className="gap-1.5">
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          <div className="flex-1" />
          <Button size="sm" onClick={handleSave} className="font-semibold px-5">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
