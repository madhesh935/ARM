import {
  Activity,
  AlertTriangle,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  CheckCircle2,
  CircleSlash,
  Info,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertSeverity, RiskLevel, SignalQuality, StatusTone } from "@/types";

const toneClass: Record<StatusTone, string> = {
  normal: "bg-normal-soft text-normal border-normal/25",
  warning: "bg-warning-soft text-warning-foreground border-warning/35",
  critical: "bg-critical-soft text-critical border-critical/25",
  info: "bg-info-soft text-info border-info/25",
  offline: "bg-offline-soft text-muted-foreground border-border",
};

const toneIcon: Record<StatusTone, typeof Info> = {
  normal: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertTriangle,
  info: Info,
  offline: CircleSlash,
};

export function StatusBadge({
  tone,
  children,
  className,
  showIcon = true,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}) {
  const Icon = toneIcon[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {showIcon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
      {children}
    </span>
  );
}

export const riskTone = (risk: RiskLevel): StatusTone =>
  risk === "HIGH" ? "critical" : risk === "MEDIUM" ? "warning" : "normal";

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <StatusBadge tone={riskTone(risk)}>
      <span className="sr-only">Risk indicator: </span>
      {risk}
    </StatusBadge>
  );
}

export const severityTone = (s: AlertSeverity): StatusTone =>
  s === "Critical" ? "critical" : s === "Warning" ? "warning" : "info";

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>;
}

const qualityMeta: Record<
  SignalQuality,
  { tone: StatusTone; icon: typeof SignalHigh; bars: number }
> = {
  Excellent: { tone: "normal", icon: SignalHigh, bars: 4 },
  Good: { tone: "normal", icon: SignalMedium, bars: 3 },
  Fair: { tone: "warning", icon: SignalLow, bars: 2 },
  Poor: { tone: "critical", icon: SignalZero, bars: 1 },
};

export function SignalQualityIndicator({
  quality,
  className,
}: {
  quality: SignalQuality;
  className?: string;
}) {
  const meta = qualityMeta[quality];
  const Icon = meta.icon;
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      title={`Signal quality: ${quality}`}
    >
      <Icon className={cn("size-4", `text-${meta.tone}`)} aria-hidden />
      <StatusBadge tone={meta.tone} showIcon={false}>
        {quality}
      </StatusBadge>
    </span>
  );
}

export function BatteryIndicator({ level, className }: { level: number; className?: string }) {
  const tone: StatusTone = level <= 15 ? "critical" : level <= 35 ? "warning" : "normal";
  const Icon = level <= 15 ? BatteryLow : level <= 60 ? BatteryMedium : BatteryFull;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Icon
        className={cn(
          "size-4",
          tone === "critical"
            ? "text-critical"
            : tone === "warning"
              ? "text-warning"
              : "text-normal",
        )}
        aria-hidden
      />
      <span
        className="metric text-sm font-medium"
        aria-label={`Battery ${Math.round(level)} percent`}
      >
        {Math.round(level)}%
      </span>
    </span>
  );
}

export function LiveDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className={cn("size-2 rounded-full", active ? "live-dot bg-normal" : "bg-offline")}
        aria-hidden
      />
      {label}
    </span>
  );
}

export function ActivityChip({ state }: { state: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
      <Activity className="size-3.5" aria-hidden />
      {state}
    </span>
  );
}
