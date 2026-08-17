import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Gauge,
  Heart,
  HeartPulse,
  Info,
  Pause,
  Play,
  Radio,
  Sliders,
  Sparkles,
  Square,
  Thermometer,
  TrendingUp,
  Waves,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PrimaryVitalCard } from "@/components/dashboard/VitalCard";
import { RealtimeChart, WaveformChart } from "@/components/charts/charts";
import { LiveDot, SignalQualityIndicator, StatusBadge } from "@/components/common/indicators";
import { useSimulation } from "@/hooks/useSimulation";
import { decimate, windowSamples } from "@/lib/analysis";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Biometric Telemetry — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Real-time continuous 100 Hz optical PPG pulsatile stream, cardiovascular vitals, perfusion index, and autonomic parameters.",
      },
    ],
  }),
  component: LiveVitalsPage,
});

export function LiveVitalsPage() {
  const { samples, latest, running, start, pause, connected, activity } = useSimulation();
  const [activeMetricTab, setActiveMetricTab] = useState<"all" | "cardio" | "resp" | "temp">("all");

  const data = decimate(windowSamples(samples, 180), 160);

  const hr = latest?.heartRate ?? 76;
  const spo2 = latest?.spo2 ?? 98;
  const temp = latest?.temperature ?? 36.8;
  const sys = latest?.systolic ?? 118;
  const dia = latest?.diastolic ?? 76;
  const map = Math.round((2 * dia + sys) / 3);
  const pulsePressure = sys - dia;
  const perfusionIndex = (4.8).toFixed(1);
  const respRate = 14;

  const hrTone = hr > 110 ? "warning" : "normal";
  const spo2Tone = spo2 < 94 ? "warning" : "normal";

  return (
    <AppShell
      title="Live Biometric Telemetry & Waveform Stream"
      subtitle="Real-time optical PPG and physiological parameter stream with on-device ARM DSP analysis (100 Hz sensor sync)"
    >
      {/* 1. TOP STREAM CONTROL & SIGNAL FIDELITY BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-5">
          <LiveDot
            active={running && connected}
            label={running && connected ? "Stream Active (100 Hz Sync)" : "Stream Paused"}
          />
          <SignalQualityIndicator quality={latest?.signalQuality ?? "Excellent"} />
          <StatusBadge
            tone={connected ? "normal" : "offline"}
            className="text-xs px-2.5 py-0.5 font-bold"
          >
            {connected ? "SmartBand SB-01 Pro (BLE 5.3 Active)" : "Link Offline"}
          </StatusBadge>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="size-3.5 text-primary" />
            <span>
              Perfusion Index:{" "}
              <strong className="text-foreground font-semibold">{perfusionIndex}%</strong>
            </span>
          </div>
          <span className="metric text-xs text-muted-foreground">
            Buffered: <strong className="text-foreground font-semibold">{samples.length}</strong>{" "}
            pkts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={running ? "secondary" : "default"}
            size="sm"
            onClick={running ? pause : start}
            disabled={!connected}
            className="h-8.5 font-semibold text-xs"
          >
            {running ? <Pause className="mr-1.5 size-3.5" /> : <Play className="mr-1.5 size-3.5" />}
            {running ? "Pause Stream" : "Resume Stream"}
          </Button>

          <Button variant="outline" size="sm" asChild className="h-8.5 text-xs font-semibold">
            <Link to="/devices">
              Smart Band Console <ArrowRight className="ml-1 size-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. PRIMARY 4 VITALS METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PrimaryVitalCard
          label="Heart Rate"
          value={hr}
          unit="BPM"
          icon={HeartPulse}
          normalRange="60–100 BPM"
          tone={hrTone}
          statusLabel={hrTone === "normal" ? "Resting Baseline" : "Elevated"}
          sparklineColor="var(--color-chart-5)"
        />

        <PrimaryVitalCard
          label="Blood Oxygen (SpO₂)"
          value={`${spo2}%`}
          unit=""
          icon={Droplets}
          normalRange="95–100%"
          tone={spo2Tone}
          statusLabel={spo2Tone === "normal" ? "Optimal Arterial" : "Low Range"}
          sparklineColor="var(--color-chart-1)"
        />

        <PrimaryVitalCard
          label="Skin Temperature"
          value={temp.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          normalRange="36.1–37.2 °C"
          tone="normal"
          statusLabel="Thermal Balance"
          sparklineColor="var(--color-chart-4)"
        />

        <PrimaryVitalCard
          label="Blood Pressure"
          value={`${sys}/${dia}`}
          unit="mmHg"
          icon={Activity}
          normalRange="< 120/80"
          tone="normal"
          statusLabel={`MAP: ${map} mmHg`}
          sparklineColor="var(--color-chart-6)"
        />
      </div>

      {/* 3. CONTINUOUS HIGH-FREQUENCY PPG WAVEFORM */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Waves className="size-4.5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Continuous Photoplethysmography (PPG) Pulse Waveform
              </h3>
              <p className="text-xs text-muted-foreground">
                High-frequency dual-wavelength (525nm / 660nm) optical absorption signal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="metric font-semibold text-muted-foreground">
              Sampling: <strong className="text-foreground">100 Hz</strong>
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Motion Filtered
            </span>
          </div>
        </div>

        <WaveformChart data={samples} height={190} />
      </div>

      {/* 4. REAL-TIME MULTI-STREAM CHARTS */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Heart Rate Real-Time Dynamics */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Heart Rate Dynamic Stream</h3>
              <p className="text-xs text-muted-foreground">
                Instantaneous beat-to-beat pulse tracking
              </p>
            </div>
            <div className="text-right">
              <span className="metric text-base font-extrabold text-rose-600 dark:text-rose-400">
                {hr} BPM
              </span>
              <span className="text-[10px] text-muted-foreground block">Resting: 58 BPM</span>
            </div>
          </div>
          <RealtimeChart
            data={data}
            series={[
              {
                key: "heartRate",
                label: "Heart Rate (BPM)",
                color: "var(--color-chart-5)",
                domain: [50, 140],
              },
            ]}
            height={210}
          />
        </div>

        {/* SpO2 Oxygenation Real-Time Dynamics */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Blood Oxygen Saturation (SpO₂)</h3>
              <p className="text-xs text-muted-foreground">
                Dual-LED optical ratio-of-ratios measurement
              </p>
            </div>
            <div className="text-right">
              <span className="metric text-base font-extrabold text-sky-600 dark:text-sky-400">
                {spo2}% SpO₂
              </span>
              <span className="text-[10px] text-muted-foreground block">Target: 95–100%</span>
            </div>
          </div>
          <RealtimeChart
            data={data}
            series={[
              { key: "spo2", label: "SpO2 (%)", color: "var(--color-chart-1)", domain: [88, 100] },
            ]}
            height={210}
          />
        </div>
      </div>

      {/* 5. ADVANCED PHYSIOLOGICAL PARAMETERS & AUTONOMIC DECK */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Gauge className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Hemodynamic & Autonomic Indicators
              </h3>
              <p className="text-xs text-muted-foreground">
                Calculated on-band via ARM CMSIS-DSP signal pipeline
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary">Real-time Synthesis</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Tile 1: MAP */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              Mean Arterial (MAP)
            </span>
            <span className="metric text-xl font-extrabold text-foreground">
              {map} <span className="text-xs font-normal text-muted-foreground">mmHg</span>
            </span>
            <span className="text-[10px] text-normal font-medium block">● Optimal (70–100)</span>
          </div>

          {/* Tile 2: Pulse Pressure */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              Pulse Pressure
            </span>
            <span className="metric text-xl font-extrabold text-foreground">
              {pulsePressure}{" "}
              <span className="text-xs font-normal text-muted-foreground">mmHg</span>
            </span>
            <span className="text-[10px] text-normal font-medium block">● Flexible Arteries</span>
          </div>

          {/* Tile 3: Respiration */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              Respiration Rate
            </span>
            <span className="metric text-xl font-extrabold text-foreground">
              {respRate} <span className="text-xs font-normal text-muted-foreground">br/min</span>
            </span>
            <span className="text-[10px] text-normal font-medium block">● Eupnea (12–20)</span>
          </div>

          {/* Tile 4: Perfusion Index */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              Perfusion Index (PI)
            </span>
            <span className="metric text-xl font-extrabold text-foreground">{perfusionIndex}%</span>
            <span className="text-[10px] text-normal font-medium block">● Strong Pulsatile</span>
          </div>

          {/* Tile 5: Motion Energy */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              Motion Activity
            </span>
            <span className="metric text-xl font-extrabold text-foreground">{activity}</span>
            <span className="text-[10px] text-muted-foreground block">3-Axis MEMS ~0.14G</span>
          </div>

          {/* Tile 6: DSP Status */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
              Edge Neural Status
            </span>
            <span className="metric text-xl font-extrabold text-primary">INT8 OK</span>
            <span className="text-[10px] text-primary font-medium block">Latency ~18.2ms</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
