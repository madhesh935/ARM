import {
  Activity,
  Battery,
  Flame,
  Footprints,
  Moon,
  ShieldCheck,
  ShieldAlert,
  Signal,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { StatusTone } from "@/types";

interface SecondaryGridProps {
  steps: number;
  stepGoal?: number;
  calories: number;
  sleepFormatted: string;
  stressScore: number;
  fallDetected: boolean;
  activityState: string;
  batteryPercent: number;
  signalStrengthDbm: number;
}

export function SecondaryMetricCards({
  steps,
  stepGoal = 8000,
  calories,
  sleepFormatted,
  stressScore,
  fallDetected,
  activityState,
  batteryPercent,
  signalStrengthDbm,
}: SecondaryGridProps) {
  const stepPercent = Math.min(100, Math.round((steps / stepGoal) * 100));

  const stressTone: StatusTone =
    stressScore < 30 ? "normal" : stressScore < 60 ? "warning" : "critical";
  const stressLabel = stressScore < 30 ? "Low Stress" : stressScore < 60 ? "Moderate" : "Elevated";

  const batteryTone: StatusTone =
    batteryPercent <= 15 ? "critical" : batteryPercent <= 35 ? "warning" : "normal";

  const signalQuality =
    signalStrengthDbm >= -60
      ? "Excellent"
      : signalStrengthDbm >= -75
        ? "Good"
        : signalStrengthDbm >= -85
          ? "Fair"
          : "Poor";

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 xl:grid-cols-8">
      {/* 1. Steps */}
      <div className="panel p-3.5 flex flex-col justify-between transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Steps</span>
          <Footprints className="size-3.5 text-primary" />
        </div>
        <div className="my-1.5">
          <div className="metric text-lg font-bold text-foreground">{steps.toLocaleString()}</div>
          <p className="text-[10px] text-muted-foreground">Goal: {stepGoal.toLocaleString()}</p>
        </div>
        <Progress value={stepPercent} className="h-1.5" />
      </div>

      {/* 2. Calories */}
      <div className="panel p-3.5 flex flex-col justify-between transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Active Burn</span>
          <Flame className="size-3.5 text-amber-500" />
        </div>
        <div className="my-1.5">
          <div className="metric text-lg font-bold text-foreground">{calories}</div>
          <p className="text-[10px] text-muted-foreground">kcal burned</p>
        </div>
        <span className="text-[10px] text-normal font-medium">● Normal metabolism</span>
      </div>

      {/* 3. Sleep */}
      <div className="panel p-3.5 flex flex-col justify-between transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Last Sleep</span>
          <Moon className="size-3.5 text-indigo-500" />
        </div>
        <div className="my-1.5">
          <div className="metric text-lg font-bold text-foreground">{sleepFormatted}</div>
          <p className="text-[10px] text-muted-foreground">Score: 84 / 100</p>
        </div>
        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
          ● Restorative
        </span>
      </div>

      {/* 4. Stress */}
      <div className="panel p-3.5 flex flex-col justify-between transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Stress Level</span>
          <Smile
            className={cn("size-3.5", stressTone === "normal" ? "text-normal" : "text-warning")}
          />
        </div>
        <div className="my-1.5">
          <div className="metric text-lg font-bold text-foreground">{stressScore}</div>
          <p className="text-[10px] text-muted-foreground">{stressLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "size-1.5 rounded-full",
              stressTone === "normal"
                ? "bg-normal"
                : stressTone === "warning"
                  ? "bg-warning"
                  : "bg-critical",
            )}
          />
          <span className="text-[10px] text-muted-foreground">Autonomic tone</span>
        </div>
      </div>

      {/* 5. Fall Detection */}
      <div
        className={cn(
          "panel p-3.5 flex flex-col justify-between transition-all",
          fallDetected
            ? "border-critical bg-critical-soft/60 animate-pulse"
            : "hover:border-primary/40",
        )}
      >
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Fall Detection</span>
          {fallDetected ? (
            <ShieldAlert className="size-3.5 text-critical" />
          ) : (
            <ShieldCheck className="size-3.5 text-normal" />
          )}
        </div>
        <div className="my-1.5">
          <div
            className={cn(
              "text-xs font-bold leading-tight",
              fallDetected ? "text-critical" : "text-foreground",
            )}
          >
            {fallDetected ? "FALL DETECTED!" : "No Fall Detected"}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {fallDetected ? "Emergency triggered" : "Continuous 3-axis"}
          </p>
        </div>
        <span
          className={cn("text-[10px] font-medium", fallDetected ? "text-critical" : "text-normal")}
        >
          {fallDetected ? "● Critical Alert" : "● Posture Safe"}
        </span>
      </div>

      {/* 6. Activity */}
      <div className="panel p-3.5 flex flex-col justify-between transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Activity</span>
          <Activity className="size-3.5 text-cyan-600" />
        </div>
        <div className="my-1.5">
          <div className="metric text-lg font-bold text-foreground">{activityState}</div>
          <p className="text-[10px] text-muted-foreground">Accelerometer</p>
        </div>
        <span className="text-[10px] text-cyan-600 font-medium">● 50 Hz motion</span>
      </div>

      {/* 7. Battery */}
      <div className="panel p-3.5 flex flex-col justify-between transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Band Battery</span>
          <Battery
            className={cn("size-3.5", batteryTone === "normal" ? "text-normal" : "text-critical")}
          />
        </div>
        <div className="my-1.5">
          <div className="metric text-lg font-bold text-foreground">
            {Math.round(batteryPercent)}%
          </div>
          <p className="text-[10px] text-muted-foreground">SmartBand SB-01</p>
        </div>
        <Progress value={batteryPercent} className="h-1.5" />
      </div>

      {/* 8. Signal */}
      <div className="panel p-3.5 flex flex-col justify-between transition-all hover:border-primary/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-medium">Signal Quality</span>
          <Signal className="size-3.5 text-primary" />
        </div>
        <div className="my-1.5">
          <div className="metric text-sm font-bold text-foreground">{signalQuality}</div>
          <p className="metric text-[10px] text-muted-foreground">{signalStrengthDbm} dBm</p>
        </div>
        <span className="text-[10px] text-normal font-medium">● BLE 5.3 Active</span>
      </div>
    </div>
  );
}
