# Client Ledger Dashboard (Community Edition)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green.svg)](https://supabase.com)

A modern, open-source client management and financial ledger dashboard built for freelancers, agencies, and micro-consultancies. Track client accounts, project milestones, payments, server infrastructure, internal tools, and invoices — all in one self-hostable platform.

---

## ✨ Features

- **🔐 Role-Based Auth**: Admin & Client roles with signup approval workflow powered by Supabase Auth.
- **📊 Admin Dashboard**: High-level scorecards for total revenue, collected payments, outstanding balances, and active client projects.
- **📁 Project Tracking**: Manage projects with status badges, balance auto-calculation, and client filtering.
- **🖥️ VPS Infrastructure Tracker**: Catalog VPS servers, IP addresses, access credentials, and deployed applications.
- **🔧 Internal Tools Directory**: Share links and descriptions to internal micro-apps and client portals.
- **🧾 Invoicing**: Generate, track, and manage client invoice records.
- **🎨 Modern Dark Mode UI**: Built with React 19, Tailwind CSS v4, Radix UI primitives, and Framer Motion.

---

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- A free [Supabase](https://supabase.com) account

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/client-ledger-community.git
cd client-ledger-community
```

---

### Step 2: Install Dependencies
```bash
npm install
```

---

### Step 3: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Open `.env.local` and enter your Supabase Project URL and Anon API key:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Step 4: Setup Database Schema
1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

---

### Step 5: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript |
| **Bundler** | Vite 7 |
| **Styling** | Tailwind CSS v4 + Radix UI |
| **Backend / DB** | Supabase (Auth, PostgreSQL, Realtime) |
| **Routing** | Wouter |
| **Charts** | Recharts |

---

## 🌐 Deployment (Vercel / Netlify)

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Click **Deploy**.

---

## 🤝 Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) to get started.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
