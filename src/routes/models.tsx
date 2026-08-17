import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KeyValue, Panel } from "@/components/common/cards";
import { StatusBadge } from "@/components/common/indicators";
import { MODELS } from "@/mock/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "AI Model Registry — Quantized Anomaly Detection Models" },
      {
        name: "description",
        content:
          "Versioned registry of quantized anomaly-detection models with architecture, dataset, inputs, outputs and detection metrics.",
      },
      { property: "og:title", content: "AI Model Registry" },
      { property: "og:description", content: "Model versions deployed to the ARM wearable band." },
    ],
  }),
  component: ModelsPage,
});

function ModelsPage() {
  const [selected, setSelected] = useState(
    MODELS.find((m) => m.status === "Active")?.version ?? MODELS[0]!.version,
  );
  const model = MODELS.find((m) => m.version === selected)!;

  return (
    <AppShell title="AI Model Registry" subtitle="Model versions available to the wearable band">
      <Panel title="Registered models">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantization</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>F1</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODELS.map((m) => (
                <TableRow
                  key={m.version}
                  data-state={m.version === selected ? "selected" : undefined}
                >
                  <TableCell className="metric font-medium">{m.version}</TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>{m.quantization}</TableCell>
                  <TableCell className="metric">{m.sizeKb} KB</TableCell>
                  <TableCell className="metric">{m.accuracy.toFixed(3)}</TableCell>
                  <TableCell className="metric">{m.f1.toFixed(3)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      tone={
                        m.status === "Active"
                          ? "normal"
                          : m.status === "Candidate"
                            ? "info"
                            : "offline"
                      }
                      showIcon={false}
                    >
                      {m.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(m.version)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Model ${model.version}`} description={model.type}>
          <KeyValue
            items={[
              { label: "Quantization", value: model.quantization },
              { label: "Model size", value: `${model.sizeKb} KB` },
              { label: "Accuracy", value: model.accuracy.toFixed(3) },
              { label: "F1 score", value: model.f1.toFixed(3) },
              { label: "Status", value: model.status },
              { label: "Created", value: model.created },
              { label: "Training date", value: model.trainingDate },
              { label: "Training dataset", value: model.dataset },
            ]}
          />
        </Panel>
        <Panel title="Inputs and outputs">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Input features
              </p>
              <ul className="space-y-1.5 text-sm text-foreground">
                {model.inputs.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Outputs
              </p>
              <ul className="space-y-1.5 text-sm text-foreground">
                {model.outputs.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Model outputs are health-monitoring indications for research demonstration and are not
            diagnostic.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
