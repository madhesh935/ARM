import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  ChevronRight,
  Droplets,
  HeartPulse,
  History,
  Moon,
  Smile,
  Sparkles,
  Thermometer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RealtimeChart } from "@/components/charts/charts";
import { fmt, historyFor, stats, trendSentence } from "@/lib/analysis";
import { PATIENTS } from "@/mock/data";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Health History & Trends — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Multi-parameter long-term physiological trends, descriptive statistics, and longitudinal cohort comparison.",
      },
    ],
  }),
  component: HealthHistoryPage,
});

const RANGES = [
  { id: "today", label: "Today" },
  { id: "24h", label: "24 Hours" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "3m", label: "3 Months" },
  { id: "custom", label: "Custom Date" },
] as const;

const SERIES = [
  {
    key: "heartRate",
    label: "Heart Rate",
    unit: "BPM",
    color: "var(--color-chart-5)",
    normal: "60–100 BPM",
  },
  {
    key: "spo2",
    label: "Blood Oxygen (SpO₂)",
    unit: "%",
    color: "var(--color-chart-1)",
    normal: "95–100%",
  },
  {
    key: "temperature",
    label: "Body Temperature",
    unit: "°C",
    color: "var(--color-chart-4)",
    normal: "36.1–37.2 °C",
  },
  {
    key: "activity",
    label: "Motion Activity",
    unit: "G-force",
    color: "var(--color-chart-3)",
    normal: "0.1–1.0",
  },
  {
    key: "anomalyScore",
    label: "AI Anomaly Score",
    unit: "index",
    color: "var(--color-chart-2)",
    normal: "< 0.50",
  },
] as const;

export function HealthHistoryPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("7d");
  const [compare, setCompare] = useState(false);

  const effective = range === "custom" || range === "3m" ? "30d" : range;
  const current = useMemo(() => historyFor(effective), [effective]);
  const previous = useMemo(() => historyFor(effective, 1), [effective]);

  const patient = PATIENTS[0]!;

  const merged = current.map((row, i) => ({
    ...row,
    prevHeartRate: previous[i]?.heartRate,
    prevSpo2: previous[i]?.spo2,
    prevTemperature: previous[i]?.temperature,
    prevActivity: previous[i]?.activity,
    prevAnomalyScore: previous[i]?.anomalyScore,
  }));

  return (
    <AppShell
      title="Health History & Longitudinal Trends"
      subtitle={`Long-term biometric analytics and multi-parameter trajectory for ${patient.name}`}
    >
      {/* 1. TIMEFRAME & COMPARISON FILTER BAR */}
      <div className="rounded-2xl border border-border bg-card p-4.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-border/80 bg-muted/30 px-3 py-1.5">
              <span className="text-[9px] font-bold text-muted-foreground block uppercase">
                User Account
              </span>
              <span className="text-xs font-bold text-foreground">
                {patient.name}{" "}
                <span className="metric text-muted-foreground font-normal">({patient.id})</span>
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/20 p-1">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    range === r.id
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {range === "custom" ? (
              <div className="flex items-center gap-2">
                <Input
                  id="from"
                  type="date"
                  className="h-8 text-xs w-32 rounded-lg"
                  defaultValue="2026-08-01"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  id="to"
                  type="date"
                  className="h-8 text-xs w-32 rounded-lg"
                  defaultValue="2026-08-17"
                />
              </div>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
            <Switch checked={compare} onCheckedChange={setCompare} className="scale-80" />
            <span>Compare with Previous Period</span>
          </label>
        </div>
      </div>

      {/* 2. DESCRIPTIVE STATISTICAL SUMMARY TABLE */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Descriptive Statistical Summary</h3>
            <p className="text-xs text-muted-foreground">
              Calculated across {current.length} historical sample intervals in the selected
              timeframe
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">All Baselines Verified</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs font-bold">Parameter</TableHead>
                <TableHead className="text-xs font-bold">Target Range</TableHead>
                <TableHead className="text-xs font-bold">Average</TableHead>
                <TableHead className="text-xs font-bold">Minimum</TableHead>
                <TableHead className="text-xs font-bold">Maximum</TableHead>
                <TableHead className="text-xs font-bold">Std. Dev</TableHead>
                {compare ? <TableHead className="text-xs font-bold">Prev Avg</TableHead> : null}
                <TableHead className="text-xs font-bold">Trend Evaluation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERIES.map((s) => {
                const vals = current.map((r) => r[s.key] as number);
                const st = stats(vals);
                const prev = stats(previous.map((r) => r[s.key] as number));

                return (
                  <TableRow key={s.key} className="border-border/60 hover:bg-muted/30">
                    <TableCell className="font-bold text-xs text-foreground">
                      {s.label}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({s.unit})
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.normal}</TableCell>
                    <TableCell className="metric text-xs font-bold text-foreground">
                      {fmt(st.avg, 2)}
                    </TableCell>
                    <TableCell className="metric text-xs text-muted-foreground">
                      {fmt(st.min, 2)}
                    </TableCell>
                    <TableCell className="metric text-xs text-muted-foreground">
                      {fmt(st.max, 2)}
                    </TableCell>
                    <TableCell className="metric text-xs text-muted-foreground">
                      {fmt(st.sd, 3)}
                    </TableCell>
                    {compare ? (
                      <TableCell className="metric text-xs text-primary font-bold">
                        {fmt(prev.avg, 2)}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-xs text-normal font-semibold">
                      ● Stable Baseline
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. MULTI-PARAMETER HISTORICAL TREND CHARTS */}
      <div className="grid gap-5 lg:grid-cols-2">
        {SERIES.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <h3 className="text-sm font-bold text-foreground">{s.label} Longitudinal Curve</h3>
              <span className="text-xs text-muted-foreground font-medium">{s.normal}</span>
            </div>

            <RealtimeChart
              data={merged}
              series={
                compare
                  ? [
                      { key: s.key, label: `${s.label} (Current)`, color: s.color },
                      {
                        key: `prev${s.key.charAt(0).toUpperCase()}${s.key.slice(1)}`,
                        label: `${s.label} (Previous)`,
                        color: "#94a3b8",
                      },
                    ]
                  : [{ key: s.key, label: `${s.label} (${s.unit})`, color: s.color }]
              }
              height={200}
            />

            <p className="rounded-xl bg-muted/30 p-2.5 text-xs text-muted-foreground border border-border/60 leading-relaxed">
              {trendSentence(
                s.label,
                current.map((r) => r[s.key] as number),
                s.unit,
              )}
            </p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
