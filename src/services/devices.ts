import { IS_MOCK_DATA, fetchFromApi } from "./api";
import { DEVICES } from "@/mock/data";
import type { Device } from "@/types";

export const deviceService = {
  async getAll(): Promise<Device[]> {
    if (IS_MOCK_DATA) {
      return DEVICES;
    }
    return fetchFromApi<Device[]>("/devices");
  },

  async getById(id: string): Promise<Device | null> {
    if (IS_MOCK_DATA) {
      return DEVICES.find((d) => d.id === id) || null;
    }
    return fetchFromApi<Device>(`/devices/${id}`);
  },

  async syncDevice(id: string): Promise<{ success: boolean; lastSync: string }> {
    if (IS_MOCK_DATA) {
      return { success: true, lastSync: new Date().toLocaleTimeString("en-GB") };
    }
    return fetchFromApi(`/devices/${id}/sync`, { method: "POST" });
  },

  async restartDevice(id: string): Promise<{ success: boolean }> {
    if (IS_MOCK_DATA) {
      return { success: true };
    }
    return fetchFromApi(`/devices/${id}/restart`, { method: "POST" });
  },
};
