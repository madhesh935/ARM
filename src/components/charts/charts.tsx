import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useRef, useState } from "react";
import type { VitalSample } from "@/types";

const axisProps = {
  stroke: "var(--color-border)",
  tick: { fill: "var(--color-muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    color: "var(--color-card-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)", fontSize: 11, marginBottom: 4 },
};

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
  domain?: [number | "auto", number | "auto"];
  unit?: string;
}

export function RealtimeChart<T extends object>({
  data,
  series,
  height = 260,
  xKey = "time",
  showGrid = true,
  referenceLines,
}: {
  data: readonly T[];
  series: SeriesDef[];
  height?: number;
  xKey?: string;
  showGrid?: boolean;
  referenceLines?: { y: number; label: string; color?: string }[];
}) {
  if (!data.length) {
    return (
      <div
        className="grid place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
        style={{ height }}
      >
        No telemetry samples in this window.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data as T[]} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
            </linearGradient>
          ))}
        </defs>
        {showGrid ? (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            opacity={0.6}
            vertical={false}
          />
        ) : null}
        <XAxis dataKey={xKey} {...axisProps} minTickGap={45} />
        <YAxis {...axisProps} domain={series[0]?.domain ?? ["auto", "auto"]} width={48} />
        <Tooltip {...tooltipStyle} />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} /> : null}

        {referenceLines?.map((ref, i) => (
          <ReferenceLine
            key={i}
            y={ref.y}
            label={{ value: ref.label, fill: ref.color || "#ef4444", fontSize: 10 }}
            stroke={ref.color || "#ef4444"}
            strokeDasharray="3 3"
          />
        ))}

        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            fill={`url(#grad-${s.key})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Specialized Live Heart Rate Chart with stats panel */
export function LiveHeartRatePanel({
  samples,
  windowSeconds = 60,
}: {
  samples: VitalSample[];
  windowSeconds?: number;
}) {
  const windowData = samples.slice(-windowSeconds);
  const heartRates = windowData.map((s) => s.heartRate);

  const current = heartRates.length ? heartRates[heartRates.length - 1] : 76;
  const min = heartRates.length ? Math.min(...heartRates) : 60;
  const max = heartRates.length ? Math.max(...heartRates) : 100;
  const avg = heartRates.length
    ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
    : 74;

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Live Heart Rate</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              <span className="size-1.5 rounded-full bg-rose-500 live-dot" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Continuous PPG telemetry · 1 Hz stream</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center rounded-md bg-muted/50 px-2.5 py-1">
            <span className="text-[10px] text-muted-foreground block">Current</span>
            <span className="metric font-bold text-rose-600 dark:text-rose-400 text-sm">
              {current} BPM
            </span>
          </div>
          <div className="text-center rounded-md bg-muted/50 px-2.5 py-1">
            <span className="text-[10px] text-muted-foreground block">Avg</span>
            <span className="metric font-semibold text-foreground text-sm">{avg} BPM</span>
          </div>
          <div className="text-center rounded-md bg-muted/50 px-2.5 py-1">
            <span className="text-[10px] text-muted-foreground block">Min</span>
            <span className="metric font-semibold text-muted-foreground text-sm">{min}</span>
          </div>
          <div className="text-center rounded-md bg-muted/50 px-2.5 py-1">
            <span className="text-[10px] text-muted-foreground block">Max</span>
            <span className="metric font-semibold text-muted-foreground text-sm">{max}</span>
          </div>
        </div>
      </div>

      <RealtimeChart
        data={windowData}
        series={[
          {
            key: "heartRate",
            label: "Heart Rate (BPM)",
            color: "var(--color-chart-5)",
            domain: [50, 160],
          },
        ]}
        height={220}
      />
    </div>
  );
}

/** Bedside Medical ECG Monitor with interactive canvas sweep */
export function LiveECGCanvas({
  samples,
  gain = 1,
  speed = 25,
  showGrid = true,
}: {
  samples: VitalSample[];
  gain?: number;
  speed?: number;
  showGrid?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sweepPos, setSweepPos] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let x = 0;
    const points: number[] = [];

    // Pre-generate smooth ECG stream
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      // Draw medical grid if enabled
      if (showGrid) {
        ctx.fillStyle = "#0a101d";
        ctx.fillRect(0, 0, w, h);

        // Small 1mm equivalent grid (10px)
        ctx.strokeStyle = "rgba(14, 165, 233, 0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = 0; gx < w; gx += 10) {
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, h);
        }
        for (let gy = 0; gy < h; gy += 10) {
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
        }
        ctx.stroke();

        // Major 5mm equivalent grid (50px)
        ctx.strokeStyle = "rgba(14, 165, 233, 0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = 0; gx < w; gx += 50) {
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, h);
        }
        for (let gy = 0; gy < h; gy += 50) {
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = "#0a101d";
        ctx.fillRect(0, 0, w, h);
      }

      // Draw continuous ECG waveform from samples buffer
      const latestEcg = samples.length ? samples[samples.length - 1]!.ecgVoltage : 0;
      points.push(latestEcg);
      if (points.length > w) points.shift();

      ctx.strokeStyle = "#10b981"; // Clinical Emerald Neon
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      const step = Math.max(1, Math.floor(w / (points.length || 1)));
      for (let i = 0; i < points.length; i++) {
        const px = i * step;
        const py = midY - (points[i] || 0) * 45 * gain;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Sweep line cursor
      x = (x + speed / 20) % w;
      setSweepPos(Math.round(x));

      ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
      ctx.fillRect(x, 0, 2, h);

      // Fade tail after sweep
      ctx.fillStyle = "rgba(10, 16, 29, 0.4)";
      ctx.fillRect(x + 2, 0, 20, h);
    };

    render();
    const interval = setInterval(render, 40);
    return () => clearInterval(interval);
  }, [samples, gain, speed, showGrid]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0a101d]">
      <canvas ref={canvasRef} width={900} height={260} className="w-full h-[260px] block" />
      <div className="absolute bottom-2 left-3 text-[10px] text-emerald-400 font-mono flex items-center gap-3">
        <span>LEAD I · 250 Hz</span>
        <span>GAIN: {gain}x</span>
        <span>SPEED: {speed} mm/s</span>
      </div>
    </div>
  );
}

/** Sleep Hypnogram Chart */
export function HypnogramChart({ height = 200 }: { height?: number }) {
  // Hypnogram mock stages: 3=Awake, 2=REM, 1=Light, 0=Deep
  const data = [
    { time: "23:00", stage: 3, label: "Awake" },
    { time: "23:30", stage: 1, label: "Light" },
    { time: "00:00", stage: 0, label: "Deep" },
    { time: "00:45", stage: 0, label: "Deep" },
    { time: "01:30", stage: 1, label: "Light" },
    { time: "02:00", stage: 2, label: "REM" },
    { time: "02:45", stage: 1, label: "Light" },
    { time: "03:15", stage: 0, label: "Deep" },
    { time: "04:00", stage: 1, label: "Light" },
    { time: "04:45", stage: 2, label: "REM" },
    { time: "05:30", stage: 1, label: "Light" },
    { time: "06:15", stage: 2, label: "REM" },
    { time: "06:45", stage: 1, label: "Light" },
    { time: "07:00", stage: 3, label: "Awake" },
  ];

  const stageMap: Record<number, string> = {
    3: "Awake",
    2: "REM",
    1: "Light",
    0: "Deep",
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#312e81" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="time" {...axisProps} />
        <YAxis
          {...axisProps}
          domain={[0, 3]}
          ticks={[0, 1, 2, 3]}
          tickFormatter={(val: number) => stageMap[val] || ""}
          width={55}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: string | number | undefined) => [
            typeof value === "number" ? stageMap[value] || value : value || "",
            "Sleep Stage",
          ]}
        />
        <Area
          type="stepAfter"
          dataKey="stage"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#sleepGrad)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Activity & Steps Daily Bar Chart */
export function ActivityBarChart({
  data,
  height = 240,
}: {
  data: { day: string; steps: number; goal: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="day" {...axisProps} />
        <YAxis {...axisProps} width={50} />
        <Tooltip {...tooltipStyle} />
        <ReferenceLine
          y={8000}
          stroke="#10b981"
          strokeDasharray="3 3"
          label={{ value: "8,000 Goal", fill: "#10b981", fontSize: 10 }}
        />
        <Bar dataKey="steps" name="Steps" radius={[6, 6, 0, 0]} isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.steps >= entry.goal ? "var(--color-normal)" : "var(--color-primary)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WaveformChart({ data, height = 180 }: { data: VitalSample[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data.slice(-120)} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="time" {...axisProps} minTickGap={60} />
        <YAxis {...axisProps} domain={[-2, 2]} width={46} />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey="ppg"
          name="PPG Signal (a.u.)"
          stroke="var(--color-chart-5)"
          strokeWidth={1.6}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ComparisonBarChart({
  data,
  dataKey,
  label,
  height = 260,
  horizontal = false,
}: {
  data: { name: string; [k: string]: string | number }[];
  dataKey: string;
  label: string;
  height?: number;
  horizontal?: boolean;
}) {
  const palette = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 16, left: horizontal ? 20 : -14, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={horizontal}
          horizontal={!horizontal}
        />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey="name" {...axisProps} width={92} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} width={56} />
          </>
        )}
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Bar
          dataKey={dataKey}
          name={label}
          radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
          isAnimationActive={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]!} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
