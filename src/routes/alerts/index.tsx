import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  Info,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SeverityBadge, StatusBadge, SignalQualityIndicator } from "@/components/common/indicators";
import { setAlertStatus, useAlerts } from "@/hooks/useAlerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/alerts/")({
  head: () => ({
    meta: [
      { title: "Alerts & Incident Log — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Real-time health alert center with threshold crossing notifications, on-device AI anomalies, and resolution actions.",
      },
    ],
  }),
  component: AlertsPage,
});

const TABS = ["All", "Critical", "Warning", "Resolved"] as const;

export function AlertsPage() {
  const alerts = useAlerts();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const patientAlerts = alerts.filter(
    (a) => a.patientId === "USR-00124" || a.patientId === "PT-00124",
  );

  const filtered = patientAlerts.filter((a) => {
    const matchesTab =
      tab === "All"
        ? true
        : tab === "Resolved"
          ? a.status === "Resolved"
          : a.severity === tab && a.status !== "Resolved";

    const matchesSearch =
      searchQuery.trim() === "" ||
      `${a.id} ${a.type} ${a.description}`.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const criticalCount = alerts.filter(
    (a) => a.severity === "Critical" && a.status !== "Resolved",
  ).length;
  const warningCount = alerts.filter(
    (a) => a.severity === "Warning" && a.status !== "Resolved",
  ).length;

  return (
    <AppShell
      title="Alerts & Incident Center"
      subtitle="Real-time biometric threshold notifications and on-device ARM AI event indications"
    >
      {/* 1. ALERT STATS TOP CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-critical flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Critical Alarms
            </span>
            <div className="metric text-2xl font-black text-critical mt-0.5">{criticalCount}</div>
            <p className="text-[11px] text-muted-foreground">Immediate action required</p>
          </div>
          <AlertOctagon className="size-6 text-critical" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-amber-500 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Warning Notices
            </span>
            <div className="metric text-2xl font-black text-amber-500 mt-0.5">{warningCount}</div>
            <p className="text-[11px] text-muted-foreground">Biometric drift detected</p>
          </div>
          <AlertTriangle className="size-6 text-amber-500" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-sky-500 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Monitored Events
            </span>
            <div className="metric text-2xl font-black text-foreground mt-0.5">{alerts.length}</div>
            <p className="text-[11px] text-muted-foreground">In past 24-hour window</p>
          </div>
          <Bell className="size-6 text-primary" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-emerald-500 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Resolved Events
            </span>
            <div className="metric text-2xl font-black text-normal mt-0.5">
              {alerts.filter((a) => a.status === "Resolved").length}
            </div>
            <p className="text-[11px] text-muted-foreground">Acknowledged & cleared</p>
          </div>
          <CheckCircle2 className="size-6 text-normal" />
        </div>
      </div>

      {/* 2. FILTER TABS & SEARCH BAR */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-3.5">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="rounded-xl">
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t} className="text-xs rounded-lg font-semibold">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full max-w-xs">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts by ID or parameter..."
              className="pl-9 text-xs h-9 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Alerts Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs font-bold">Alert ID</TableHead>
                <TableHead className="text-xs font-bold">Timestamp</TableHead>
                <TableHead className="text-xs font-bold">Observed Value</TableHead>
                <TableHead className="text-xs font-bold">Severity</TableHead>
                <TableHead className="text-xs min-w-[200px] font-bold">Description</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
                <TableHead className="text-right text-xs font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="border-border/60 hover:bg-muted/30">
                  <TableCell className="metric text-xs font-bold text-foreground whitespace-nowrap">
                    {a.id}
                  </TableCell>
                  <TableCell className="metric text-xs text-muted-foreground whitespace-nowrap">
                    {a.timestamp.split(" ")[1]}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="metric text-xs font-bold text-foreground block">
                      {a.observedValue || a.type}
                    </span>
                    {a.threshold ? (
                      <span className="text-[10px] text-muted-foreground">
                        Baseline: {a.threshold}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={a.severity} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-sm">
                    {a.description}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      tone={
                        a.status === "Resolved"
                          ? "normal"
                          : a.status === "Acknowledged"
                            ? "info"
                            : "warning"
                      }
                      showIcon={false}
                      className="text-[10px] font-bold"
                    >
                      {a.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 rounded-lg font-semibold"
                        disabled={a.status !== "Active"}
                        onClick={() => {
                          setAlertStatus(a.id, "Acknowledged");
                          toast.success(`${a.id} acknowledged`);
                        }}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 rounded-lg font-semibold text-normal hover:bg-normal-soft"
                        disabled={a.status === "Resolved"}
                        onClick={() => {
                          setAlertStatus(a.id, "Resolved");
                          toast.success(`${a.id} marked as resolved`);
                        }}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 rounded-lg font-semibold"
                        asChild
                      >
                        <Link to="/alerts/$id" params={{ id: a.id }}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-xs text-muted-foreground"
                  >
                    No active alerts in this category. All biometric channels are within designated
                    limits.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
