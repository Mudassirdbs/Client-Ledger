-- ==========================================
-- Client Ledger Dashboard - Database Seed Script
-- Run this script in your Supabase SQL Editor to populate sample data
-- ==========================================

-- 1. SEED PROJECTS
INSERT INTO public.projects (client_name, project_name, status, total_value, amount_paid)
VALUES
  ('Acme Corporation', 'Enterprise Web Redesign & Portal', 'in-progress', 15000, 7500),
  ('Fintech Solutions', 'Stripe Billing & Subscription API', 'in-progress', 12500, 12500),
  ('Nexus Media Group', 'Mobile Security & Performance Audit', 'completed', 4800, 4800),
  ('Vanguard Logistics', 'Real-Time Fleet Tracking Dashboard', 'not-started', 18000, 0),
  ('Apex Healthcare', 'HIPAA Compliant Patient Intake System', 'in-progress', 22000, 11000);

-- 2. SEED VPS SERVERS
INSERT INTO public.vps_servers (company, ip_address, username, password, deployed_items, client_name)
VALUES
  ('Hetzner Cloud', '195.201.82.41', 'root', 'hetzner-prod-sec#99', 'Client Portal Backend, Redis Cache', 'Acme Corporation'),
  ('DigitalOcean', '164.90.174.112', 'deploy', 'do-staging-key!2026', 'Staging Environment, Billing Microservice', 'Fintech Solutions'),
  ('AWS EC2', '54.210.12.89', 'ubuntu', 'aws-ec2-app-prod-88', 'Fleet API Node Cluster, PostgreSQL Primary', 'Vanguard Logistics');

-- 3. SEED INTERNAL TOOLS
INSERT INTO public.tools (app_name, description, url)
VALUES
  ('Client Portal', 'External client dashboard for invoice downloads and milestone tracking', 'https://portal.clientledger.dev'),
  ('System Status Monitor', 'Real-time uptime checking and server monitoring dashboard', 'https://status.clientledger.dev'),
  ('PDF Invoice Generator', 'Micro-app for generating downloadable PDF invoices and statements', 'https://invoices.clientledger.dev');

-- 4. SEED CLIENT SITES
INSERT INTO public.sites (client_name, site_url, credentials, notes)
VALUES
  ('Acme Corporation', 'https://acme-corp.com', 'Admin: admin@acme.com / acme-wp-2026', 'WordPress multisite installation. PHP 8.2 on Hetzner.'),
  ('Fintech Solutions', 'https://fintech-billing.io', 'Admin: dev@fintech.io / ft-app-secret', 'Next.js application hosted on Vercel with Supabase backend.');

-- 5. SEED INVOICES
INSERT INTO public.invoices (invoice_number, client_name, project_name, amount, status, issue_date, due_date, items)
VALUES
  (
    'INV-2026-001',
    'Acme Corporation',
    'Enterprise Web Redesign & Portal',
    7500,
    'paid',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '16 days',
    '[{"description": "Milestone 1: Wireframes and Design System", "quantity": 1, "unitPrice": 3500, "total": 3500}, {"description": "Milestone 2: Frontend Implementation", "quantity": 1, "unitPrice": 4000, "total": 4000}]'::jsonb
  ),
  (
    'INV-2026-002',
    'Fintech Solutions',
    'Stripe Billing & Subscription API',
    12500,
    'paid',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE,
    '[{"description": "Stripe Connect Integration & Webhooks", "quantity": 1, "unitPrice": 12500, "total": 12500}]'::jsonb
  ),
  (
    'INV-2026-003',
    'Acme Corporation',
    'Enterprise Web Redesign & Portal',
    7500,
    'unpaid',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '9 days',
    '[{"description": "Milestone 3: Backend Integration & Go-Live", "quantity": 1, "unitPrice": 7500, "total": 7500}]'::jsonb
  ),
  (
    'INV-2026-004',
    'Vanguard Logistics',
    'Real-Time Fleet Tracking Dashboard',
    9000,
    'overdue',
    CURRENT_DATE - INTERVAL '25 days',
    CURRENT_DATE - INTERVAL '11 days',
    '[{"description": "Initial Deposit & Architecture Planning", "quantity": 1, "unitPrice": 9000, "total": 9000}]'::jsonb
  );
