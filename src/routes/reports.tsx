import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Download,
  FileSpreadsheet,
  FileText,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Moon,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PATIENTS, DEVICES } from "@/mock/data";
import { useAlerts } from "@/hooks/useAlerts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Health & Activity Reports — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Generate and export comprehensive personal health summaries, sleep quality logs, daily activity metrics, and smart band logs.",
      },
    ],
  }),
  component: ReportsPage,
});

const REPORT_TYPES = [
  { id: "weekly", label: "Comprehensive 7-Day Personal Health & Activity Dossier" },
  { id: "vitals", label: "Continuous 24-Hour Cardiovascular Vitals & Telemetry Log" },
  { id: "sleep-recovery", label: "Sleep Architecture & Autonomic Recovery Analysis" },
  { id: "ecg-cardiac", label: "Cardiac Rhythm & Single-Lead ECG Observation Report" },
] as const;

const PERIODS = ["Last 7 Days", "Last 24 Hours", "Last 30 Days", "Current Month"] as const;

export function ReportsPage() {
  const alerts = useAlerts();
  const [reportType, setReportType] = useState<(typeof REPORT_TYPES)[number]["id"]>("weekly");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Last 7 Days");

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;

  const selectedTypeLabel = REPORT_TYPES.find((t) => t.id === reportType)!.label;

  const handleExportPdf = () => {
    toast.success("Generating printable health report PDF...");
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Timestamp,User,HeartRate,SpO2,Temp,Systolic,Diastolic,Steps,Calories,HRV,Status\n" +
      `2026-08-17 20:00,${patient.name},76,98,36.8,118,76,6824,1840,48,Normal\n` +
      `2026-08-17 19:00,${patient.name},74,98,36.7,116,74,6210,1720,50,Normal\n` +
      `2026-08-17 18:00,${patient.name},78,97,36.9,120,78,5400,1580,46,Normal\n` +
      `2026-08-17 17:00,${patient.name},72,98,36.8,118,76,4600,1400,52,Normal\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmartHealth_Dossier_${patient.id}_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Health Dataset CSV downloaded successfully");
  };

  return (
    <AppShell
      title="Health & Activity Reports"
      subtitle="Export comprehensive health dossiers, sleep quality logs, and wearable sensor datasets"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* 1. REPORT CONFIGURATION FORM */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 h-fit">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground">Report Configuration</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select parameters and export format
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="report-type" className="text-xs font-semibold">
                Dossier Type
              </Label>
              <Select
                value={reportType}
                onValueChange={(v) => setReportType(v as typeof reportType)}
              >
                <SelectTrigger id="report-type" className="text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">User Account</Label>
              <div className="rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-xs font-bold text-foreground flex items-center justify-between">
                <span>{patient.name}</span>
                <span className="metric text-muted-foreground font-normal">{patient.id}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-period" className="text-xs font-semibold">
                Reporting Timeframe
              </Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <SelectTrigger id="report-period" className="text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-3 border-t border-border/70 space-y-2">
              <Button className="w-full font-bold text-xs rounded-xl h-9" onClick={handleExportPdf}>
                <FileText className="mr-2 size-4" /> Export Document (PDF)
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs font-semibold rounded-xl h-9"
                onClick={handleExportCsv}
              >
                <FileSpreadsheet className="mr-2 size-4" /> Export Raw Dataset (CSV)
              </Button>
            </div>
          </div>
        </div>

        {/* 2. HIGH-FIDELITY PRINTABLE REPORT DOSSIER */}
        <div className="rounded-2xl border-2 border-border/90 bg-card p-6 shadow-xs space-y-5">
          {/* Header Banner */}
          <div className="border-b-2 border-primary pb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-primary">SmartHealth</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                  Personal Health Audit
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-1">{selectedTypeLabel}</h2>
              <p className="text-xs text-muted-foreground">
                Timeframe: {period} · Generated: 17 Aug 2026, 20:55 UTC · Ref: RPT-{patient.id}
                -202608
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-foreground block">Paired Hardware</span>
              <span className="text-muted-foreground font-mono">
                {device.name} (v{device.firmware})
              </span>
            </div>
          </div>

          {/* User Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/80 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                User Name
              </span>
              <span className="font-bold text-foreground">{patient.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                ID / Age
              </span>
              <span className="font-bold text-foreground">
                {patient.id} · {patient.age} yrs
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Emergency SOS Contact
              </span>
              <span className="font-bold text-foreground truncate block">
                {patient.emergencyContact}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Edge AI Status
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                INT8 CMSIS-NN Active
              </span>
            </div>
          </div>

          {/* Section 1: Biometric Baselines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="size-3.5 text-primary" /> 1. Physiological & Cardiovascular
              Baselines
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Mean Heart Rate
                </span>
                <span className="metric text-lg font-black text-foreground">74 BPM</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● Resting Baseline (58 BPM)
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Mean SpO₂
                </span>
                <span className="metric text-lg font-black text-foreground">98.2%</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● Optimal Arterial Range
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Mean Temperature
                </span>
                <span className="metric text-lg font-black text-foreground">36.8 °C</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● Thermal Equilibrium
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Blood Pressure
                </span>
                <span className="metric text-lg font-black text-foreground">118 / 76</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● Optimal Normotensive
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Activity & Sleep Aggregates */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Footprints className="size-3.5 text-primary" /> 2. Daily Activity & Sleep
              Architecture Aggregates
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Average Daily Steps
                </span>
                <span className="metric text-lg font-black text-foreground">7,480</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● 94% of 8,000 Target
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Mean Active Calories
                </span>
                <span className="metric text-lg font-black text-foreground">1,820 kcal</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● Steady Metabolic Burn
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  Mean Sleep Duration
                </span>
                <span className="metric text-lg font-black text-foreground">7h 28m</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● 91% Sleep Efficiency
                </span>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                  HRV RMSSD & Score
                </span>
                <span className="metric text-lg font-black text-foreground">48 ms · 84/100</span>
                <span className="text-[10px] text-normal block font-medium mt-0.5">
                  ● Prime Readiness
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Summary Conclusion */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-xs text-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> Wellness Summary & AI Synthesis
            </div>
            <p className="text-muted-foreground leading-relaxed">
              All tracked biometric channels are stable and aligned with healthy physiological
              benchmarks. Cardio recovery, nocturnal HRV rebound, and physical movement consistency
              remain within optimal bounds.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
