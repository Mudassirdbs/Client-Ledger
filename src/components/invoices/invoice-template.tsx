import { forwardRef } from "react";
import { Invoice } from "@/lib/types";

interface InvoiceTemplateProps {
  invoice: Partial<Invoice>;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ invoice }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: "#fff",
          color: "#16181D",
          padding: "32px 48px 24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.01em", lineHeight: 1 }}>
              Mudassir Asghar
            </h1>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: "#DC8C3A", textTransform: "uppercase", margin: "0 0 6px" }}>
              Web Developer • WordPress Expert • SEO Specialist
            </p>
            <p style={{ fontSize: 12.5, color: "#6B6E76", margin: 0 }}>
              Bahawalpur, Pakistan&nbsp;&nbsp;|&nbsp;&nbsp;(+92) 336-787-6763
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.01em", lineHeight: 1 }}>
              INVOICE
            </h2>
            <p style={{ fontSize: 13, color: "#6B6E76", margin: "0 0 8px" }}>
              {invoice.invoiceNumber || "INV-000"}
            </p>
            <span style={{
              display: "inline-block",
              background: invoice.status === "paid" ? "#22C55E" : invoice.status === "partially-paid" ? "#3B82F6" : "#DC8C3A",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 600,
              padding: "5px 14px",
              borderRadius: 999,
            }}>
              {invoice.status === "paid" ? "Paid" : invoice.status === "partially-paid" ? "Partially Paid" : "Payment Due"}
            </span>
          </div>
        </div>

        {/* ─── DIVIDER ─── */}
        <hr style={{ border: "none", borderTop: "2.5px solid #16181D", margin: "28px 0" }} />

        {/* ─── DATE ROW ─── */}
        <div style={{ display: "flex", gap: 56, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 5px" }}>Invoice Date</p>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{invoice.invoiceDate || "MMM DD, YYYY"}</p>
          </div>
          <div>
            <p style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 5px" }}>Due Date</p>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{invoice.dueDate || "MMM DD, YYYY"}</p>
          </div>
          <div>
            <p style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 5px" }}>Project Name</p>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{invoice.projectName || "---"}</p>
          </div>
        </div>

        {/* ─── PARTIES ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 10px" }}>Bill To</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: "#16181D", display: "inline-block" }} />
              <span style={{ width: 18, height: 18, borderRadius: 4, background: "#C8C9CC", display: "inline-block" }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#DC8C3A", margin: "0 0 3px" }}>{invoice.clientName || "Client Name"}</p>
            <p style={{ fontSize: 12.5, color: "#6B6E76", margin: 0, whiteSpace: "pre-wrap" }}>{invoice.clientAddress || "Client Address"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 10px" }}>From</p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 3px" }}>Mudassir Asghar</p>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#DC8C3A", margin: "0 0 2px", fontStyle: "italic" }}>Web Development Services</p>
            <p style={{ fontSize: 12.5, color: "#6B6E76", margin: 0 }}>Bahawalpur, Pakistan</p>
          </div>
        </div>

        {/* ─── DELIVERABLES BANNER ─── */}
        {/* Always show the deliverables banner */}
        <div style={{
          background: "#1E232C",
          borderRadius: 10,
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}>
          <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>
            🛠 {invoice.projectName || "Project Deliverables Included"}
          </p>
          <p style={{ color: "#B7BAC2", fontSize: 12, margin: 0 }}>
            {(invoice.deliverables || []).length} deliverables →
          </p>
        </div>

        {/* ─── TABLE ─── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", paddingBottom: 8, borderBottom: "1px solid #E7E7E8" }}>Description</th>
              <th style={{ textAlign: "right", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", paddingBottom: 8, borderBottom: "1px solid #E7E7E8", width: 40 }}>Qty</th>
              <th style={{ textAlign: "right", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", paddingBottom: 8, borderBottom: "1px solid #E7E7E8", width: 60 }}>Rate</th>
              <th style={{ textAlign: "right", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", paddingBottom: 8, borderBottom: "1px solid #E7E7E8", width: 100 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "24px 0", textAlign: "center", color: "#9A9DA5", fontSize: 12.5 }}>No items added yet.</td>
              </tr>
            )}
            {(invoice.items || []).map((item, idx) => (
              <tr key={item.id || idx}>
                <td style={{ padding: "12px 0", borderBottom: "1px solid #E7E7E8", verticalAlign: "top" }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>{item.title || "---"}</p>
                  {item.description && (
                    <p style={{ fontSize: 11.5, color: "#6B6E76", margin: 0, whiteSpace: "pre-wrap" }}>{item.description}</p>
                  )}
                </td>
                <td style={{ padding: "12px 0", borderBottom: "1px solid #E7E7E8", verticalAlign: "top", textAlign: "right", fontSize: 12.5, color: "#6B6E76", paddingLeft: 12 }}>
                  {item.qty}
                </td>
                <td style={{ padding: "12px 0", borderBottom: "1px solid #E7E7E8", verticalAlign: "top", textAlign: "right", fontSize: 12.5, color: "#6B6E76", whiteSpace: "nowrap", paddingLeft: 12 }}>
                  {item.rate.toLocaleString()}
                </td>
                <td style={{ padding: "12px 0", borderBottom: "1px solid #E7E7E8", verticalAlign: "top", textAlign: "right", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", paddingLeft: 12 }}>
                  PKR {item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ pageBreakInside: "avoid" }}>
          {/* ─── TOTALS ─── */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <div style={{ width: 260 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6B6E76", padding: "4px 0" }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: "#16181D" }}>PKR {(invoice.subtotal || 0).toLocaleString()}</span>
              </div>
              {invoice.discount ? (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6B6E76", padding: "4px 0" }}>
                  <span>Discount (Mohabbat)</span>
                  <span style={{ fontWeight: 600, color: "#DC8C3A" }}>- PKR {invoice.discount.toLocaleString()}</span>
                </div>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 10, borderTop: "1.5px solid #16181D" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total Due</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: invoice.status === "partially-paid" ? "#16181D" : "#DC8C3A", lineHeight: 1 }}>PKR {(invoice.total || 0).toLocaleString()}</span>
              </div>
              {invoice.status === "partially-paid" ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6B6E76", padding: "4px 0", marginTop: 8 }}>
                    <span>Amount Paid</span>
                    <span style={{ fontWeight: 600, color: "#3B82F6" }}>- PKR {(invoice.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 8, borderTop: "1px dashed #D2D3D6" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Balance Due</span>
                    <span style={{ fontWeight: 800, fontSize: 20, color: "#DC8C3A", lineHeight: 1 }}>PKR {((invoice.total || 0) - (invoice.amountPaid || 0)).toLocaleString()}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* ─── SPACER ─── */}
          <div style={{ height: 16 }} />

          {/* ─── FOOTER CARDS ─── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Payment Info */}
            <div style={{ border: "1px solid #E7E7E8", background: "#FAFAFA", borderRadius: 10, padding: "16px 20px" }}>
              <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#DC8C3A", margin: "0 0 14px" }}>💳 Payment Information</p>
              <div>
                <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 4px" }}>Account Holder</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, margin: "0 0 12px" }}>Muhammad Mudassir Asghar</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 4px" }}>Bank</p>
                  <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>Meezan Bank</p>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 4px" }}>Method</p>
                  <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>Bank Transfer</p>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9DA5", margin: "0 0 4px" }}>Account Number</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>00300110341829</p>
              </div>
            </div>

            {/* Project Deliverables */}
            {(invoice.deliverables && invoice.deliverables.length > 0) && (
              <div style={{ border: "1px solid #E7E7E8", background: "#FAFAFA", borderRadius: 10, padding: "16px 20px" }}>
                <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#DC8C3A", margin: "0 0 14px" }}>📋 Project Deliverables</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {invoice.deliverables.map((del, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#6B6E76", lineHeight: 1.5, marginBottom: 10 }}>
                      <span style={{ color: "#DC8C3A", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ─── FOOTER MESSAGE ─── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24, marginBottom: 4 }}>
            <span style={{ width: 32, height: 12, borderRadius: 999, background: "#16181D", display: "inline-block" }} />
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6E76", margin: 0 }}>Thank you for your partnership</p>
            <span style={{ width: 32, height: 12, borderRadius: 999, background: "#D2D3D6", display: "inline-block" }} />
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";
