import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Award,
  CheckCircle2,
  Flame,
  Footprints,
  Heart,
  MapPin,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ActivityBarChart, RealtimeChart } from "@/components/charts/charts";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from "@/hooks/useSimulation";
import { WEEKLY_ACTIVITY_DATA } from "@/mock/data";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Daily Activity & Movement — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Daily steps, active calorie expenditure, distance covered, standing hours, 3-axis motion intensity breakdown, and metabolic energy metrics.",
      },
    ],
  }),
  component: ActivityPage,
});

const HOURLY_STEPS = [
  { time: "06:00", steps: 120 },
  { time: "07:00", steps: 480 },
  { time: "08:00", steps: 890 },
  { time: "09:00", steps: 1420 },
  { time: "10:00", steps: 610 },
  { time: "11:00", steps: 350 },
  { time: "12:00", steps: 780 },
  { time: "13:00", steps: 940 },
  { time: "14:00", steps: 410 },
  { time: "15:00", steps: 320 },
  { time: "16:00", steps: 510 },
  { time: "17:00", steps: 820 },
  { time: "18:00", steps: 1210 },
  { time: "19:00", steps: 640 },
  { time: "20:00", steps: 320 },
];

export function ActivityPage() {
  const { latest, activity } = useSimulation();

  const currentSteps = latest?.steps ?? 6824;
  const goal = 8000;
  const progressPercent = Math.min(100, Math.round((currentSteps / goal) * 100));
  const calories = latest?.calories ?? 1840;
  const distanceKm = (currentSteps * 0.00075).toFixed(1);

  const intensityBreakdown = [
    { label: "Sedentary / Rest", percent: 68, hours: "7h 45m", color: "bg-slate-400" },
    { label: "Light Daily Movement", percent: 18, hours: "2h 10m", color: "bg-sky-500" },
    { label: "Moderate Aerobic Pace", percent: 10, hours: "1h 15m", color: "bg-emerald-500" },
    { label: "Intense Cardio Effort", percent: 4, hours: "28m", color: "bg-rose-500" },
  ];

  return (
    <AppShell
      title="Daily Activity & Movement Analytics"
      subtitle="3-axis continuous accelerometer tracking, cadence estimation, and metabolic energy expenditure"
    >
      {/* 1. TOP 4 ACTIVITY METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Steps Card */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Daily Step Count</span>
            <Footprints className="size-4 text-primary" />
          </div>
          <div className="my-2">
            <div className="metric text-3xl font-black text-foreground">
              {currentSteps.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Goal: {goal.toLocaleString()}</span>
              <span className="font-bold text-primary">{progressPercent}%</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Calories Card */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Active Calories</span>
            <Flame className="size-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="metric text-3xl font-black text-amber-500">
              {calories.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">kcal total energy burn</p>
          </div>
          <span className="text-xs text-normal font-medium flex items-center gap-1">
            <Zap className="size-3.5" /> +180 kcal ahead of 7-day average
          </span>
        </div>

        {/* Distance & Cadence Card */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Traversed Distance</span>
            <MapPin className="size-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="metric text-3xl font-black text-foreground">
              {distanceKm} <span className="text-sm font-normal text-muted-foreground">km</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Estimated stride: 74 cm</p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Cadence: ~112 steps/min</span>
        </div>

        {/* Active Minutes & Stand Target */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Exercise & Stand</span>
            <Activity className="size-4 text-indigo-500" />
          </div>
          <div className="my-2">
            <div className="metric text-3xl font-black text-indigo-600 dark:text-indigo-400">
              54 <span className="text-sm font-normal text-muted-foreground">min</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Standing: 10 / 12 active hours</p>
          </div>
          <span className="text-xs text-normal font-semibold">● Daily Exercise Goal Exceeded</span>
        </div>
      </div>

      {/* 2. WEEKLY STEP TRENDS CHART */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              7-Day Step History vs 8,000 Target
            </h3>
            <p className="text-xs text-muted-foreground">
              Daily step volume consistency across the past week
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-normal">
              <span className="size-2.5 rounded-full bg-normal" /> Target Achieved (&gt;8k)
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <span className="size-2.5 rounded-full bg-primary" /> Active Progression
            </span>
          </div>
        </div>
        <ActivityBarChart data={WEEKLY_ACTIVITY_DATA} height={220} />
      </div>

      {/* 3. HOURLY BREAKDOWN & INTENSITY DISTRIBUTION */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Hourly Movement Profile */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Hourly Step Distribution</h3>
              <p className="text-xs text-muted-foreground">
                Steps recorded per hour today (Peak: 09:00 & 18:00)
              </p>
            </div>
            <span className="metric text-xs font-bold text-primary">Peak: 1,420 steps</span>
          </div>
          <RealtimeChart
            data={HOURLY_STEPS}
            xKey="time"
            series={[{ key: "steps", label: "Steps per hour", color: "var(--color-chart-3)" }]}
            height={210}
          />
        </div>

        {/* Movement Intensity Staging */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Activity Intensity Breakdown</h3>
              <p className="text-xs text-muted-foreground">
                Classified from 50 Hz 3-axis accelerometer signals
              </p>
            </div>
            <span className="text-xs font-semibold text-foreground">11h 38m Tracked</span>
          </div>

          <div className="space-y-3">
            {intensityBreakdown.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="metric font-semibold text-muted-foreground">
                    {item.hours} ({item.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground border border-border/60 flex items-center justify-between">
            <div>
              <strong>Current State:</strong>{" "}
              <span className="text-foreground font-bold">{activity}</span>
              <span className="text-[10px] text-muted-foreground block">
                Dynamic Acceleration: ~0.14 G
              </span>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Auto-Classified
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
