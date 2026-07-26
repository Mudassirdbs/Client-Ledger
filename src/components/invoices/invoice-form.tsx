// UI/UX Fix applied: Fix 2A — Labels linked to inputs with htmlFor/id, Fix 2B — AlertDialog confirmation on line item delete
import { useEffect, useState } from "react";
import { useProjects } from "@/lib/projects-context";
import { InvoiceItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Link, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AiInvoiceParserModal } from "@/components/ai/ai-invoice-parser-modal";
import { ParsedInvoiceData } from "@/lib/gemini-service";

interface InvoiceFormProps {
  invoiceData: any;
  setInvoiceData: (data: any) => void;
  onSave: () => void;
  onPrint: () => void;
  loading: boolean;
}

export function InvoiceForm({ invoiceData, setInvoiceData, onSave, onPrint, loading }: InvoiceFormProps) {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("none");
  const [aiParserOpen, setAiParserOpen] = useState(false);

  const handleApplyAiData = (parsed: ParsedInvoiceData) => {
    setInvoiceData((prev: any) => {
      const newItems: InvoiceItem[] = parsed.items.map((item) => ({
        id: crypto.randomUUID(),
        title: item.title,
        description: item.description || "",
        qty: item.qty || 1,
        rate: item.rate || 0,
        amount: item.amount || ((item.qty || 1) * (item.rate || 0)),
      }));
      const subtotal = parsed.subtotal || newItems.reduce((acc, i) => acc + i.amount, 0);
      const discount = parsed.discount || 0;
      const total = parsed.total || (subtotal - discount);

      return {
        ...prev,
        clientName: parsed.clientName || prev.clientName,
        clientAddress: parsed.clientAddress || prev.clientAddress,
        projectName: parsed.projectName || prev.projectName,
        items: newItems.length > 0 ? newItems : prev.items,
        subtotal,
        discount,
        total,
        deliverables: parsed.deliverables?.length ? parsed.deliverables : prev.deliverables,
      };
    });
  };

  // Handlers for inputs
  const updateField = (field: string, value: any) => {
    setInvoiceData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleProjectSelect = (val: string) => {
    setSelectedProjectId(val);
    if (val === "none") return;
    
    const p = projects.find((p) => p.id === val);
    if (p) {
      updateField("projectName", p.projectName);
      updateField("clientName", p.clientName);
      // Auto populate an item with total value
      const newItem: InvoiceItem = {
        id: crypto.randomUUID(),
        title: p.projectName,
        description: "",
        qty: 1,
        rate: p.totalValue,
        amount: p.totalValue
      };
      setInvoiceData((prev: any) => {
        const items = [newItem];
        return {
          ...prev,
          projectName: p.projectName,
          clientName: p.clientName,
          items,
          subtotal: p.totalValue,
          total: p.totalValue - prev.discount,
        };
      });
    }
  };

  const addItem = () => {
    setInvoiceData((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), title: invoiceData.projectName || "", description: "", qty: 1, rate: 0, amount: 0 }
      ]
    }));
  };

  const removeItem = (id: string) => {
    setInvoiceData((prev: any) => {
      const items = prev.items.filter((i: any) => i.id !== id);
      const subtotal = items.reduce((acc: number, cur: any) => acc + cur.amount, 0);
      return { ...prev, items, subtotal, total: subtotal - prev.discount };
    });
  };

  const updateItem = (id: string, field: string, value: any) => {
    setInvoiceData((prev: any) => {
      const items = prev.items.map((item: any) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "qty" || field === "rate") {
            updated.amount = (Number(updated.qty) || 0) * (Number(updated.rate) || 0);
          }
          return updated;
        }
        return item;
      });
      const subtotal = items.reduce((acc: number, cur: any) => acc + cur.amount, 0);
      return { ...prev, items, subtotal, total: subtotal - prev.discount };
    });
  };

  const updateDiscount = (discount: number) => {
    setInvoiceData((prev: any) => ({
      ...prev,
      discount,
      total: prev.subtotal - discount
    }));
  };

  const addDeliverable = () => {
    setInvoiceData((prev: any) => ({
      ...prev,
      deliverables: [...prev.deliverables, ""]
    }));
  };

  const updateDeliverable = (idx: number, val: string) => {
    setInvoiceData((prev: any) => {
      const delivs = [...prev.deliverables];
      delivs[idx] = val;
      return { ...prev, deliverables: delivs };
    });
  };

  const removeDeliverable = (idx: number) => {
    setInvoiceData((prev: any) => {
      const delivs = [...prev.deliverables];
      delivs.splice(idx, 1);
      return { ...prev, deliverables: delivs };
    });
  };

  return (
    <div className="space-y-6">
      {/* Groq AI Smart Auto-Fill Banner */}
      <div className="p-4 border rounded-2xl bg-gradient-to-r from-primary/10 via-violet-500/10 to-indigo-500/10 border-primary/20 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>AI Smart Draft & Auto-Fill</span>
          </div>
          <Button
            size="sm"
            onClick={() => setAiParserOpen(true)}
            className="h-8 gap-1.5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            <Sparkles className="h-3.5 w-3.5" /> Auto-Fill from Text
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Paste client emails or project notes to auto-extract line items, prices, deliverables, and category.
        </p>
      </div>

      <div className="p-5 border rounded-xl bg-card space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Link className="h-4 w-4" /> Link to Project
        </h3>
        <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Manual Entry)</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.projectName} ({p.clientName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice-invoiceNumber">Invoice Number</Label>
          <Input id="invoice-invoiceNumber" value={invoiceData.invoiceNumber} onChange={(e: any) => updateField("invoiceNumber", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-projectName">Project Name</Label>
          <Input id="invoice-projectName" value={invoiceData.projectName} onChange={(e: any) => updateField("projectName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-invoiceDate">Invoice Date</Label>
          <Input id="invoice-invoiceDate" type="date" value={invoiceData.invoiceDate} onChange={(e: any) => updateField("invoiceDate", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-dueDate">Due Date</Label>
          <Input id="invoice-dueDate" type="date" value={invoiceData.dueDate} onChange={(e: any) => updateField("dueDate", e.target.value)} />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="invoice-status">Status</Label>
          <Select value={invoiceData.status} onValueChange={(val) => {
            updateField("status", val);
            if (val !== "partially-paid") {
              updateField("amountPaid", 0);
            }
          }}>
            <SelectTrigger id="invoice-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partially-paid">Partially Paid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {invoiceData.status === "partially-paid" && (
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <Label htmlFor="invoice-amountPaid">Amount Paid (PKR)</Label>
            <Input 
              id="invoice-amountPaid" 
              type="number" 
              min="0"
              max={invoiceData.total}
              value={invoiceData.amountPaid === 0 ? "" : invoiceData.amountPaid} 
              onChange={(e: any) => {
                let val = Number(e.target.value) || 0;
                if (val > invoiceData.total) {
                  val = invoiceData.total;
                }
                updateField("amountPaid", val);
              }} 
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold border-b pb-2">Client Details</h3>
        <div className="space-y-2">
          <Label htmlFor="invoice-clientName">Client Name</Label>
          <Input id="invoice-clientName" value={invoiceData.clientName} onChange={(e: any) => updateField("clientName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-clientAddress">Client Address/Location</Label>
          <Textarea id="invoice-clientAddress" value={invoiceData.clientAddress} onChange={(e: any) => updateField("clientAddress", e.target.value)} rows={2} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-semibold">Line Items</h3>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </div>
        {invoiceData.items.map((item: any) => (
          <div key={item.id} className="p-4 border rounded-lg bg-card/50 space-y-3 relative">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Line Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this item from the invoice. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Item</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-1">
              <Label htmlFor={`item-${item.id}-title`} className="text-xs">Title</Label>
              <Input id={`item-${item.id}-title`} value={item.title || ""} onChange={(e: any) => updateItem(item.id, "title", e.target.value)} className="pr-10" />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`item-${item.id}-description`} className="text-xs">Description</Label>
              <Input id={`item-${item.id}-description`} value={item.description || ""} onChange={(e: any) => updateItem(item.id, "description", e.target.value)} placeholder="Optional description..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`item-${item.id}-qty`} className="text-xs">Qty</Label>
                <Input id={`item-${item.id}-qty`} type="number" min="1" value={item.qty} onChange={(e: any) => updateItem(item.id, "qty", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`item-${item.id}-rate`} className="text-xs">Rate (PKR)</Label>
                <Input id={`item-${item.id}-rate`} type="number" min="0" value={item.rate} onChange={(e: any) => updateItem(item.id, "rate", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Amount</Label>
                <div className="h-9 px-3 border rounded-md bg-muted flex items-center text-sm font-medium">
                  PKR {item.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-semibold">Deliverables (Optional)</h3>
          <Button variant="outline" size="sm" onClick={addDeliverable}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        {invoiceData.deliverables.map((del: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <Input value={del} onChange={(e: any) => updateDeliverable(idx, e.target.value)} placeholder="e.g. Website source code" />
            <Button variant="ghost" size="icon" className="text-red-500 shrink-0" onClick={() => removeDeliverable(idx)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-semibold">PKR {invoiceData.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <Label htmlFor="invoice-discount" className="text-sm text-muted-foreground whitespace-nowrap">Discount (PKR)</Label>
          <Input 
            id="invoice-discount"
            type="number" 
            min="0" 
            className="w-32 text-right" 
            value={invoiceData.discount || ""} 
            onChange={(e: any) => updateDiscount(Number(e.target.value) || 0)} 
          />
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-bold">Total Due</span>
          <span className="font-bold text-lg text-primary">PKR {invoiceData.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button className="flex-1" onClick={onSave} disabled={loading}>
          {loading ? "Saving..." : "Save Invoice"}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onPrint}>
          Print / PDF
        </Button>
      </div>

      <AiInvoiceParserModal
        open={aiParserOpen}
        onOpenChange={setAiParserOpen}
        onApplyInvoice={handleApplyAiData}
      />
    </div>
  );
}
