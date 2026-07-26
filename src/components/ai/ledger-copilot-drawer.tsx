import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/lib/projects-context";
import { useInvoices } from "@/lib/invoices-context";
import { askLedgerCopilot, getGroqApiKey } from "@/lib/groq-service";
import { GroqSettingsModal } from "./groq-settings-modal";
import { Sparkles, Send, Bot, User, Key, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LedgerCopilotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function LedgerCopilotDrawer({ open, onOpenChange }: LedgerCopilotDrawerProps) {
  const { projects } = useProjects();
  const { invoices } = useInvoices();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Hi! I'm your Groq AI Ledger Copilot. Ask me anything about your revenue, client balances, payment bottlenecks, or collection strategies!",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const quickPrompts = [
    "Which client has the highest unpaid balance?",
    "Summarize total contracted revenue and collection rate",
    "Give me 3 actionable tips to get paid faster",
    "List all projects currently in-progress with zero payment",
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const apiKey = getGroqApiKey();
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setLoading(true);

    try {
      const reply = await askLedgerCopilot(q, { projects, invoices });
      const aiMsg: ChatMessage = { id: crypto.randomUUID(), sender: "ai", text: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error(err.message || "Failed to communicate with Groq AI Copilot");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "ai", text: "❌ Sorry, I encountered an error. Please check your Groq API Key." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GroqSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl bg-card border-card-border rounded-3xl p-6 flex flex-col h-[85vh]">
          <DialogHeader className="space-y-2 border-b border-border pb-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-violet-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    Groq AI Ledger Copilot
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Ask natural language questions about your business ledger
                  </DialogDescription>
                </div>
              </div>
              <button onClick={() => setSettingsOpen(true)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                <Key className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          {/* Quick prompt chips */}
          <div className="py-2 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none border-b border-border/50 pb-3">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border text-[11px] font-medium whitespace-nowrap transition-colors shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                    m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-violet-500/10 text-violet-500 border border-violet-500/20"
                  )}
                >
                  {m.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={cn(
                    "p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm",
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                      : "bg-muted/40 border border-border text-foreground rounded-tl-none whitespace-pre-wrap font-sans"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="h-7 w-7 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Groq AI thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <div className="pt-3 border-t border-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about revenue, clients, invoices..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading}
                className="text-xs rounded-xl"
              />
              <Button type="submit" size="icon" disabled={loading || !inputQuery.trim()} className="rounded-xl shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
