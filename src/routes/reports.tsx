import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Award,
  Bed,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Info,
  Layers,
  Moon,
  Printer,
  QrCode,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PATIENTS, DEVICES } from "@/mock/data";
import { useAlerts } from "@/hooks/useAlerts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Clinical Health Dossiers & Reports — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Generate, customize, and export clinical health dossiers, 24-hour telemetry audits, sleep architecture hypnograms, and physician-ready wearable reports.",
      },
    ],
  }),
  component: ReportsPage,
});

type ReportTypeId = "weekly" | "vitals" | "sleep-recovery" | "ecg-cardiac";
type AudienceType = "physician" | "personal" | "fitness";

const REPORT_TYPES = [
  {
    id: "weekly" as ReportTypeId,
    label: "Comprehensive 7-Day Health & Activity Dossier",
    short: "7-Day Dossier",
    desc: "Complete summary of cardiovascular, metabolic energy, sleep, and recovery metrics.",
  },
  {
    id: "vitals" as ReportTypeId,
    label: "Continuous 24-Hour Vitals & Telemetry Audit",
    short: "24h Vitals Log",
    desc: "Diurnal vital signs log with mean arterial pressure, temperature, and SpO2 ranges.",
  },
  {
    id: "sleep-recovery" as ReportTypeId,
    label: "Sleep Architecture & Autonomic Recovery Report",
    short: "Sleep & Recovery",
    desc: "Hypnogram decomposition, nocturnal resting HR dip, and HRV RMSSD parasympathetic recovery.",
  },
  {
    id: "ecg-cardiac" as ReportTypeId,
    label: "Cardiac Rhythm & Single-Lead ECG Observation Strip",
    short: "ECG Cardiac Report",
    desc: "P-Q-R-S-T wave interval measurements, Bazett QTc, rhythm regularity, and ectopy logs.",
  },
];

const PERIODS = ["Last 7 Days", "Last 24 Hours", "Last 30 Days", "Current Month"] as const;

