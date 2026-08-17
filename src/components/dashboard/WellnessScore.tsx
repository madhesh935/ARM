import {
  CheckCircle2,
  HeartPulse,
  Droplets,
  Thermometer,
  Activity,
  Moon,
  Smile,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CategoryScore {
  name: string;
  score: number;
  rating: string;
  icon: typeof HeartPulse;
  tone: "normal" | "warning" | "info";
}

export function WellnessScore({
  overallScore = 82,
  maxScore = 100,
}: {
  overallScore?: number;
  maxScore?: number;
}) {
  const categories: CategoryScore[] = [
    { name: "Cardiovascular", score: 86, rating: "Good", icon: HeartPulse, tone: "normal" },
    { name: "Blood Oxygen", score: 98, rating: "Excellent", icon: Droplets, tone: "normal" },
    { name: "Temperature", score: 94, rating: "Normal", icon: Thermometer, tone: "normal" },
    { name: "Daily Activity", score: 72, rating: "Moderate", icon: Activity, tone: "info" },
    { name: "Sleep Quality", score: 84, rating: "Good", icon: Moon, tone: "normal" },
    { name: "Autonomic Stress", score: 76, rating: "Moderate", icon: Smile, tone: "warning" },
  ];

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Indicative Wellness Score</h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              AI-Synthesized
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Holistic multidimensional wellness index computed across active vital streams.
          </p>
        </div>

        {/* Circular / Badge Score */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="metric text-3xl font-extrabold text-primary">
              {overallScore}
              <span className="text-sm font-normal text-muted-foreground"> / {maxScore}</span>
            </span>
            <span className="text-[11px] font-medium text-normal flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Stable Health Profile
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.name} className="rounded-lg border border-border/80 bg-muted/40 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">{cat.name}</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    cat.tone === "normal"
                      ? "text-normal"
                      : cat.tone === "warning"
                        ? "text-warning-foreground"
                        : "text-primary",
                  )}
                >
                  {cat.rating}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Score</span>
                <span className="metric font-medium text-foreground">{cat.score}%</span>
              </div>
              <Progress value={cat.score} className="mt-1 h-1.5" />
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground italic border-t border-border/60 pt-3">
        <strong>Disclaimer:</strong> The Indicative Wellness Score is a wearable telemetry heuristic
        for lifestyle and trend monitoring. It is not intended to replace professional medical
        diagnosis, clinical assessment, or treatment.
      </p>
    </div>
  );
}
