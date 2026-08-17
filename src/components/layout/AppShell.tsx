import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileText,
  Footprints,
  HeartPulse,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSimulation } from "@/hooks/useSimulation";
import { ROLE_LABEL, ALERTS } from "@/mock/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AIAssistantDrawer } from "@/components/ai/AIAssistantDrawer";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/live", label: "Live Vitals", icon: HeartPulse },
  { to: "/ecg", label: "ECG Monitor", icon: Activity },
  { to: "/activity", label: "Activity", icon: Footprints },
  { to: "/sleep", label: "Sleep", icon: Moon },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/trends", label: "Health History", icon: History },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/devices", label: "Smart Band", icon: Cpu },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

const getInitialCollapsed = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("smarthealth_sidebar_collapsed");
    if (saved !== null) {
      return saved === "true";
    }
  }
  return false;
};

export function AppShell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(getInitialCollapsed);

  const setCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    setCollapsedState((prev) => {
      const nextVal = typeof val === "function" ? val(prev) : val;
      if (typeof window !== "undefined") {
        localStorage.setItem("smarthealth_sidebar_collapsed", String(nextVal));
      }
      return nextVal;
    });
  };

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentUser = user || DEMO_USERS[0]!;
  const { connected, emergencyActive, lastSyncSecondsAgo } = useSimulation();

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeAlerts = ALERTS.filter(
    (a) => a.status === "Active" && (a.patientId === currentUser.id || a.patientId === "USR-00124"),
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Accessibility skip link */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>

        {/* Sidebar Navigation */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex flex-col bg-card text-card-foreground transition-all duration-300 ease-in-out border-r border-border shadow-xs",
            collapsed ? "lg:w-[72px]" : "lg:w-64",
            mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          )}
          aria-label="Primary navigation"
        >
          {/* Brand Header */}
          <div
            className={cn(
              "h-16 flex items-center border-b border-border/80 px-4 transition-all duration-300",
              collapsed ? "justify-center px-2" : "justify-between",
            )}
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCollapsed(false)}
                    className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all shadow-xs"
                    aria-label="Expand Sidebar"
                  >
                    <HeartPulse className="size-5 text-primary" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-semibold text-xs">
                  Expand Sidebar
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-9.5 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                    <HeartPulse className="size-5 text-primary" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <span className="text-base font-extrabold tracking-tight text-foreground block truncate">
                      SmartHealth
                    </span>
                    <p className="truncate text-[11px] font-medium text-muted-foreground">
                      User Health Portal
                    </p>
                  </div>
                </div>

                {/* Desktop Collapse Toggle */}
                <button
                  className="hidden lg:grid size-8 place-items-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  onClick={() => setCollapsed(true)}
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {/* Mobile Close Button */}
                <button
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 lg:hidden ml-auto"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="size-4" />
                </button>
              </>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.to ||
                (item.to !== "/dashboard" && pathname.startsWith(`${item.to}/`));

              const linkContent = (
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center rounded-xl text-xs font-semibold transition-all duration-200",
                    collapsed ? "justify-center size-11 mx-auto" : "px-3.5 py-2.5 gap-3 w-full",
                    active
                      ? "bg-primary text-white shadow-sm font-bold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-4.5 shrink-0" aria-hidden />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-semibold text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.to}>{linkContent}</div>;
            })}
          </nav>

          {/* Sidebar Footer: User Profile */}
          <div
            className={cn(
              "border-t border-border/80 bg-muted/20 transition-all duration-300",
              collapsed ? "p-2.5 text-center" : "p-3.5",
            )}
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="grid size-10 mx-auto place-items-center rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20 shadow-xs cursor-default"
                    aria-label={currentUser.name}
                  >
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-bold">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground">{currentUser.id} · Connected</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">{currentUser.name}</p>
                    <p className="truncate text-[10px] font-medium text-muted-foreground">
                      User · {currentUser.id}
                    </p>
                  </div>
                </div>
                <span
                  className="size-2 rounded-full bg-emerald-500 live-dot shrink-0"
                  title="Profile Active"
                />
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen ? (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
        ) : null}

        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
            collapsed ? "lg:pl-[72px]" : "lg:pl-64",
          )}
        >
          {/* Sticky Top Header */}
          <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/90 backdrop-blur-md shadow-xs flex items-center">
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Menu Button */}
                <button
                  className="grid size-9 place-items-center rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="size-4.5" />
                </button>

                {/* Desktop Sidebar Toggle Button */}
                <button
                  className="hidden lg:grid size-9 place-items-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  onClick={() => setCollapsed(!collapsed)}
                  title={collapsed ? "Open Sidebar" : "Close Sidebar"}
                  aria-label={collapsed ? "Open Sidebar" : "Close Sidebar"}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="size-4.5" />
                  ) : (
                    <PanelLeftClose className="size-4.5" />
                  )}
                </button>

                <div className="min-w-0">
                  <h1 className="truncate text-base font-bold text-foreground tracking-tight sm:text-lg">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="truncate text-xs text-muted-foreground hidden sm:block">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Header Right Status Badges */}
              <div className="flex items-center gap-3">
                {/* Action button if supplied */}
                {action}

                {/* System & Band Connection Indicator */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 live-dot" />
                    System Live
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border",
                      connected
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
                    )}
                  >
                    <Radio className="size-3" />
                    {connected ? `Band Connected (${lastSyncSecondsAgo}s ago)` : "Band Offline"}
                  </span>
                </div>

                {/* Live Time */}
                <div className="hidden xl:block text-right metric text-xs text-muted-foreground">
                  <div>
                    {currentTime.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="font-bold text-foreground">
                    {currentTime.toLocaleTimeString("en-GB")}
                  </div>
                </div>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative size-9 rounded-xl border-border/80"
                      aria-label={`Notifications: ${activeAlerts.length} active`}
                    >
                      <Bell className="size-4 text-muted-foreground" />
                      {activeAlerts.length > 0 ? (
                        <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-critical text-[9px] font-bold text-white shadow-xs">
                          {activeAlerts.length}
                        </span>
                      ) : null}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Health Notifications</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {activeAlerts.length} active
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {activeAlerts.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No active health alerts. All metrics stable.
                      </p>
                    ) : (
                      activeAlerts.map((a) => (
                        <DropdownMenuItem
                          key={a.id}
                          className="flex flex-col items-start gap-1 p-2.5"
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="font-bold text-xs text-foreground">{a.type}</span>
                            <span className="metric text-[10px] text-muted-foreground">
                              {a.timestamp.split(" ")[1]}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {a.description}
                          </p>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Page Area */}
          <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6 md:px-8 space-y-6">
            {children}
          </main>
        </div>

        {/* Global AI Health Assistant Component */}
        <AIAssistantDrawer />
      </div>
    </TooltipProvider>
  );
}
