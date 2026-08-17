import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import { StatusBadge } from "./indicators";

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  description,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("panel p-4 sm:p-5", className)}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = "info",
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone?: StatusTone;
  hint?: string;
}) {
  const ring: Record<StatusTone, string> = {
    normal: "bg-normal-soft text-normal",
    warning: "bg-warning-soft text-warning-foreground",
    critical: "bg-critical-soft text-critical",
    info: "bg-info-soft text-info",
    offline: "bg-offline-soft text-muted-foreground",
  };
  return (
    <div className="panel flex items-start gap-3 p-4">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", ring[tone])}>
        <Icon className="size-4.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="metric mt-1 text-2xl leading-none font-semibold text-foreground">
          {value}
          {unit ? (
            <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
          ) : null}
        </p>
        {hint ? <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export function VitalCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = "normal",
  status,
  sub,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone?: StatusTone;
  status?: string;
  sub?: string;
}) {
  const accent: Record<StatusTone, string> = {
    normal: "border-l-normal",
    warning: "border-l-warning",
    critical: "border-l-critical",
    info: "border-l-info",
    offline: "border-l-offline",
  };
  return (
    <div className={cn("panel border-l-4 p-4", accent[tone])}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          {label}
        </span>
        {status ? (
          <StatusBadge tone={tone} showIcon={false} className="text-[10px]">
            {status}
          </StatusBadge>
        ) : null}
      </div>
      <p className="metric mt-3 text-3xl leading-none font-semibold text-foreground">
        {value}
        {unit ? (
          <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span>
        ) : null}
      </p>
      {sub ? <p className="mt-2 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function KeyValue({
  items,
  columns = 2,
}: {
  items: { label: string; value: React.ReactNode }[];
  columns?: 1 | 2 | 3 | 4;
}) {
  const cols = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-3", cols)}>
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center justify-between gap-3 border-b border-border/70 pb-2"
        >
          <dt className="text-xs text-muted-foreground">{it.label}</dt>
          <dd className="metric text-right text-sm font-medium text-foreground">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DemoDataNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      {children ?? "Values shown are simulated demo data from the mock sensor engine."}
    </p>
  );
}
