export type ProjectStatus = "not-started" | "in-progress" | "completed";

export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  status: ProjectStatus;
  totalValue: number;
  amountPaid: number;
}

export interface VpsServer {
  id: string;
  company: string;
  ipAddress: string;
  username: string;
  password: string;
  deployedItems: string;
  clientName: string;
}

export interface Tool {
  id: string;
  appName: string;
  description: string;
  url: string;
}

export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectName: string;
  clientName: string;
  clientAddress: string;
  invoiceDate: string;
  dueDate: string;
  status: "paid" | "unpaid" | "partially-paid";
  amountPaid?: number;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  deliverables: string[];
}

export interface Site {
  id: string;
  siteName: string;
  username: string;
  password: string;
  driveLink: string;
}