export function ReportsPage() {
  const alerts = useAlerts();
  const [reportType, setReportType] = useState<ReportTypeId>("weekly");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Last 7 Days");
  const [audience, setAudience] = useState<AudienceType>("physician");

  // Inclusion flags
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAIInsights, setIncludeAIInsights] = useState(true);
  const [includeCoding, setIncludeCoding] = useState(true);

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;

  const selectedReport = REPORT_TYPES.find((t) => t.id === reportType)!;

  const handleExportPdf = () => {
    toast.success("Preparing high-resolution PDF document...");
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Timestamp,User_ID,User_Name,HeartRate_BPM,SpO2_Pct,Temp_C,Systolic_mmHg,Diastolic_mmHg,MAP_mmHg,HRV_RMSSD_ms,Steps,Active_kcal,Status\n" +
      `2026-08-17 20:00,${patient.id},${patient.name},76,98,36.8,118,76,90,48,6824,1840,Normal\n` +
      `2026-08-17 19:00,${patient.id},${patient.name},74,98,36.7,116,74,88,50,6210,1720,Normal\n` +
      `2026-08-17 18:00,${patient.id},${patient.name},78,97,36.9,120,78,92,46,5400,1580,Normal\n` +
      `2026-08-17 17:00,${patient.id},${patient.name},72,98,36.8,118,76,90,52,4600,1400,Normal\n` +
      `2026-08-17 16:00,${patient.id},${patient.name},70,98,36.6,115,74,88,54,3800,1210,Normal\n` +
      `2026-08-17 15:00,${patient.id},${patient.name},75,98,36.8,118,76,90,48,3100,1050,Normal\n` +
      `2026-08-17 14:00,${patient.id},${patient.name},82,97,36.9,122,78,93,42,2800,940,Normal\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmartHealth_${reportType}_${patient.id}_20260817.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Health Dataset CSV downloaded successfully");
  };

  const handleExportFhirJson = () => {
    const fhirBundle = {
      resourceType: "Bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      identifier: {
        system: "urn:ietf:rfc:3986",
        value: `urn:uuid:smarthealth-${patient.id}-20260817`,
      },
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: patient.id,
            name: [{ use: "official", text: patient.name }],
            gender: patient.gender.toLowerCase(),
            birthDate: "1984-06-12",
          },
        },
        {
          resource: {
            resourceType: "Device",
            id: device.id,
            modelNumber: device.name,
            version: [{ value: device.firmware }],
          },
        },
        {
          resource: {
            resourceType: "Observation",
            status: "final",
            code: {
              coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }],
            },
            subject: { reference: `Patient/${patient.id}` },
            valueQuantity: {
              value: 76,
              unit: "beats/minute",
              system: "http://unitsofmeasure.org",
              code: "/min",
            },
          },
        },
        {
          resource: {
            resourceType: "Observation",
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "2708-6",
                  display: "Oxygen saturation in Arterial blood",
                },
              ],
            },
            subject: { reference: `Patient/${patient.id}` },
            valueQuantity: { value: 98, unit: "%", system: "http://unitsofmeasure.org", code: "%" },
          },
        },
      ],
    };

    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `SmartHealth_FHIR_${patient.id}_20260817.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("FHIR R4 Diagnostic JSON bundle exported successfully");
  };

  return (
    <AppShell
      title="Clinical Health Dossiers & Reports"
      subtitle="Generate, customize, and export physician-ready health dossiers, 24-hour telemetry audits, and wearable datasets"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* ================================================================ */}
        {/* 1. REPORT BUILDER CONTROLS & OPTIONS */}
        {/* ================================================================ */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5 h-fit">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground">Dossier Builder</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure parameters, audience, and export format
            </p>
          </div>

          <div className="space-y-4">
            {/* Dossier Type Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Select Report Type</Label>
              <div className="space-y-1">
                {REPORT_TYPES.map((t) => {
                  const active = reportType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setReportType(t.id)}
                      className={`w-full text-left rounded-xl p-2.5 transition-all border text-xs flex flex-col justify-between ${
                        active
                          ? "bg-primary/10 border-primary text-foreground shadow-xs font-bold ring-1 ring-primary/40"
                          : "bg-muted/20 border-border/70 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span className="font-bold text-foreground block text-xs">{t.short}</span>
                      <span className="text-[10px] text-muted-foreground block line-clamp-1">
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Report Focus & Audience</Label>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/20 p-1 text-xs">
                {[
                  { id: "physician" as AudienceType, label: "Doctor" },
                  { id: "personal" as AudienceType, label: "Personal" },
                  { id: "fitness" as AudienceType, label: "Fitness" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAudience(item.id)}
                    className={`rounded-lg py-1 text-xs font-semibold transition-all ${
                      audience === item.id
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            <div className="space-y-1.5">
              <Label htmlFor="period-select" className="text-xs font-bold text-foreground">
                Reporting Window
              </Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                <SelectTrigger id="period-select" className="text-xs rounded-xl">
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

            {/* Content Inclusions */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-xs font-bold text-foreground block mb-1">
                Dossier Modules
              </Label>

              <label className="flex items-center justify-between text-xs text-foreground cursor-pointer">
                <span>7-Day Trajectory Sparklines</span>
                <Switch
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                  className="scale-75"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-foreground cursor-pointer">
                <span>AI Clinical Synthesis</span>
                <Switch
                  checked={includeAIInsights}
                  onCheckedChange={setIncludeAIInsights}
                  className="scale-75"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-foreground cursor-pointer">
                <span>LOINC & CPT Coding</span>
                <Switch
                  checked={includeCoding}
                  onCheckedChange={setIncludeCoding}
                  className="scale-75"
                />
              </label>
            </div>

            {/* Export Buttons */}
            <div className="pt-3 border-t border-border/70 space-y-2">
              <Button className="w-full font-bold text-xs rounded-xl h-9" onClick={handleExportPdf}>
                <Printer className="mr-2 size-4" /> Print / Export PDF
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold rounded-xl h-8.5"
                  onClick={handleExportCsv}
                >
                  <FileSpreadsheet className="mr-1.5 size-3.5" /> CSV Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold rounded-xl h-8.5"
                  onClick={handleExportFhirJson}
                >
                  <FileCode className="mr-1.5 size-3.5" /> FHIR JSON
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. HIGH-PRECISION PRINTABLE DOSSIER PREVIEW */}
        {/* ================================================================ */}
        <div className="rounded-2xl border-2 border-border/90 bg-card p-6 shadow-xs space-y-6">
          {/* Executive Header Banner */}
          <div className="border-b-2 border-primary pb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-primary tracking-tight">SmartHealth</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-wider">
                  {audience === "physician"
                    ? "Clinical Diagnostic Audit"
                    : audience === "fitness"
                      ? "Athletic Physiology Dossier"
                      : "Personal Health Summary"}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-foreground">{selectedReport.label}</h2>
              <p className="text-xs text-muted-foreground">
                Timeframe: {period} · Generated: 17 Aug 2026, 21:00 UTC · Document ID:{" "}
                <span className="font-mono font-semibold text-foreground">
                  SH-{patient.id}-20260817-A1
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-14 rounded-xl border border-border/80 bg-muted/40 p-1 flex items-center justify-center">
                <QrCode className="size-11 text-foreground opacity-80" />
              </div>
              <div className="text-right text-[10px] text-muted-foreground space-y-0.5">
                <span className="font-bold text-foreground block text-xs">Verified Hardware</span>
                <span className="font-mono block">{device.name}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                  INT8 CMSIS-NN OK
                </span>
              </div>
            </div>
          </div>

          {/* Subject Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/80 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                User Name
              </span>
              <span className="font-bold text-foreground text-xs">{patient.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Patient / User ID
              </span>
              <span className="font-bold text-foreground text-xs font-mono">
                {patient.id} · {patient.age} yrs ({patient.gender})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Emergency Contact
              </span>
              <span className="font-bold text-foreground text-xs truncate block">
                {patient.emergencyContact}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Device Node
              </span>
              <span className="font-mono text-foreground text-xs font-semibold">
                {device.id} (Firmware v{device.firmware})
              </span>
            </div>
          </div>

          {/* DYNAMIC SECTION 1: REPORT-SPECIFIC TELEMETRY */}

          {/* A. WEEKLY COMPREHENSIVE DOSSIER VIEW */}
          {reportType === "weekly" && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <HeartPulse className="size-3.5 text-primary" /> 1. 7-Day Baseline Biometrics &
                  Vital Statistics
                </h4>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60">
                        <TableHead className="text-xs font-bold">Parameter</TableHead>
                        <TableHead className="text-xs font-bold">Mean Value</TableHead>
                        <TableHead className="text-xs font-bold">7-Day Min / Max</TableHead>
                        <TableHead className="text-xs font-bold">Target Range</TableHead>
                        <TableHead className="text-xs font-bold">Status Assessment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          param: "Resting Heart Rate",
                          mean: "58 BPM",
                          range: "52 – 64 BPM",
                          target: "50 – 75 BPM",
                          status: "Optimal Baseline",
                          tone: "normal",
                        },
                        {
                          param: "Active Day Pulse",
                          mean: "74 BPM",
                          range: "61 – 118 BPM",
                          target: "60 – 100 BPM",
                          status: "Normocardic",
                          tone: "normal",
                        },
                        {
                          param: "Blood Oxygen (SpO₂)",
                          mean: "98.2%",
                          range: "96 – 99%",
                          target: "95 – 100%",
                          status: "Optimal Arterial",
                          tone: "normal",
                        },
                        {
                          param: "Blood Pressure",
                          mean: "118 / 76 mmHg",
                          range: "112/70 – 124/80",
                          target: "< 120/80 mmHg",
                          status: "Normotensive",
                          tone: "normal",
                        },
                        {
                          param: "HRV RMSSD",
                          mean: "48 ms",
                          range: "38 – 58 ms",
                          target: "> 35 ms",
                          status: "High Autonomic Tone",
                          tone: "normal",
                        },
                        {
                          param: "Skin Temperature",
                          mean: "36.8 °C",
                          range: "36.4 – 37.1 °C",
                          target: "36.1 – 37.2 °C",
                          status: "Thermal Equilibrium",
                          tone: "normal",
                        },
                      ].map((row) => (
                        <TableRow key={row.param} className="border-border/60">
                          <TableCell className="font-bold text-xs text-foreground">
                            {row.param}
                          </TableCell>
                          <TableCell className="metric text-xs font-black text-foreground">
                            {row.mean}
                          </TableCell>
                          <TableCell className="metric text-xs text-muted-foreground">
                            {row.range}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.target}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-normal">
                            ● {row.status}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 7-Day Trajectory Mini Visualizer */}
              {includeCharts && (
                <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">
                      7-Day Heart Rate & Activity Progression
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      11 Aug – 17 Aug 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {[
                      { day: "Mon", hr: 59, steps: 7200, score: 82 },
                      { day: "Tue", hr: 58, steps: 8100, score: 86 },
                      { day: "Wed", hr: 57, steps: 6900, score: 84 },
                      { day: "Thu", hr: 60, steps: 7500, score: 81 },
                      { day: "Fri", hr: 58, steps: 9200, score: 89 },
                      { day: "Sat", hr: 56, steps: 8400, score: 88 },
                      { day: "Sun", hr: 58, steps: 6824, score: 84 },
                    ].map((d) => (
                      <div
                        key={d.day}
                        className="rounded-lg bg-card p-2 border border-border/60 space-y-1"
                      >
                        <span className="text-[10px] text-muted-foreground font-bold block">
                          {d.day}
                        </span>
                        <span className="metric text-xs font-extrabold text-rose-600 dark:text-rose-400 block">
                          {d.hr} bpm
                        </span>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (d.steps / 9500) * 100)}%` }}
                          />
                        </div>
                        <span className="metric text-[9px] text-muted-foreground block">
                          {d.steps.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Footprints className="size-3.5 text-primary" /> 2. 7-Day Activity & Sleep
                  Architecture Breakdown
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                      Daily Step Average
                    </span>
                    <span className="metric text-xl font-black text-foreground">7,480</span>
                    <span className="text-[10px] text-normal block font-semibold mt-0.5">
                      ● 94% of 8,000 Goal
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                      Mean Active Calories
                    </span>
                    <span className="metric text-xl font-black text-foreground">1,820 kcal</span>
                    <span className="text-[10px] text-normal block font-semibold mt-0.5">
                      ● Steady Expenditure
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                      Mean Sleep Time
                    </span>
                    <span className="metric text-xl font-black text-foreground">7h 28m</span>
                    <span className="text-[10px] text-normal block font-semibold mt-0.5">
                      ● 91% Sleep Efficiency
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                      Recovery Score
                    </span>
                    <span className="metric text-xl font-black text-primary">84 / 100</span>
                    <span className="text-[10px] text-primary block font-semibold mt-0.5">
                      ● Prime Readiness
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. 24-HOUR VITALS LOG VIEW */}
          {reportType === "vitals" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="size-3.5 text-primary" /> 24-Hour Hourly Telemetry & Diurnal
                Excursions
              </h4>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60">
                      <TableHead className="text-xs font-bold">Time</TableHead>
                      <TableHead className="text-xs font-bold">Heart Rate</TableHead>
                      <TableHead className="text-xs font-bold">SpO₂</TableHead>
                      <TableHead className="text-xs font-bold">Blood Pressure</TableHead>
                      <TableHead className="text-xs font-bold">MAP</TableHead>
                      <TableHead className="text-xs font-bold">Skin Temp</TableHead>
                      <TableHead className="text-xs font-bold">Activity State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        time: "20:00 (Latest)",
                        hr: "76 BPM",
                        spo2: "98%",
                        bp: "118/76",
                        map: "90 mmHg",
                        temp: "36.8 °C",
                        act: "Resting",
                      },
                      {
                        time: "18:00 (Evening)",
                        hr: "94 BPM",
                        spo2: "98%",
                        bp: "122/78",
                        map: "92 mmHg",
                        temp: "37.0 °C",
                        act: "Active Walking",
                      },
                      {
                        time: "16:00 (Afternoon)",
                        hr: "72 BPM",
                        spo2: "99%",
                        bp: "116/74",
                        map: "88 mmHg",
                        temp: "36.8 °C",
                        act: "Sedentary",
                      },
                      {
                        time: "12:00 (Midday)",
                        hr: "80 BPM",
                        spo2: "98%",
                        bp: "119/76",
                        map: "90 mmHg",
                        temp: "36.9 °C",
                        act: "Light Movement",
                      },
                      {
                        time: "08:00 (Morning)",
                        hr: "75 BPM",
                        spo2: "98%",
                        bp: "117/75",
                        map: "89 mmHg",
                        temp: "36.7 °C",
                        act: "Awake Baseline",
                      },
                      {
                        time: "04:00 (Nocturnal)",
                        hr: "56 BPM",
                        spo2: "98%",
                        bp: "108/68",
                        map: "81 mmHg",
                        temp: "36.4 °C",
                        act: "Deep Sleep (N3)",
                      },
                      {
                        time: "00:00 (Midnight)",
                        hr: "60 BPM",
                        spo2: "98%",
                        bp: "110/70",
                        map: "83 mmHg",
                        temp: "36.5 °C",
                        act: "Light Sleep (N2)",
                      },
                    ].map((row) => (
                      <TableRow key={row.time} className="border-border/60">
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {row.time}
                        </TableCell>
                        <TableCell className="metric text-xs font-bold text-rose-600 dark:text-rose-400">
                          {row.hr}
                        </TableCell>
                        <TableCell className="metric text-xs font-bold text-sky-600 dark:text-sky-400">
                          {row.spo2}
                        </TableCell>
                        <TableCell className="metric text-xs font-bold text-foreground">
                          {row.bp}
                        </TableCell>
                        <TableCell className="metric text-xs text-muted-foreground">
                          {row.map}
                        </TableCell>
                        <TableCell className="metric text-xs text-muted-foreground">
                          {row.temp}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground">
                          {row.act}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* C. SLEEP ARCHITECTURE & RECOVERY VIEW */}
          {reportType === "sleep-recovery" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="size-3.5 text-primary" /> Nocturnal Architecture & Sleep Staging
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Deep Sleep (N3)
                  </span>
                  <span className="metric text-xl font-black text-indigo-600 dark:text-indigo-400">
                    1h 48m (24%)
                  </span>
                  <span className="text-[10px] text-normal block font-semibold mt-0.5">
                    ● Cellular Restoration
                  </span>
                </div>
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    REM Dream Sleep
                  </span>
                  <span className="metric text-xl font-black text-sky-600 dark:text-sky-400">
                    1h 45m (24%)
                  </span>
                  <span className="text-[10px] text-normal block font-semibold mt-0.5">
                    ● Neural Consolidation
                  </span>
                </div>
                <div className="rounded-xl border border-slate-500/30 bg-slate-500/5 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Light Sleep (N1/N2)
                  </span>
                  <span className="metric text-xl font-black text-foreground">3h 51m (52%)</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Physical Maintenance
                  </span>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Awake Interludes
                  </span>
                  <span className="metric text-xl font-black text-amber-500">18 min (4%)</span>
                  <span className="text-[10px] text-normal block font-semibold mt-0.5">
                    ● Low Sleep Fragmentation
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Autonomic Recovery & Nocturnal Dip Analysis</span>
                  <span className="text-primary font-mono">HRV RMSSD: 48 ms</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Nocturnal resting heart rate exhibited a healthy 12% dip (58 BPM nadir at 04:12),
                  signifying pronounced parasympathetic vagal dominance during slow-wave sleep.
                  Overnight mean respiratory rate remained uniform at 13.8 breaths/min with zero
                  desaturation events.
                </p>
              </div>
            </div>
          )}

          {/* D. ECG CARDIAC RHYTHM VIEW */}
          {reportType === "ecg-cardiac" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="size-3.5 text-primary" /> Single-Lead (Lead I) Cardiac
                Conduction & Interval Audit
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    PR Interval
                  </span>
                  <span className="metric text-xl font-black text-foreground">156 ms</span>
                  <span className="text-[10px] text-normal block font-semibold mt-0.5">
                    ● Normal (120–200ms)
                  </span>
                </div>
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    QRS Duration
                  </span>
                  <span className="metric text-xl font-black text-foreground">88 ms</span>
                  <span className="text-[10px] text-normal block font-semibold mt-0.5">
                    ● Narrow Complex
                  </span>
                </div>
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    QT / QTc (Bazett)
                  </span>
                  <span className="metric text-xl font-black text-foreground">382 / 412 ms</span>
                  <span className="text-[10px] text-normal block font-semibold mt-0.5">
                    ● Normal Repolarization
                  </span>
                </div>
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Ectopy / PAC / PVC
                  </span>
                  <span className="metric text-xl font-black text-emerald-600 dark:text-emerald-400">
                    0 Events
                  </span>
                  <span className="text-[10px] text-normal block font-semibold mt-0.5">
                    ● Clean 24h Window
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Conduction & Morphology Impression</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Normal Sinus Rhythm (NSR)
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  250 Hz single-lead telemetry demonstrates normal upright P waves, uniform P-R
                  intervals, isoelectric ST segments with zero ST-elevation/depression, and
                  symmetrical T waves. Zero evidence of atrial fibrillation, supraventricular runs,
                  or premature ventricular complexes.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 2: CLINICAL RISK STRATIFICATION & FITNESS INDICES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Estimated VO₂ Max
              </span>
              <span className="metric text-lg font-black text-foreground">46.2 mL/kg/min</span>
              <span className="text-[10px] text-normal block font-medium">
                ● Superior for Age Group (35-39)
              </span>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                10-Yr Cardiovascular Risk
              </span>
              <span className="metric text-lg font-black text-emerald-600 dark:text-emerald-400">
                &lt; 1.8% (ASCVD)
              </span>
              <span className="text-[10px] text-normal block font-medium">
                ● Low Atherosclerotic Risk
              </span>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Circadian Dipping Status
              </span>
              <span className="metric text-lg font-black text-foreground">12% Normal Dipper</span>
              <span className="text-[10px] text-normal block font-medium">
                ● Healthy Autonomic Reset
              </span>
            </div>
          </div>

          {/* SECTION 3: AI CLINICAL ATTESTATION */}
          {includeAIInsights && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs text-foreground space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> Physician Clinical Attestation & AI Neural
                  Synthesis
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  Model: ARM CMSIS-NN INT8 (99.4% Conformance)
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Biometric data verified and continuously cross-validated by wearable edge neural
                network inference running locally on the ARM Cortex-M55 microcontroller. All diurnal
                telemetry channels fall within normative physiological tolerances for age and
                activity profile.
              </p>
            </div>
          )}

          {/* SECTION 4: LOINC & CPT MEDICAL CODING MAPPINGS */}
          {includeCoding && (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-[10px] font-mono text-muted-foreground flex flex-wrap items-center justify-between gap-2">
              <span>
                LOINC: <strong>8867-4</strong> (Heart Rate), <strong>2708-6</strong> (SpO₂),{" "}
                <strong>8480-6</strong> (Systolic BP)
              </span>
              <span>
                CPT: <strong>93299</strong> (Wearable Remote Patient Monitoring Stream)
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
