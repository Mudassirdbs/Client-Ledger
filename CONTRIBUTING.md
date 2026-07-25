# Contributing to Client Ledger Dashboard

Thank you for your interest in contributing to Client Ledger Dashboard! Here are guidelines to help you get started.

## 🚀 How to Contribute

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/Mudassirdbs/Client-Ledger.git
   cd Client-Ledger
   ```
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
4. **Make Your Changes** and test them locally:
   ```bash
   npm run dev
   ```
5. **Verify Before Pushing**: Ensure there are no type errors or build issues.
   ```bash
   npm run typecheck
   npm run build
   ```
6. **Commit Your Changes**:
   ```bash
   git commit -m "feat: add support for client tags"
   ```
7. **Push to Your Fork** and open a **Pull Request**.

## 🎨 Code Style & Standards

- Write clean, type-safe TypeScript code.
- Follow existing Tailwind CSS styling conventions and component patterns.
- Do not commit secrets, passwords, or live Supabase API keys.
