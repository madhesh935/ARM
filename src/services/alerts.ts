import { IS_MOCK_DATA, fetchFromApi } from "./api";
import { ALERTS, updateAlertState } from "@/mock/data";
import type { HealthAlert } from "@/types";

export const alertService = {
  async getAll(): Promise<HealthAlert[]> {
    if (IS_MOCK_DATA) {
      return ALERTS;
    }
    return fetchFromApi<HealthAlert[]>("/alerts");
  },

  async updateStatus(alertId: string, status: HealthAlert["status"]): Promise<void> {
    if (IS_MOCK_DATA) {
      updateAlertState(alertId, status);
      return;
    }
    await fetchFromApi(`/alerts/${alertId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
