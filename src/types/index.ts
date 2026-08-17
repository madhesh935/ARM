export type Role = "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type StatusTone = "normal" | "warning" | "critical" | "info" | "offline";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type SignalQuality = "Excellent" | "Good" | "Fair" | "Poor";
export type ActivityState = "Resting" | "Light" | "Walking" | "Moderate" | "Exercise" | "Intense";

export type ScenarioId =
  "normal" | "exercise" | "anomaly" | "poor-signal" | "low-battery" | "disconnect" | "emergency";

export type InferenceState = "NORMAL" | "SUSPICIOUS" | "LOW_BATTERY" | "POOR_SIGNAL" | "EMERGENCY";

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  deviceId: string;
  monitoring: "Active" | "Paused" | "Offline";
  lastUpdate: string;
  risk: RiskLevel;
  contact: string;
  emergencyContact: string;
  monitoringStart: string;
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
}

export type Patient = UserProfile;

export interface DeviceSensor {
  name: string;
  type: string;
  status: "Active" | "Standby" | "Calibrating" | "Error";
  sampleRate: string;
}

export interface Device {
  id: string;
  name: string;
  patientId: string;
  processor: string;
  firmware: string;
  modelVersion: string;
  battery: number;
  temperature: number;
  ramUsedKb: number;
  ramTotalKb: number;
  storageUsedMb: number;
  storageTotalMb: number;
  cpu: number;
  ble: "Connected" | "Disconnected";
  wifi: "Connected" | "Disconnected";
  signalStrengthDbm: number;
  lastSync: string;
  status: "Online" | "Offline";
  pairedAt: string;
  sensors?: DeviceSensor[];
}

export type AlertSeverity = "Info" | "Warning" | "High" | "Critical";
export type AlertStatus = "Active" | "Acknowledged" | "Resolved";

export interface HealthAlert {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  deviceId: string;
  type: string;
  severity: AlertSeverity;
  aiScore: number;
  metric?: string;
  observedValue?: string | number;
  threshold?: string | number;
  description: string;
  status: AlertStatus;
  signalQuality: SignalQuality;
  confidence: number;
  vitals: {
    hr: number;
    spo2: number;
    temp: number;
    systolic?: number;
    diastolic?: number;
    activity: ActivityState;
  };
}

export interface VitalSample {
  t: number;
  time: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  activity: number;
  steps: number;
  calories: number;
  stress: number;
  fallDetected: boolean;
  accelX: number;
  accelY: number;
  accelZ: number;
  motionComposite: number;
  ppg: number;
  ecgVoltage: number;
  anomalyScore: number;
  signalQuality: SignalQuality;
  battery: number;
  inferenceLatency: number;
}

export interface AiStatus {
  status: "NORMAL" | "POTENTIAL ANOMALY" | "EMERGENCY ALERT";
  risk: RiskLevel;
  anomalyScore: number;
  confidence: number;
  latencyMs: number;
  mode: string;
  modelVersion: string;
  explanation: string;
  contributions: { feature: string; value: number }[];
}

export interface ModelRecord {
  version: string;
  type: string;
  quantization: string;
  sizeKb: number;
  accuracy: number;
  f1: number;
  status: "Active" | "Archived" | "Candidate";
  created: string;
  trainingDate: string;
  dataset: string;
  inputs: string[];
  outputs: string[];
}

export interface PerfVariant {
  key: string;
  label: string;
  modelSizeKb: number;
  ramKb: number;
  latencyMs: number;
  cpuCyclesM: number;
  energyMj: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  falseAlertRate: number;
}

export interface EmergencyIncident {
  id: string;
  timestamp: string;
  type: string;
  severity: "Critical";
  status: "Active" | "Dispatched" | "Resolved";
  patientId: string;
  patientName: string;
  deviceId: string;
  fallConfirmed: boolean;
  impactG: number;
  heartRateAtTrigger: number;
  spo2AtTrigger: number;
  gpsLocation: { lat?: number; lng?: number; label: string; available: boolean };
  emergencyContacts: { name: string; relation: string; phone: string; notified: boolean }[];
  timeline: { time: string; event: string; status: "completed" | "in-progress" | "pending" }[];
}

export interface ActivityDay {
  day: string;
  date: string;
  steps: number;
  goal: number;
  calories: number;
  distanceKm: number;
  activeMinutes: number;
  sedentaryMinutes: number;
}

export interface SleepRecord {
  date: string;
  totalMinutes: number;
  deepMinutes: number;
  lightMinutes: number;
  remMinutes: number;
  awakeMinutes: number;
  sleepScore: number;
  efficiencyPercent: number;
  restingHr: number;
  hrvMs: number;
}
