import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Battery,
  Clock,
  Cpu,
  Droplets,
  HeartPulse,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Signal,
  Thermometer,
  Waves,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RealtimeChart, WaveformChart } from "@/components/charts/charts";
import {
  StatusBadge,
  BatteryIndicator,
  SignalQualityIndicator,
} from "@/components/common/indicators";
import { useSimulation } from "@/hooks/useSimulation";
import { PATIENTS, DEVICES } from "@/mock/data";
import { decimate, windowSamples } from "@/lib/analysis";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/telemetry")({
  head: () => ({
    meta: [
      { title: "Live Patient Telemetry — SmartHealth Multimodal Monitoring" },
      {
        name: "description",
        content:
          "Real-time physiological telemetry suite with continuous Heart Rate, SpO2, Temperature, Blood Pressure, 3-Axis Accelerometer, and PPG waveform.",
      },
    ],
  }),
  component: LiveTelemetryPage,
});

const TIMEFRAMES = [
  { id: "live", label: "LIVE (60s)", seconds: 60 },
  { id: "1h", label: "1H", seconds: 3600 },
  { id: "6h", label: "6H", seconds: 21600 },
  { id: "24h", label: "24H", seconds: 86400 },
  { id: "7d", label: "7D", seconds: 604800 },
  { id: "30d", label: "30D", seconds: 2592000 },
] as const;

export function LiveTelemetryPage() {
  const { samples, latest, running, start, pause, stop, connected, ai } = useSimulation();
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]["id"]>("live");

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;
  const selectedTf = TIMEFRAMES.find((t) => t.id === timeframe) || TIMEFRAMES[0];
  const chartData = decimate(windowSamples(samples, selectedTf.seconds), 180);

  return (
    <AppShell
      title="Live Health Telemetry"
      subtitle="Real-time multimodal physiological data from connected wearable smart band"
    >
      {/* Top Status Bar (User, Band, Connection, Latency, Battery, Signal) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              User
            </span>
            <span className="text-sm font-bold text-foreground">
              {patient.name}{" "}
              <span className="metric text-xs text-muted-foreground">({patient.id})</span>
            </span>
          </div>

          <div className="border-l border-border pl-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Device Node
            </span>
            <span className="text-sm font-bold text-foreground">{device.name}</span>
          </div>

          <div className="border-l border-border pl-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Link Status
            </span>
            <StatusBadge tone={connected ? "normal" : "offline"} className="mt-0.5 text-xs">
              {connected ? "BLE 5.3 Active" : "Disconnected"}
            </StatusBadge>
          </div>

          <div className="border-l border-border pl-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Latency
            </span>
            <span className="metric text-sm font-bold text-foreground">
              {latest?.inferenceLatency.toFixed(1) ?? "18.4"} ms
            </span>
          </div>

          <div className="border-l border-border pl-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Battery
            </span>
            <span className="mt-0.5 block">
              <BatteryIndicator level={latest?.battery ?? device.battery} />
            </span>
          </div>

          <div className="border-l border-border pl-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Signal Quality
            </span>
            <div className="mt-0.5">
              <SignalQualityIndicator quality={latest?.signalQuality ?? "Excellent"} />
            </div>
          </div>
        </div>

        {/* Stream Play/Pause Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={running ? "secondary" : "default"}
            onClick={running ? pause : start}
            disabled={!connected}
          >
            {running ? <Pause className="mr-1.5 size-3.5" /> : <Play className="mr-1.5 size-3.5" />}
            {running ? "Pause Stream" : "Resume Stream"}
          </Button>
        </div>
      </div>

      {/* Timeframe Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Telemetry Timeframe:
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                timeframe === tf.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Real-time Telemetry Charts Suite */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 1. Heart Rate */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-foreground">Heart Rate</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="metric text-lg font-bold text-rose-600 dark:text-rose-400">
                {latest?.heartRate ?? 76}{" "}
                <span className="text-xs font-normal text-muted-foreground">BPM</span>
              </span>
              <span className="text-[10px] text-muted-foreground">(Normal: 60–100)</span>
            </div>
          </div>
          <RealtimeChart
            data={chartData}
            series={[
              {
                key: "heartRate",
                label: "Heart Rate (BPM)",
                color: "var(--color-chart-5)",
                domain: [50, 160],
              },
            ]}
            height={200}
          />
        </div>

        {/* 2. SpO2 */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-bold text-foreground">Blood Oxygen (SpO₂)</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="metric text-lg font-bold text-sky-600 dark:text-sky-400">
                {latest?.spo2 ?? 98}%
              </span>
              <span className="text-[10px] text-muted-foreground">(Normal: 95–100%)</span>
            </div>
          </div>
          <RealtimeChart
            data={chartData}
            series={[
              { key: "spo2", label: "SpO2 (%)", color: "var(--color-chart-1)", domain: [85, 100] },
            ]}
            height={200}
          />
        </div>

        {/* 3. Body Temperature */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="size-4 text-amber-500" />
              <h3 className="text-sm font-bold text-foreground">Skin Temperature</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="metric text-lg font-bold text-amber-500">
                {latest?.temperature.toFixed(1) ?? "36.8"}{" "}
                <span className="text-xs font-normal text-muted-foreground">°C</span>
              </span>
              <span className="text-[10px] text-muted-foreground">(Normal: 36.1–37.2°C)</span>
            </div>
          </div>
          <RealtimeChart
            data={chartData}
            series={[
              {
                key: "temperature",
                label: "Temperature (°C)",
                color: "var(--color-chart-4)",
                domain: [35.5, 39],
              },
            ]}
            height={200}
          />
        </div>

        {/* 4. Blood Pressure */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-foreground">Blood Pressure (Estimated)</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="metric text-lg font-bold text-purple-600 dark:text-purple-400">
                {latest?.systolic ?? 118}/{latest?.diastolic ?? 76}{" "}
                <span className="text-xs font-normal text-muted-foreground">mmHg</span>
              </span>
              <span className="text-[10px] text-muted-foreground">(Target: &lt;120/80)</span>
            </div>
          </div>
          <RealtimeChart
            data={chartData}
            series={[
              { key: "systolic", label: "Systolic (mmHg)", color: "#8b5cf6", domain: [60, 180] },
              { key: "diastolic", label: "Diastolic (mmHg)", color: "#c084fc", domain: [60, 180] },
            ]}
            height={200}
          />
        </div>

        {/* 5. 3-Axis Accelerometer / Motion */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-foreground">3-Axis Accelerometer (X, Y, Z)</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                X:{latest?.accelX} Y:{latest?.accelY} Z:{latest?.accelZ}
              </span>
              <span className="text-[10px] text-muted-foreground">(G-force)</span>
            </div>
          </div>
          <RealtimeChart
            data={chartData}
            series={[
              { key: "accelX", label: "X-Axis", color: "#06b6d4", domain: [-1.5, 2] },
              { key: "accelY", label: "Y-Axis", color: "#10b981", domain: [-1.5, 2] },
              { key: "accelZ", label: "Z-Axis", color: "#f59e0b", domain: [-1.5, 2] },
            ]}
            height={200}
          />
        </div>

        {/* 6. Raw Photoplethysmography (PPG) Waveform */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Waves className="size-4 text-rose-500" />
              <h3 className="text-sm font-bold text-foreground">Raw PPG Waveform</h3>
            </div>
            <span className="text-xs text-muted-foreground">100 Hz Optical Reflected Signal</span>
          </div>
          <WaveformChart data={samples} height={200} />
        </div>
      </div>
    </AppShell>
  );
}
