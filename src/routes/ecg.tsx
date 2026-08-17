import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cpu,
  FileText,
  Heart,
  Info,
  Radio,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { LiveECGCanvas } from "@/components/charts/charts";
import { StatusBadge, SignalQualityIndicator } from "@/components/common/indicators";
import { useSimulation } from "@/hooks/useSimulation";
import { PATIENTS, DEVICES } from "@/mock/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ecg")({
  head: () => ({
    meta: [
      { title: "Live ECG Cardiac Monitor — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Real-time continuous single-lead ECG telemetry at 250 Hz with waveform sweep, rhythm regularity analysis, and P-Q-R-S-T interval diagnostics.",
      },
    ],
  }),
  component: ECGMonitorPage,
});

export function ECGMonitorPage() {
  const { samples, latest, connected, scenario } = useSimulation();
  const [gain, setGain] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(25);
  const [showGrid, setShowGrid] = useState<boolean>(true);

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
    toast.success("10-Second High-Precision ECG Snapshot Captured", {
      description: "Saved to personal health records dossier (Ref: ECG-2026-0817)",
    });
  };

  return (
    <AppShell
      title="Live ECG Cardiac Monitor & Rhythm Analysis"
      subtitle="High-resolution single-lead cardiac potential waveform streamed at 250 Hz from 316L stainless steel dry electrodes"
    >
      {/* 1. TOP STATUS & CALIBRATION CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">Lead I Bipolar Vector</h2>
                <StatusBadge
                  tone={connected ? "normal" : "offline"}
                  className="text-[10px] font-bold"
                >
                  {connected ? "250 Hz Active" : "Disconnected"}
                </StatusBadge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Electrode Impedance:{" "}
                <strong className="text-foreground font-semibold">4.2 kΩ (Good Contact)</strong> ·
                24-bit ADC
              </p>
            </div>
          </div>
        </div>

        {/* Oscilloscope Viewport Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            <span className="text-[11px] text-muted-foreground px-1 font-semibold">Gain:</span>
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

          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            <span className="text-[11px] text-muted-foreground px-1 font-semibold">Sweep:</span>
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

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => setShowGrid((v) => !v)}
          >
            {showGrid ? "Hide Standard Grid" : "Show 1mm/5mm Grid"}
          </Button>

          <Button size="sm" className="h-8 text-xs font-semibold" onClick={handleCaptureSnapshot}>
            <FileText className="mr-1.5 size-3.5" /> Capture 10s Strip
          </Button>
        </div>
      </div>

      {/* 2. MAIN 250 Hz CONTINUOUS CARDIAC WAVEFORM CANVAS */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <LiveECGCanvas samples={samples} gain={gain} speed={speed} showGrid={showGrid} />
      </div>

      {/* 3. PHYSIOLOGICAL WAVEFORM INTERVAL DECOMPOSITION (P-Q-R-S-T) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Instantaneous HR
          </span>
          <div className="my-1 flex items-baseline gap-1.5">
            <span className="metric text-3xl font-black text-rose-600 dark:text-rose-400">
              {hr}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">BPM</span>
          </div>
          <span className="text-[10px] text-normal font-medium flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-normal" /> R-R: {Math.round(60000 / hr)} ms
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            PR Interval
          </span>
          <div className="my-1">
            <span className="metric text-2xl font-extrabold text-foreground">156</span>
            <span className="text-xs text-muted-foreground ml-1">ms</span>
          </div>
          <span className="text-[10px] text-normal font-medium">● Normal (120–200 ms)</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            QRS Duration
          </span>
          <div className="my-1">
            <span className="metric text-2xl font-extrabold text-foreground">88</span>
            <span className="text-xs text-muted-foreground ml-1">ms</span>
          </div>
          <span className="text-[10px] text-normal font-medium">● Narrow QRS (&lt; 120 ms)</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            QT / QTc Interval
          </span>
          <div className="my-1">
            <span className="metric text-2xl font-extrabold text-foreground">382 / 412</span>
            <span className="text-xs text-muted-foreground ml-1">ms</span>
          </div>
          <span className="text-[10px] text-normal font-medium">● Bazett Corrected Normal</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            HRV RMSSD
          </span>
          <div className="my-1">
            <span className="metric text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              48
            </span>
            <span className="text-xs text-muted-foreground ml-1">ms</span>
          </div>
          <span className="text-[10px] text-normal font-medium">● High Parasympathetic Tone</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Ectopy & Arrhythmia
          </span>
          <div className="my-1">
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-4" /> 0 PAC / 0 PVC
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">24h Continuous Zero Ectopy</span>
        </div>
      </div>

      {/* 4. RHYTHM CLASSIFICATION & CLINICAL FIDELITY SUMMARY */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">Real-Time Rhythm Classification</h3>
              <p className="text-xs text-muted-foreground">
                Automated on-device signal morphology analysis
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {rhythmStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[11px] font-bold text-foreground block">P-Wave Morphology</span>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Consistent positive deflection prior to each QRS complex confirming normal sinoatrial
              node pacemaking.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[11px] font-bold text-foreground block">ST-Segment Baseline</span>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Isoelectric ST-segment with zero clinically significant elevation or depression (&lt;
              0.05 mV deviation).
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1">
            <span className="text-[11px] font-bold text-foreground block">
              Signal-to-Noise Ratio (SNR)
            </span>
            <p className="text-[11px] text-muted-foreground leading-snug">
              28.4 dB high-fidelity signal with 50/60 Hz digital notch filter and baseline wander
              cancellation enabled.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
