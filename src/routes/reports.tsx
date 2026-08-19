import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Info,
  Layers,
  Moon,
  Printer,
  QrCode,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  Waves,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PATIENTS, DEVICES } from "@/mock/data";
import { useSimulation } from "@/hooks/useSimulation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Personal Health & Wellness Reports — SmartHealth" },
      {
        name: "description",
        content:
          "Explore your personalized health summaries, 7-day fitness progress, sleep recovery scores, and AI wellness coach insights.",
      },
    ],
  }),
  component: ReportsPage,
});

type ReportTypeId = "weekly" | "vitals" | "sleep-recovery" | "activity";
type FocusType = "overall" | "cardio" | "fitness" | "sleep";

const REPORT_TYPES = [
  {
    id: "weekly" as ReportTypeId,
    label: "7-Day Personal Wellness & Body Readiness Summary",
    short: "7-Day Wellness Summary",
    desc: "Holistic overview of resting heart rate, daily activity goals, sleep cycles, and recovery capacity.",
    icon: Sparkles,
    badge: "Most Popular",
  },
  {
    id: "vitals" as ReportTypeId,
    label: "24-Hour Continuous Biometric & Vitals Log",
    short: "24h Vitals History",
    desc: "Hourly pulse rates, blood oxygen levels, blood pressure equilibrium, and skin temperature.",
    icon: HeartPulse,
    badge: "Live Telemetry",
  },
  {
    id: "sleep-recovery" as ReportTypeId,
    label: "Sleep Architecture & Nightly Autonomic Recharge",
    short: "Sleep & Recovery",
    desc: "Deep slow-wave sleep, REM dream states, sleep efficiency score, and nocturnal heart rate dipping.",
    icon: Moon,
    badge: "Recovery Peak",
  },
  {
    id: "activity" as ReportTypeId,
    label: "Weekly Physical Activity & Metabolic Calorie Burn",
    short: "Activity & Energy",
    desc: "Daily step volume, active calorie expenditure, walking distance, and aerobic cardio intensity zones.",
    icon: Flame,
    badge: "Fitness Goals",
  },
];

const PERIODS = ["Last 7 Days", "Last 14 Days", "Last 30 Days", "Current Month"] as const;

const SEVEN_DAY_DATA = [
  {
    day: "Thu",
    date: "13 Aug",
    hr: 59,
    steps: 7200,
    calories: 1820,
    sleep: "7h 15m",
    deepSleep: "1h 40m",
    hrv: 46,
    score: 82,
    status: "Optimal",
  },
  {
    day: "Fri",
    date: "14 Aug",
    hr: 58,
    steps: 8100,
    calories: 1900,
    sleep: "7h 30m",
    deepSleep: "1h 50m",
    hrv: 50,
    score: 86,
    status: "Prime",
  },
  {
    day: "Sat",
    date: "15 Aug",
    hr: 57,
    steps: 6900,
    calories: 1750,
    sleep: "8h 10m",
    deepSleep: "2h 05m",
    hrv: 52,
    score: 84,
    status: "Optimal",
  },
  {
    day: "Sun",
    date: "16 Aug",
    hr: 60,
    steps: 7500,
    calories: 1810,
    sleep: "7h 05m",
    deepSleep: "1h 35m",
    hrv: 44,
    score: 81,
    status: "Optimal",
  },
  {
    day: "Mon",
    date: "17 Aug",
    hr: 58,
    steps: 9200,
    calories: 2050,
    sleep: "7h 45m",
    deepSleep: "1h 55m",
    hrv: 49,
    score: 89,
    status: "Prime",
  },
  {
    day: "Tue",
    date: "18 Aug",
    hr: 56,
    steps: 8400,
    calories: 1920,
    sleep: "7h 40m",
    deepSleep: "1h 52m",
    hrv: 54,
    score: 88,
    status: "Prime",
  },
  {
    day: "Wed",
    date: "19 Aug",
    hr: 58,
    steps: 6824,
    calories: 1840,
    sleep: "7h 28m",
    deepSleep: "1h 48m",
    hrv: 48,
    score: 84,
    status: "Optimal",
  },
];

