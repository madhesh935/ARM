import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import { StatusBadge } from "@/components/common/indicators";

interface VitalCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  normalRange: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    isPositive?: boolean;
  };
  tone?: StatusTone;
  statusLabel?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  subtext?: string;
}

export function PrimaryVitalCard({
  label,
  value,
  unit,
  icon: Icon,
  normalRange,
  trend,
  tone = "normal",
  statusLabel = "Normal",
  sparklineData = [65, 68, 72, 70, 75, 74, 76],
  sparklineColor = "#0284c7",
  subtext,
}: VitalCardProps) {
  const toneBorder: Record<StatusTone, string> = {
    normal: "border-l-normal",
    warning: "border-l-warning",
    critical: "border-l-critical",
    info: "border-l-info",
    offline: "border-l-offline",
  };

  const toneBg: Record<StatusTone, string> = {
    normal: "bg-normal-soft text-normal",
    warning: "bg-warning-soft text-warning-foreground",
    critical: "bg-critical-soft text-critical",
    info: "bg-info-soft text-info",
    offline: "bg-offline-soft text-muted-foreground",
  };

  // Generate SVG path for the mini sparkline
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 80;
  const height = 28;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      className={cn(
        "panel border-l-4 p-4 transition-all duration-200 hover:shadow-card-hover",
        toneBorder[tone],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("grid size-7 place-items-center rounded-lg", toneBg[tone])}>
            <Icon className="size-3.5" aria-hidden />
          </span>
          <span className="text-xs font-semibold tracking-tight text-muted-foreground">
            {label}
          </span>
        </div>
        <StatusBadge tone={tone} showIcon={false} className="text-[10px] py-0 px-2 font-medium">
          {statusLabel}
        </StatusBadge>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="metric text-3xl font-bold tracking-tight text-foreground">{value}</span>
          <span className="ml-1.5 text-xs font-medium text-muted-foreground">{unit}</span>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="shrink-0" title="Recent rolling trend">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={sparklineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2 text-[11px] text-muted-foreground">
        <span>
          Range: <strong className="font-medium text-foreground">{normalRange}</strong>
        </span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.isPositive === true
                ? "text-normal"
                : trend.isPositive === false
                  ? "text-critical"
                  : "text-muted-foreground",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : trend.direction === "down" ? (
              <ArrowDownRight className="size-3" />
            ) : (
              <Minus className="size-3" />
            )}
            {trend.value}
          </span>
        ) : subtext ? (
          <span>{subtext}</span>
        ) : null}
      </div>
    </div>
  );
}
