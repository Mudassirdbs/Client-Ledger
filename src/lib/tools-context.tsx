import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Tool } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface ToolsContextType {
  tools: Tool[];
  loading: boolean;
  addTool: (tool: Omit<Tool, "id">) => Promise<void>;
  updateTool: (id: string, updates: Omit<Tool, "id">) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
}

const ToolsContext = createContext<ToolsContextType | null>(null);

function dbToTool(row: Record<string, unknown>): Tool {
  return {
    id: row.id as string,
    appName: row.app_name as string,
    description: (row.description as string) || "",
    url: (row.url as string) || "",
  };
}

import { DEMO_TOOLS } from "@/lib/demo-data";

export function ToolsProvider({ children }: { children: ReactNode }) {
  const { user, profile, isAdmin } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDemo = import.meta.env.VITE_ENABLE_DEMO_MODE === "true" || user?.id === "demo-admin-id";

  const fetchTools = useCallback(async () => {
    if (isDemo) {
      setTools(DEMO_TOOLS);
      setLoading(false);
      return;
    }

    if (!profile || !isAdmin) { setTools([]); setLoading(false); return; }

    setLoading(true);
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Tools] Failed to fetch tools:", error);
    } else if (data) {
      setTools(data.map(dbToTool));
    }
    setLoading(false);
  }, [profile, isAdmin, isDemo]);

  const debouncedFetch = useCallback(() => {
    if (isDemo) return;
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => {
      fetchTools();
    }, 300);
  }, [fetchTools, isDemo]);

  useEffect(() => {
    fetchTools();

    if (isDemo) return;

    const channel = supabase
      .channel("tools-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tools" }, debouncedFetch)
      .subscribe();

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchTools, debouncedFetch, isDemo]);

  const addTool = async (tool: Omit<Tool, "id">) => {
    if (isDemo) {
      const newTool: Tool = { id: `demo-tool-${Date.now()}`, ...tool };
      setTools((prev) => [newTool, ...prev]);
      return;
    }
    if (!isAdmin) return;
    const { error } = await supabase.from("tools").insert({
      app_name: tool.appName,
      description: tool.description || "",
      url: tool.url || "",
    });
    if (error) {
      console.error("[Tools] Failed to add tool:", error);
    }
  };

  const updateTool = async (id: string, updates: Omit<Tool, "id">) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    if (isDemo || !isAdmin) return;
    const { error } = await supabase.from("tools").update({
      app_name: updates.appName,
      description: updates.description || "",
      url: updates.url || "",
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      console.error("[Tools] Failed to update tool:", error);
    }
  };

  const deleteTool = async (id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
    if (isDemo || !isAdmin) return;
    const { error } = await supabase.from("tools").delete().eq("id", id);
    if (error) {
      console.error("[Tools] Failed to delete tool:", error);
    }
  };

  return (
    <ToolsContext.Provider value={{ tools, loading, addTool, updateTool, deleteTool }}>
      {children}
    </ToolsContext.Provider>
  );
}

export function useTools() {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error("useTools must be inside ToolsProvider");
  return ctx;
}
