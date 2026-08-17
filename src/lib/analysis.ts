import type { VitalSample } from "@/types";

export function stats(values: number[]) {
  if (!values.length) return { avg: 0, min: 0, max: 0, sd: 0 };
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length);
  return { avg, min: Math.min(...values), max: Math.max(...values), sd };
}

export const fmt = (n: number, d = 1) => n.toFixed(d);

export function windowSamples(samples: VitalSample[], seconds: number) {
  const cutoff = Date.now() - seconds * 1000;
  const win = samples.filter((s) => s.t >= cutoff);
  return win.length ? win : samples.slice(-Math.min(samples.length, seconds));
}

/** Downsample for long ranges so charts stay readable. */
export function decimate<T>(rows: T[], target = 180): T[] {
  if (rows.length <= target) return rows;
  const step = Math.ceil(rows.length / target);
  return rows.filter((_, i) => i % step === 0);
}

export function trendSentence(label: string, values: number[], unit: string) {
  if (values.length < 4)
    return `Insufficient ${label.toLowerCase()} samples in the selected period.`;
  const s = stats(values);
  const first = stats(values.slice(0, Math.floor(values.length / 2)));
  const second = stats(values.slice(Math.floor(values.length / 2)));
  const delta = second.avg - first.avg;
  const rel = Math.abs(delta) / (Math.abs(first.avg) || 1);
  const direction =
    rel < 0.02 ? "remained relatively stable" : delta > 0 ? "trended upward" : "trended downward";
  return `${label} ${direction} during the selected period (mean ${fmt(s.avg)} ${unit}, SD ${fmt(s.sd, 2)}). Descriptive summary only — no clinical interpretation.`;
}

/** Generates a synthetic long-range history for trend pages (demo data). */
export function historyFor(range: "today" | "24h" | "7d" | "30d", offsetPeriods = 0) {
  const config = {
    today: { points: 96, stepMs: 15 * 60 * 1000 },
    "24h": { points: 144, stepMs: 10 * 60 * 1000 },
    "7d": { points: 168, stepMs: 60 * 60 * 1000 },
    "30d": { points: 180, stepMs: 4 * 60 * 60 * 1000 },
  }[range];
  const span = config.points * config.stepMs;
  const end = Date.now() - offsetPeriods * span;
  const rows = [];
  for (let i = config.points; i > 0; i--) {
    const t = end - i * config.stepMs;
    const h = (t / 3600000) % 24;
    const circadian = Math.sin(((h - 4) / 24) * Math.PI * 2);
    const seed = Math.sin(t / 7e6) * 0.5 + Math.sin(t / 1.7e6) * 0.5;
    rows.push({
      t,
      time:
        range === "today" || range === "24h"
          ? new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
          : new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      heartRate: Math.round(74 + circadian * 9 + seed * 4 + offsetPeriods * 1.5),
      spo2: Math.round((97.2 + circadian * 0.4 + seed * 0.3) * 10) / 10,
      temperature: Math.round((36.7 + circadian * 0.25 + seed * 0.08) * 100) / 100,
      activity: Math.round(Math.max(0, 0.25 + circadian * 0.28 + seed * 0.12) * 100) / 100,
      anomalyScore:
        Math.round(
          Math.max(0.02, 0.12 + seed * 0.12 + (Math.sin(t / 9e5) > 0.96 ? 0.6 : 0)) * 1000,
        ) / 1000,
    });
  }
  return rows;
}
