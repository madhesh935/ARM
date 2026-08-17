import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  HeartPulse,
  RotateCcw,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/useSimulation";
import { PATIENTS, DEVICES } from "@/mock/data";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "SmartHealth AI Assistant" },
      {
        name: "description",
        content:
          "Conversational health intelligence powered by on-device ARM Cortex-M55 edge neural models. Analyze vitals, optimize sleep, evaluate recovery readiness, and synthesize medical telemetry.",
      },
    ],
  }),
  component: AIAssistantPage,
});

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  metrics?: { label: string; value: string; status?: "normal" | "warning" }[];
  recommendations?: string[];
}

export function AIAssistantPage() {
  const { latest } = useSimulation();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;

  const hr = latest?.heartRate ?? 76;
  const spo2 = latest?.spo2 ?? 98;
  const temp = latest?.temperature ?? 36.8;
  const sys = latest?.systolic ?? 118;
  const dia = latest?.diastolic ?? 76;
  const steps = latest?.steps ?? 6824;
  const calories = latest?.calories ?? 1840;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "ai",
      text: `Hello ${patient.name}! I am your **SmartHealth AI Assistant**, running live neural models locally on your **${device.name} (ARM Cortex-M55)**.

Your physiological recovery score is **84/100 (Prime Readiness)** today. How can I assist you with your health, sleep, or activity metrics?`,
      timestamp: "Just now",
      metrics: [
        { label: "Heart Rate", value: `${hr} BPM` },
        { label: "SpO₂ Oxygen", value: `${spo2}%` },
        { label: "Blood Pressure", value: `${sys}/${dia} mmHg` },
        { label: "Recovery Score", value: "84 / 100" },
      ],
      recommendations: [
        "Cardiovascular recovery is prime today. High readiness for aerobic exertion.",
        "Sleep efficiency reached 91% with 1h 48m in cellular slow-wave Deep Sleep.",
        "Daily step progress is at 85% of target (6,824 / 8,000 steps).",
      ],
    },
  ]);

  const quickPrompts = [
    "🌟 Daily recovery readiness & capacity",
    "💓 Is my heart rate and ECG regular?",
    "🌙 Explain my deep sleep architecture",
    "🚶 How close am I to 8,000 steps?",
    "📑 Prepare medical brief for my doctor",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      let metrics: Message["metrics"] = undefined;
      let recommendations: string[] = [];
      const lower = query.toLowerCase();

      if (
        lower.includes("recovery") ||
        lower.includes("readiness") ||
        lower.includes("workout") ||
        lower.includes("capacity")
      ) {
        reply = `### 🌟 Daily Recovery & Physiological Capacity (Score: 84/100)
Your autonomic nervous system and cardiovascular reserves indicate **Prime Readiness**:

- **Autonomic Vagal Tone**: HRV RMSSD is **48 ms** (↑6 ms above baseline), indicating low physiological fatigue.
- **Resting Pulse**: **58 BPM** nadir reached at 04:12 during slow-wave sleep.
- **Energy Reserves**: 1,840 active kcal burned with balanced glycogen replenishment.`;
        metrics = [
          { label: "Readiness", value: "84 / 100" },
          { label: "HRV RMSSD", value: "48 ms" },
          { label: "Resting HR", value: "58 BPM" },
        ];
        recommendations = [
          "Target an aerobic conditioning workout between 115–145 BPM.",
          "Adequate hydration recommended: Aim for 2.5L throughout the active window.",
        ];
      } else if (
        lower.includes("ecg") ||
        lower.includes("heart") ||
        lower.includes("pulse") ||
        lower.includes("cardio")
      ) {
        reply = `### 💓 Cardiovascular & 250 Hz Lead I Analysis
Continuous optical PPG and 316L stainless dry electrode ECG telemetry confirm:

- **Cardiac Rhythm**: **Normal Sinus Rhythm (NSR)** at **${hr} BPM**.
- **Conduction Intervals**: PR: 156ms (Normal), QRS: 88ms (Narrow complex), QTc: 412ms (Bazett Normal).
- **ST-Segment Elevation/Depression**: None (<0.02 mV deviation).
- **Arrhythmia Sentry**: Zero Premature Atrial (PAC) or Premature Ventricular (PVC) complexes in 24 hours.`;
        metrics = [
          { label: "Heart Rate", value: `${hr} BPM` },
          { label: "Rhythm", value: "Normal Sinus" },
          { label: "Ectopy Count", value: "0 Events" },
          { label: "QTc (Bazett)", value: "412 ms" },
        ];
        recommendations = [
          "Cardiovascular electrical conduction is completely intact and regular.",
          "Blood pressure remains optimal at 118/76 mmHg (MAP: 90 mmHg).",
        ];
      } else if (
        lower.includes("sleep") ||
        lower.includes("rem") ||
        lower.includes("deep") ||
        lower.includes("hypnogram")
      ) {
        reply = `### 🌙 Sleep Architecture & Hypnogram Decomposition
Last night's sleep recording showed excellent restoration across all 4 stages:

- **Total Duration**: **7 hours 24 minutes** (Bedtime: 23:14 · Wake: 06:38).
- **Deep Sleep (N3)**: **1h 48m (24%)** — Optimal cellular growth and physical repair.
- **REM Dream Sleep**: **1h 45m (24%)** — High neural consolidation and memory indexing.
- **Light Sleep (N1/N2)**: **3h 51m (52%)** with minimal fragmentation (18m awake).
- **Nocturnal Dip**: 12% physiological blood pressure and heart rate dipping.`;
        metrics = [
          { label: "Total Sleep", value: "7h 24m" },
          { label: "Deep Sleep (N3)", value: "1h 48m (24%)" },
          { label: "REM Sleep", value: "1h 45m (24%)" },
          { label: "Efficiency", value: "91%" },
        ];
        recommendations = [
          "Maintain consistent sleep schedule by targeting bedtime around 23:00 tonight.",
          "Avoid blue light exposure 45 minutes prior to sleep to preserve REM onset.",
        ];
      } else if (
        lower.includes("activity") ||
        lower.includes("step") ||
        lower.includes("calorie") ||
        lower.includes("burn")
      ) {
        reply = `### 🚶 Kinetic Activity & Metabolic Energy Burn
Your continuous 3-axis accelerometer and step cadence tracker report:

- **Step Volume**: **${steps.toLocaleString()} / 8,000 steps** (85% completed).
- **Active Calories**: **${calories} kcal** metabolic expenditure.
- **Estimated Distance**: **${(steps * 0.00075).toFixed(2)} km**.
- **Stand Hours**: **10 of 12 hours** achieved.`;
        metrics = [
          { label: "Steps Today", value: `${steps.toLocaleString()}` },
          { label: "Active Energy", value: `${calories} kcal` },
          { label: "Distance", value: `${(steps * 0.00075).toFixed(1)} km` },
        ];
        recommendations = [
          "You are only 1,176 steps away from your daily 8,000-step target.",
          "A 15-minute evening stroll will easily complete all daily activity rings.",
        ];
      } else if (
        lower.includes("doctor") ||
        lower.includes("brief") ||
        lower.includes("loinc") ||
        lower.includes("medical") ||
        lower.includes("report")
      ) {
        reply = `### 📑 Physician Clinical Consultation Dossier
Here is your structured medical summary formatted with standardized observation codes:

- **Patient Name**: ${patient.name} (${patient.id}, Age: ${patient.age}, Gender: ${patient.gender})
- **Resting HR**: **58 BPM** (LOINC 8867-4) · Active Mean: **74 BPM**
- **Oxygen Saturation**: **98.2%** (LOINC 2708-6) · Perfusion Index: **4.8%**
- **Arterial BP**: **118/76 mmHg** (LOINC 8480-6 / LOINC 8462-4) · MAP: **90 mmHg**
- **Skin Temperature**: **36.8 °C** (LOINC 8310-5)
- **10-Year ASCVD Risk**: **< 1.8%** (Low Atherosclerotic Risk Index)
- **Estimated VO₂ Max**: **46.2 mL/kg/min** (Superior category)`;
        metrics = [
          { label: "BP", value: "118/76 mmHg" },
          { label: "SpO₂", value: "98.2%" },
          { label: "VO₂ Max", value: "46.2" },
          { label: "ASCVD Risk", value: "< 1.8%" },
        ];
        recommendations = [
          "You can export the printable PDF or FHIR R4 JSON bundle anytime from the Reports page.",
        ];
      } else {
        reply = `I have analyzed your live wearable telemetry: **${hr} BPM Heart Rate**, **${spo2}% Oxygen Saturation**, **${sys}/${dia} mmHg Blood Pressure**, and an overall **84/100 Readiness Score**. 

All biometric channels are operating within optimal bounds with zero anomaly indications.

You can ask me about your recovery capacity, cardiac ECG intervals, sleep architecture, or to prepare a doctor summary.`;
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metrics,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 700);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: "ai",
        text: `Conversation reset. How can I assist you with your health metrics today, ${patient.name}?`,
        timestamp: "Just now",
      },
    ]);
    toast.success("AI conversation history cleared");
  };

  return (
    <AppShell
      title="AI Health Assistant"
      subtitle="Interactive conversational intelligence powered by on-device ARM Cortex-M55 neural inference"
    >
      <div className="w-full flex-1 flex flex-col -mt-2">
        {/* ================================================================ */}
        {/* DEDICATED FULL CHAT SUITE */}
        {/* ================================================================ */}
        <div className="rounded-2xl border border-border/90 bg-card shadow-xs flex flex-col h-[calc(100vh-8.5rem)] w-full overflow-hidden">
          {/* Header Bar */}
          <div className="border-b border-border/80 bg-muted/20 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="grid size-9.5 place-items-center rounded-xl bg-primary text-white shadow-xs">
                <Bot className="size-5.5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-foreground">SmartHealth AI</h2>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ARM INT8 Active
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Continuous Telemetry Aware · {device.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Telemetry live badges */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
                <span className="rounded-lg bg-card px-2.5 py-1 border border-border font-mono text-muted-foreground">
                  HR: <strong className="text-foreground">{hr} BPM</strong>
                </span>
                <span className="rounded-lg bg-card px-2.5 py-1 border border-border font-mono text-muted-foreground">
                  SpO₂: <strong className="text-foreground">{spo2}%</strong>
                </span>
                <span className="rounded-lg bg-card px-2.5 py-1 border border-border font-mono text-muted-foreground">
                  Recovery: <strong className="text-primary">84/100</strong>
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="rounded-xl h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1.5 size-3" /> Clear Chat
              </Button>
            </div>
          </div>

          {/* Message Timeline */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 shadow-2xs space-y-3 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-xs font-medium"
                      : "bg-muted/30 text-foreground border border-border/80 rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-normal leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Embedded Biometric Data Tiles */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
                      {msg.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-card p-2 border border-border/70 text-center shadow-2xs"
                        >
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block truncate">
                            {m.label}
                          </span>
                          <span className="metric font-black text-foreground text-sm">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actionable Recommendations Deck */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1.5 text-xs text-foreground">
                      <div className="flex items-center gap-1.5 font-bold text-primary text-xs">
                        <CheckCircle2 className="size-3.5" /> Actionable Insights
                      </div>
                      <ul className="space-y-1 text-muted-foreground text-[11px] list-disc list-inside">
                        {msg.recommendations.map((rec, rIdx) => (
                          <li key={rIdx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-muted-foreground mt-1 px-1.5">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/40 p-3 rounded-xl w-fit text-xs border border-border/60 animate-pulse">
                <Sparkles className="size-4 text-primary animate-spin" />
                <span className="font-semibold text-foreground">
                  SmartHealth AI is synthesizing telemetry...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Carousel Footer */}
          <div className="px-5 py-2.5 border-t border-border/60 bg-muted/10 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.substring(2).trim())}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 sm:p-4 border-t border-border/80 bg-card flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your vitals, sleep stages, recovery, or medical reports..."
              className="flex-1 bg-muted/30 border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-10 px-5 rounded-xl font-bold text-xs shrink-0"
            >
              <Send className="size-4 mr-1.5" /> Send
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
