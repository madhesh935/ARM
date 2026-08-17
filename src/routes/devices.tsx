import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Battery,
  CheckCircle2,
  Cpu,
  HardDrive,
  MemoryStick,
  Radio,
  RefreshCw,
  RotateCcw,
  Signal,
  Sparkles,
  Thermometer,
  Upload,
  Wifi,
  Zap,
} from "lucide-react";
import { DigitalTwin } from "@/components/devices/DigitalTwin";
import { AppShell } from "@/components/layout/AppShell";
import { KeyValue, Panel } from "@/components/common/cards";
import { BatteryIndicator, StatusBadge } from "@/components/common/indicators";
import { DEVICES, SENSORS_LIST } from "@/mock/data";
import { useSimulation } from "@/hooks/useSimulation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Smart Band Hardware & Sensors — SmartHealth Portal" },
      {
        name: "description",
        content:
          "Wearable smart band hardware telemetry: ARM Cortex-M55 edge processor, battery status, BLE wireless link, firmware revision, and active sensor matrix.",
      },
    ],
  }),
  component: DevicesPage,
});

export function DevicesPage() {
  const [deviceId] = useState(DEVICES[0]!.id);
  const device = DEVICES.find((d) => d.id === deviceId) || DEVICES[0]!;
  const { latest, connected, ai } = useSimulation();

  const battery = device.id === DEVICES[0]!.id && latest ? latest.battery : device.battery;

  return (
    <AppShell
      title="Smart Band Hardware & Edge Diagnostics"
      subtitle="Wearable node telemetry, digital twin simulation, and ARM Cortex-M55 edge firmware diagnostics"
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl h-8.5 text-xs font-semibold"
            onClick={() =>
              toast.success(`SmartBand ${device.id} synchronized successfully (100 Hz Sync)`)
            }
          >
            <RefreshCw className="mr-1.5 size-3.5" /> Sync Now
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl h-8.5 text-xs font-semibold"
            onClick={() => toast.info(`Soft reboot sequence initiated on ${device.id}`)}
          >
            <RotateCcw className="mr-1.5 size-3.5" /> Restart Band
          </Button>
        </div>
      }
    >
      {/* 1. COMPACT DIGITAL TWIN OF THE SMART BAND */}
      <DigitalTwin device={device} />

      {/* 2. HARDWARE RESOURCE TELEMETRY METERS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Cortex-M55 CPU</span>
            <Cpu className="size-4 text-primary" />
          </div>
          <div className="my-2">
            <div className="metric text-2xl font-black text-foreground">{device.cpu}%</div>
            <p className="text-[10px] text-muted-foreground">160 MHz + Helium Vector DSP</p>
          </div>
          <Progress value={device.cpu} className="h-1.5" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">SRAM Memory</span>
            <MemoryStick className="size-4 text-indigo-500" />
          </div>
          <div className="my-2">
            <div className="metric text-2xl font-black text-foreground">
              {device.ramUsedKb}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {device.ramTotalKb} KB
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">INT8 activation buffers</p>
          </div>
          <Progress value={(device.ramUsedKb / device.ramTotalKb) * 100} className="h-1.5" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Flash Storage</span>
            <HardDrive className="size-4 text-sky-500" />
          </div>
          <div className="my-2">
            <div className="metric text-2xl font-black text-foreground">
              {device.storageUsedMb}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {device.storageTotalMb} MB
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">TFLite Micro weights & logs</p>
          </div>
          <Progress
            value={(device.storageUsedMb / device.storageTotalMb) * 100}
            className="h-1.5"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Battery Cell</span>
            <Battery className="size-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <div className="metric text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {Math.round(battery)}%
            </div>
            <p className="text-[10px] text-muted-foreground">Est. 48h active autonomy</p>
          </div>
          <Progress value={battery} className="h-1.5" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Chip Temp</span>
            <Thermometer className="size-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="metric text-2xl font-black text-foreground">
              {device.temperature.toFixed(1)}{" "}
              <span className="text-xs font-normal text-muted-foreground">°C</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Thermal throttle: Optimal</p>
          </div>
          <span className="text-[10px] text-normal font-semibold">● Thermal Safe</span>
        </div>
      </div>

      {/* 3. SENSOR STATUS MATRIX */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">On-Band Sensor Matrix</h3>
            <p className="text-xs text-muted-foreground">
              Integrated biomedical optical and MEMS inertial channels
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">All Sensors Calibrated</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SENSORS_LIST.map((sensor) => (
            <div
              key={sensor.name}
              className="rounded-xl border border-border/80 bg-muted/20 p-3.5 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{sensor.name}</span>
                  <StatusBadge
                    tone={sensor.status === "Active" ? "normal" : "info"}
                    className="text-[10px] font-bold"
                  >
                    {sensor.status}
                  </StatusBadge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sensor Channel: {sensor.type}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
                <span>
                  Sampling: <strong className="text-foreground">{sensor.sampleRate}</strong>
                </span>
                <span className="text-normal font-semibold">● Active Sync</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SPECIFICATIONS & MAINTENANCE */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground">Hardware Specifications</h3>
            <p className="text-xs text-muted-foreground">
              Embedded microcontroller and wireless subsystem
            </p>
          </div>

          <KeyValue
            items={[
              { label: "Hardware Node ID", value: device.id },
              { label: "Microcontroller", value: device.processor },
              { label: "Firmware Build", value: device.firmware },
              { label: "AI Graph Quantization", value: "INT8 CMSIS-NN Vectorized" },
              { label: "User Account", value: "Arun Menon (USR-00124)" },
              { label: "Pairing Timestamp", value: device.pairedAt },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Calibration & Firmware Maintenance
              </h3>
              <p className="text-xs text-muted-foreground">
                On-device maintenance actions and updates
              </p>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div>
                  <p className="text-xs font-semibold text-foreground">Sensor Zero-Calibration</p>
                  <p className="text-[11px] text-muted-foreground">
                    Recalibrate PPG baseline and 3-axis accelerometer zero-point
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 text-xs font-semibold"
                  onClick={() => toast.success("Sensors calibrated successfully")}
                >
                  Calibrate
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">OTA Firmware Check</p>
                  <p className="text-[11px] text-muted-foreground">
                    Current build: v2.4.1-prod (Latest)
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 text-xs font-semibold"
                  onClick={() => toast.info("Firmware build is up to date")}
                >
                  Check Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
