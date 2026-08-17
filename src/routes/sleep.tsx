import { createFileRoute } from "@tanstack/react-router";
import { Bed, CheckCircle2, Clock, Heart, Moon, Sparkles, Sun, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { HypnogramChart, RealtimeChart } from "@/components/charts/charts";
import { Progress } from "@/components/ui/progress";
import { WEEKLY_SLEEP_DATA } from "@/mock/data";

export const Route = createFileRoute("/sleep")({
  head: () => ({
    meta: [
      { title: "Sleep Architecture & Recovery — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Sleep hypnogram, sleep score, deep/REM/light stage decomposition, nocturnal resting heart rate, and heart rate variability (HRV).",
      },
    ],
  }),
  component: SleepPage,
});

export function SleepPage() {
  const stages = [
    {
      name: "Deep Sleep (N3 Slow Wave)",
      duration: "1h 48m",
      percent: 24,
      target: "15–25%",
      description: "Cellular repair, physical restoration, and human growth hormone release.",
      color: "bg-indigo-700",
    },
    {
      name: "Light Sleep (N1 / N2)",
      duration: "3h 51m",
      percent: 52,
      target: "45–55%",
      description: "Neurological maintenance, motor skill consolidation, and baseline rest.",
      color: "bg-indigo-400",
    },
    {
      name: "REM Sleep (Dream Stage)",
      duration: "1h 45m",
      percent: 24,
      target: "20–25%",
      description: "Cognitive memory synthesis, emotional regulation, and neural plasticity.",
      color: "bg-sky-400",
    },
    {
      name: "Awake Interludes",
      duration: "18m",
      percent: 4,
      target: "< 5%",
      description: "Brief micro-arousals during natural 90-minute sleep cycle transitions.",
      color: "bg-amber-400",
    },
  ];

  const weeklyData = WEEKLY_SLEEP_DATA.map((d) => ({
    date: d.date,
    totalHours: Math.round((d.totalMinutes / 60) * 10) / 10,
    score: d.sleepScore,
  }));

  return (
    <AppShell
      title="Sleep Architecture & Nocturnal Recovery"
      subtitle="Biometric sleep staging from continuous PPG pulse rate variability and 3-axis wrist accelerometer"
    >
      {/* 1. TOP 4 NOCTURNAL RECOVERY METRICS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sleep Time */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Total Sleep Duration</span>
            <Moon className="size-4 text-indigo-500" />
          </div>
          <div className="my-2">
            <div className="metric text-3xl font-black text-foreground">7h 24m</div>
            <p className="text-xs text-muted-foreground mt-1">Bedtime: 23:04 · Wake: 07:10</p>
          </div>
          <span className="text-xs text-normal font-medium flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> Optimal 7–9h window met
          </span>
        </div>

        {/* Sleep Score */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Sleep Quality Index</span>
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <div className="metric text-3xl font-black text-primary">84</div>
            <span className="text-xs font-medium text-muted-foreground">/ 100</span>
          </div>
          <span className="text-xs text-primary font-semibold">● Highly Restorative Recovery</span>
        </div>

        {/* Sleep Efficiency */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Sleep Efficiency</span>
            <Bed className="size-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="metric text-3xl font-black text-foreground">91%</div>
            <p className="text-xs text-muted-foreground mt-1">Time asleep vs total time in bed</p>
          </div>
          <Progress value={91} className="h-2" />
        </div>

        {/* Nocturnal Biometrics (Resting HR & HRV) */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Nocturnal Autonomic Dip</span>
            <Heart className="size-4 text-rose-500" />
          </div>
          <div className="my-2">
            <div className="metric text-2xl font-black text-foreground">
              58 <span className="text-xs text-muted-foreground font-normal">BPM (12% Dip)</span>
            </div>
            <p className="metric text-xs text-muted-foreground mt-0.5">
              HRV: 48 ms RMSSD · Resp: 13.8/min
            </p>
          </div>
          <span className="text-xs text-normal font-medium">● Strong Parasympathetic Rebound</span>
        </div>
      </div>

      {/* 2. SLEEP HYPNOGRAM TIMELINE */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Sleep Stage Hypnogram Timeline</h3>
            <p className="text-xs text-muted-foreground">
              Continuous stage classification across 4 complete 90-minute sleep cycles (23:00 to
              07:00)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-indigo-700 font-semibold">
              <span className="size-2.5 rounded-full bg-indigo-700" /> Deep (N3)
            </span>
            <span className="flex items-center gap-1 text-indigo-400 font-semibold">
              <span className="size-2.5 rounded-full bg-indigo-400" /> Light (N1/N2)
            </span>
            <span className="flex items-center gap-1 text-sky-400 font-semibold">
              <span className="size-2.5 rounded-full bg-sky-400" /> REM
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <span className="size-2.5 rounded-full bg-amber-400" /> Awake
            </span>
          </div>
        </div>

        <HypnogramChart height={220} />
      </div>

      {/* 3. STAGE BREAKDOWN & 7-DAY SLEEP HISTORY */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Stage Decomposition */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Sleep Stages Proportion</h3>
              <p className="text-xs text-muted-foreground">
                Decomposition against clinical target ranges
              </p>
            </div>
            <span className="text-xs font-semibold text-primary">All Stages Balanced</span>
          </div>

          <div className="space-y-3">
            {stages.map((stg) => (
              <div
                key={stg.name}
                className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{stg.name}</span>
                  <span className="metric font-bold text-foreground">
                    {stg.duration} ({stg.percent}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${stg.color} rounded-full transition-all`}
                    style={{ width: `${stg.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span>{stg.description}</span>
                  <span className="shrink-0 font-medium">Target: {stg.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Sleep Trend */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">7-Day Sleep Duration Trend</h3>
              <p className="text-xs text-muted-foreground">
                Average: 7h 28m per night · Average Score: 84/100
              </p>
            </div>
            <span className="metric text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Consistency: 92%
            </span>
          </div>

          <RealtimeChart
            data={weeklyData}
            xKey="date"
            series={[
              { key: "totalHours", label: "Hours Asleep", color: "#6366f1", domain: [4, 10] },
            ]}
            height={230}
          />
        </div>
      </div>
    </AppShell>
  );
}
