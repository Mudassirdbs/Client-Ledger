import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types matching the database schema ───────────────────────────────────────

export type UserRole = "admin" | "client";
export type UserStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  assigned_client_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface DbProject {
  id: string;
  client_name: string;
  project_name: string;
  status: "not-started" | "in-progress" | "completed";
  total_value: number;
  amount_paid: number;
  created_at: string;
  updated_at: string;
}

export interface DbVpsServer {
  id: string;
  company: string;
  ip_address: string;
  username: string;
  password: string;
  deployed_items: string;
  client_name: string;
  created_at: string;
  updated_at: string;
}

export interface DbTool {
  id: string;
  app_name: string;
  description: string;
  url: string;
  created_at: string;
  updated_at: string;
}
