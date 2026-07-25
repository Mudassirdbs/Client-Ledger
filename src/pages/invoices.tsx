import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { InvoiceForm } from "@/components/invoices/invoice-form";

import { InvoiceTemplate } from "@/components/invoices/invoice-template";
import { useInvoices } from "@/lib/invoices-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { FileText, ChevronLeft, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { FadeIn } from "@/components/ui/fade-in";

export default function InvoicesPage() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice, loading } = useInvoices();
  const { isAdmin } = useAuth();
  const [view, setView] = useState<"list" | "editor" | "preview">("list");
  
  // Create a default date for today (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const getNextInvoiceNumber = () => {
    if (invoices.length === 0) return "INV-001";
    let max = 0;
    invoices.forEach(inv => {
      const match = inv.invoiceNumber?.match(/INV-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return `INV-${String(max + 1).padStart(3, '0')}`;
  };

  const getDefaultInvoiceData = () => ({
    invoiceNumber: getNextInvoiceNumber(),
    projectName: "",
    clientName: "",
    clientAddress: "",
    invoiceDate: today,
    dueDate: nextWeekStr,
    status: "unpaid",
    amountPaid: 0,
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    deliverables: [],
  });

  const [currentInvoice, setCurrentInvoice] = useState<any>(getDefaultInvoiceData());
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Auto-open editor when navigated from a payment alert
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const project = params.get("project");
    const client = params.get("client");
    const amount = params.get("amount");
    if (project && client) {
      const outstanding = amount ? Number(amount) : 0;
      const newItem = {
        id: crypto.randomUUID(),
        title: project,
        description: "Outstanding balance due",
        qty: 1,
        rate: outstanding,
        amount: outstanding,
      };
      setCurrentInvoice({
        ...getDefaultInvoiceData(),
        projectName: project,
        clientName: client,
        items: [newItem],
        subtotal: outstanding,
        total: outstanding,
      });
      setView("editor");
      // Clean URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNew = () => {
    setCurrentInvoice(getDefaultInvoiceData());
    setView("editor");
  };

  const handleSave = async () => {
    if (!currentInvoice.clientName) {
      toast.error("Client Name is required");
      return;
    }
    setIsSaving(true);
    
    const invoicePayload = {
      ...currentInvoice,
      // Ensure date format is stored correctly (or let Supabase handle if it's pure YYYY-MM-DD)
      invoiceDate: currentInvoice.invoiceDate ? format(new Date(currentInvoice.invoiceDate), 'MMM dd, yyyy') : "",
      dueDate: currentInvoice.dueDate ? format(new Date(currentInvoice.dueDate), 'MMM dd, yyyy') : "",
    };

    if (currentInvoice.id) {
      await updateInvoice(currentInvoice.id, invoicePayload);
      toast.success("Invoice updated successfully!");
    } else {
      await addInvoice(invoicePayload);
      toast.success("Invoice saved to database!");
    }
    
    setIsSaving(false);
    setView("list");
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const pName = currentInvoice.projectName?.trim() || "Invoice";
    const cName = currentInvoice.clientName?.trim() || "Client";
    document.title = `${pName} - ${cName}`;
    
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  return (
    <AppShell>
      {/* Print styles override via Tailwind plugin or native CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { 
            margin: 10mm; 
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          /* Reset layout containers to allow natural pagination */
          html, body, #root, .h-screen, .h-full, .flex, .flex-1, .flex-col, .overflow-y-auto, .overflow-hidden {
            display: block !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .p-4, .md\\:p-8 {
            padding: 0 !important;
          }
          
          /* Hide app shell elements and header - MUST be after layout reset with high specificity */
          #root aside, #root header, #root .print-hide {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          #print-area {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          /* Ensure good page breaks inside the invoice */
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}} />

      {view === "list" && (
        <>
          <header className="h-16 pl-16 pr-6 md:px-8 flex items-center justify-between border-b border-border bg-background shrink-0 gap-4">
            <h1 className="text-2xl font-black tracking-tight">Invoices</h1>
            {isAdmin && (
              <button 
                onClick={handleCreateNew}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:bg-primary/90"
              >
                New Invoice
              </button>
            )}
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-[1000px] mx-auto">
              {loading ? (
                <div className="text-muted-foreground text-sm">Loading invoices...</div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-card border-dashed">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">No invoices yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {isAdmin ? "Create your first professional invoice." : "Check back later."}
                  </p>
                  {isAdmin && (
                    <button onClick={handleCreateNew} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:bg-primary/90">
                      Create Invoice
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {invoices.map((inv, i) => (
                    <FadeIn key={inv.id} delay={i * 0.05} direction="up" className="h-full">
                      <div className="p-5 border rounded-xl bg-card hover:border-primary/50 transition-colors cursor-pointer h-full" onClick={() => {
                        setCurrentInvoice(inv);
                        setView(isAdmin ? "editor" : "preview");
                      }}>
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-bold text-lg">{inv.invoiceNumber}</span>
                          <div className="flex items-center gap-2">
                            {inv.status === "paid" && (
                              <span className="text-xs font-semibold bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                                Paid
                              </span>
                            )}
                            {inv.status === "partially-paid" && (
                              <span className="text-xs font-semibold bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full flex gap-1">
                                <span>Partial</span>
                                <span className="opacity-70">({inv.amountPaid?.toLocaleString()})</span>
                              </span>
                            )}
                            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                              PKR {inv.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-semibold mb-1">{inv.clientName}</p>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{inv.invoiceDate || "No date"}</span>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const confirmDelete = window.confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`);
                                if (confirmDelete) {
                                  try {
                                    await deleteInvoice(inv.id);
                                    toast.success("Invoice deleted successfully.");
                                  } catch (err) {
                                    toast.error("Failed to delete invoice. It may be linked to other records.");
                                  }
                                }
                              }}
                              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {view === "editor" && (
        <div className="flex flex-col h-full bg-muted/30">
          <header className="h-14 px-6 md:px-8 flex items-center border-b border-border bg-background shrink-0 gap-4">
            <button 
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to List
            </button>
            <div className="h-4 w-px bg-border mx-2"></div>
            <span className="text-sm font-bold">Edit Invoice</span>
          </header>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Left Sidebar Form */}
            <div className="w-full md:w-[450px] lg:w-[500px] md:border-r border-b md:border-b-0 border-border bg-background flex flex-col shrink-0 overflow-y-auto print-hide max-h-[50vh] md:max-h-none">
              <div className="p-6">
                <InvoiceForm 
                  invoiceData={currentInvoice} 
                  setInvoiceData={setCurrentInvoice} 
                  onSave={handleSave} 
                  onPrint={handlePrint}
                  loading={isSaving}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-8 bg-zinc-100/50 dark:bg-zinc-950 flex justify-center items-start">
              <div id="print-area" className="w-full max-w-[800px] shrink-0 drop-shadow-xl bg-white print:drop-shadow-none overflow-x-auto">
                <div className="min-w-[600px]">
                  <InvoiceTemplate ref={printRef} invoice={currentInvoice} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "preview" && (
        <div className="flex flex-col h-full bg-muted/30">
          <header className="h-14 px-4 md:px-8 flex items-center border-b border-border bg-background shrink-0 gap-2 md:gap-4">
            <button 
              onClick={() => setView("list")}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to List</span><span className="sm:hidden">Back</span>
            </button>
            <div className="h-4 w-px bg-border mx-1 md:mx-2"></div>
            <span className="text-sm font-bold">View Invoice</span>
            
            <div className="ml-auto">
              <button onClick={handlePrint} className="h-9 px-3 md:px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-xs md:text-sm transition-colors hover:bg-primary/90">
                <span className="hidden sm:inline">Print / Download PDF</span><span className="sm:hidden">Print</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 bg-zinc-100/50 dark:bg-zinc-950 flex justify-center items-start">
            <div id="print-area" className="w-full max-w-[800px] shrink-0 drop-shadow-xl bg-white print:drop-shadow-none overflow-x-auto">
              <div className="min-w-[600px]">
                <InvoiceTemplate ref={printRef} invoice={currentInvoice} />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
