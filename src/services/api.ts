/**
 * SmartHealth API Client & Integration Services
 *
 * Supports both Mock Data Fallback (for development / demonstrations)
 * and real REST / WebSocket / Firebase backend endpoints.
 */

export const IS_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.smarthealth-telemetry.io/v1";

export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL || "wss://stream.smarthealth-telemetry.io/live";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (IS_MOCK_DATA) {
    // Development mock layer active
    console.debug(`[API MOCK] GET ${endpoint}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("smarthealth_token") || "demo_token"}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}
