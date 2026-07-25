import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, Profile } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isApprovedClient: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isDemoBypass = import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

const GUEST_ADMIN_PROFILE: Profile = {
  id: "guest-admin-id",
  email: "guest@admin.local",
  full_name: "Admin",
  role: "admin",
  status: "approved",
  assigned_client_name: null,
  avatar_url: null,
  created_at: new Date().toISOString(),
};

const GUEST_ADMIN_USER: User = {
  id: "guest-admin-id",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "guest@admin.local",
};

const GUEST_ADMIN_SESSION: Session = {
  access_token: "guest-token",
  token_type: "bearer",
  user: GUEST_ADMIN_USER,
  expires_in: 3600,
  refresh_token: "guest-refresh-token",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else if (isDemoBypass) {
        setSession(GUEST_ADMIN_SESSION);
        setUser(GUEST_ADMIN_USER);
        setProfile(GUEST_ADMIN_PROFILE);
        setLoading(false);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (isDemoBypass) {
          setSession(GUEST_ADMIN_SESSION);
          setUser(GUEST_ADMIN_USER);
          setProfile(GUEST_ADMIN_PROFILE);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === "admin";
  const isApprovedClient =
    profile?.role === "client" && profile?.status === "approved";

  return (
    <AuthContext.Provider
      value={{ session, user, profile, isAdmin, isApprovedClient, loading, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
