import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Battery,
  Bed,
  Bluetooth,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Eye,
  FileText,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  History,
  Info,
  Layers,
  MapPin,
  Moon,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Smile,
  Sparkles,
  Thermometer,
  TrendingUp,
  User,
  Waves,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import {
  StatusBadge,
  SeverityBadge,
  BatteryIndicator,
  LiveDot,
} from "@/components/common/indicators";
import { RealtimeChart } from "@/components/charts/charts";
import { useSimulation } from "@/hooks/useSimulation";
import { PATIENTS, DEVICES, ALERTS } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Personal Health Cockpit — SmartHealth" },
      {
        name: "description",
        content:
          "High-density personal health telemetry cockpit: real-time biometrics, on-device ARM edge AI inference, ECG monitoring, sleep architecture, and activity tracking.",
      },
    ],
  }),
  component: DashboardPage,
});

export function DashboardPage() {
  const {
    latest,
    samples,
    connected,
    activity,
    emergencyActive,
    lastSyncSecondsAgo,
    resetEmergencySimulation,
  } = useSimulation();

  const [activeTrendMetric, setActiveTrendMetric] = useState<"hr" | "spo2" | "temp" | "bp">("hr");

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;

  const hr = latest?.heartRate ?? 76;
  const spo2 = latest?.spo2 ?? 98;
  const temp = latest?.temperature ?? 36.8;
  const sys = latest?.systolic ?? 118;
  const dia = latest?.diastolic ?? 76;
  const steps = latest?.steps ?? 6824;
  const calories = latest?.calories ?? 1840;
  const stress = latest?.stress ?? 24;
  const battery = latest?.battery ?? device.battery;

  // Status tone calculations
  const hrTone = hr > 120 ? "critical" : hr > 100 ? "warning" : "normal";
  const hrStatus = hr > 120 ? "Tachycardia" : hr > 100 ? "Elevated" : "Optimal (60–100)";

  const spo2Tone = spo2 < 90 ? "critical" : spo2 < 95 ? "warning" : "normal";
  const spo2Status = spo2 < 90 ? "Low Oxygen" : spo2 < 95 ? "Borderline" : "Optimal (95–100%)";

  const tempTone = temp > 38.0 ? "critical" : temp > 37.5 ? "warning" : "normal";
  const tempStatus = temp > 38.0 ? "High Fever" : temp > 37.5 ? "Elevated" : "Normal Euthermic";

  const bpTone = sys > 140 || dia > 90 ? "warning" : "normal";
  const bpStatus = sys > 140 || dia > 90 ? "Pre-Hypertension" : "Optimal (<120/80)";

  // Format sample series for multi-metric chart
  const recentChartData = useMemo(() => {
    const slice = samples.slice(-30);
    return slice.map((s) => ({
      time: s.time,
      hr: s.heartRate,
      spo2: s.spo2,
      temp: s.temperature,
      systolic: s.systolic,
      diastolic: s.diastolic,
      stress: s.stress,
    }));
  }, [samples]);

  const activeAlertsCount = ALERTS.filter((a) => a.status === "Active").length;

  return (
    <AppShell
      title="Health Cockpit"
      subtitle={`Live biometrics & continuous wearable telemetry for ${patient.name}`}
    >
      {/* Emergency Active Alert Banner */}
      {emergencyActive ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-critical bg-critical-soft p-4 text-critical shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-critical text-white shadow-xs">
              <ShieldAlert className="size-6" />
            </span>
            <div>
              <h3 className="text-sm font-bold">
                CRITICAL EMERGENCY — Fall Detected with Tachycardia
              </h3>
              <p className="text-xs opacity-90">
                Automated SOS broadcast active to emergency contacts (Leela Menon, Rahul Menon) and
                911 relay.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-card text-foreground"
              onClick={() => {
                resetEmergencySimulation();
                toast.success("Emergency alarm dismissed");
              }}
            >
              <RotateCcw className="mr-1.5 size-3.5" /> Dismiss Alarm
            </Button>
            <Button size="sm" variant="destructive" asChild>
              <Link to="/emergency">Open Emergency Console</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {/* 1. TOP HERO ROW: Dedicated Health Score Card (Left) + 4 Primary Vitals Grid (Right) */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
        {/* DEDICATED HEALTH SCORE & WEARABLE INSIGHTS BOX */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-xs flex flex-col justify-between space-y-3.5">
          <div className="space-y-3">
            {/* Header: Title on Left, Score Ring & Prime Readiness on Right */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Health & Recovery Score</h3>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Continuous ARM Edge Telemetry
                  </span>
                </div>
              </div>

              {/* Integrated Top-Right Score Dial & Prime Readiness */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 block">
                    Prime Readiness
                  </span>
                  <span className="text-[9px] text-muted-foreground metric">84 / 100 Score</span>
                </div>
                <div className="relative size-12 flex items-center justify-center shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="stroke-muted/40"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="stroke-primary transition-all duration-1000 ease-out"
                      strokeWidth="9"
                      strokeDasharray={238.76}
                      strokeDashoffset={238.76 * (1 - 84 / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute metric text-xs font-extrabold text-foreground">84</span>
                </div>
              </div>
            </div>

            {/* 4 Comprehensive Physiological Recovery Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Tile 1: Cardio */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 shadow-2xs hover:border-rose-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Heart className="size-3.5 text-rose-500 animate-pulse" /> Cardio Workload
                  </span>
                  <span className="metric text-[11px] font-extrabold text-rose-600 dark:text-rose-400">
                    92%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Resting: <strong className="text-foreground font-semibold">58 BPM</strong> (↓2 vs
                  7d avg) · Minimal load
                </p>
                <Progress value={92} className="h-1.5 bg-rose-500/10" />
              </div>

              {/* Tile 2: Sleep */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 shadow-2xs hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Moon className="size-3.5 text-indigo-500" /> Sleep Quality
                  </span>
                  <span className="metric text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                    88%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  <strong className="text-foreground font-semibold">7h 24m</strong> · 1h 48m Deep
                  (24%) · 91% eff.
                </p>
                <Progress value={88} className="h-1.5 bg-indigo-500/10" />
              </div>

              {/* Tile 3: Activity */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 shadow-2xs hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Footprints className="size-3.5 text-emerald-500" /> Daily Target
                  </span>
                  <span className="metric text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    85%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  <strong className="text-foreground font-semibold">
                    {steps.toLocaleString()}
                  </strong>{" "}
                  / 8,000 steps (85%)
                </p>
                <Progress value={85} className="h-1.5 bg-emerald-500/10" />
              </div>

              {/* Tile 4: Autonomic Stress & HRV */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 shadow-2xs hover:border-amber-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Smile className="size-3.5 text-amber-500" /> Autonomic HRV
                  </span>
                  <span className="metric text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    82%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  HRV: <strong className="text-foreground font-semibold">48 ms</strong> (↑6 ms) ·
                  Stress: {stress}/100
                </p>
                <Progress value={82} className="h-1.5 bg-amber-500/10" />
              </div>
            </div>

            {/* Smart Actionable Guidance */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground font-semibold">AI Recommendation:</strong>{" "}
                Physiological recovery is prime today. Great window for moderate physical activity
                or an evening walk to hit your 8,000 step goal.
              </p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Radio className="size-3 text-primary" /> {device.name}
            </span>
            <span className="metric">Sync {lastSyncSecondsAgo}s ago</span>
          </div>
        </div>

        {/* 4 PRIMARY VITALS 2x2 GRID */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Vital 1: Heart Rate */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-rose-500/40 hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
                  <HeartPulse className="size-4.5 animate-pulse" />
                </span>
                <div>
                  <span className="text-xs font-bold text-foreground">Heart Rate</span>
                  <p className="text-[10px] text-muted-foreground font-medium">Optical PPG</p>
                </div>
              </div>
              <StatusBadge tone={hrTone} showIcon={false} className="text-[10px] px-2 py-0.5">
                {hrStatus}
              </StatusBadge>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="metric text-3xl font-extrabold text-foreground tracking-tight">
                  {hr}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase">BPM</span>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <span>24h Range</span>
                <div className="metric font-bold text-foreground">56 – 124 BPM</div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Resting: <strong className="text-foreground font-semibold">58 BPM</strong>
                </span>
                <span>
                  HRV: <strong className="text-foreground font-semibold">48 ms</strong>
                </span>
              </div>
              <Progress value={Math.min(100, (hr / 140) * 100)} className="h-1.5 bg-rose-500/10" />
            </div>
          </div>

          {/* Vital 2: Blood Oxygen (SpO2) */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-sky-500/40 hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-sky-500/10 text-sky-500">
                  <Droplets className="size-4.5" />
                </span>
                <div>
                  <span className="text-xs font-bold text-foreground">Blood Oxygen</span>
                  <p className="text-[10px] text-muted-foreground font-medium">Red/IR Sensor</p>
                </div>
              </div>
              <StatusBadge tone={spo2Tone} showIcon={false} className="text-[10px] px-2 py-0.5">
                {spo2Status}
              </StatusBadge>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="metric text-3xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight">
                  {spo2}%
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase">SpO₂</span>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <span>Perfusion</span>
                <div className="metric font-bold text-foreground">PI: 4.8%</div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Signal: <strong className="text-normal font-semibold">Excellent</strong>
                </span>
                <span>
                  Min: <strong className="text-foreground font-semibold">96%</strong>
                </span>
              </div>
              <Progress value={spo2} className="h-1.5 bg-sky-500/10" />
            </div>
          </div>

          {/* Vital 3: Body Temperature */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-amber-500/40 hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Thermometer className="size-4.5" />
                </span>
                <div>
                  <span className="text-xs font-bold text-foreground">Body Temperature</span>
                  <p className="text-[10px] text-muted-foreground font-medium">Skin Thermistor</p>
                </div>
              </div>
              <StatusBadge tone={tempTone} showIcon={false} className="text-[10px] px-2 py-0.5">
                {tempStatus}
              </StatusBadge>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="metric text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                  {temp.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-muted-foreground">°C</span>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <span>Fahrenheit</span>
                <div className="metric font-bold text-foreground">
                  {((temp * 9) / 5 + 32).toFixed(1)} °F
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Baseline: <strong className="text-foreground font-semibold">36.5–37.2°C</strong>
                </span>
                <span>
                  Drift: <strong className="text-normal font-semibold">0.0°C</strong>
                </span>
              </div>
              <Progress
                value={Math.min(100, ((temp - 35) / 5) * 100)}
                className="h-1.5 bg-amber-500/10"
              />
            </div>
          </div>

          {/* Vital 4: Blood Pressure */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-indigo-500/40 hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Activity className="size-4.5" />
                </span>
                <div>
                  <span className="text-xs font-bold text-foreground">Blood Pressure</span>
                  <p className="text-[10px] text-muted-foreground font-medium">PTT Wave Analysis</p>
                </div>
              </div>
              <StatusBadge tone={bpTone} showIcon={false} className="text-[10px] px-2 py-0.5">
                {bpStatus}
              </StatusBadge>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="metric text-3xl font-extrabold text-foreground tracking-tight">
                  {sys}/{dia}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase">mmHg</span>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <span>Mean Arterial</span>
                <div className="metric font-bold text-foreground">
                  {Math.round(dia + (sys - dia) / 3)} mmHg
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Systolic: <strong className="text-foreground font-semibold">{sys}</strong>
                </span>
                <span>
                  Diastolic: <strong className="text-foreground font-semibold">{dia}</strong>
                </span>
              </div>
              <Progress
                value={Math.min(100, (sys / 160) * 100)}
                className="h-1.5 bg-indigo-500/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE BIOMETRIC TELEMETRY GRAPH & STREAM ANALYZER */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Waves className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                Continuous Biometric Telemetry
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time physiological multi-parameter waveform and trend stream
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/30 p-1">
            {[
              { id: "hr", label: "Heart Rate (BPM)", color: "text-rose-500" },
              { id: "spo2", label: "Oxygen (SpO₂ %)", color: "text-sky-500" },
              { id: "temp", label: "Temperature (°C)", color: "text-amber-500" },
              { id: "bp", label: "Blood Pressure", color: "text-indigo-500" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTrendMetric(tab.id as typeof activeTrendMetric)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTrendMetric === tab.id
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={activeTrendMetric === tab.id ? tab.color : ""}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <div className="pt-2">
          {activeTrendMetric === "hr" && (
            <RealtimeChart
              data={recentChartData}
              xKey="time"
              series={[{ key: "hr", label: "Heart Rate (BPM)", color: "var(--color-chart-5)" }]}
              height={260}
            />
          )}

          {activeTrendMetric === "spo2" && (
            <RealtimeChart
              data={recentChartData}
              xKey="time"
              series={[
                { key: "spo2", label: "Blood Oxygen (SpO₂ %)", color: "var(--color-chart-1)" },
              ]}
              height={260}
            />
          )}

          {activeTrendMetric === "temp" && (
            <RealtimeChart
              data={recentChartData}
              xKey="time"
              series={[
                { key: "temp", label: "Body Temperature (°C)", color: "var(--color-chart-4)" },
              ]}
              height={260}
            />
          )}

          {activeTrendMetric === "bp" && (
            <RealtimeChart
              data={recentChartData}
              xKey="time"
              series={[
                { key: "systolic", label: "Systolic (mmHg)", color: "var(--color-chart-6)" },
                { key: "diastolic", label: "Diastolic (mmHg)", color: "var(--color-chart-2)" },
              ]}
              height={260}
            />
          )}
        </div>
      </div>

      {/* 3. HOLISTIC LIFESTYLE & RECOVERY MATRIX (3-Column Clean Composition) */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Column 1: Daily Activity & Energy Burn */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Footprints className="size-4.5 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Daily Activity Target</h4>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/activity">
                  Details <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="metric text-3xl font-extrabold text-foreground">
                    {steps.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1.5">/ 8,000 steps</span>
                </div>
                <span className="metric font-bold text-primary text-sm">
                  {Math.min(100, Math.round((steps / 8000) * 100))}%
                </span>
              </div>

              <Progress value={(steps / 8000) * 100} className="h-2" />

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-muted/40 p-2.5 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Active Calories
                  </span>
                  <span className="metric font-bold text-amber-500 text-sm mt-0.5 block">
                    {calories} kcal
                  </span>
                </div>
                <div className="rounded-xl bg-muted/40 p-2.5 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Distance
                  </span>
                  <span className="metric font-bold text-foreground text-sm mt-0.5 block">
                    {(steps * 0.00075).toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Active Motion Intensity:</span>
            <strong className="text-foreground font-semibold uppercase">{activity}</strong>
          </div>
        </div>

        {/* Column 2: Sleep Architecture & Nocturnal Recovery */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Moon className="size-4.5 text-indigo-500" />
                <h4 className="text-sm font-bold text-foreground">Sleep Architecture</h4>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/sleep">
                  Details <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="metric text-3xl font-extrabold text-foreground">7h 24m</span>
                  <span className="text-xs text-muted-foreground ml-1.5">total sleep</span>
                </div>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Score: 84
                </span>
              </div>

              {/* Hypnogram Stage Mini Bar */}
              <div className="h-3 w-full rounded-full overflow-hidden flex">
                <div
                  style={{ width: "24%" }}
                  className="bg-indigo-700"
                  title="Deep Sleep 1h 48m (24%)"
                />
                <div
                  style={{ width: "52%" }}
                  className="bg-indigo-400"
                  title="Light Sleep 3h 51m (52%)"
                />
                <div
                  style={{ width: "20%" }}
                  className="bg-sky-400"
                  title="REM Sleep 1h 45m (20%)"
                />
                <div style={{ width: "4%" }} className="bg-amber-400" title="Awake 18m (4%)" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="rounded-xl bg-muted/40 p-2 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">Deep</span>
                  <span className="font-bold text-foreground metric">1h 48m</span>
                </div>
                <div className="rounded-xl bg-muted/40 p-2 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">REM</span>
                  <span className="font-bold text-foreground metric">1h 45m</span>
                </div>
                <div className="rounded-xl bg-muted/40 p-2 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">Light</span>
                  <span className="font-bold text-foreground metric">3h 51m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Sleep Efficiency:</span>
            <strong className="text-normal font-semibold">91% (Optimal)</strong>
          </div>
        </div>

        {/* Column 3: Stress & Autonomic Recovery */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Smile className="size-4.5 text-amber-500" />
                <h4 className="text-sm font-bold text-foreground">Autonomic Recovery & HRV</h4>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/trends">
                  Trends <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="metric text-3xl font-extrabold text-foreground">{stress}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">/ 100</span>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Relaxed Tone
                </span>
              </div>

              <Progress value={stress} className="h-2 bg-emerald-500/20" />

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-muted/40 p-2.5 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    HRV Balance
                  </span>
                  <span className="metric font-bold text-foreground text-sm mt-0.5 block">
                    48 ms RMSSD
                  </span>
                </div>
                <div className="rounded-xl bg-muted/40 p-2.5 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Respiration
                  </span>
                  <span className="metric font-bold text-foreground text-sm mt-0.5 block">
                    14 br / min
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Autonomic State:</span>
            <strong className="text-normal font-semibold">High Parasympathetic Tone</strong>
          </div>
        </div>
      </div>

      {/* 4. FULL-WIDTH RECENT WEARABLE OBSERVATIONS & TELEMETRY LOG */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                Recent Wearable Observations & Anomaly Log
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Continuous on-device heuristic observations, anomaly detection, and baseline threshold
              logs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground border border-border">
              <Radio className="size-3 text-primary" /> {device.name} (ARM Cortex-M55)
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/alerts" className="text-xs text-primary font-bold">
                View All Alerts ({activeAlertsCount}) <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Event Type</th>
                <th className="pb-3 font-semibold">Observation & Context</th>
                <th className="pb-3 font-semibold">Sensor Source</th>
                <th className="pb-3 font-semibold">Observed Value</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {ALERTS.slice(0, 5).map((alert) => (
                <tr key={alert.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 metric font-medium text-muted-foreground whitespace-nowrap">
                    {alert.timestamp}
                  </td>
                  <td className="py-3.5 font-bold text-foreground whitespace-nowrap">
                    {alert.type}
                  </td>
                  <td className="py-3.5 text-muted-foreground max-w-md">
                    <p className="line-clamp-1">{alert.description}</p>
                  </td>
                  <td className="py-3.5 text-muted-foreground whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[10px] font-medium border border-border/60">
                      <Cpu className="size-2.5 text-primary" />
                      {alert.type.includes("Fall") || alert.type.includes("Motion")
                        ? "6-Axis MEMS IMU"
                        : alert.type.includes("ECG") ||
                            alert.type.includes("Tachycardia") ||
                            alert.type.includes("Bradycardia")
                          ? "On-Band DSP (100 Hz)"
                          : "PPG / Optical Hub"}
                    </span>
                  </td>
                  <td className="py-3.5 metric font-semibold text-foreground whitespace-nowrap">
                    {alert.observedValue || alert.threshold || "--"}
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <SeverityBadge severity={alert.severity} className="text-[10px] px-2 py-0.5" />
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <StatusBadge
                      tone={
                        alert.status === "Resolved"
                          ? "normal"
                          : alert.status === "Acknowledged"
                            ? "info"
                            : "warning"
                      }
                      showIcon={false}
                      className="text-[10px] px-2 py-0.5"
                    >
                      {alert.status}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" asChild>
                      <Link to="/alerts/$id" params={{ id: alert.id }}>
                        Inspect <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
