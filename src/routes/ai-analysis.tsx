import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DemoDataNote, KeyValue, Panel } from "@/components/common/cards";
import { RiskBadge, SignalQualityIndicator, StatusBadge } from "@/components/common/indicators";
import { ComparisonBarChart, RealtimeChart } from "@/components/charts/charts";
import { useSimulation } from "@/hooks/useSimulation";
import { decimate, windowSamples } from "@/lib/analysis";

export const Route = createFileRoute("/ai-analysis")({
  head: () => ({
    meta: [
      { title: "Edge AI Analysis — INT8 On-Device Inference" },
      {
        name: "description",
        content:
          "Current edge AI result, feature contributions, anomaly timeline and AI-generated explanation from the INT8 quantized on-device model.",
      },
      { property: "og:title", content: "Edge AI Analysis" },
      {
        property: "og:description",
        content: "INT8 on-device anomaly indication with feature attribution.",
      },
    ],
  }),
  component: AiAnalysisPage,
});

function AiAnalysisPage() {
  const { ai, samples, latest } = useSimulation();
  const window = decimate(windowSamples(samples, 900), 220);
  const anomalies = samples
    .filter((s) => s.anomalyScore >= 0.5)
    .slice(-8)
    .reverse();

  return (
    <AppShell
      title="Edge AI Analysis"
      subtitle="On-device INT8 inference — anomaly indication, not diagnosis"
    >
      <Panel title="Model in use">
        <KeyValue
          columns={3}
          items={[
            { label: "Current model", value: "Healthcare Anomaly Detection Model" },
            { label: "Model type", value: "1D-CNN + GRU neural network" },
            { label: "Quantization", value: "INT8 (post-training)" },
            { label: "Inference location", value: "On-device (wearable band)" },
            { label: "Framework", value: "TensorFlow Lite Micro / CMSIS-NN" },
            { label: "Model version", value: ai.modelVersion },
          ]}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Current AI result" className="lg:col-span-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={ai.status === "NORMAL" ? "normal" : "warning"}>
              {ai.status}
            </StatusBadge>
            <RiskBadge risk={ai.risk} />
          </div>
          <div className="mt-4">
            <KeyValue
              columns={1}
              items={[
                { label: "Anomaly score", value: ai.anomalyScore.toFixed(3) },
                { label: "Confidence", value: `${Math.round(ai.confidence * 100)}%` },
                { label: "Inference latency", value: `${ai.latencyMs.toFixed(1)} ms` },
                {
                  label: "Signal quality",
                  value: <SignalQualityIndicator quality={latest?.signalQuality ?? "Good"} />,
                },
                { label: "Inference mode", value: ai.mode },
              ]}
            />
          </div>
        </Panel>

        <Panel
          title="Feature contribution"
          description="Relative influence of each input on the current output"
          className="lg:col-span-2"
        >
          <ComparisonBarChart
            horizontal
            height={240}
            dataKey="value"
            label="Contribution (%)"
            data={ai.contributions.map((c) => ({ name: c.feature, value: c.value }))}
          />
          <DemoDataNote>
            Attribution values are produced by the demo explainability layer and are indicative
            only.
          </DemoDataNote>
        </Panel>
      </div>

      <Panel title="Anomaly score timeline" description="Last 15 minutes of on-device scores">
        <RealtimeChart
          data={window}
          series={[
            {
              key: "anomalyScore",
              label: "Anomaly score",
              color: "var(--color-chart-2)",
              domain: [0, 1],
            },
          ]}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Detected unusual patterns"
          description="Windows where the score crossed the review threshold (0.50)"
        >
          {anomalies.length ? (
            <ul className="divide-y divide-border text-sm">
              {anomalies.map((s) => (
                <li key={s.t} className="flex items-center justify-between gap-3 py-2">
                  <span className="metric text-xs text-muted-foreground">{s.time}</span>
                  <span className="metric text-sm">score {s.anomalyScore.toFixed(3)}</span>
                  <span className="metric text-xs">
                    HR {s.heartRate} · SpO2 {s.spo2}%
                  </span>
                  <StatusBadge tone={s.anomalyScore >= 0.7 ? "critical" : "warning"}>
                    {s.anomalyScore >= 0.7 ? "High" : "Medium"}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No windows crossed the review threshold in the current buffer.
            </p>
          )}
        </Panel>

        <Panel title="AI-generated explanation">
          <p className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-foreground">
            {ai.explanation}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            This text is generated from model feature attributions. It is an AI observation for
            research demonstration and is not a medical diagnosis or clinical recommendation.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
