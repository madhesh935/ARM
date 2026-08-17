import { IS_MOCK_DATA, fetchFromApi } from "./api";
import type { VitalSample } from "@/types";

export interface TelemetryPacket {
  deviceId: string;
  patientId: string;
  timestamp: number;
  vitals: VitalSample;
}

export const telemetryService = {
  /** Connect to WebSocket live stream from the wearable gateway */
  connectWebSocket(
    deviceId: string,
    onSample: (sample: VitalSample) => void,
    onError?: (err: Event) => void,
  ): () => void {
    if (IS_MOCK_DATA) {
      // In mock mode, the useSimulation hook provides the live data loop
      return () => {};
    }

    try {
      const ws = new WebSocket(`wss://stream.smarthealth-telemetry.io/devices/${deviceId}/live`);
      ws.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          onSample(packet.vitals);
        } catch (e) {
          console.error("Failed to parse telemetry packet", e);
        }
      };
      if (onError) ws.onerror = onError;
      return () => ws.close();
    } catch (e) {
      console.warn("WebSocket connection failed, falling back to mock stream", e);
      return () => {};
    }
  },

  /** Fetch historical vitals window */
  async getVitalsHistory(patientId: string, timeframe: string): Promise<VitalSample[]> {
    if (IS_MOCK_DATA) {
      return [];
    }
    return fetchFromApi<VitalSample[]>(`/patients/${patientId}/telemetry?timeframe=${timeframe}`);
  },
};
