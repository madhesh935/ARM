import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Cpu,
  Info,
  Lock,
  Phone,
  Save,
  Shield,
  Sliders,
  User,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/common/cards";
import { useAuth } from "@/hooks/useAuth";
import { useSimulation } from "@/hooks/useSimulation";
import { ROLE_LABEL } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Clinical Thresholds — SmartHealth" },
      {
        name: "description",
        content:
          "Configure clinical monitoring thresholds, notification routing, emergency contacts, and smart band preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

export function SettingsPage() {
  const { user } = useAuth();
  const { connected } = useSimulation();

  const [hrRange, setHrRange] = useState<number[]>([50, 115]);
  const [spo2Min, setSpo2Min] = useState<number[]>([92]);
  const [tempMax, setTempMax] = useState<number[]>([37.8]);
  const [sensitivity, setSensitivity] = useState<number[]>([75]);

  return (
    <AppShell
      title="Platform Settings & Threshold Configuration"
      subtitle="Configure clinical alert bounds, emergency escalation, and smart band device parameters"
    >
      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 w-full max-w-2xl text-xs p-1">
          <TabsTrigger value="thresholds" className="rounded-lg">
            Alert Thresholds
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="emergency" className="rounded-lg">
            Emergency Routing
          </TabsTrigger>
          <TabsTrigger value="smartband" className="rounded-lg">
            Smart Band
          </TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg">
            Profile & Security
          </TabsTrigger>
        </TabsList>

        {/* 1. Alert Thresholds */}
        <TabsContent value="thresholds" className="space-y-5">
          <div className="panel p-5 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Clinical Monitoring Thresholds
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Parameters that trigger active warning and critical alarm states
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold text-foreground">
                    Resting Heart Rate Alert Bounds —{" "}
                    <span className="text-primary metric">
                      {hrRange[0]}–{hrRange[1]} BPM
                    </span>
                  </Label>
                  <span className="text-muted-foreground">Normal default: 60–100 BPM</span>
                </div>
                <Slider min={40} max={160} step={1} value={hrRange} onValueChange={setHrRange} />
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold text-foreground">
                    Minimum SpO₂ Oxygenation Alert —{" "}
                    <span className="text-primary metric">{spo2Min[0]}%</span>
                  </Label>
                  <span className="text-muted-foreground">Critical boundary: &lt;90%</span>
                </div>
                <Slider min={80} max={98} step={1} value={spo2Min} onValueChange={setSpo2Min} />
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold text-foreground">
                    Maximum Body Temperature Bound —{" "}
                    <span className="text-primary metric">{tempMax[0]?.toFixed(1)} °C</span>
                  </Label>
                  <span className="text-muted-foreground">Normal baseline: 36.5–37.2 °C</span>
                </div>
                <Slider
                  min={36.5}
                  max={40.0}
                  step={0.1}
                  value={tempMax}
                  onValueChange={setTempMax}
                />
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold text-foreground">
                    Edge AI Anomaly Sensitivity —{" "}
                    <span className="text-primary metric">{sensitivity[0]}%</span>
                  </Label>
                  <span className="text-muted-foreground">
                    Threshold score: {(1 - (sensitivity[0] || 75) / 100).toFixed(2)}
                  </span>
                </div>
                <Slider
                  min={20}
                  max={95}
                  step={1}
                  value={sensitivity}
                  onValueChange={setSensitivity}
                />
              </div>

              {/* Required Medical Disclaimer Box */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Info className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Important Clinical Disclaimer:</strong> Threshold settings are for
                  monitoring and alerting purposes only and should be configured based on
                  professional clinical guidance. They do not replace individualized patient care
                  protocols.
                </p>
              </div>

              <Button
                onClick={() => toast.success("Threshold parameters updated for active session")}
              >
                <Save className="mr-2 size-4" /> Save Thresholds
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 2. Notifications */}
        <TabsContent value="notifications" className="space-y-5">
          <div className="panel p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground">Notification Preferences</h3>

            <div className="space-y-4">
              {[
                [
                  "Critical Alarm Popups",
                  "Always display persistent visual alarm for Critical vitals",
                  true,
                ],
                [
                  "Audible Tone on Critical",
                  "Play acoustic medical cue for severe threshold crossings",
                  true,
                ],
                [
                  "Warning Push Alerts",
                  "Notify attending care team when metrics drift outside target bounds",
                  true,
                ],
                ["Low Battery Warnings", "Notify when Smart Band charge drops below 15%", true],
                [
                  "Auto-Escalate Unresolved",
                  "Escalate unacknowledged alarms to secondary physician after 5 min",
                  true,
                ],
              ].map(([title, desc, def]) => (
                <div
                  key={title as string}
                  className="flex items-center justify-between border-b border-border/60 pb-3"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{title as string}</p>
                    <p className="text-[11px] text-muted-foreground">{desc as string}</p>
                  </div>
                  <Switch defaultChecked={def as boolean} />
                </div>
              ))}

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="alert-email" className="text-xs">
                  Alert Notification Email
                </Label>
                <Input
                  id="alert-email"
                  className="max-w-sm text-xs"
                  defaultValue={user?.email || "user@smarthealth.io"}
                />
              </div>

              <Button onClick={() => toast.success("Notification preferences saved")}>
                Save Preferences
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 3. Emergency Routing */}
        <TabsContent value="emergency" className="space-y-5">
          <div className="panel p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Emergency Contacts & Dispatch Setup
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure automated escalation phone numbers for Fall detection
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c1" className="text-xs">
                  Primary Emergency Contact
                </Label>
                <Input
                  id="c1"
                  className="text-xs"
                  defaultValue="Leela Menon (Spouse) · +1 (555) 234-5679"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c2" className="text-xs">
                  Secondary Emergency Contact
                </Label>
                <Input
                  id="c2"
                  className="text-xs"
                  defaultValue="Rahul Menon (Brother) · +1 (555) 888-9911"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ems" className="text-xs">
                  Emergency Services (911)
                </Label>
                <Input id="ems" className="text-xs" defaultValue="Emergency 911 Relay" />
              </div>
            </div>

            <Button onClick={() => toast.success("Emergency contacts saved")}>
              Update Emergency Routing
            </Button>
          </div>
        </TabsContent>

        {/* 4. Smart Band */}
        <TabsContent value="smartband" className="space-y-5">
          <div className="panel p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Smart Band Connectivity & Power Management
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Resource-Adaptive Sampling Rate
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Automatically reduce PPG duty cycle when battery &lt; 20%
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <p className="text-xs font-bold text-foreground">Signal Quality Gating</p>
                  <p className="text-[11px] text-muted-foreground">
                    Defer AI inference when motion artifact SNR is below 12 dB
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <p className="text-xs font-bold text-foreground">Flash Sample Caching</p>
                  <p className="text-[11px] text-muted-foreground">
                    Store up to 24 hours of telemetry on flash when offline
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>

            <Button onClick={() => toast.success("Band configuration synced to wearable")}>
              Sync Device Settings
            </Button>
          </div>
        </TabsContent>

        {/* 5. Account & Security */}
        <TabsContent value="account" className="space-y-5">
          <div className="panel p-5 space-y-4">
            <h3 className="text-base font-bold text-foreground">Account Profile & Security</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="acc-name" className="text-xs">
                  User Name
                </Label>
                <Input id="acc-name" className="text-xs" defaultValue={user?.name || ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-email" className="text-xs">
                  Email Address
                </Label>
                <Input id="acc-email" className="text-xs" defaultValue={user?.email || ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acc-role" className="text-xs">
                  Clinical Access Role
                </Label>
                <Input
                  id="acc-role"
                  className="text-xs"
                  readOnly
                  value={user ? ROLE_LABEL[user.role] : ""}
                />
              </div>
            </div>

            <Button onClick={() => toast.success("Profile saved")}>Save Profile</Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
