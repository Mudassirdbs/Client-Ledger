import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Site } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface SitesContextType {
  sites: Site[];
  loading: boolean;
  addSite: (site: Omit<Site, "id">) => Promise<void>;
  updateSite: (id: string, updates: Omit<Site, "id">) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
}

const SitesContext = createContext<SitesContextType | null>(null);

function dbToSite(row: Record<string, unknown>): Site {
  return {
    id: row.id as string,
    siteName: row.site_name as string,
    username: row.username as string,
    password: row.password as string,
    driveLink: (row.drive_link as string) || "",
  };
}

import { DEMO_SITES } from "@/lib/demo-data";

export function SitesProvider({ children }: { children: ReactNode }) {
  const { user, profile, isAdmin } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDemo = import.meta.env.VITE_ENABLE_DEMO_MODE === "true" || user?.id === "demo-admin-id";

  const fetchSites = useCallback(async () => {
    if (isDemo) {
      setSites(DEMO_SITES);
      setLoading(false);
      return;
    }

    if (!profile || !isAdmin) { setSites([]); setLoading(false); return; }

    setLoading(true);
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Sites] Failed to fetch sites:", error);
    } else if (data) {
      setSites(data.map(dbToSite));
    }
    setLoading(false);
  }, [profile, isAdmin, isDemo]);

  const debouncedFetch = useCallback(() => {
    if (isDemo) return;
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => {
      fetchSites();
    }, 300);
  }, [fetchSites, isDemo]);

  useEffect(() => {
    fetchSites();

    if (isDemo) return;

    const channel = supabase
      .channel("sites-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "sites" }, debouncedFetch)
      .subscribe();

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchSites, debouncedFetch, isDemo]);

  const addSite = async (site: Omit<Site, "id">) => {
    if (isDemo) {
      const newSite: Site = { id: `demo-site-${Date.now()}`, ...site };
      setSites((prev) => [newSite, ...prev]);
      return;
    }
    if (!isAdmin) return;
    const { error } = await supabase.from("sites").insert({
      site_name: site.siteName,
      username: site.username,
      password: site.password,
      drive_link: site.driveLink || "",
    });
    if (error) {
      console.error("[Sites] Failed to add site:", error);
    }
  };

  const updateSite = async (id: string, updates: Omit<Site, "id">) => {
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    if (isDemo || !isAdmin) return;
    const { error } = await supabase.from("sites").update({
      site_name: updates.siteName,
      username: updates.username,
      password: updates.password,
      drive_link: updates.driveLink || "",
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      console.error("[Sites] Failed to update site:", error);
    }
  };

  const deleteSite = async (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
    if (isDemo || !isAdmin) return;
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) {
      console.error("[Sites] Failed to delete site:", error);
    }
  };

  return (
    <SitesContext.Provider value={{ sites, loading, addSite, updateSite, deleteSite }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites() {
  const ctx = useContext(SitesContext);
  if (!ctx) throw new Error("useSites must be inside SitesProvider");
  return ctx;
}
