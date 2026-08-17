import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { KeyValue, Panel } from "@/components/common/cards";
import {
  BatteryIndicator,
  SignalQualityIndicator,
  StatusBadge,
} from "@/components/common/indicators";
import { useSimulation } from "@/hooks/useSimulation";
import { cn } from "@/lib/utils";
import type { InferenceState, StatusTone } from "@/types";

export const Route = createFileRoute("/adaptive")({
  head: () => ({
    meta: [
      { title: "Resource-Adaptive Inference — Edge AI Healthcare Band" },
      {
        name: "description",
        content:
          "How battery level, signal quality, activity and anomaly state drive the wearable band's inference frequency and model configuration.",
      },
      { property: "og:title", content: "Resource-Adaptive Inference" },
      {
        property: "og:description",
        content: "Adaptive inference state machine for the ARM wearable band.",
      },
    ],
  }),
  component: AdaptivePage,
});

const STATES: {
  id: InferenceState;
  title: string;
  tone: StatusTone;
  bullets: string[];
}[] = [
  {
    id: "NORMAL",
    title: "Normal state",
    tone: "normal",
    bullets: [
      "Stable multimodal signals",
      "Standard INT8 inference",
      "Lower inference frequency (0.5 Hz)",
    ],
  },
  {
    id: "SUSPICIOUS",
    title: "Suspicious state",
    tone: "warning",
    bullets: [
      "Unusual sensor trend detected",
      "Increased inference frequency (2 Hz)",
      "Additional feature-window analysis",
    ],
  },
  {
    id: "LOW_BATTERY",
    title: "Low battery state",
    tone: "critical",
    bullets: [
      "Resource-saving inference",
      "Reduced computation and duty cycle",
      "Inference every 10 s",
    ],
  },
  {
    id: "POOR_SIGNAL",
    title: "Poor signal state",
    tone: "offline",
    bullets: [
      "Decision deferred for the window",
      "Request better sensor contact",
      "No anomaly classification issued",
    ],
  },
];

function AdaptivePage() {
  const { latest, activity, ai, inferenceState, inferenceHz, stateTimeline } = useSimulation();

  return (
    <AppShell
      title="Resource-Adaptive Inference"
      subtitle="Battery-, quality- and context-aware inference scheduling"
    >
      <Panel title="Current inputs and decision">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <StatusBadge
            tone={
              inferenceState === "NORMAL"
                ? "normal"
                : inferenceState === "SUSPICIOUS"
                  ? "warning"
                  : inferenceState === "LOW_BATTERY"
                    ? "critical"
                    : "offline"
            }
          >
            {inferenceState.replace("_", " ")}
          </StatusBadge>
          <SignalQualityIndicator quality={latest?.signalQuality ?? "Good"} />
          {latest ? <BatteryIndicator level={latest.battery} /> : null}
        </div>
        <KeyValue
          columns={3}
          items={[
            { label: "Battery level", value: `${latest ? Math.round(latest.battery) : "--"}%` },
            { label: "Signal quality", value: latest?.signalQuality ?? "--" },
            { label: "Activity state", value: activity },
            { label: "Anomaly state", value: ai.status },
            {
              label: "Inference frequency",
              value: `${inferenceHz} Hz (every ${(1 / inferenceHz).toFixed(1)} s)`,
            },
            { label: "Current model", value: `${ai.modelVersion} · ${ai.mode}` },
          ]}
        />
      </Panel>

      <Panel
        title="Decision states"
        description="The scheduler selects one state per inference window"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATES.map((s) => {
            const active = inferenceState === s.id;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  active ? "border-primary bg-accent" : "border-border bg-card",
                )}
                aria-current={active ? "true" : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  {active ? <StatusBadge tone={s.tone}>Active</StatusBadge> : null}
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground"
                        aria-hidden
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Inference mode timeline"
        description="State transitions observed during this session"
      >
        <ol className="relative space-y-3 border-l border-border pl-5">
          {[...stateTimeline].reverse().map((s, i) => (
            <li key={`${s.t}-${i}`} className="relative">
              <span
                className="absolute top-1.5 -left-[23px] size-2.5 rounded-full bg-primary"
                aria-hidden
              />
              <p className="text-sm text-foreground">{s.state.replace("_", " ")}</p>
              <p className="metric text-xs text-muted-foreground">{s.time}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </AppShell>
  );
}
