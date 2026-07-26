import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseInvoiceFromText, ParsedInvoiceData, getGeminiApiKey } from "@/lib/gemini-service";
import { AiSettingsModal } from "./ai-settings-modal";
import { Sparkles, ArrowRight, CheckCircle2, Loader2, Key, Tag } from "lucide-react";
import { fmt } from "@/lib/utils";
import { toast } from "sonner";

interface AiInvoiceParserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyInvoice: (data: ParsedInvoiceData) => void;
}

export function AiInvoiceParserModal({ open, onOpenChange, onApplyInvoice }: AiInvoiceParserModalProps) {
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedInvoiceData | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error("Please enter contract notes or an email snippet first.");
      return;
    }
    const key = getGeminiApiKey();
    if (!key) {
      setSettingsOpen(true);
      return;
    }
    setLoading(true);
    try {
      const data = await parseInvoiceFromText(rawText);
      setParsedData(data);
      toast.success("Invoice details parsed successfully with Gemini AI!");
    } catch (err: any) {
      toast.error(err.message || "Failed to parse text into invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsedData) return;
    onApplyInvoice(parsedData);
    onOpenChange(false);
    toast.success("Invoice form auto-populated with AI data!");
  };

  const sampleSnippets = [
    "Invoice ACME Corp for landing page redesign ($1,500) and custom logo branding ($400). Included 10% discount ($190 off). Total $1,710. Deliverables: Figma design files, React source code. Due in 7 days.",
    "Client: TechNova Systems. Project: Backend API Integration ($2,500) & Server Setup ($500). Paid $1,000 deposit already. Address: 100 Innovation Way, Austin TX.",
  ];

  return (
    <>
      <AiSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} onSaved={() => handleParse()} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl bg-card border-card-border rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-2 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Gemini AI Invoice Auto-Fill</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Paste contract scope, email notes, or Slack messages to auto-generate structured invoice line items.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-3">
            {/* Input Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Raw Contract / Email / Scope Text
                </label>
                <button
                  type="button"
                  onClick={() => setRawText(sampleSnippets[0])}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Load Sample Snippet
                </button>
              </div>
              <Textarea
                placeholder="Paste client email or scope notes here (e.g. 'Build React web app for Acme Corp $2000, logo $500...')"
                rows={4}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setParsedData(null);
                }}
                className="text-xs font-sans leading-relaxed"
              />
            </div>

            {/* Parse Action Button */}
            <Button
              onClick={handleParse}
              disabled={loading || !rawText.trim()}
              className="w-full font-semibold gap-2 py-5 rounded-xl shadow-md"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Extracting with Gemini AI..." : "Parse & Auto-Generate Invoice"}
            </Button>

            {/* Parsed Result Preview */}
            {parsedData && (
              <div className="space-y-4 bg-muted/20 border border-border p-4 rounded-2xl animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-sm text-foreground">AI Extracted Invoice Preview</span>
                  </div>
                  {parsedData.category && (
                    <Badge variant="secondary" className="gap-1 font-semibold text-[10px]">
                      <Tag className="h-3 w-3" /> {parsedData.category}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-b border-border pb-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Client</span>
                    <span className="font-semibold text-foreground">{parsedData.clientName || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Project Title</span>
                    <span className="font-semibold text-foreground">{parsedData.projectName || "Not specified"}</span>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Extracted Line Items ({parsedData.items.length})</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {parsedData.items.map((item, idx) => (
                      <div key={idx} className="bg-card border border-card-border p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-foreground">{item.title}</p>
                          {item.description && <p className="text-[11px] text-muted-foreground">{item.description}</p>}
                        </div>
                        <div className="text-right font-mono font-semibold">
                          {item.qty} x {fmt(item.rate)} = <span className="font-bold text-primary">{fmt(item.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs font-semibold">
                  <span className="text-muted-foreground">Calculated Total</span>
                  <span className="text-base font-bold text-primary tabular-nums">{fmt(parsedData.total)}</span>
                </div>

                <Button onClick={handleApply} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl">
                  Apply Parsed Data to Invoice <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border mt-4">
            <button onClick={() => setSettingsOpen(true)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Key className="h-3 w-3" /> Gemini AI Settings
            </button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
