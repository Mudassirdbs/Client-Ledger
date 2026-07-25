import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { VpsServer } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface VpsContextType {
  vpsServers: VpsServer[];
  loading: boolean;
  addVpsServer: (vps: Omit<VpsServer, "id">) => Promise<void>;
  updateVpsServer: (id: string, updates: Omit<VpsServer, "id">) => Promise<void>;
  deleteVpsServer: (id: string) => Promise<void>;
}

const VpsContext = createContext<VpsContextType | null>(null);

function dbToVpsServer(row: Record<string, unknown>): VpsServer {
  return {
    id: row.id as string,
    company: row.company as string,
    ipAddress: row.ip_address as string,
    username: row.username as string,
    password: row.password as string,
    deployedItems: row.deployed_items as string,
    clientName: row.client_name as string,
  };
}

import { DEMO_VPS_SERVERS } from "@/lib/demo-data";

export function VpsProvider({ children }: { children: ReactNode }) {
  const { user, profile, isAdmin } = useAuth();
  const [vpsServers, setVpsServers] = useState<VpsServer[]>([]);
  const [loading, setLoading] = useState(true);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDemo = import.meta.env.VITE_ENABLE_DEMO_MODE === "true" || user?.id === "demo-admin-id";

  const fetchVpsServers = useCallback(async () => {
    if (isDemo) {
      setVpsServers(DEMO_VPS_SERVERS);
      setLoading(false);
      return;
    }

    // Strictly restrict to admins
    if (!profile || !isAdmin) { setVpsServers([]); setLoading(false); return; }

    setLoading(true);
    const { data, error } = await supabase
      .from("vps_servers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[VPS] Failed to fetch servers:", error);
    } else if (data) {
      setVpsServers(data.map(dbToVpsServer));
    }
    setLoading(false);
  }, [profile, isAdmin, isDemo]);

  const debouncedFetch = useCallback(() => {
    if (isDemo) return;
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => {
      fetchVpsServers();
    }, 300);
  }, [fetchVpsServers, isDemo]);

  useEffect(() => {
    fetchVpsServers();

    if (isDemo) return;

    // Real-time subscription
    const channel = supabase
      .channel("vps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "vps_servers" }, debouncedFetch)
      .subscribe();

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchVpsServers, debouncedFetch, isDemo]);

  const addVpsServer = async (vps: Omit<VpsServer, "id">) => {
    if (isDemo) {
      const newVps: VpsServer = { id: `demo-vps-${Date.now()}`, ...vps };
      setVpsServers((prev) => [newVps, ...prev]);
      return;
    }
    if (!isAdmin) return;
    const { error } = await supabase.from("vps_servers").insert({
      company: vps.company,
      ip_address: vps.ipAddress,
      username: vps.username,
      password: vps.password,
      deployed_items: vps.deployedItems || "",
      client_name: vps.clientName || "",
    });
    if (error) {
      console.error("[VPS] Failed to add server:", error);
    }
  };

  const updateVpsServer = async (id: string, updates: Omit<VpsServer, "id">) => {
    setVpsServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    if (isDemo || !isAdmin) return;
    const { error } = await supabase.from("vps_servers").update({
      company: updates.company,
      ip_address: updates.ipAddress,
      username: updates.username,
      password: updates.password,
      deployed_items: updates.deployedItems || "",
      client_name: updates.clientName || "",
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      console.error("[VPS] Failed to update server:", error);
    }
  };

  const deleteVpsServer = async (id: string) => {
    setVpsServers((prev) => prev.filter((s) => s.id !== id));
    if (isDemo || !isAdmin) return;
    const { error } = await supabase.from("vps_servers").delete().eq("id", id);
    if (error) {
      console.error("[VPS] Failed to delete server:", error);
    }
  };

  return (
    <VpsContext.Provider value={{ vpsServers, loading, addVpsServer, updateVpsServer, deleteVpsServer }}>
      {children}
    </VpsContext.Provider>
  );
}

export function useVpsServers() {
  const ctx = useContext(VpsContext);
  if (!ctx) throw new Error("useVpsServers must be inside VpsProvider");
  return ctx;
}
