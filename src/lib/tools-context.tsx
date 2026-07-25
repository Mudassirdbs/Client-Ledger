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

export function ToolsProvider({ children }: { children: ReactNode }) {
  const { profile, isAdmin } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTools = useCallback(async () => {
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
  }, [profile, isAdmin]);

  const debouncedFetch = useCallback(() => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => {
      fetchTools();
    }, 300);
  }, [fetchTools]);

  useEffect(() => {
    fetchTools();

    const channel = supabase
      .channel("tools-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tools" }, debouncedFetch)
      .subscribe();

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchTools, debouncedFetch]);

  const addTool = async (tool: Omit<Tool, "id">) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("tools").insert({
      app_name: tool.appName,
      description: tool.description || "",
      url: tool.url || "",
    });
    if (error) {
      console.error("[Tools] Failed to add tool:", error);
    }
    // Realtime will push update
  };

  const updateTool = async (id: string, updates: Omit<Tool, "id">) => {
    if (!isAdmin) return;
    // Optimistic local update
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
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
    if (!isAdmin) return;
    // Optimistic local delete
    setTools((prev) => prev.filter((t) => t.id !== id));
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
