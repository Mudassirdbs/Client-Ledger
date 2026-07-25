import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Invoice } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface InvoicesContextType {
  invoices: Invoice[];
  loading: boolean;
  addInvoice: (invoice: Omit<Invoice, "id">) => Promise<void>;
  updateInvoice: (id: string, updates: Omit<Invoice, "id">) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

const InvoicesContext = createContext<InvoicesContextType | null>(null);

function dbToInvoice(row: Record<string, any>): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    projectName: row.project_id || "",
    clientName: row.client_name,
    clientAddress: row.client_address || "",
    invoiceDate: row.invoice_date || "",
    dueDate: row.due_date || "",
    status: row.status || "unpaid",
    amountPaid: Number(row.amount_paid) || 0,
    items: row.items || [],
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    deliverables: row.deliverables || [],
  };
}

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const { profile, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!profile) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdmin && profile.assigned_client_name) {
      query = query.eq("client_name", profile.assigned_client_name);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Invoices] Failed to fetch:", error);
    } else if (data) {
      let fetchedInvoices = data.map(dbToInvoice);
      
      // Auto-detect and merge duplicates (only if admin to ensure permission)
      if (isAdmin && fetchedInvoices.length > 0) {
        const seenNumbers = new Map<string, Invoice>();
        const toDelete: string[] = [];
        const toUpdate: { id: string, newNumber: string }[] = [];
        
        let maxNum = 0;
        fetchedInvoices.forEach(inv => {
          const match = inv.invoiceNumber?.match(/INV-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });

        // Process from oldest to newest (array is descending, so iterate backwards)
        for (let i = fetchedInvoices.length - 1; i >= 0; i--) {
          const inv = fetchedInvoices[i];
          if (!inv.invoiceNumber) continue;
          
          if (seenNumbers.has(inv.invoiceNumber)) {
            const existing = seenNumbers.get(inv.invoiceNumber)!;
            // Exact duplicate (same client and same total) -> delete the newer one
            if (existing.clientName === inv.clientName && existing.total === inv.total) {
              toDelete.push(inv.id);
            } else {
              // Collision (same number but different invoice) -> assign new number to newer one
              maxNum++;
              const newNumber = `INV-${String(maxNum).padStart(3, '0')}`;
              toUpdate.push({ id: inv.id, newNumber });
              seenNumbers.set(newNumber, inv);
              inv.invoiceNumber = newNumber; // Update locally for this session
            }
          } else {
            seenNumbers.set(inv.invoiceNumber, inv);
          }
        }

        // Perform DB cleanup in background
        if (toDelete.length > 0) {
          supabase.from("invoices").delete().in("id", toDelete).then(({ error }) => {
            if (error) console.error("Failed to auto-delete duplicates:", error);
            else console.log(`Auto-deleted ${toDelete.length} duplicates`);
          });
        }
        if (toUpdate.length > 0) {
          Promise.all(toUpdate.map(u => 
            supabase.from("invoices").update({ invoice_number: u.newNumber }).eq("id", u.id)
          )).then(() => {
            console.log(`Auto-updated ${toUpdate.length} colliding invoice numbers`);
          });
        }

        // Filter out deleted ones from the local state
        fetchedInvoices = fetchedInvoices.filter(inv => !toDelete.includes(inv.id));
        // Sort again just in case invoice numbers changed and we want to ensure correct display order
        fetchedInvoices.sort((a, b) => {
           // Keep original created_at descending sort (assuming the array was already sorted descending, filtering doesn't change order)
           return 0; 
        });
      }

      setInvoices(fetchedInvoices);
    }
    setLoading(false);
  }, [profile, isAdmin]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addInvoice = async (invoice: Omit<Invoice, "id">) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("invoices").insert({
      invoice_number: invoice.invoiceNumber,
      project_id: invoice.projectName,
      client_name: invoice.clientName,
      client_address: invoice.clientAddress,
      invoice_date: invoice.invoiceDate || null,
      due_date: invoice.dueDate || null,
      status: invoice.status,
      amount_paid: invoice.amountPaid || 0,
      items: invoice.items,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      total: invoice.total,
      deliverables: invoice.deliverables,
      user_id: profile?.id,
    });
    if (error) {
      console.error("[Invoices] Failed to add:", error);
    } else {
      fetchInvoices();
    }
  };

  const updateInvoice = async (id: string, updates: Omit<Invoice, "id">) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from("invoices")
      .update({
        invoice_number: updates.invoiceNumber,
        project_id: updates.projectName,
        client_name: updates.clientName,
        client_address: updates.clientAddress,
        invoice_date: updates.invoiceDate || null,
        due_date: updates.dueDate || null,
        status: updates.status,
        amount_paid: updates.amountPaid || 0,
        items: updates.items,
        subtotal: updates.subtotal,
        discount: updates.discount,
        total: updates.total,
        deliverables: updates.deliverables,
      })
      .eq("id", id);
    if (error) {
      console.error("[Invoices] Failed to update:", error);
    } else {
      fetchInvoices();
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!isAdmin) return;
    
    // Optimistic local delete
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    
    // Perform delete and return the deleted rows to verify success
    const { data, error } = await supabase.from("invoices").delete().eq("id", id).select();
    
    if (error) {
      console.error("[Invoices] Failed to delete:", error);
      fetchInvoices(); // Revert
      throw error;
    } else if (!data || data.length === 0) {
      console.error("[Invoices] Failed to delete: Invoice not found or permission denied.");
      fetchInvoices(); // Revert
      throw new Error("Failed to delete invoice");
    }
  };

  return (
    <InvoicesContext.Provider value={{ invoices, loading, addInvoice, updateInvoice, deleteInvoice }}>
      {children}
    </InvoicesContext.Provider>
  );
}

export function useInvoices() {
  const ctx = useContext(InvoicesContext);
  if (!ctx) throw new Error("useInvoices must be inside InvoicesProvider");
  return ctx;
}
