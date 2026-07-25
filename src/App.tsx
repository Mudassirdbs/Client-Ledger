// UI/UX Fix applied: Fix 4 — ErrorBoundary wrapping the entire app
import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ProjectsProvider } from "@/lib/projects-context";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ErrorBoundary } from "@/components/layout/error-boundary";

import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Projects from "@/pages/projects";
import Reports from "@/pages/reports";
import Approvals from "@/pages/admin/approvals";
import VpsServers from "@/pages/vps";
import Tools from "@/pages/tools";
import Sites from "@/pages/sites";
import Invoices from "@/pages/invoices";

import { VpsProvider } from "@/lib/vps-context";
import { ToolsProvider } from "@/lib/tools-context";
import { SitesProvider } from "@/lib/sites-context";
import { InvoicesProvider } from "@/lib/invoices-context";

import { StaleProjectsProvider } from "@/lib/stale-projects-context";

// Isolated pages — keep lazy loading for smaller initial bundle
const NotFound = lazy(() => import("@/pages/not-found"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const Pending = lazy(() => import("@/pages/pending"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — avoid refetches on focus/mount
      refetchOnWindowFocus: false,
    },
  },
});

type ThemeContextType = { isDark: boolean; toggleTheme: () => void };
export const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

/** Minimal loading spinner */
function PageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** Auth-aware router — redirects based on session + profile state */
function AppRouter() {
  const { session, profile, isAdmin, isApprovedClient, loading } = useAuth();

  if (loading) return <PageFallback />;

  // Not logged in → only allow /login and /signup
  if (!session) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/login"           component={Login} />
          <Route path="/signup"          component={Signup} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password"  component={ResetPassword} />
          <Route><Redirect to="/login" /></Route>
        </Switch>
      </Suspense>
    );
  }

  // Logged in but profile not loaded yet
  if (!profile) return <PageFallback />;

  // Pending or rejected client
  if (profile.role === "client" && profile.status !== "approved") {
    return (
      <Suspense fallback={<PageFallback />}>
        <Pending />
      </Suspense>
    );
  }

  // Approved — wrap with projects data
  // Admin gets VPS + Tools providers; clients skip those chunks entirely
  const innerRoutes = (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        {/* Admin-only routes */}
        {isAdmin && <Route path="/clients"         component={Clients} />}
        {isAdmin && <Route path="/admin/approvals" component={Approvals} />}
        {isAdmin && <Route path="/vps"             component={VpsServers} />}
        {isAdmin && <Route path="/tools"           component={Tools} />}
        {isAdmin && <Route path="/sites"           component={Sites} />}
        <Route path="/invoices"                    component={Invoices} />

        {/* Shared routes */}
        <Route path="/"         component={isAdmin ? Dashboard : Projects} />
        <Route path="/projects" component={Projects} />
        <Route path="/reports"  component={Reports} />

        {/* Redirect auth pages away */}
        <Route path="/login"  ><Redirect to="/" /></Route>
        <Route path="/signup" ><Redirect to="/" /></Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );

  return (

      <ProjectsProvider>
        <StaleProjectsProvider>
        <Suspense fallback={<PageFallback />}>
          <InvoicesProvider>
            {isAdmin ? (
              <VpsProvider>
                <ToolsProvider>
                  <SitesProvider>
                    {innerRoutes}
                  </SitesProvider>
                </ToolsProvider>
              </VpsProvider>
            ) : (
              innerRoutes
            )}
          </InvoicesProvider>
        </Suspense>
        </StaleProjectsProvider>
      </ProjectsProvider>

  );
}

function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <WouterRouter>
                <AppRouter />
              </WouterRouter>
              <Toaster />
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
