import { Link } from "@tanstack/react-router";
import { Activity, Cpu, HeartPulse, Radio, User, ShieldCheck, Zap, Footprints } from "lucide-react";
import type { Patient, Device } from "@/types";
import { StatusBadge, BatteryIndicator } from "@/components/common/indicators";
import { Button } from "@/components/ui/button";

export function PatientSummaryCard({
  patient,
  device,
  connected = true,
  lastSyncText = "2 seconds ago",
}: {
  patient: Patient;
  device: Device;
  connected?: boolean;
  lastSyncText?: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base border border-primary/20">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{patient.name}</h3>
              <StatusBadge tone={connected ? "normal" : "offline"} className="text-[10px]">
                {connected ? "Smart Band Active" : "Smart Band Offline"}
              </StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              User ID: <span className="metric font-medium text-foreground">{patient.id}</span> ·{" "}
              {patient.age} yrs · {patient.gender} · Blood: {patient.bloodGroup || "O+"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/devices">View Smart Band</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/live">Live Telemetry</Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/40 p-2.5 border border-border/60">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
            Emergency Contact
          </span>
          <span className="text-xs font-semibold text-foreground mt-0.5 block truncate">
            {patient.emergencyContact}
          </span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5 border border-border/60">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
            Daily Step Target
          </span>
          <span className="text-xs font-semibold text-foreground mt-0.5 block truncate">
            8,000 steps / day
          </span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5 border border-border/60">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
            Health Status
          </span>
          <span className="text-xs font-semibold text-normal mt-0.5 block truncate">
            All Biometrics Normal
          </span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5 border border-border/60">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
            Member Since
          </span>
          <span className="metric text-xs font-semibold text-foreground mt-0.5 block">
            {patient.monitoringStart}
          </span>
        </div>
      </div>

      {/* Connected Wearable Device Status Bar */}
      <div className="mt-4 rounded-xl border border-border bg-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Radio className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{device.name}</span>
              <span className="text-[10px] text-muted-foreground metric">({device.id})</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Edge SoC: {device.processor} · BLE 5.3 Wireless Link
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-[11px]">Sync:</span>
            <span className="font-semibold text-foreground metric">{lastSyncText}</span>
          </div>
          <BatteryIndicator level={device.battery} showPercentage />
        </div>
      </div>
    </div>
  );
}

export const UserSummaryCard = PatientSummaryCard;
