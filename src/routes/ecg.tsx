import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Eye,
  FileText,
  Gauge,
  Heart,
  HeartPulse,
  Info,
  Layers,
  Pause,
  Play,
  Printer,
  Radio,
  Ruler,
  Sliders,
  Sparkles,
  Timer,
  TrendingUp,
  Waves,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { LiveECGCanvas } from "@/components/charts/charts";
import { StatusBadge, SignalQualityIndicator } from "@/components/common/indicators";
import { useSimulation } from "@/hooks/useSimulation";
import { PATIENTS, DEVICES } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/ecg")({
  head: () => ({
    meta: [
      { title: "Live ECG Cardiac Monitor & Calipers — SmartHealth Portal" },
      {
        name: "description",
        content:
          "High-resolution 250 Hz single-lead ECG telemetry, electronic caliper interval measurements, frequency-domain HRV spectrum, and real-time arrhythmia classification.",
      },
    ],
  }),
  component: ECGMonitorPage,
});

type FilterBandwidth = "diagnostic" | "monitoring" | "filtered";

export function ECGMonitorPage() {
  const { samples, latest, connected, scenario } = useSimulation();

  // Viewport calibration states
  const [gain, setGain] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(25);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [caliperActive, setCaliperActive] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterBandwidth>("monitoring");
  const [selectedInterval, setSelectedInterval] = useState<"pr" | "qrs" | "qt" | "rr">("rr");

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;
  const hr = latest?.heartRate ?? 76;
  const signalQuality = latest?.signalQuality ?? "Excellent";

  const rhythmStatus =
    scenario === "emergency"
      ? "Tachycardic rhythm pattern detected"
      : scenario === "exercise"
        ? "Sinus rhythm elevated with physical exertion"
        : scenario === "poor-signal"
          ? "Intermittent noise artifact — checking lead contact"
          : "Normal Sinus Rhythm (NSR) — Regular & Stable";

  const handleCaptureSnapshot = () => {
    toast.success("10-Second High-Precision ECG Strip Captured", {
      description: `Saved to dossier: LEAD-I-ECG-${patient.id}-20260817.pdf (250 Hz, ${speed} mm/s)`,
    });
  };

  const calipers = {
    rr: {
      name: "R-R Interval",
      val: `${Math.round(60000 / hr)} ms`,
      target: "600–1000 ms",
      note: "Instantaneous cycle duration",
    },
    pr: {
      name: "P-R Interval",
      val: "156 ms",
      target: "120–200 ms",
      note: "Normal AV nodal conduction delay",
    },
    qrs: {
      name: "QRS Complex Duration",
      val: "88 ms",
      target: "70–110 ms",
      note: "Narrow intraventricular conduction",
    },
    qt: {
      name: "QT / QTc (Bazett)",
      val: "382 / 412 ms",
      target: "< 450 ms",
      note: "Normal repolarization recovery",
    },
  };

  return (
    <AppShell
      title="Live ECG Cardiac Monitor & Rhythm Conduction"
      subtitle="High-resolution single-lead cardiac electrical vector streamed at 250 Hz from 316L stainless dry electrodes with ARM Helium DSP filtering"
    >
      {/* 1. TOP TELEMETRY STATUS & OSCILLOSCOPE CALIBRATION TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">
                  Lead I Bipolar Conduction Vector
                </h2>
                <StatusBadge
                  tone={connected ? "normal" : "offline"}
                  className="text-[10px] font-bold"
                >
                  {connected ? "250 Hz Synchronized" : "Disconnected"}
                </StatusBadge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Electrode Impedance:{" "}
                <strong className="text-foreground font-semibold">4.2 kΩ (Optimal Contact)</strong>{" "}
                · 24-bit Σ-Δ ADC
              </p>
            </div>
          </div>
        </div>

        {/* Calibration & Caliper Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Gain Controls */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
            <span className="text-[11px] text-muted-foreground px-1 font-bold">Gain:</span>
            {[0.5, 1.0, 2.0].map((g) => (
              <button
                key={g}
                onClick={() => setGain(g)}
                className={`rounded-lg px-2 py-0.5 text-xs font-semibold transition-all ${
                  gain === g
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {g}x
              </button>
            ))}
          </div>

          {/* Sweep Speed */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
            <span className="text-[11px] text-muted-foreground px-1 font-bold">Sweep:</span>
            {[25, 50].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-lg px-2 py-0.5 text-xs font-semibold transition-all ${
                  speed === s
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s} mm/s
              </button>
            ))}
          </div>

          {/* Grid Toggle */}
          <Button
            variant={showGrid ? "secondary" : "outline"}
            size="sm"
            className="h-8 text-xs font-semibold rounded-xl"
            onClick={() => setShowGrid((v) => !v)}
          >
            {showGrid ? "Standard 1mm/5mm Grid" : "Plain Dark Grid"}
          </Button>

          {/* Caliper Mode */}
          <Button
            variant={caliperActive ? "default" : "outline"}
            size="sm"
            className={`h-8 text-xs font-semibold rounded-xl transition-all ${
              caliperActive ? "bg-primary text-primary-foreground font-bold shadow-xs" : ""
            }`}
            onClick={() => {
              setCaliperActive((v) => !v);
              toast.info(
                caliperActive
                  ? "Electronic calipers disabled"
                  : "Electronic caliper measurement mode enabled",
              );
            }}
          >
            <Ruler className="mr-1.5 size-3.5" /> Calipers {caliperActive ? "ON" : "OFF"}
          </Button>

          {/* Capture 10s Strip */}
          <Button
            size="sm"
            className="h-8 text-xs font-bold rounded-xl"
            onClick={handleCaptureSnapshot}
          >
            <FileText className="mr-1.5 size-3.5" /> Capture 10s Strip
          </Button>
        </div>
      </div>

      {/* 2. MAIN 250 Hz CONTINUOUS CARDIAC WAVEFORM CANVAS */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <LiveECGCanvas samples={samples} gain={gain} speed={speed} showGrid={showGrid} />

        {/* Live Canvas Telemetry Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-border/60 pt-3 text-muted-foreground font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Live 250 Hz
              Sweep
            </span>
            <span>
              Bandwidth: <strong className="text-foreground">0.5 Hz – 40 Hz</strong>
            </span>
            <span>
              50/60 Hz Notch: <strong className="text-foreground">Active</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              R-R Interval:{" "}
              <strong className="text-foreground font-bold">{Math.round(60000 / hr)} ms</strong>
            </span>
            <span>
              Signal-to-Noise:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">28.4 dB</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. ELECTRONIC CALIPER INTERVAL INSPECTOR (When Caliper is Active) */}
      {caliperActive && (
        <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
            <div className="flex items-center gap-2">
              <Ruler className="size-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Precision Electronic Caliper Measurements
              </h3>
            </div>
            <span className="text-[10px] font-mono text-primary font-bold">
              Calibrated to 25 mm/s standard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(calipers) as (keyof typeof calipers)[]).map((key) => {
              const item = calipers[key];
              const isSelected = selectedInterval === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedInterval(key)}
                  className={`text-left rounded-xl p-3 transition-all border text-xs flex flex-col justify-between space-y-1 ${
                    isSelected
                      ? "bg-card border-primary text-foreground shadow-xs font-bold ring-1 ring-primary/50"
                      : "bg-card/50 border-border/70 text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase block">{item.name}</span>
                  <span className="metric text-xl font-black text-primary">{item.val}</span>
                  <span className="text-[9px] text-muted-foreground block">{item.note}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PHYSIOLOGICAL WAVEFORM INTERVAL DECOMPOSITION (P-Q-R-S-T) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Instantaneous HR */}
        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            Instantaneous HR
          </span>
          <div className="my-1 flex items-baseline gap-1.5">
            <span className="metric text-3xl font-black text-rose-600 dark:text-rose-400">
              {hr}
            </span>
            <span className="text-xs text-muted-foreground font-bold">BPM</span>
          </div>
          <span className="text-[10px] text-normal font-semibold flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-normal" /> R-R: {Math.round(60000 / hr)} ms
          </span>
        </div>

        {/* PR Interval */}
        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            P-R Interval
          </span>
          <div className="my-1">
            <span className="metric text-2xl font-black text-foreground">156</span>
            <span className="text-xs text-muted-foreground ml-1 font-semibold">ms</span>
          </div>
          <span className="text-[10px] text-normal font-semibold">● Normal (120–200 ms)</span>
        </div>

        {/* QRS Duration */}
        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            QRS Duration
          </span>
          <div className="my-1">
            <span className="metric text-2xl font-black text-foreground">88</span>
            <span className="text-xs text-muted-foreground ml-1 font-semibold">ms</span>
          </div>
          <span className="text-[10px] text-normal font-semibold">● Narrow QRS (&lt; 120 ms)</span>
        </div>

        {/* QT / QTc */}
        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            QT / QTc (Bazett)
          </span>
          <div className="my-1">
            <span className="metric text-2xl font-black text-foreground">382 / 412</span>
            <span className="text-xs text-muted-foreground ml-1 font-semibold">ms</span>
          </div>
          <span className="text-[10px] text-normal font-semibold">● Normal Repolarization</span>
        </div>

        {/* HRV RMSSD */}
        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">HRV RMSSD</span>
          <div className="my-1">
            <span className="metric text-2xl font-black text-indigo-600 dark:text-indigo-400">
              48
            </span>
            <span className="text-xs text-muted-foreground ml-1 font-semibold">ms</span>
          </div>
          <span className="text-[10px] text-normal font-semibold">● High Vagal Recovery</span>
        </div>

        {/* Ectopy & Arrhythmia */}
        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">
            Ectopy & Arrhythmia
          </span>
          <div className="my-1">
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-4" /> 0 PAC / 0 PVC
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            24h Continuous Zero Ectopy
          </span>
        </div>
      </div>

      {/* 5. FREQUENCY-DOMAIN HRV SPECTRUM & RHYTHM CONDUCTION ASSESSMENT */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Frequency-Domain HRV Power Spectral Density (PSD) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">HRV Frequency Spectral Density</h3>
              <p className="text-xs text-muted-foreground">
                Autonomic balance between parasympathetic (HF) and sympathetic (LF) tone
              </p>
            </div>
            <span className="metric text-xs font-bold text-primary">LF/HF: 0.47</span>
          </div>

          <div className="space-y-3">
            {/* HF Power */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">
                  High Frequency (HF: 0.15–0.40 Hz) — Parasympathetic Vagal
                </span>
                <span className="metric font-bold text-emerald-600 dark:text-emerald-400">68%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68%" }} />
              </div>
            </div>

            {/* LF Power */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Low Frequency (LF: 0.04–0.15 Hz) — Sympathetic Vasomotor
                </span>
                <span className="metric font-bold text-indigo-600 dark:text-indigo-400">32%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "32%" }} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground flex items-center justify-between">
            <div>
              <span className="font-bold text-foreground block">
                Total Spectral Power: <strong className="font-mono text-primary">2,410 ms²</strong>
              </span>
              <span className="text-[10px] text-muted-foreground">
                High total spectral power indicates healthy autonomic flexibility
              </span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Optimal Recovery
            </span>
          </div>
        </div>

        {/* Real-time Morphology & Conduction Summary */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Morphology & Conduction Assessment
              </h3>
              <p className="text-xs text-muted-foreground">
                Automated edge signal classification via CMSIS-DSP
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {rhythmStatus}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 space-y-0.5">
              <span className="font-bold text-foreground block">P-Wave & Atrial Conduction</span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Consistent positive deflection prior to each QRS complex confirming normal
                sinoatrial node pacemaking.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 space-y-0.5">
              <span className="font-bold text-foreground block">ST-Segment Baseline</span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Isoelectric ST-segment with zero clinically significant elevation or depression
                (&lt; 0.02 mV deviation).
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 space-y-0.5">
              <span className="font-bold text-foreground block">
                T-Wave Symmetrical Repolarization
              </span>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Normal concordant T-wave amplitude and morphology with zero pathological inversion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
