import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HeartPulse,
  Radio,
  ShieldCheck,
  User,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KeyValue, Panel } from "@/components/common/cards";
import { SeverityBadge, SignalQualityIndicator, StatusBadge } from "@/components/common/indicators";
import { ALERTS, DEVICES, PATIENTS } from "@/mock/data";
import { setAlertStatus, useAlerts } from "@/hooks/useAlerts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/alerts/$id")({
  loader: ({ params }) => {
    const alert = ALERTS.find((a) => a.id === params.id);
    if (!alert) throw notFound();
    return { alertId: alert.id, type: alert.type };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Alert not found" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.alertId} — Alert Detail | SmartHealth` },
        {
          name: "description",
          content: `Diagnostic context for alert ${loaderData.alertId}: ${loaderData.type}.`,
        },
      ],
    };
  },
  component: AlertDetailPage,
  notFoundComponent: AlertNotFound,
});

function AlertNotFound() {
  return (
    <AppShell title="Alert Not Found">
      <Panel>
        <p className="text-sm text-muted-foreground">
          No alert matching this identifier was found.{" "}
          <Link to="/alerts" className="text-primary hover:underline">
            Back to alerts list
          </Link>
        </p>
      </Panel>
    </AppShell>
  );
}

function AlertDetailPage() {
  const { alertId } = Route.useLoaderData();
  const alerts = useAlerts();
  const alert = alerts.find((a) => a.id === alertId) || ALERTS[0]!;
  const patient = PATIENTS.find((p) => p.id === alert.patientId) || PATIENTS[0]!;
  const device = DEVICES.find((d) => d.id === alert.deviceId) || DEVICES[0]!;

  const timeline = [
    {
      time: alert.timestamp,
      label: "Threshold deviation captured by SmartBand sensors",
      status: "Triggered",
    },
    {
      time: alert.timestamp,
      label: "On-device INT8 inference flagged high confidence anomaly score",
      status: "Processed",
    },
    ...(alert.status !== "Active"
      ? [
          {
            time: "+ 2m 14s",
            label: "Acknowledged in user portal",
            status: "Acknowledged",
          },
        ]
      : []),
    ...(alert.status === "Resolved"
      ? [
          {
            time: "+ 14m 32s",
            label: "Wearable vitals re-stabilized; alert resolved",
            status: "Resolved",
          },
        ]
      : []),
  ];

  return (
    <AppShell
      title={`Alert ${alert.id} Detail`}
      subtitle={`${alert.type} — ${alert.patientName} (${alert.patientId})`}
      action={
        <Button variant="outline" size="sm" asChild>
          <Link to="/alerts">
            <ArrowLeft className="mr-1.5 size-3.5" /> Back to Alerts
          </Link>
        </Button>
      }
    >
      {/* Alert Header Summary */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-foreground">{alert.type}</h2>
              <SeverityBadge severity={alert.severity} />
              <StatusBadge
                tone={
                  alert.status === "Resolved"
                    ? "normal"
                    : alert.status === "Acknowledged"
                      ? "info"
                      : "warning"
                }
                showIcon={false}
                className="text-xs"
              >
                {alert.status}
              </StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {alert.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={alert.status !== "Active"}
              onClick={() => {
                setAlertStatus(alert.id, "Acknowledged");
                toast.success("Alert marked as acknowledged");
              }}
            >
              Acknowledge Alert
            </Button>
            <Button
              disabled={alert.status === "Resolved"}
              className="bg-normal hover:bg-normal/90 text-white font-semibold"
              onClick={() => {
                setAlertStatus(alert.id, "Resolved");
                toast.success("Alert resolved successfully");
              }}
            >
              Mark as Resolved
            </Button>
          </div>
        </div>
      </div>

      {/* Trigger Snapshot & Sensor Context */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Sensor Snapshot at Trigger Time */}
        <div className="panel p-5">
          <h3 className="text-base font-bold text-foreground mb-1">
            Vitals Snapshot at Event Time
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Recorded physiological parameters during incident
          </p>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
              <span className="text-[10px] font-medium text-muted-foreground block uppercase">
                Heart Rate
              </span>
              <span className="metric text-xl font-bold text-foreground mt-0.5 block">
                {alert.vitals.hr} BPM
              </span>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
              <span className="text-[10px] font-medium text-muted-foreground block uppercase">
                Blood Oxygen
              </span>
              <span className="metric text-xl font-bold text-foreground mt-0.5 block">
                {alert.vitals.spo2}%
              </span>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
              <span className="text-[10px] font-medium text-muted-foreground block uppercase">
                Temperature
              </span>
              <span className="metric text-xl font-bold text-foreground mt-0.5 block">
                {alert.vitals.temp.toFixed(1)} °C
              </span>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
              <span className="text-[10px] font-medium text-muted-foreground block uppercase">
                Blood Pressure
              </span>
              <span className="metric text-xl font-bold text-foreground mt-0.5 block">
                {alert.vitals.systolic || 120}/{alert.vitals.diastolic || 80}
              </span>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
              <span className="text-[10px] font-medium text-muted-foreground block uppercase">
                Activity State
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {alert.vitals.activity}
              </span>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
              <span className="text-[10px] font-medium text-muted-foreground block uppercase">
                Signal Quality
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">
                {alert.signalQuality}
              </span>
            </div>
          </div>
        </div>

        {/* Edge AI Attribution & Telemetry Context */}
        <div className="panel p-5">
          <h3 className="text-base font-bold text-foreground mb-1">
            Trigger Context & AI Attribution
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            On-device edge inference diagnosis context
          </p>

          <KeyValue
            items={[
              { label: "Trigger Timestamp", value: alert.timestamp },
              { label: "Patient Record", value: `${alert.patientName} (${alert.patientId})` },
              { label: "Wearable Node", value: `${device.name} (${device.id})` },
              { label: "AI Anomaly Score", value: alert.aiScore.toFixed(3) },
              {
                label: "Classification Confidence",
                value: `${Math.round(alert.confidence * 100)}%`,
              },
              { label: "Observed Value", value: alert.observedValue || "--" },
              { label: "Configured Threshold", value: alert.threshold || "--" },
            ]}
          />
        </div>
      </div>

      {/* Resolution Event Timeline */}
      <div className="panel p-5">
        <h3 className="text-base font-bold text-foreground mb-1">Incident Resolution Timeline</h3>
        <p className="text-xs text-muted-foreground mb-4">Chronological audit trail</p>

        <ol className="relative space-y-4 border-l border-border pl-5">
          {timeline.map((item, idx) => (
            <li key={idx} className="relative">
              <span className="absolute top-1.5 -left-[23px] size-2.5 rounded-full bg-primary" />
              <p className="text-xs font-bold text-foreground">{item.label}</p>
              <p className="metric text-[10px] text-muted-foreground">{item.time}</p>
            </li>
          ))}
        </ol>
      </div>
    </AppShell>
  );
}
