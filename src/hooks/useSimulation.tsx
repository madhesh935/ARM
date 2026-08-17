import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ActivityState,
  AiStatus,
  EmergencyIncident,
  InferenceState,
  RiskLevel,
  ScenarioId,
  SignalQuality,
  VitalSample,
} from "@/types";
import { EMERGENCY_INCIDENT_MOCK } from "@/mock/data";

export const SCENARIOS: { id: ScenarioId; label: string; description: string }[] = [
  { id: "normal", label: "Stable Normal", description: "All vitals in optimal range at rest." },
  {
    id: "exercise",
    label: "Physical Activity",
    description: "Elevated heart rate, active movement, higher systolic BP.",
  },
  {
    id: "anomaly",
    label: "Subtle Anomaly",
    description: "SpO2 drop with elevated heart rate at rest.",
  },
  {
    id: "emergency",
    label: "Emergency Fall",
    description: "Simulated impact, tachycardia, critical distress alert.",
  },
  {
    id: "poor-signal",
    label: "Poor Sensor Contact",
    description: "Motion artifacts, inference deferred.",
  },
  {
    id: "low-battery",
    label: "Low Battery",
    description: "Battery < 15%, resource-saving edge mode.",
  },
  {
    id: "disconnect",
    label: "Band Disconnected",
    description: "BLE link lost, telemetry streaming paused.",
  },
];

const MAX_POINTS = 600; // 10 minutes rolling buffer

