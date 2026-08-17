import { useRouterState } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronDown,
  CornerDownLeft,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  Moon,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/useSimulation";
import { PATIENTS, DEVICES } from "@/mock/data";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  metrics?: { label: string; value: string; status?: "normal" | "warning" }[];
}

export function AIAssistantDrawer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { latest, connected } = useSimulation();
  const patient = PATIENTS[0]!;
  const device = DEVICES[0]!;

  const hr = latest?.heartRate ?? 76;
  const spo2 = latest?.spo2 ?? 98;
  const temp = latest?.temperature ?? 36.8;
  const sys = latest?.systolic ?? 118;
  const dia = latest?.diastolic ?? 76;
  const steps = latest?.steps ?? 6824;
  const stress = latest?.stress ?? 24;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: `Hello ${patient.name}! I am your **SmartHealth Edge AI Assistant**, running live neural models locally on your ${device.name}. 

Your physiological recovery score is **84/100 (Prime Readiness)** today. How can I assist you with your health and activity metrics?`,
      timestamp: "Just now",
      metrics: [
        { label: "Heart Rate", value: `${hr} BPM`, status: "normal" },
        { label: "SpO₂ Oxygen", value: `${spo2}%`, status: "normal" },
        { label: "Blood Pressure", value: `${sys}/${dia}`, status: "normal" },
        { label: "Readiness", value: "84/100", status: "normal" },
      ],
    },
  ]);

  const quickPrompts = [
    "🌟 Analyze my recovery score",
    "💓 Is my heart rate and ECG normal?",
    "🌙 How was my deep sleep last night?",
    "🏃 Can I do intense cardio today?",
    "📑 Summarize my health report",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Dynamic AI response generation based on telemetry & query keywords
    setTimeout(() => {
      let replyText = "";
      let replyMetrics: ChatMessage["metrics"] = undefined;
      const lower = query.toLowerCase();

      if (lower.includes("recovery") || lower.includes("readiness") || lower.includes("score")) {
        replyText = `### 🌟 Recovery & Readiness Analysis (Score: 84/100)
Your autonomic nervous system is in **Prime Readiness** today:
- **Resting Heart Rate**: 58 BPM (2 BPM below your 7-day baseline).
- **HRV RMSSD**: 48 ms, reflecting robust parasympathetic vagal recovery.
- **Cardiovascular Workload**: Normal. Zero strain detected.
- **Actionable Advice**: Today is an optimal day for a structured endurance workout or strength training.`;
        replyMetrics = [
          { label: "Recovery", value: "84/100", status: "normal" },
          { label: "HRV RMSSD", value: "48 ms", status: "normal" },
          { label: "Resting HR", value: "58 BPM", status: "normal" },
        ];
      } else if (
        lower.includes("heart") ||
        lower.includes("ecg") ||
        lower.includes("bpm") ||
        lower.includes("rate")
      ) {
        replyText = `### 💓 Cardiovascular & ECG Assessment
Your real-time cardiac signals are stable and within healthy physiological bounds:
- **Instantaneous Pulse**: **${hr} BPM** (Optimal resting range: 60–100 BPM).
- **Single-Lead ECG (Lead I)**: Normal Sinus Rhythm (NSR) confirmed at 250 Hz.
- **Intervals**: PR: 156ms (Normal), QRS: 88ms (Narrow), QTc: 412ms (Bazett Normal).
- **Arrhythmia Sentry**: Zero PAC or PVC ectopic beats detected in the last 24 hours.`;
        replyMetrics = [
          { label: "Pulse Rate", value: `${hr} BPM`, status: "normal" },
          { label: "Rhythm", value: "Normal Sinus (NSR)", status: "normal" },
          { label: "Ectopy", value: "0 Events", status: "normal" },
        ];
      } else if (lower.includes("sleep") || lower.includes("deep") || lower.includes("night")) {
        replyText = `### 🌙 Sleep Architecture Analysis
Last night's sleep recording exhibited optimal stage distribution:
- **Total Sleep Duration**: **7 hours 24 minutes** (91% efficiency).
- **Deep Sleep (N3)**: **1h 48m (24%)** — Crucial for physical tissue repair.
- **REM Dream Sleep**: **1h 45m (24%)** — High cognitive restoration.
- **Nocturnal Dip**: 12% resting HR reduction during slow-wave sleep.
- **Tip**: Keep your bedroom temperature between 18–20°C tonight to maintain high deep sleep proportions.`;
        replyMetrics = [
          { label: "Duration", value: "7h 24m", status: "normal" },
          { label: "Deep Sleep", value: "1h 48m (24%)", status: "normal" },
          { label: "Efficiency", value: "91%", status: "normal" },
        ];
      } else if (
        lower.includes("cardio") ||
        lower.includes("workout") ||
        lower.includes("exercise") ||
        lower.includes("training")
      ) {
        replyText = `### 🏃 Exercise & Training Recommendation
Based on your current telemetry and recovery baseline:
- **Recommendation**: **Green Light** for moderate to high-intensity cardiovascular training.
- **Target Heart Rate Zone**: 115–145 BPM for aerobic conditioning.
- **Daily Step Progress**: You are at **${steps.toLocaleString()} / 8,000 steps** (85%). An additional 20-minute brisk walk will achieve today's goal.`;
        replyMetrics = [
          { label: "Target Zone", value: "115–145 BPM", status: "normal" },
          { label: "Steps Today", value: `${steps.toLocaleString()}`, status: "normal" },
          { label: "Calories", value: "1,840 kcal", status: "normal" },
        ];
      } else if (
        lower.includes("report") ||
        lower.includes("doctor") ||
        lower.includes("summary")
      ) {
        replyText = `### 📑 Comprehensive Health Summary
Here is your current health dossier brief:
- **Subject**: ${patient.name} (${patient.id}, Age ${patient.age})
- **Blood Pressure**: **${sys}/${dia} mmHg** (Mean Arterial Pressure: ${Math.round(dia + (sys - dia) / 3)} mmHg — Normotensive).
- **Oxygen Saturation**: **${spo2}%** (Optimal arterial perfusion).
- **Body Temperature**: **${temp.toFixed(1)} °C** (Euthermic equilibrium).
- **Edge AI Model**: ARM CMSIS-NN INT8 running continuously with 99.4% confidence.
You can export the full printable PDF and FHIR R4 JSON bundle from the **Reports** page.`;
      } else {
        replyText = `Thank you for asking! Based on your live SmartBand telemetry (${hr} BPM, ${spo2}% SpO₂, ${sys}/${dia} mmHg, and 84/100 Readiness), all physiological vital signs are balanced.

Feel free to ask about your cardio metrics, sleep architecture, recovery readiness, or health report summaries.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metrics: replyMetrics,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: "ai",
        text: `Chat history cleared. How can I assist you with your health telemetry, ${patient.name}?`,
        timestamp: "Just now",
      },
    ]);
  };

  if (pathname === "/ai-assistant") {
    return null;
  }

  return (
    <>
      {/* ================================================================ */}
      {/* 1. FLOATING AGENT LOGO BUTTON TRIGGER (BOTTOM RIGHT) */}
      {/* ================================================================ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 grid size-13.5 place-items-center rounded-full bg-primary text-white shadow-xl hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 group border-2 border-white/30"
          aria-label="Open AI Health Assistant"
          title="SmartHealth AI Assistant"
        >
          <span className="absolute -top-0.5 -right-0.5 flex size-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-3.5 bg-emerald-500 border-2 border-card" />
          </span>
          <Bot className="size-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* ================================================================ */}
      {/* 2. EXPANDED AI CHAT MODAL / DRAWER */}
      {/* ================================================================ */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border-2 border-border/90 bg-card text-card-foreground shadow-2xl transition-all duration-300 ${
            isMinimized
              ? "h-14 w-80 sm:w-96"
              : "h-[560px] max-h-[85vh] w-[92vw] sm:w-[420px] md:w-[460px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-4 py-3 rounded-t-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-foreground truncate">
                    SmartHealth AI
                  </h3>
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ARM INT8 Active
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  Personal Health Intelligence Companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={handleClearChat}
                title="Clear conversation"
              >
                <Trash2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="size-3.5" />
                ) : (
                  <Minimize2 className="size-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Message Scroll Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 shadow-2xs space-y-2 leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-primary text-white rounded-br-xs font-medium"
                          : "bg-muted/40 text-foreground border border-border/80 rounded-bl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-line text-xs font-normal">{msg.text}</div>

                      {/* Embedded Biometric Metrics Chips */}
                      {msg.metrics && msg.metrics.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1.5 border-t border-border/60">
                          {msg.metrics.map((m, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-card/90 p-1.5 border border-border/60 text-center"
                            >
                              <span className="text-[9px] text-muted-foreground block truncate">
                                {m.label}
                              </span>
                              <span className="metric font-extrabold text-foreground text-xs">
                                {m.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/40 p-2.5 rounded-xl w-fit text-xs border border-border/60">
                    <Sparkles className="size-3.5 text-primary animate-spin" />
                    <span className="text-[11px] font-medium">
                      SmartHealth AI is synthesizing telemetry...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-3 py-1.5 border-t border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.substring(2).trim())}
                    className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-border/80 bg-card rounded-b-2xl flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your vitals, sleep, or recovery..."
                  className="flex-1 bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputMessage.trim() || isTyping}
                  className="h-8.5 px-3 rounded-xl font-bold text-xs shrink-0"
                >
                  <Send className="size-3.5 mr-1" /> Send
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
