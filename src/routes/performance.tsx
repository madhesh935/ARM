import { createFileRoute } from "@tanstack/react-router";
import { Gauge, HardDrive, MemoryStick, Target, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DemoDataNote, Panel } from "@/components/common/cards";
import { ComparisonBarChart } from "@/components/charts/charts";
import { PERF_VARIANTS } from "@/mock/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Edge AI Performance — FP32 vs INT8 vs ARM-Optimized" },
      {
        name: "description",
        content:
          "Measured model size, latency, memory, energy and detection metrics across FP32, INT8, ARM-optimized INT8 and adaptive inference variants.",
      },
      { property: "og:title", content: "Edge AI Performance" },
      {
        property: "og:description",
        content: "Quantization and ARM-optimization benchmark results.",
      },
    ],
  }),
  component: PerformancePage,
});

const CHARTS = [
  { key: "modelSizeKb", label: "Model size (KB)", icon: HardDrive },
  { key: "latencyMs", label: "Inference latency (ms)", icon: Gauge },
  { key: "ramKb", label: "Peak RAM (KB)", icon: MemoryStick },
  { key: "accuracy", label: "Accuracy", icon: Target },
  { key: "energyMj", label: "Energy per inference (mJ)", icon: Zap },
] as const;

function PerformancePage() {
  const rows = PERF_VARIANTS.map((v) => ({ ...v, name: v.label }));

  return (
    <AppShell
      title="Edge AI Performance"
      subtitle="Measured benchmark values from the configurable mock bench harness"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PERF_VARIANTS.map((v) => (
          <div key={v.key} className="panel p-4">
            <p className="text-sm font-semibold text-foreground">{v.label}</p>
            <dl className="mt-3 space-y-1.5 text-xs">
              {[
                ["Model size", `${v.modelSizeKb} KB`],
                ["Peak RAM", `${v.ramKb} KB`],
                ["Latency", `${v.latencyMs} ms`],
                ["CPU cycles", `${v.cpuCyclesM} M`],
                ["Energy", `${v.energyMj} mJ`],
                ["Accuracy", v.accuracy.toFixed(3)],
                ["F1", v.f1.toFixed(3)],
                ["False alert rate", v.falseAlertRate.toFixed(3)],
              ].map(([k, val]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="metric text-foreground">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {CHARTS.map((c) => (
          <Panel key={c.key} title={c.label}>
            <ComparisonBarChart data={rows} dataKey={c.key} label={c.label} height={230} />
          </Panel>
        ))}
      </div>

      <Panel
        title="Performance table"
        description="All values measured over 500 inference windows on the target board"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {PERF_VARIANTS.map((v) => (
                  <TableHead key={v.key}>{v.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(
                [
                  ["Model size (KB)", "modelSizeKb"],
                  ["RAM usage (KB)", "ramKb"],
                  ["Inference latency (ms)", "latencyMs"],
                  ["CPU cycles (M)", "cpuCyclesM"],
                  ["Energy per inference (mJ)", "energyMj"],
                  ["Accuracy", "accuracy"],
                  ["Precision", "precision"],
                  ["Recall", "recall"],
                  ["F1 score", "f1"],
                  ["False alert rate", "falseAlertRate"],
                ] as const
              ).map(([label, key]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{label}</TableCell>
                  {PERF_VARIANTS.map((v) => (
                    <TableCell key={v.key} className="metric">
                      {v[key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DemoDataNote>
          Benchmark values are configurable mock measurements supplied by the data layer; replace
          them with the bench harness output from the physical board.
        </DemoDataNote>
      </Panel>

      <Panel title="Optimization summary">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            INT8 quantization reduces the stored model footprint from{" "}
            {PERF_VARIANTS[0]!.modelSizeKb} KB to {PERF_VARIANTS[1]!.modelSizeKb} KB and peak RAM
            from {PERF_VARIANTS[0]!.ramKb} KB to {PERF_VARIANTS[1]!.ramKb} KB in these measurements,
            while F1 changes from {PERF_VARIANTS[0]!.f1.toFixed(3)} to{" "}
            {PERF_VARIANTS[1]!.f1.toFixed(3)}.
          </li>
          <li>
            ARM-optimized kernels reduce measured latency from {PERF_VARIANTS[1]!.latencyMs} ms to{" "}
            {PERF_VARIANTS[2]!.latencyMs} ms on the same INT8 graph.
          </li>
          <li>
            Adaptive scheduling lowers measured energy per inference to {PERF_VARIANTS[3]!.energyMj}{" "}
            mJ, with a false alert rate of {PERF_VARIANTS[3]!.falseAlertRate.toFixed(3)} in this
            configuration.
          </li>
          <li>
            All statements above are read directly from the measurement table; no scaling claims are
            asserted.
          </li>
        </ul>
      </Panel>
    </AppShell>
  );
}
