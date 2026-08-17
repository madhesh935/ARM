import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DemoDataNote, Panel } from "@/components/common/cards";
import { ComparisonBarChart } from "@/components/charts/charts";
import { EXPERIMENTS, PERF_VARIANTS } from "@/mock/data";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Mode — Experiments and Measurement Protocol" },
      {
        name: "description",
        content:
          "Academic experiment set comparing quantization, ARM-optimized kernels, adaptive scheduling, multimodal inputs and signal-quality gating.",
      },
      { property: "og:title", content: "Research Mode" },
      {
        property: "og:description",
        content: "Experiment objectives, configurations and measured results.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <AppShell title="Research Mode" subtitle="Experiment definitions and measured outcomes">
      <Panel
        title="Project"
        description="Resource-Adaptive Edge AI Healthcare Monitoring Band Using INT8 Quantization and ARM-Optimized Inference"
      >
        <p className="text-sm text-muted-foreground">
          This section documents the experiment protocol used to characterise the wearable
          monitoring band. Each experiment isolates one variable and reports measured values from
          the benchmark table; the dashboard makes no diagnostic claim and reports only
          health-monitoring indications.
        </p>
        <DemoDataNote>
          All figures below come from the configurable mock measurement layer so the dashboard runs
          without hardware.
        </DemoDataNote>
      </Panel>

      {EXPERIMENTS.map((exp) => {
        const rows = PERF_VARIANTS.filter((v) =>
          (exp.variants as readonly string[]).includes(v.key),
        ).map((v) => ({
          ...v,
          name: v.label,
        }));
        return (
          <Panel key={exp.id} title={exp.title} description={exp.objective}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Configuration
                </p>
                <ul className="space-y-1.5 text-sm text-foreground">
                  {exp.configuration.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Measured result
                </p>
                <ul className="space-y-1.5 text-sm">
                  {rows.map((r) => (
                    <li
                      key={r.key}
                      className="flex justify-between gap-3 border-b border-border/70 pb-1.5"
                    >
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="metric text-foreground">
                        {r[exp.metric as keyof typeof r] as number}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <ComparisonBarChart
                data={rows}
                dataKey={exp.metric}
                label={exp.metricLabel}
                height={220}
              />
            </div>
          </Panel>
        );
      })}
    </AppShell>
  );
}