export function ReportsPage() {
  const { latest } = useSimulation();
  const [reportType, setReportType] = useState<ReportTypeId>("weekly");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Last 7 Days");
  const [focus, setFocus] = useState<FocusType>("overall");
  const [selectedDayIndex, setSelectedDayIndex] = useState(6); // Default to latest day (Wed)

  // Display Options
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAIInsights, setIncludeAIInsights] = useState(true);
  const [includeTable, setIncludeTable] = useState(true);

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;
  const selectedDay = SEVEN_DAY_DATA[selectedDayIndex]!;

  const selectedReport = REPORT_TYPES.find((t) => t.id === reportType)!;
  const bmi = (patient.weightKg / Math.pow(patient.heightCm / 100, 2)).toFixed(1);

  const handleExportPdf = () => {
    toast.success("Preparing your high-resolution wellness report for print / PDF download...");
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Date,Day,HeartRate_BPM,SpO2_Pct,BloodPressure_mmHg,Steps,Active_kcal,Sleep_Hours,HRV_ms,Recovery_Score,Status\n" +
      SEVEN_DAY_DATA.map(
        (d) =>
          `2026-08-${d.date.slice(0, 2)},${d.day},${d.hr},98,118/76,${d.steps},${d.calories},${d.sleep},${d.hrv},${d.score},${d.status}`,
      ).join("\n") +
      "\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `My_Health_Report_${patient.name.replace(/\s+/g, "_")}_20260819.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Health and fitness dataset exported as CSV!");
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Personal health report link copied to clipboard!");
  };

  return (
    <AppShell
      title="Personal Health Reports"
      subtitle="Comprehensive wellness summaries, body readiness scores, activity trends, and AI coach recommendations"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,350px)_minmax(0,1fr)] items-stretch">
        {/* ================================================================ */}
        {/* 1. REPORT BUILDER & CUSTOMIZER CONTROLS */}
        {/* ================================================================ */}
        <div className="rounded-3xl border border-border/80 bg-card p-5.5 shadow-xs flex flex-col justify-between h-full space-y-5">
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Report Customizer</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tailor your metrics, focus area, and download format
                </p>
              </div>
              <span className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="size-4" />
              </span>
            </div>

            {/* QUICK ACTIONS AT TOP FOR INSTANT ACCESSIBILITY */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
              <Button
                className="w-full font-bold text-xs rounded-xl h-10 shadow-sm"
                onClick={handleExportPdf}
              >
                <Printer className="mr-2 size-4" /> Download / Print Report
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold rounded-xl h-8.5 bg-card hover:bg-muted/50"
                  onClick={handleExportCsv}
                >
                  <FileSpreadsheet className="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold rounded-xl h-8.5 bg-card hover:bg-muted/50"
                  onClick={handleShareLink}
                >
                  <Share2 className="mr-1.5 size-3.5 text-primary" /> Share Link
                </Button>
              </div>
            </div>

            {/* Report Type Selector */}
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-bold text-foreground">Select View Category</Label>
              <div className="space-y-1.5">
                {REPORT_TYPES.map((t) => {
                  const active = reportType === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setReportType(t.id)}
                      className={`w-full text-left rounded-2xl p-3 transition-all border text-xs flex items-start gap-3 relative overflow-hidden group ${
                        active
                          ? "bg-primary/10 border-primary text-foreground shadow-xs ring-1 ring-primary/40"
                          : "bg-muted/20 border-border/70 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`p-2 rounded-xl shrink-0 mt-0.5 transition-all ${
                          active
                            ? "bg-primary text-white shadow-xs"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-foreground block text-xs truncate">
                            {t.short}
                          </span>
                          {t.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-primary/15 text-primary border border-primary/20 shrink-0">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block line-clamp-1 mt-0.5">
                          {t.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeframe */}
            <div className="space-y-1.5">
              <Label htmlFor="period-select" className="text-xs font-bold text-foreground">
                Timeframe Window
              </Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <SelectTrigger id="period-select" className="text-xs rounded-xl h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs font-medium">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Highlight Focus Profile */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Report Focus Area</Label>
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-muted/20 p-1 text-xs">
                {[
                  { id: "overall" as FocusType, label: "Wellness", icon: Sparkles },
                  { id: "cardio" as FocusType, label: "Cardio Focus", icon: HeartPulse },
                  { id: "fitness" as FocusType, label: "Strain / Energy", icon: Flame },
                  { id: "sleep" as FocusType, label: "Sleep Recharge", icon: Moon },
                ].map((item) => {
                  const active = focus === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setFocus(item.id)}
                      className={`rounded-xl py-2 px-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Switches */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-xs font-bold text-foreground block mb-1">
                Display Sections
              </Label>

              <label className="flex items-center justify-between text-xs text-foreground cursor-pointer hover:opacity-90">
                <span>Personal Goals & Milestones</span>
                <Switch
                  checked={includeGoals}
                  onCheckedChange={setIncludeGoals}
                  className="scale-75"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-foreground cursor-pointer hover:opacity-90">
                <span>7-Day Progression Trends</span>
                <Switch
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                  className="scale-75"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-foreground cursor-pointer hover:opacity-90">
                <span>AI Health Coach Insights</span>
                <Switch
                  checked={includeAIInsights}
                  onCheckedChange={setIncludeAIInsights}
                  className="scale-75"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-foreground cursor-pointer hover:opacity-90">
                <span>Detailed Metric Tables</span>
                <Switch
                  checked={includeTable}
                  onCheckedChange={setIncludeTable}
                  className="scale-75"
                />
              </label>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. EXECUTIVE PERSONAL HEALTH REPORT PREVIEW */}
        {/* ================================================================ */}
        <div className="rounded-3xl border border-border/90 bg-card p-6.5 shadow-sm space-y-6 flex flex-col justify-between h-full">
          {/* Top Hero Performance Card */}
          <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-background p-5 shadow-xs flex flex-wrap items-center justify-between gap-5">
            <div className="space-y-1.5 flex-1 min-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-primary tracking-tight">SmartHealth</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ● Live Sync Active
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                  {focus === "overall"
                    ? "Full Wellness"
                    : focus === "cardio"
                      ? "Cardio Focus"
                      : focus === "fitness"
                        ? "Strain & Energy"
                        : "Sleep Recharge"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {selectedReport.label}
              </h2>
              <p className="text-xs text-muted-foreground">
                Personal performance dossier for{" "}
                <strong className="text-foreground">{patient.name}</strong> · {period} · Generated
                on 19 Aug 2026
              </p>
            </div>

            {/* Big Circular Readiness Score Visual */}
            <div className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card/90 px-4.5 py-3 shadow-xs">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Weekly Readiness
                </span>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  <span className="metric text-3xl font-black text-primary leading-none">88</span>
                  <span className="text-xs font-bold text-muted-foreground">/ 100</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  ● Prime Recovery
                </span>
              </div>
              <div className="size-13 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <Trophy className="size-6.5 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3.5 rounded-2xl border border-border/80 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                User
              </span>
              <span className="font-bold text-foreground text-xs">
                {patient.name} ({patient.age} yrs, {patient.gender})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Physical Metrics
              </span>
              <span className="font-bold text-foreground text-xs">
                {patient.heightCm} cm · {patient.weightKg} kg (BMI {bmi})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Connected Smart Band
              </span>
              <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                <Cpu className="size-3 text-primary" /> {device.name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Battery & BLE Link
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                84% · BLE 5.3 Active
              </span>
            </div>
          </div>

          {/* SECTION 1: PERSONAL GOALS & STREAKS */}
          {includeGoals && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="size-3.5 text-primary" /> Weekly Habit Milestones & Goal
                  Targets
                </h4>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  4 of 4 Target Goals Achieved
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                {/* Steps */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2.5 shadow-xs hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1.5">
                      <Footprints className="size-3.5 text-primary" /> Daily Steps
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      94%
                    </span>
                  </div>
                  <div>
                    <span className="metric text-xl font-black text-foreground">7,480</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Goal: 8,000 steps / day
                    </span>
                  </div>
                  <Progress value={94} className="h-1.5 bg-muted" />
                </div>

                {/* Active Calories */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2.5 shadow-xs hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1.5">
                      <Flame className="size-3.5 text-amber-500" /> Active Burn
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      91%
                    </span>
                  </div>
                  <div>
                    <span className="metric text-xl font-black text-foreground">1,820 kcal</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Goal: 2,000 kcal / day
                    </span>
                  </div>
                  <Progress value={91} className="h-1.5 bg-muted" />
                </div>

                {/* Sleep Duration */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2.5 shadow-xs hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1.5">
                      <Moon className="size-3.5 text-indigo-500" /> Sleep Duration
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      99%
                    </span>
                  </div>
                  <div>
                    <span className="metric text-xl font-black text-foreground">7h 28m</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Goal: 7h 30m / night
                    </span>
                  </div>
                  <Progress value={99} className="h-1.5 bg-muted" />
                </div>

                {/* Resting Pulse */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2.5 shadow-xs hover:border-rose-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1.5">
                      <HeartPulse className="size-3.5 text-rose-500" /> Resting Pulse
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Optimal
                    </span>
                  </div>
                  <div>
                    <span className="metric text-xl font-black text-rose-600 dark:text-rose-400">
                      58 BPM
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Target: &lt; 60 BPM
                    </span>
                  </div>
                  <Progress value={100} className="h-1.5 bg-muted" />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INTERACTIVE 7-DAY PROGRESSION MATRIX */}
          {includeCharts && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="size-3.5 text-primary" /> 7-Day Day-by-Day Performance Matrix
                </h4>
                <span className="text-[10px] text-muted-foreground">
                  Click a day card to inspect details
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5 text-center text-xs">
                {SEVEN_DAY_DATA.map((d, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`rounded-2xl p-3 border transition-all text-left space-y-2 ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/40"
                          : "bg-muted/20 border-border/70 hover:bg-muted/50 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-foreground">{d.day}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">{d.date}</span>
                      </div>
                      <div>
                        <span className="metric text-sm font-black text-rose-600 dark:text-rose-400 block">
                          {d.hr} bpm
                        </span>
                        <span className="text-[9px] text-muted-foreground block">Resting HR</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, (d.steps / 9500) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="metric font-bold text-foreground">
                          {d.steps.toLocaleString()}
                        </span>
                        <span className="text-indigo-500 font-bold">{d.sleep}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Inspector Spotlight */}
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shadow-xs">
                    {selectedDay.day}
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-xs">
                      Daily Inspection: {selectedDay.day}, {selectedDay.date} 2026
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Body Recovery Status:{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {selectedDay.status} ({selectedDay.score}/100)
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <Footprints className="size-3.5 text-primary" />
                    <strong>{selectedDay.steps.toLocaleString()}</strong> steps
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame className="size-3.5 text-amber-500" />
                    <strong>{selectedDay.calories}</strong> kcal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Moon className="size-3.5 text-indigo-500" />
                    <strong>{selectedDay.sleep}</strong> sleep ({selectedDay.deepSleep} deep)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Waves className="size-3.5 text-sky-500" />
                    HRV: <strong>{selectedDay.hrv} ms</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DETAILED VITALS SUMMARY TABLE */}
          {includeTable && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="size-3.5 text-primary" /> Body Vitals & Physiological
                Baseline
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-border/80">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 bg-muted/30">
                      <TableHead className="text-xs font-bold">Biometric Metric</TableHead>
                      <TableHead className="text-xs font-bold">Your 7-Day Average</TableHead>
                      <TableHead className="text-xs font-bold">Healthy Range</TableHead>
                      <TableHead className="text-xs font-bold">Your Target</TableHead>
                      <TableHead className="text-xs font-bold">Status Assessment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        param: "Resting Heart Rate",
                        value: "58 BPM",
                        range: "52 – 64 BPM",
                        target: "50 – 65 BPM",
                        status: "Optimal Cardio Fitness",
                        tone: "normal",
                      },
                      {
                        param: "Active Day Pulse",
                        value: "74 BPM",
                        range: "61 – 118 BPM",
                        target: "60 – 100 BPM",
                        status: "Steady & Controlled",
                        tone: "normal",
                      },
                      {
                        param: "Blood Oxygen (SpO₂)",
                        value: "98.2%",
                        range: "96 – 99%",
                        target: "95 – 100%",
                        status: "Excellent Arterial Oxygen",
                        tone: "normal",
                      },
                      {
                        param: "Blood Pressure",
                        value: "118 / 76 mmHg",
                        range: "112/70 – 124/80",
                        target: "< 120/80 mmHg",
                        status: "Healthy Normotensive",
                        tone: "normal",
                      },
                      {
                        param: "HRV RMSSD (Recovery)",
                        value: "48 ms",
                        range: "38 – 58 ms",
                        target: "> 35 ms",
                        status: "High Autonomic Resilience",
                        tone: "normal",
                      },
                      {
                        param: "Skin Temperature",
                        value: "36.8 °C",
                        range: "36.4 – 37.1 °C",
                        target: "36.1 – 37.2 °C",
                        status: "Balanced Thermoregulation",
                        tone: "normal",
                      },
                    ].map((row) => (
                      <TableRow key={row.param} className="border-border/60 hover:bg-muted/10">
                        <TableCell className="font-bold text-xs text-foreground">
                          {row.param}
                        </TableCell>
                        <TableCell className="metric text-xs font-black text-foreground">
                          {row.value}
                        </TableCell>
                        <TableCell className="metric text-xs text-muted-foreground">
                          {row.range}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.target}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ● {row.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* SECTION 4: SLEEP STAGE QUALITY BREAKDOWN */}
          {reportType === "sleep-recovery" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="size-3.5 text-primary" /> Sleep Stages & Nightly Recharge
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-3.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Deep Sleep (N3)
                  </span>
                  <span className="metric text-lg font-black text-indigo-600 dark:text-indigo-400 block mt-0.5">
                    1h 48m (24%)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    ● Physical Restoration
                  </span>
                </div>
                <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-3.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    REM Dream Sleep
                  </span>
                  <span className="metric text-lg font-black text-sky-600 dark:text-sky-400 block mt-0.5">
                    1h 45m (24%)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    ● Cognitive Refresh
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-500/30 bg-slate-500/5 p-3.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Light Sleep (N1/N2)
                  </span>
                  <span className="metric text-lg font-black text-foreground block mt-0.5">
                    3h 51m (52%)
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Physical Maintenance
                  </span>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Awake Interludes
                  </span>
                  <span className="metric text-lg font-black text-amber-500 block mt-0.5">
                    18 min (4%)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    ● Minimal Disruptions
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: AI HEALTH COACH RECOMMENDATIONS */}
          {includeAIInsights && (
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/5 via-card to-background p-4.5 text-xs text-foreground space-y-3">
              <div className="flex items-center justify-between font-bold text-primary">
                <span className="flex items-center gap-1.5 text-xs">
                  <Sparkles className="size-4 text-primary" /> AI Health Coach Personalized
                  Recommendations
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Synthesized for {patient.name}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 text-[11px] text-muted-foreground">
                <div className="rounded-xl bg-card p-3 border border-border/70 space-y-1 shadow-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    🏃 Training Readiness
                  </span>
                  <p>
                    Your step volume and resting HR are primed. With 7,480 daily steps and 58 bpm
                    pulse, you are cleared for high-intensity cardio or resistance work.
                  </p>
                </div>
                <div className="rounded-xl bg-card p-3 border border-border/70 space-y-1 shadow-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    🌙 Sleep Optimization
                  </span>
                  <p>
                    Deep sleep reached 24% (1h 48m) with a 12% nocturnal pulse dip. Maintaining your
                    10:30 PM bedtime will sustain your 88/100 readiness score.
                  </p>
                </div>
                <div className="rounded-xl bg-card p-3 border border-border/70 space-y-1 shadow-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    💧 Hydration & Recovery
                  </span>
                  <p>
                    HRV RMSSD averaged 48 ms, signifying strong autonomic balance. Keep morning
                    hydration steady to preserve peak blood oxygen levels.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
