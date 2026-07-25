import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Project } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  addProject: (p: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, updates: Omit<Project, "id">) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | null>(null);

function dbToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    clientName: row.client_name as string,
    projectName: row.project_name as string,
    status: row.status as Project["status"],
    totalValue: Number(row.total_value),
    amountPaid: Number(row.amount_paid),
  };
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { profile, isAdmin, isApprovedClient } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  // Debounce realtime refetches to avoid hammering Supabase
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!profile) { setProjects([]); setLoading(false); return; }

    setLoading(true);
    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    // Clients only see their own projects
    if (!isAdmin && isApprovedClient && profile.assigned_client_name) {
      query = query.eq("client_name", profile.assigned_client_name);
    }

    const { data, error } = await query;
    if (!error && data) {
      setProjects(data.map(dbToProject));
    }
    setLoading(false);
  }, [profile, isAdmin, isApprovedClient]);

  // Debounced version for realtime — coalesces rapid changes into one fetch
  const debouncedFetch = useCallback(() => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => {
      fetchProjects();
    }, 300);
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();

    // Real-time subscription — uses debounced handler
    const channel = supabase
      .channel("projects-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, debouncedFetch)
      .subscribe();

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchProjects, debouncedFetch]);

  const addProject = async (p: Omit<Project, "id">) => {
    // Optimistic: skip manual re-fetch, realtime will push update
    await supabase.from("projects").insert({
      client_name: p.clientName,
      project_name: p.projectName,
      status: p.status,
      total_value: p.totalValue,
      amount_paid: p.amountPaid,
    });
  };

  const updateProject = async (id: string, updates: Omit<Project, "id">) => {
    // Optimistic local update — instant UI feedback
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    await supabase.from("projects").update({
      client_name: updates.clientName,
      project_name: updates.projectName,
      status: updates.status,
      total_value: updates.totalValue,
      amount_paid: updates.amountPaid,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
  };

  const deleteProject = async (id: string) => {
    // Optimistic local delete — instant UI removal
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("projects").delete().eq("id", id);
  };

  return (
    <ProjectsContext.Provider value={{ projects, loading, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be inside ProjectsProvider");
  return ctx;
}
