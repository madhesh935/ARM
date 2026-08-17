import { useState, useEffect, useRef } from "react";
import {
  Activity,
  Battery,
  Bluetooth,
  CheckCircle2,
  Cpu,
  Droplets,
  Eye,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Info,
  Layers,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { StatusBadge } from "@/components/common/indicators";
import { Device } from "@/types";

import type { LucideIcon } from "lucide-react";

interface DigitalTwinProps {
  device: Device;
}

type TwinViewMode = "front" | "sensors" | "teardown";

interface Hotspot {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: string;
  status: string;
  icon: LucideIcon;
}

export function DigitalTwin({ device }: DigitalTwinProps) {
  const { latest, samples } = useSimulation();

  const [viewMode, setViewMode] = useState<TwinViewMode>("front");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const hr = latest?.heartRate ?? 76;
  const spo2 = latest?.spo2 ?? 98;
  const temp = latest?.temperature ?? 36.8;
  const steps = latest?.steps ?? 6824;
  const battery = latest?.battery ?? device.battery;

  // Hardware hotspots
  const hotspots: Hotspot[] = [
    {
      id: "oled",
      name: '1.47" AMOLED Touch Display',
      category: "Optoelectronics",
      description:
        "194×368 resolution, 450 nits peak brightness curved 2.5D sapphire crystal glass.",
      specs: "60 Hz Refresh · 2.5D Sapphire",
      status: "Active 60 Hz",
      icon: Activity,
    },
    {
      id: "ppg",
      name: "Bio-Optical PPG Sensor Hub",
      category: "Photoplethysmography",
      description:
        "Dual-wavelength 525nm green + 660/940nm red/infrared optical LEDs for HR & SpO2.",
      specs: "100 Hz Sampling · PI 4.8%",
      status: "Active · PI 4.8%",
      icon: HeartPulse,
    },
    {
      id: "soc",
      name: "ARM Cortex-M55 + Helium DSP",
      category: "Embedded Microcontroller",
      description:
        "160 MHz microcontroller running INT8 CMSIS-NN quantized neural network inference.",
      specs: "160 MHz · 512 KB SRAM · 18.2ms",
      status: "Nominal · 28% CPU",
      icon: Cpu,
    },
    {
      id: "ecg",
      name: "316L Stainless ECG Electrodes",
      category: "Bio-Impedance",
      description:
        "Medical-grade stainless steel dry contact electrodes for single-lead continuous ECG.",
      specs: "250 Hz Multi-Lead Sampling",
      status: "Skin Contact Good",
      icon: Heart,
    },
    {
      id: "battery",
      name: "240 mAh Li-Po Battery Cell",
      category: "Power Subsystem",
      description: "High-density Lithium Polymer battery with magnetic fast charging contacts.",
      specs: "3.8V Nominal · 48h Autonomy",
      status: `${Math.round(battery)}% Charged`,
      icon: Battery,
    },
    {
      id: "ble",
      name: "Bluetooth Low Energy 5.3 SoC",
      category: "Wireless Telemetry",
      description:
        "Encrypted AES-128 bidirectional link streaming 100 Hz continuous sensor packets.",
      specs: "2.4 GHz · -62 dBm RSSI",
      status: "Encrypted Active",
      icon: Bluetooth,
    },
  ];

  // Real-time continuous ECG oscilloscope canvas wave on the OLED watchface
  useEffect(() => {
    if (viewMode !== "front") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Neon cyan ECG waveform
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#0284c7";
      ctx.beginPath();

      const sliceCount = 28;
      const recent = samples.slice(-sliceCount);
      const step = w / (sliceCount - 1);

      recent.forEach((s, idx) => {
        const x = idx * step;
        const norm = (s.ecgVoltage ?? 0) * 14;
        const y = h / 2 - norm;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [viewMode, samples]);

  return (
    <div className="rounded-2xl border-2 border-border/80 bg-card shadow-xs overflow-hidden">
      {/* Header with View Tabs (Compact) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 p-3.5 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <Eye className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Digital Twin — {device.name}</h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Continuous 100 Hz sensor synchronization & edge hardware mirroring
            </p>
          </div>
        </div>

        {/* View Selection Controls */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-xs text-xs">
          {[
            { id: "front", label: "Front Face", icon: Activity },
            { id: "sensors", label: "Sensor Hub", icon: HeartPulse },
            { id: "teardown", label: "Internal SoC", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setViewMode(tab.id as TwinViewMode);
                  if (tab.id === "front") setSelectedHotspot(hotspots[0]);
                  else if (tab.id === "sensors") setSelectedHotspot(hotspots[1]);
                  else if (tab.id === "teardown") setSelectedHotspot(hotspots[2]);
                }}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="size-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Viewport: Compact Left Watch Stage (280px) + Expansive Right Diagnostics Deck (1fr) */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] divide-y md:divide-y-0 md:divide-x divide-border/70">
        {/* ================================================================ */}
        {/* COMPACT SMART BAND VIEWPORT (Left Column - 280px) */}
        {/* ================================================================ */}
        <div className="relative min-h-[340px] w-full select-none overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-3">
          {/* Spatial Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-56 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

          {/* MODE 1: FRONT OLED WATCHFACE */}
          {viewMode === "front" && (
            <div className="relative flex flex-col items-center my-auto scale-90">
              {/* Top Strap */}
              <div className="w-20 h-9 rounded-t-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 border-x-2 border-t-2 border-slate-700 shadow-md relative overflow-hidden">
                <div className="w-full h-full flex flex-col justify-evenly px-2.5 opacity-20">
                  <div className="h-0.5 w-full bg-slate-400 rounded-full" />
                </div>
              </div>

              {/* Main Watch Capsule Frame */}
              <div className="relative w-40 h-56 rounded-[30px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-4 border-slate-700 shadow-[0_12px_30px_rgba(0,0,0,0.9)] p-2 flex items-center justify-center">
                {/* Physical Side Function Button */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-md bg-gradient-to-r from-slate-600 to-slate-400 border border-slate-500 shadow-sm" />

                {/* Curved Metallic Inner Bezel */}
                <div className="w-full h-full rounded-[22px] bg-black border border-slate-800/80 p-2 flex flex-col justify-between relative overflow-hidden shadow-inner">
                  {/* Glass Specular Reflection */}
                  <div className="absolute -top-6 -left-6 size-24 rounded-full bg-gradient-to-br from-white/15 to-transparent blur-xs pointer-events-none" />

                  {/* Top Status Bar: Clock, BLE, Battery */}
                  <div className="flex items-center justify-between text-slate-400 text-[9px] font-mono z-10">
                    <span className="font-bold text-white text-[11px]">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex items-center gap-1">
                      <Bluetooth className="size-2.5 text-sky-400 animate-pulse" />
                      <span className="text-emerald-400 font-bold text-[9px]">
                        {Math.round(battery)}%
                      </span>
                    </div>
                  </div>

                  {/* Center Biometrics: Pulsing Heart Rate & Continuous ECG */}
                  <div className="text-center my-auto z-10 space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-rose-500">
                      <Heart className="size-3 animate-pulse text-rose-500" />
                      <span className="metric text-xl font-black text-white tracking-tight">
                        {hr}
                      </span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">BPM</span>
                    </div>

                    {/* Streaming Live ECG Canvas Wave */}
                    <div className="w-full h-8 bg-slate-950/90 rounded-md border border-slate-800/90 overflow-hidden flex items-center justify-center p-0.5">
                      <canvas ref={canvasRef} width={130} height={28} className="w-full h-full" />
                    </div>

                    {/* Secondary Metrics: SpO2 & Temperature */}
                    <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-300 font-mono">
                      <div className="bg-slate-900/90 rounded py-0.5 px-1 border border-slate-800 flex items-center justify-center gap-0.5">
                        <Droplets className="size-2 text-sky-400" />
                        <span className="text-sky-400 font-bold">{spo2}%</span>
                      </div>
                      <div className="bg-slate-900/90 rounded py-0.5 px-1 border border-slate-800 flex items-center justify-center gap-0.5">
                        <Thermometer className="size-2 text-amber-400" />
                        <span className="text-amber-400 font-bold">{temp.toFixed(1)}°</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Steps & ARM DSP status */}
                  <div className="flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-900 pt-1 z-10 font-mono">
                    <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                      <Footprints className="size-2.5" /> {steps.toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-[7px]">INT8 DSP</span>
                  </div>
                </div>
              </div>

              {/* Bottom Strap */}
              <div className="w-20 h-10 rounded-b-2xl bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 border-x-2 border-b-2 border-slate-700 shadow-md relative flex flex-col items-center justify-end pb-1.5">
                <div className="w-10 h-1.5 rounded bg-slate-600 border border-slate-400 shadow-xs" />
              </div>
            </div>
          )}

          {/* MODE 2: SENSOR HUB UNDERSIDE */}
          {viewMode === "sensors" && (
            <div className="relative flex flex-col items-center my-auto scale-90">
              <div className="w-20 h-9 rounded-t-2xl bg-slate-900 border-x-2 border-t-2 border-slate-700 opacity-60" />

              <div className="relative w-40 h-56 rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-950 to-black border-4 border-slate-700 shadow-xl p-3 flex flex-col items-center justify-between">
                {/* Top ECG Electrode */}
                <div className="w-28 h-4 rounded bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border border-slate-400 shadow-2xs flex items-center justify-center">
                  <span className="text-[7px] font-mono font-bold text-slate-800">
                    316L ECG LEAD (+)
                  </span>
                </div>

                {/* Central Optical Bio-Sensing Hub */}
                <div className="relative size-20 rounded-full bg-slate-900 border-2 border-slate-700 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center">
                  <div className="size-8 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse flex items-center justify-center">
                    <div className="size-3 rounded-full bg-emerald-200" />
                  </div>
                  <div className="absolute top-1.5 size-2 rounded-full bg-rose-600 shadow-[0_0_6px_#e11d48]" />
                  <div className="absolute bottom-1.5 size-2 rounded-full bg-rose-600 shadow-[0_0_6px_#e11d48]" />
                  <div className="absolute left-1.5 size-2 rounded-full bg-amber-500" />
                  <div className="absolute right-1.5 size-2 rounded-full bg-sky-500" />
                </div>

                {/* Bottom ECG Electrode */}
                <div className="w-28 h-4 rounded bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border border-slate-400 shadow-2xs flex items-center justify-center">
                  <span className="text-[7px] font-mono font-bold text-slate-800">
                    316L ECG LEAD (-)
                  </span>
                </div>

                <span className="text-[7px] font-mono text-slate-500 font-bold tracking-wider">
                  525nm PPG · 5ATM WATERPROOF
                </span>
              </div>

              <div className="w-20 h-9 rounded-b-2xl bg-slate-900 border-x-2 border-b-2 border-slate-700 opacity-60" />
            </div>
          )}

          {/* MODE 3: INTERNAL HARDWARE SoC X-RAY */}
          {viewMode === "teardown" && (
            <div className="relative flex flex-col items-center my-auto w-full max-w-[240px]">
              <div className="w-full rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3 space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="size-3.5 text-emerald-400 animate-pulse" />
                    <div>
                      <h4 className="text-[11px] font-bold text-white font-mono">
                        Cortex-M55 Core
                      </h4>
                      <span className="text-[8px] text-emerald-300 font-mono">
                        160 MHz + Helium DSP
                      </span>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-mono font-bold text-emerald-300 border border-emerald-500/40">
                    INT8
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                  <div className="rounded border border-emerald-500/30 bg-emerald-900/30 p-1.5">
                    <span className="text-emerald-400 font-bold block">SRAM</span>
                    <span className="text-white text-[9px]">512 KB Low-Power</span>
                  </div>
                  <div className="rounded border border-emerald-500/30 bg-emerald-900/30 p-1.5">
                    <span className="text-emerald-400 font-bold block">Latency</span>
                    <span className="text-white text-[9px]">18.2 ms Inference</span>
                  </div>
                  <div className="rounded border border-emerald-500/30 bg-emerald-900/30 p-1.5">
                    <span className="text-emerald-400 font-bold block">Battery</span>
                    <span className="text-white text-[9px]">240 mAh Li-Po</span>
                  </div>
                  <div className="rounded border border-emerald-500/30 bg-emerald-900/30 p-1.5">
                    <span className="text-emerald-400 font-bold block">BLE 5.3</span>
                    <span className="text-white text-[9px]">AES-128 Link</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sync indicator */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-xs border border-slate-700 px-2 py-0.5 text-[9px] text-slate-300 shadow-xs pointer-events-none">
            <Sparkles className="size-2.5 text-primary" />
            <span>100 Hz Live Telemetry</span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* EXPANSIVE HARDWARE DIAGNOSTICS DECK (Right Column - 1fr) */}
        {/* ================================================================ */}
        <div className="p-4 flex flex-col justify-between bg-card space-y-3">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Hardware Subsystems & Sensor Telemetry
                </h4>
                <span className="text-[10px] text-muted-foreground">
                  Select a subsystem below to inspect onboard diagnostics and real-time sampling
                </span>
              </div>
              <StatusBadge
                tone="normal"
                showIcon={false}
                className="text-[10px] px-2 py-0.5 font-bold"
              >
                All Systems Nominal
              </StatusBadge>
            </div>

            {/* 6 Comprehensive Hardware Subsystem Cards (2-Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {hotspots.map((h) => {
                const isSelected = selectedHotspot?.id === h.id;
                const Icon = h.icon;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHotspot(h)}
                    className={`text-left rounded-xl p-2.5 transition-all border text-xs flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? "bg-primary/10 border-primary text-foreground shadow-xs font-bold ring-1 ring-primary/40"
                        : "bg-muted/30 border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="metric text-[10px] font-bold text-primary">{h.status}</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block truncate text-xs">
                        {h.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {h.specs}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Hotspot Deep Diagnostic Detail Banner */}
            {selectedHotspot ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-normal" /> {selectedHotspot.name}
                  </span>
                  <span className="text-[10px] text-primary font-mono">
                    {selectedHotspot.category}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {selectedHotspot.description}
                </p>
                <div className="pt-1.5 border-t border-primary/10 flex justify-between text-[10px] text-primary font-mono">
                  <span>Sampling: Continuous 100 Hz</span>
                  <span>Health: Verified Nominal</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                <Info className="size-3.5 text-primary shrink-0" />
                <p className="text-[11px]">
                  Click on any subsystem card above to inspect onboard telemetry and memory
                  registers.
                </p>
              </div>
            )}
          </div>

          {/* Quick Hardware Spec Summary Footer */}
          <div className="pt-2.5 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
            <div>
              <span>Node ID:</span>{" "}
              <strong className="text-foreground font-mono">{device.id}</strong>
            </div>
            <div>
              <span>Firmware:</span>{" "}
              <strong className="text-foreground font-mono">{device.firmware}</strong>
            </div>
            <div>
              <span>Battery:</span>{" "}
              <strong className="text-emerald-500 font-mono">{Math.round(battery)}% Nominal</strong>
            </div>
            <div>
              <span>Edge AI:</span>{" "}
              <strong className="text-primary font-mono">INT8 CMSIS-NN</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
