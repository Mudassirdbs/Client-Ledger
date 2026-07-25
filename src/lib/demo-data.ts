import { Project, VpsServer, Tool, Site, Invoice } from "@/lib/types";

export const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-proj-1",
    clientName: "Acme Corporation",
    projectName: "Enterprise Web Redesign & Portal",
    status: "in-progress",
    totalValue: 15000,
    amountPaid: 7500,
  },
  {
    id: "demo-proj-2",
    clientName: "Fintech Solutions",
    projectName: "Stripe Billing & Subscription API",
    status: "in-progress",
    totalValue: 12500,
    amountPaid: 12500,
  },
  {
    id: "demo-proj-3",
    clientName: "Nexus Media Group",
    projectName: "Mobile Security & Performance Audit",
    status: "completed",
    totalValue: 4800,
    amountPaid: 4800,
  },
  {
    id: "demo-proj-4",
    clientName: "Vanguard Logistics",
    projectName: "Real-Time Fleet Tracking Dashboard",
    status: "not-started",
    totalValue: 18000,
    amountPaid: 0,
  },
];

export const DEMO_VPS_SERVERS: VpsServer[] = [
  {
    id: "demo-vps-1",
    company: "Hetzner Cloud",
    ipAddress: "195.201.82.41",
    username: "root",
    password: "hetzner-prod-sec#99",
    deployedItems: "Client Portal Backend, Redis Cache",
    clientName: "Acme Corporation",
  },
  {
    id: "demo-vps-2",
    company: "DigitalOcean",
    ipAddress: "164.90.174.112",
    username: "deploy",
    password: "do-staging-key!2026",
    deployedItems: "Staging Environment, Billing Microservice",
    clientName: "Fintech Solutions",
  },
  {
    id: "demo-vps-3",
    company: "AWS EC2",
    ipAddress: "54.210.12.89",
    username: "ubuntu",
    password: "aws-ec2-app-prod-88",
    deployedItems: "Fleet API Node Cluster, PostgreSQL Primary",
    clientName: "Vanguard Logistics",
  },
];

export const DEMO_TOOLS: Tool[] = [
  {
    id: "demo-tool-1",
    appName: "Client Portal",
    description: "External client dashboard for invoice downloads and milestone tracking",
    url: "https://portal.clientledger.dev",
  },
  {
    id: "demo-tool-2",
    appName: "System Status Monitor",
    description: "Real-time uptime checking and server monitoring dashboard",
    url: "https://status.clientledger.dev",
  },
  {
    id: "demo-tool-3",
    appName: "PDF Invoice Generator",
    description: "Micro-app for generating downloadable PDF invoices and statements",
    url: "https://invoices.clientledger.dev",
  },
];

export const DEMO_SITES: Site[] = [
  {
    id: "demo-site-1",
    siteName: "Acme Corporation Portal",
    username: "admin@acme.com",
    password: "acme-wp-2026",
    driveLink: "https://acme-corp.com",
  },
  {
    id: "demo-site-2",
    siteName: "Fintech Solutions App",
    username: "dev@fintech.io",
    password: "ft-app-secret",
    driveLink: "https://fintech-billing.io",
  },
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: "demo-inv-1",
    invoiceNumber: "INV-2026-001",
    clientName: "Acme Corporation",
    clientAddress: "100 Innovation Way, Suite 400",
    projectName: "Enterprise Web Redesign & Portal",
    invoiceDate: "2026-06-25",
    dueDate: "2026-07-09",
    status: "paid",
    amountPaid: 7500,
    subtotal: 7500,
    discount: 0,
    total: 7500,
    deliverables: ["Wireframes", "Frontend UI", "API Integration"],
    items: [
      { id: "item-1", title: "Milestone 1: Wireframes", description: "Design system & mockups", qty: 1, rate: 3500, amount: 3500 },
      { id: "item-2", title: "Milestone 2: Frontend", description: "React component library", qty: 1, rate: 4000, amount: 4000 },
    ],
  },
  {
    id: "demo-inv-2",
    invoiceNumber: "INV-2026-002",
    clientName: "Fintech Solutions",
    clientAddress: "500 Financial Plaza, 12th Floor",
    projectName: "Stripe Billing & Subscription API",
    invoiceDate: "2026-07-10",
    dueDate: "2026-07-24",
    status: "paid",
    amountPaid: 12500,
    subtotal: 12500,
    discount: 0,
    total: 12500,
    deliverables: ["Stripe Connect Setup", "Webhook Endpoints"],
    items: [
      { id: "item-3", title: "Stripe Integration", description: "Subscriptions and billing webhooks", qty: 1, rate: 12500, amount: 12500 },
    ],
  },
  {
    id: "demo-inv-3",
    invoiceNumber: "INV-2026-003",
    clientName: "Acme Corporation",
    clientAddress: "100 Innovation Way, Suite 400",
    projectName: "Enterprise Web Redesign & Portal",
    invoiceDate: "2026-07-20",
    dueDate: "2026-08-03",
    status: "unpaid",
    amountPaid: 0,
    subtotal: 7500,
    discount: 0,
    total: 7500,
    deliverables: ["Go-live support", "Database Migration"],
    items: [
      { id: "item-4", title: "Milestone 3: Deployment", description: "Production launch and QA", qty: 1, rate: 7500, amount: 7500 },
    ],
  },
  {
    id: "demo-inv-4",
    invoiceNumber: "INV-2026-004",
    clientName: "Vanguard Logistics",
    clientAddress: "88 Logistics Blvd, Dock 12",
    projectName: "Real-Time Fleet Tracking Dashboard",
    invoiceDate: "2026-07-01",
    dueDate: "2026-07-15",
    status: "partially-paid",
    amountPaid: 4500,
    subtotal: 9000,
    discount: 0,
    total: 9000,
    deliverables: ["Architecture spec", "Fleet maps"],
    items: [
      { id: "item-5", title: "Initial Deposit", description: "System architecture and maps API setup", qty: 1, rate: 9000, amount: 9000 },
    ],
  },
];
