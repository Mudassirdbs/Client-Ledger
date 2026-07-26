import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  analyzeClientFinancialHealth,
  ClientFinancialAnalysis,
  getGroqApiKey,
} from "@/lib/groq-service";
import { GroqSettingsModal } from "./groq-settings-modal";
import { Sparkles, Check, Copy, RefreshCw, AlertTriangle, ShieldCheck, Mail, ArrowRight, Loader2, Key } from "lucide-react";
import { fmt, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ClientAiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  projects: Array<{
    projectName: string;
    status: string;
    totalValue: number;
    amountPaid: number;
  }>;
}

export function ClientAiModal({ open, onOpenChange, clientName, projects }: ClientAiModalProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ClientFinancialAnalysis | null>(null);
  const [activeTone, setActiveTone] = useState<"friendly" | "professional" | "firm" | "urgent">("professional");
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleAnalyze = async () => {
    const key = getGroqApiKey();
    if (!key) {
      setSettingsOpen(true);
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeClientFinancialHealth(clientName, projects);
      setAnalysis(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze client with Groq AI");
    } finally {
      setLoading(false);
    }
  };

  // Run analysis when opened if not already generated for this client
  const onDialogOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen && (!analysis || analysis.clientName !== clientName)) {
      setAnalysis(null);
      handleAnalyze();
    }
  };

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Reminder email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadgeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "B":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "C":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default:
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    }
  };

  return (
    <>
      <GroqSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} onSaved={() => handleAnalyze()} />

      <Dialog open={open} onOpenChange={onDialogOpenChange}>
        <DialogContent className="sm:max-w-2xl bg-card border-card-border rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-2 border-b border-border pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">{clientName}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    AI Financial Health & Payment History Summary
                  </DialogDescription>
                </div>
              </div>

              {analysis && (
                <div className="flex items-center gap-2">
                  <div className={cn("px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5", getRiskBadgeColor(analysis.riskGrade))}>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Grade {analysis.riskGrade}</span>
                    <span className="opacity-70">({analysis.riskLevel})</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleAnalyze} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {loading ? (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Analyzing payment patterns with Groq AI...</p>
                <p className="text-xs text-muted-foreground">Evaluating revenue, collection velocity & risk profiles</p>
              </div>
            </div>
          ) : !analysis ? (
            <div className="py-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">Generate AI Financial Analysis</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Click below to analyze {clientName}'s payment metrics, collection risk, and generate tailored reminder emails.
                </p>
              </div>
              <Button onClick={handleAnalyze} className="gap-2 font-semibold">
                <Sparkles className="h-4 w-4" /> Analyze Client Now
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {/* Financial Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 border border-border p-4 rounded-2xl">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Contracted Total</p>
                  <p className="text-base font-bold tabular-nums text-foreground">{fmt(analysis.totalValue)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Collected</p>
                  <p className="text-base font-bold tabular-nums text-emerald-500">{fmt(analysis.totalCollected)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Outstanding</p>
                  <p className="text-base font-bold tabular-nums text-amber-500">{fmt(analysis.totalOutstanding)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">Collection Rate</p>
                  <p className="text-base font-bold tabular-nums text-primary">{analysis.collectionRate}%</p>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Executive Financial Summary
                </h4>
                <p className="text-sm text-foreground leading-relaxed bg-card border border-card-border p-4 rounded-2xl shadow-sm">
                  {analysis.executiveSummary}
                </p>
              </div>

              {/* Key Insights & Recommendations */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-500" /> Key Insights
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {analysis.keyInsights.map((insight, idx) => (
                      <li key={idx} className="bg-card border border-card-border p-3 rounded-xl flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="text-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Strategic Advice
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {analysis.recommendedActions.map((action, idx) => (
                      <li key={idx} className="bg-card border border-card-border p-3 rounded-xl flex items-start gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reminder Email Generator */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-emerald-500" /> Smart Payment Reminder Draft
                  </h4>
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                    {(["friendly", "professional", "firm", "urgent"] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setActiveTone(tone)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                          activeTone === tone ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-200 leading-relaxed">
                  <pre className="whitespace-pre-wrap font-mono">{analysis.reminderEmails[activeTone] || "No draft generated."}</pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3 gap-1.5 rounded-lg text-xs h-8 font-sans"
                    onClick={() => handleCopyEmail(analysis.reminderEmails[activeTone])}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy Email"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
            <button onClick={() => setSettingsOpen(true)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Key className="h-3 w-3" /> Configure Groq API Key
            </button>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