function noise(scale: number) {
  return (Math.random() - 0.5) * scale;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function qualityFromScore(q: number): SignalQuality {
  if (q > 0.88) return "Excellent";
  if (q > 0.7) return "Good";
  if (q > 0.5) return "Fair";
  return "Poor";
}

/** Generate a realistic P-Q-R-S-T ECG waveform sample (mV) given instantaneous phase */
function generateEcgPoint(phase: number, noiseLevel: number = 0.05): number {
  // Phase 0..1 represents one cardiac cycle
  const p = ((phase % 1) + 1) % 1;
  let v = 0;

  if (p >= 0.12 && p <= 0.2) {
    // P wave (atrial depolarization)
    v += 0.18 * Math.sin(((p - 0.12) / 0.08) * Math.PI);
  } else if (p > 0.28 && p < 0.31) {
    // Q wave (septal depolarization)
    v -= 0.15 * Math.sin(((p - 0.28) / 0.03) * Math.PI);
  } else if (p >= 0.31 && p <= 0.37) {
    // R peak (ventricular depolarization)
    v += 1.35 * Math.sin(((p - 0.31) / 0.06) * Math.PI);
  } else if (p > 0.37 && p < 0.42) {
    // S wave
    v -= 0.35 * Math.sin(((p - 0.37) / 0.05) * Math.PI);
  } else if (p >= 0.55 && p <= 0.72) {
    // T wave (ventricular repolarization)
    v += 0.32 * Math.sin(((p - 0.55) / 0.17) * Math.PI);
  }

  return v + (Math.random() - 0.5) * noiseLevel;
}

interface SimState {
  scenario: ScenarioId;
  setScenario: (s: ScenarioId) => void;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  running: boolean;
  start: () => void;
  pause: () => void;
  stop: () => void;
  samples: VitalSample[];
  latest: VitalSample | null;
  connected: boolean;
  activity: ActivityState;
  ai: AiStatus;
  inferenceState: InferenceState;
  stateTimeline: { t: number; time: string; state: InferenceState }[];
  inferenceHz: number;
  triggerEmergencySimulation: () => void;
  resetEmergencySimulation: () => void;
  emergencyActive: boolean;
  emergencyIncident: EmergencyIncident;
  ecgBuffer: number[];
  lastSyncSecondsAgo: number;
}

const SimContext = createContext<SimState | null>(null);

function seedInitialSamples(): VitalSample[] {
  const now = Date.now();
  const out: VitalSample[] = [];
  let steps = 6720;
  let cals = 1810;

  for (let i = 180; i > 0; i--) {
    const t = now - i * 1000;
    const phase = i / 25;
    const hr = Math.round(74 + Math.sin(phase) * 4 + noise(2));
    const spo2 = Math.round((98.2 + Math.sin(phase / 2) * 0.4 + noise(0.3)) * 10) / 10;
    const temp = Math.round((36.7 + Math.sin(phase / 3) * 0.1 + noise(0.04)) * 100) / 100;
    const sys = Math.round(118 + Math.sin(phase) * 3 + noise(2));
    const dia = Math.round(76 + Math.sin(phase) * 2 + noise(1.5));
    const act = clamp(0.12 + Math.abs(Math.sin(phase / 5)) * 0.08 + noise(0.02), 0, 1);

    if (i % 8 === 0) steps += 1;
    if (i % 20 === 0) cals += 0.2;

    out.push({
      t,
      time: new Date(t).toLocaleTimeString("en-GB"),
      heartRate: hr,
      spo2: clamp(spo2, 85, 100),
      temperature: temp,
      systolic: sys,
      diastolic: dia,
      activity: act,
      steps: Math.round(steps),
      calories: Math.round(cals),
      stress: Math.round(22 + Math.sin(phase) * 6 + noise(2)),
      fallDetected: false,
      accelX: 0.02 + noise(0.05),
      accelY: 0.98 + noise(0.05),
      accelZ: 0.12 + noise(0.05),
      motionComposite: act,
      ppg: Math.sin(i * 0.7) * 0.8 + noise(0.08),
      ecgVoltage: generateEcgPoint((i * 1.2) % 1),
      anomalyScore: clamp(0.06 + noise(0.03), 0, 1),
      signalQuality: "Excellent",
      battery: 82,
      inferenceLatency: Math.round((18.2 + noise(1.5)) * 10) / 10,
    });
  }
  return out;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<ScenarioId>("normal");
  const [demoMode, setDemoMode] = useState(true);
  const [running, setRunning] = useState(true);
  const [samples, setSamples] = useState<VitalSample[]>(() => seedInitialSamples());
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [lastSyncSecondsAgo, setLastSyncSecondsAgo] = useState(2);
  const [stateTimeline, setStateTimeline] = useState<
    { t: number; time: string; state: InferenceState }[]
  >([{ t: Date.now(), time: new Date().toLocaleTimeString("en-GB"), state: "NORMAL" }]);

  const batteryRef = useRef(82);
  const stepsRef = useRef(6824);
  const caloriesRef = useRef(1840);
  const tickRef = useRef(0);
  const ecgPhaseRef = useRef(0);

  const stop = useCallback(() => {
    setRunning(false);
    setSamples([]);
  }, []);

  const triggerEmergencySimulation = useCallback(() => {
    setScenario("emergency");
    setEmergencyActive(true);
  }, []);

  const resetEmergencySimulation = useCallback(() => {
    setScenario("normal");
    setEmergencyActive(false);
    batteryRef.current = 82;
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      tickRef.current += 1;
      const k = tickRef.current;
      const isConnected = scenario !== "disconnect";

      if (!isConnected) {
        setLastSyncSecondsAgo((prev) => prev + 1);
        return;
      }
      setLastSyncSecondsAgo(1);

      // Baseline physiological rhythms
      let hr = 76 + Math.sin(k / 20) * 3 + noise(2);
      let spo2 = 98.4 + Math.sin(k / 35) * 0.4 + noise(0.3);
      let temp = 36.8 + Math.sin(k / 50) * 0.08 + noise(0.03);
      let sys = 118 + Math.sin(k / 25) * 3 + noise(2);
      let dia = 76 + Math.sin(k / 25) * 2 + noise(1.5);
      let act = 0.14 + noise(0.03);
      let stress = 24 + Math.sin(k / 30) * 5 + noise(3);
      let quality = 0.95 + noise(0.04);
      let score = 0.06 + noise(0.04);
      let latency = 18.2 + noise(2);
      let fall = false;
      let accelX = 0.03 + noise(0.06);
      let accelY = 0.98 + noise(0.06);
      let accelZ = 0.14 + noise(0.06);

      if (scenario === "exercise") {
        hr = 126 + Math.sin(k / 10) * 8 + noise(4);
        spo2 = 97.2 + noise(0.5);
        temp = 37.3 + noise(0.06);
        sys = 138 + noise(4);
        dia = 82 + noise(3);
        act = 0.84 + noise(0.08);
        stress = 42 + noise(5);
        quality = 0.82 + noise(0.06);
        score = 0.16 + noise(0.05);
        accelX = 0.45 + noise(0.3);
        accelY = 1.35 + noise(0.4);
        accelZ = 0.6 + noise(0.3);
        stepsRef.current += Math.round(1.8 + Math.random());
        caloriesRef.current += 0.22;
      } else if (scenario === "anomaly") {
        hr = 114 + Math.sin(k / 12) * 6 + noise(3);
        spo2 = 91.4 - Math.min(3.2, k / 40) + noise(0.4);
        temp = 37.6 + noise(0.06);
        sys = 132 + noise(3);
        dia = 84 + noise(2);
        act = 0.12 + noise(0.02);
        stress = 68 + noise(6);
        quality = 0.91 + noise(0.04);
        score = clamp(0.78 + noise(0.08), 0, 1);
        latency = 19.8 + noise(1.5);
      } else if (scenario === "emergency") {
        hr = 134 + Math.sin(k / 8) * 6 + noise(4);
        spo2 = 90.8 + noise(0.6);
        temp = 37.4 + noise(0.05);
        sys = 152 + noise(5);
        dia = 96 + noise(4);
        act = 0.05 + noise(0.02);
        stress = 92 + noise(4);
        quality = 0.92 + noise(0.04);
        score = 0.94 + noise(0.03);
        fall = true;
        accelX = 0.88 + noise(0.1);
        accelY = 0.12 + noise(0.08);
        accelZ = 0.05 + noise(0.05);
      } else if (scenario === "poor-signal") {
        hr = 82 + noise(24);
        spo2 = 94 + noise(5);
        temp = 36.8 + noise(0.25);
        sys = 120 + noise(12);
        dia = 78 + noise(8);
        act = 0.45 + noise(0.35);
        quality = 0.32 + noise(0.12);
        score = 0.12 + noise(0.05);
        accelX = 0.6 + noise(0.5);
      } else if (scenario === "low-battery") {
        quality = 0.86 + noise(0.05);
        latency = 26.4 + noise(2.5);
      }

      // Smooth step increments at rest
      if (k % 5 === 0 && scenario !== "exercise" && scenario !== "emergency") {
        stepsRef.current += 1;
        caloriesRef.current += 0.04;
      }

      // Battery progression
      if (scenario === "low-battery") {
        batteryRef.current = clamp(batteryRef.current - 0.015, 3, 100);
        if (batteryRef.current > 12) batteryRef.current = 11.2;
      } else {
        batteryRef.current = clamp(batteryRef.current - 0.002, 5, 100);
        if (batteryRef.current < 45) batteryRef.current = 82;
      }

      // Advance ECG phase based on heart rate
      const beatsPerSecond = hr / 60;
      ecgPhaseRef.current = (ecgPhaseRef.current + beatsPerSecond) % 1;
      const ecgVal = generateEcgPoint(ecgPhaseRef.current, scenario === "poor-signal" ? 0.4 : 0.04);

      const t = Date.now();
      const sample: VitalSample = {
        t,
        time: new Date(t).toLocaleTimeString("en-GB"),
        heartRate: Math.round(clamp(hr, 40, 195)),
        spo2: Math.round(clamp(spo2, 75, 100) * 10) / 10,
        temperature: Math.round(clamp(temp, 34, 41) * 100) / 100,
        systolic: Math.round(clamp(sys, 70, 210)),
        diastolic: Math.round(clamp(dia, 40, 130)),
        activity: Math.round(clamp(act, 0, 1) * 100) / 100,
        steps: stepsRef.current,
        calories: Math.round(caloriesRef.current),
        stress: Math.round(clamp(stress, 0, 100)),
        fallDetected: fall,
        accelX: Math.round(accelX * 100) / 100,
        accelY: Math.round(accelY * 100) / 100,
        accelZ: Math.round(accelZ * 100) / 100,
        motionComposite: Math.round(clamp(act, 0, 1) * 100) / 100,
        ppg:
          Math.sin(k * 0.8) * (scenario === "poor-signal" ? 0.3 : 0.88) +
          noise(scenario === "poor-signal" ? 0.5 : 0.08),
        ecgVoltage: Math.round(ecgVal * 1000) / 1000,
        anomalyScore: Math.round(clamp(score, 0, 1) * 1000) / 1000,
        signalQuality: qualityFromScore(clamp(quality, 0, 1)),
        battery: Math.round(batteryRef.current * 10) / 10,
        inferenceLatency: Math.round(clamp(latency, 8, 90) * 10) / 10,
      };

      setSamples((prev) => [...prev.slice(-(MAX_POINTS - 1)), sample]);
    }, 1000);

    return () => clearInterval(interval);
  }, [running, scenario]);

  const latest = samples.length ? samples[samples.length - 1]! : null;
  const connected = scenario !== "disconnect";

  const inferenceState: InferenceState = useMemo(() => {
    if (scenario === "emergency" || latest?.fallDetected) return "EMERGENCY";
    if (!latest) return "NORMAL";
    if (latest.signalQuality === "Poor") return "POOR_SIGNAL";
    if (latest.battery <= 15) return "LOW_BATTERY";
    if (latest.anomalyScore >= 0.5) return "SUSPICIOUS";
    return "NORMAL";
  }, [latest, scenario]);

  useEffect(() => {
    setStateTimeline((prev) => {
      if (prev.length && prev[prev.length - 1]!.state === inferenceState) return prev;
      const t = Date.now();
      return [
        ...prev.slice(-19),
        { t, time: new Date(t).toLocaleTimeString("en-GB"), state: inferenceState },
      ];
    });
  }, [inferenceState]);

  const inferenceHz =
    inferenceState === "EMERGENCY"
      ? 4
      : inferenceState === "SUSPICIOUS"
        ? 2
        : inferenceState === "LOW_BATTERY"
          ? 0.1
          : inferenceState === "POOR_SIGNAL"
            ? 0.2
            : 0.5;

  const activity: ActivityState = !latest
    ? "Resting"
    : latest.activity > 0.8
      ? "Intense"
      : latest.activity > 0.6
        ? "Exercise"
        : latest.activity > 0.35
          ? "Walking"
          : latest.activity > 0.18
            ? "Light"
            : "Resting";

  const ai: AiStatus = useMemo(() => {
    const score = latest?.anomalyScore ?? 0;
    const deferred = latest?.signalQuality === "Poor";
    const isEmergency = scenario === "emergency" || latest?.fallDetected;
    const risk: RiskLevel = isEmergency
      ? "HIGH"
      : deferred
        ? "LOW"
        : score >= 0.7
          ? "HIGH"
          : score >= 0.4
            ? "MEDIUM"
            : "LOW";

    const anomalous = !deferred && (score >= 0.5 || isEmergency);

    const contributions = isEmergency
      ? [
          { feature: "3-Axis Impact Spike", value: 45 },
          { feature: "Heart Rate Elevation", value: 30 },
          { feature: "Post-Impact Inactivity", value: 15 },
          { feature: "SpO2 Level", value: 10 },
        ]
      : anomalous
        ? [
            { feature: "SpO2 Oxygenation", value: 42 },
            { feature: "Heart Rate Trend", value: 33 },
            { feature: "Motion Energy", value: 15 },
            { feature: "Temperature Delta", value: 10 },
          ]
        : scenario === "exercise"
          ? [
              { feature: "Accelerometer Energy", value: 48 },
              { feature: "Heart Rate Elevation", value: 32 },
              { feature: "Skin Temperature", value: 12 },
              { feature: "SpO2", value: 8 },
            ]
          : [
              { feature: "Resting Heart Rate", value: 34 },
              { feature: "SpO2 Stability", value: 28 },
              { feature: "Baseline Activity", value: 22 },
              { feature: "Thermal Balance", value: 16 },
            ];

    const explanation = deferred
      ? "Sensor contact quality is insufficient for reliable AI inference. Decision is deferred rather than falsely classified."
      : isEmergency
        ? "Emergency condition triggered: Sudden impact vector accompanied by tachycardia and post-fall horizontal position. Notified caregiver triage."
        : anomalous
          ? "Potential anomaly indicated: Resting SpO2 decreased while heart rate increased during a low-activity interval. Indicative observation for review."
          : scenario === "exercise"
            ? "Elevated cardiac frequency is correlated with high 3-axis motion energy, matching typical active exercise profile."
            : "Multimodal physiological parameters remain within the normal learned baseline for this patient context.";

    return {
      status: isEmergency ? "EMERGENCY ALERT" : anomalous ? "POTENTIAL ANOMALY" : "NORMAL",
      risk,
      anomalyScore: score,
      confidence:
        Math.round(
          (deferred ? 0.55 : isEmergency ? 0.98 : 0.91 + Math.min(0.08, score / 15)) * 100,
        ) / 100,
      latencyMs: latest?.inferenceLatency ?? 18.2,
      mode:
        inferenceState === "LOW_BATTERY"
          ? "INT8 Edge Inference · Resource-Saving Mode"
          : "INT8 Edge Inference · ARM Cortex-M55 CMSIS-NN",
      modelVersion: "v1.2-int8-arm",
      explanation,
      contributions,
    };
  }, [latest, scenario, inferenceState]);

  // Rolling ECG buffer (300 points for smooth canvas rendering)
  const ecgBuffer = useMemo(() => {
    return samples.slice(-150).map((s) => s.ecgVoltage);
  }, [samples]);

  const value: SimState = {
    scenario,
    setScenario,
    demoMode,
    setDemoMode,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    stop,
    samples,
    latest,
    connected,
    activity,
    ai,
    inferenceState,
    stateTimeline,
    inferenceHz,
    triggerEmergencySimulation,
    resetEmergencySimulation,
    emergencyActive,
    emergencyIncident: EMERGENCY_INCIDENT_MOCK,
    ecgBuffer,
    lastSyncSecondsAgo,
  };

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimulation must be used inside SimulationProvider");
  return ctx;
}
