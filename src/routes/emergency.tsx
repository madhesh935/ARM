import { createFileRoute } from "@tanstack/react-router";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge, BatteryIndicator } from "@/components/common/indicators";
import { useSimulation } from "@/hooks/useSimulation";
import { PATIENTS, DEVICES, EMERGENCY_INCIDENT_MOCK } from "@/mock/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency SOS & Fall Telemetry — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Real-time emergency telemetry, fall detection validation, automated dispatch alerts, and incident timeline.",
      },
    ],
  }),
  component: EmergencyPage,
});

export function EmergencyPage() {
  const {
    latest,
    connected,
    emergencyActive,
    triggerEmergencySimulation,
    resetEmergencySimulation,
  } = useSimulation();

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;
  const incident = EMERGENCY_INCIDENT_MOCK;

  const hr = emergencyActive ? 138 : (latest?.heartRate ?? 76);
  const spo2 = emergencyActive ? 91 : (latest?.spo2 ?? 98);
  const sys = emergencyActive ? 154 : (latest?.systolic ?? 118);
  const dia = emergencyActive ? 96 : (latest?.diastolic ?? 76);

  return (
    <AppShell
      title="Emergency SOS & Fall Telemetry Console"
      subtitle="Critical incident response console with automated 3-axis fall detection, GPS geolocation, and instant escalation protocols"
    >
      {/* 1. EMERGENCY STATUS HERO BANNER */}
      <div
        className={`rounded-2xl border p-5 transition-all shadow-xs ${
          emergencyActive
            ? "border-critical bg-critical-soft/90 text-critical shadow-md animate-pulse"
            : "border-border bg-card text-foreground"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span
              className={`grid size-12 place-items-center rounded-2xl ${
                emergencyActive ? "bg-critical text-white shadow-md" : "bg-normal-soft text-normal"
              }`}
            >
              {emergencyActive ? (
                <ShieldAlert className="size-7" />
              ) : (
                <ShieldCheck className="size-7" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  {emergencyActive
                    ? "CRITICAL EMERGENCY INCIDENT IN PROGRESS"
                    : "Emergency Guard: Safe & Armed"}
                </h2>
                <StatusBadge
                  tone={emergencyActive ? "critical" : "normal"}
                  className="text-xs font-bold"
                >
                  {emergencyActive ? "Active SOS Alarm" : "Monitoring Clear"}
                </StatusBadge>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {emergencyActive
                  ? "Incident #EMG-2026-0817-01: High-impact fall event confirmed with acute tachycardia. Auto-broadcast active."
                  : "All 3-axis motion & PPG optical sensors armed. Zero abnormal impact forces detected in the active window."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emergencyActive ? (
              <Button
                variant="outline"
                className="bg-card text-foreground border-border hover:bg-muted font-bold text-xs rounded-xl h-9"
                onClick={() => {
                  resetEmergencySimulation();
                  toast.success("Emergency alarm dismissed and telemetry reset to normal");
                }}
              >
                <RotateCcw className="mr-1.5 size-4" /> Dismiss SOS Alarm
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="bg-critical hover:bg-critical/90 font-bold text-xs rounded-xl h-9 shadow-xs"
                onClick={() => {
                  triggerEmergencySimulation();
                  toast.error("Emergency SOS Fall Broadcast Triggered!");
                }}
              >
                <ShieldAlert className="mr-1.5 size-4" /> Trigger Test Fall Alert
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. INCIDENT VITALS & ACCELEROMETER TELEMETRY SNAPSHOT */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-rose-500 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Live Heart Rate
          </span>
          <div className="metric text-3xl font-black text-rose-600 dark:text-rose-400 my-1">
            {hr} <span className="text-xs text-muted-foreground font-semibold">BPM</span>
          </div>
          <span
            className={`text-[10px] font-bold ${emergencyActive ? "text-critical" : "text-normal"}`}
          >
            {emergencyActive ? "● Severe Tachycardia Spike" : "● Stable Resting Heart Rate"}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-sky-500 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Oxygen Saturation (SpO₂)
          </span>
          <div className="metric text-3xl font-black text-sky-600 dark:text-sky-400 my-1">
            {spo2}%
          </div>
          <span
            className={`text-[10px] font-bold ${emergencyActive ? "text-critical" : "text-normal"}`}
          >
            {emergencyActive ? "● Hypoxemic Trend Threshold" : "● Optimal Arterial Oxygen"}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-purple-500 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Blood Pressure
          </span>
          <div className="metric text-3xl font-black text-purple-600 dark:text-purple-400 my-1">
            {sys}/{dia} <span className="text-xs text-muted-foreground font-semibold">mmHg</span>
          </div>
          <span
            className={`text-[10px] font-bold ${emergencyActive ? "text-warning" : "text-normal"}`}
          >
            {emergencyActive ? "● Acute Hypertensive Spike" : "● Normotensive Baseline"}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 border-l-4 border-l-amber-500 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">
            Impact Acceleration
          </span>
          <div className="metric text-3xl font-black text-amber-600 dark:text-amber-400 my-1">
            {emergencyActive ? "3.84 G" : "0.98 G"}
          </div>
          <span
            className={`text-[10px] font-bold ${emergencyActive ? "text-critical" : "text-muted-foreground"}`}
          >
            {emergencyActive
              ? "● Impact Threshold > 2.8 G Exceeded"
              : "● Normal Gravitational Vector"}
          </span>
        </div>
      </div>

      {/* 3. SOS PROTOCOL SEQUENCE & EMERGENCY CONTACTS */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* User Identity & Live Geolocation */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground">User Identity & Live Geolocation</h3>
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <Navigation className="size-3 text-primary" /> GPS Synced
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">User Profile</span>
              <span className="font-bold text-foreground">
                {patient.name} ({patient.id})
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Age / Gender / Blood Group</span>
              <span className="font-semibold text-foreground">
                {patient.age} yrs · {patient.gender} · {patient.bloodGroup || "O+"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Primary Emergency Contact</span>
              <span className="font-bold text-foreground">{patient.emergencyContact}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Location Pin</span>
              <span className="font-mono text-foreground font-semibold flex items-center gap-1">
                <MapPin className="size-3 text-rose-500" /> 37.7749° N, 122.4194° W (Home)
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Wearable Hardware Link</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {device.name} · BLE 5.3 Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Automated SOS Escalation Protocol Timeline */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground">Automated Escalation Protocol</h3>
            <span className="text-xs text-muted-foreground">Autonomous On-Device Workflow</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-2.5">
              <span className="rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold px-1.5 py-0.5">
                T+0s
              </span>
              <div>
                <span className="font-bold text-foreground block">Impact Force Detection</span>
                <span className="text-[11px] text-muted-foreground">
                  3-axis accelerometer registers &gt;2.8 G impact spike with sudden freefall vector.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-2.5">
              <span className="rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold px-1.5 py-0.5">
                T+5s
              </span>
              <div>
                <span className="font-bold text-foreground block">Zero-Movement Posture Check</span>
                <span className="text-[11px] text-muted-foreground">
                  Checks for prolonged lack of movement indicating potential unresponsiveness.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-2.5">
              <span className="rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold px-1.5 py-0.5">
                T+15s
              </span>
              <div>
                <span className="font-bold text-foreground block">
                  Wrist Haptic Vibration & Siren
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Smart band triggers loud audio countdown giving the user 15 seconds to cancel.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/20 p-2.5">
              <span className="rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold px-1.5 py-0.5">
                T+30s
              </span>
              <div>
                <span className="font-bold text-foreground block">
                  Automated Dispatch & SMS Geolocation
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Transmits emergency packet with live vitals, GPS coordinates, and medical ID to
                  emergency contacts.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
