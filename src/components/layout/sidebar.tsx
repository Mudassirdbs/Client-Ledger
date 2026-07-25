// UI/UX Fix applied: Fix 5 — Mobile sidebar z-index lowered to z-40 to avoid stacking above Radix dialogs
// Theme toggle added: Sun/Moon icon in both desktop and mobile sidebar
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  BarChart2,
  ShieldCheck,
  LogOut,
  Server,
  Wrench,
  Menu,
  X,
  FileText,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/App";
import { ProfileDialog } from "@/components/layout/profile-dialog";
import { useStaleProjects } from "@/lib/stale-projects-context";

export function Sidebar() {
  const [location] = useLocation();
  const { isAdmin, profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const adminNav = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users,           label: "Clients",   href: "/clients" },
    { icon: FolderOpen,      label: "Projects",  href: "/projects" },
    { icon: Server,          label: "Servers",   href: "/vps" },
    { icon: Wrench,          label: "My Tools",  href: "/tools" },
    { icon: Globe,           label: "My Sites",  href: "/sites" },
    { icon: BarChart2,       label: "Reports",   href: "/reports" },
    { icon: FileText,        label: "Invoices",  href: "/invoices" },
    { icon: ShieldCheck,     label: "Approvals", href: "/admin/approvals" },
  ];

  const clientNav = [
    { icon: FolderOpen, label: "My Projects", href: "/projects" },
    { icon: BarChart2,  label: "My Reports",  href: "/reports" },
    { icon: FileText,   label: "My Invoices", href: "/invoices" },
  ];

  const navItems = isAdmin ? adminNav : clientNav;

  // Avatar initials
  const initials = profile?.full_name
    ?.trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  const { staleCount } = useStaleProjects();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  return (
    <>
      <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />

      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-40 print-hide">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="h-10 w-10 bg-zinc-950 dark:bg-[#0d0d1a] text-white rounded-xl flex items-center justify-center shadow-lg border border-zinc-800 dark:border-[#2a2a45]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 flex backdrop-blur-sm">
          <aside className="w-64 bg-zinc-950 dark:bg-[#0d0d1a] h-full flex flex-col shadow-2xl relative border-r border-zinc-800/60 dark:border-[#2a2a45] transition-transform">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="h-16 flex items-center px-6 border-b border-zinc-800/60 dark:border-[#2a2a45]">
              <span className="text-white font-bold text-xl tracking-tight">Dashboard</span>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
              {navItems.map(({ icon: Icon, label, href }) => (
                <Link key={href} href={href}>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "w-full h-12 flex items-center gap-3 px-4 rounded-xl transition-colors",
                      isActive(href)
                        ? "bg-white text-zinc-950 font-semibold"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 font-medium"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{label}</span>
                  </button>
                </Link>
              ))}
            </nav>
            
            {/* Bottom user section */}
            <div className="p-4 border-t border-zinc-800/60 space-y-3">
              {/* Theme toggle (mobile) */}
              <button
                onClick={toggleTheme}
                className="w-full h-12 flex items-center gap-3 px-4 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 font-medium transition-colors"
              >
                {isDark ? (
                  <Sun className="h-[18px] w-[18px] shrink-0" />
                ) : (
                  <Moon className="h-[18px] w-[18px] shrink-0" />
                )}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setProfileDialogOpen(true)}
                  className="flex items-center gap-3 overflow-hidden hover:bg-zinc-800/50 p-1.5 -ml-1.5 rounded-lg transition-colors text-left"
                >
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-primary-foreground text-sm font-bold">{initials}</span>
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm text-white font-medium truncate">{profile?.full_name ?? profile?.email}</span>
                    <span className="text-xs text-zinc-500 capitalize">{profile?.role}</span>
                  </div>
                </button>
                <button
                  onClick={signOut}
                  className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-16 shrink-0 h-[calc(100vh-20px)] my-2.5 ml-2.5 bg-zinc-950 dark:bg-[#0d0d1a] rounded-3xl shadow-2xl z-20 border border-zinc-800/60 dark:border-[#2a2a45] py-4">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center shrink-0">
        <Link href="/">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-zinc-100 transition-colors">
            <span className="text-zinc-950 font-black text-base leading-none">C</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const showBadge = isAdmin && staleCount > 0 && href === "/";
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link href={href}>
                  <button
                    className={cn(
                      "relative w-full h-10 flex items-center justify-center rounded-lg transition-colors",
                      isActive(href)
                        ? "bg-white text-zinc-950"
                        : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {showBadge && (
                      <span className="absolute top-1.5 right-1.5 h-4 min-w-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                        {staleCount > 9 ? "9+" : staleCount}
                      </span>
                    )}
                    <span className="sr-only">{label}</span>
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                {label}
                {showBadge ? ` · ${staleCount} stalled` : ""}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom — theme toggle + avatar + logout */}
      <div className="px-3 pb-4 space-y-2 shrink-0">
        {/* Theme toggle (desktop) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleTheme}
              className="w-full h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              {isDark ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
              <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{isDark ? "Light Mode" : "Dark Mode"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={signOut}
              className="w-full h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Sign out</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => setProfileDialogOpen(true)}
              className="flex w-full items-center justify-center pt-1 hover:bg-zinc-800/50 rounded-lg p-1 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-primary-foreground text-xs font-bold">{initials}</span>
                )}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{profile?.full_name ?? profile?.email}</p>
            <p className="text-[10px] text-muted-foreground">Click to edit profile</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
    </>
  );
}
