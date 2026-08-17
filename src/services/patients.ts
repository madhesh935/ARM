import { IS_MOCK_DATA, fetchFromApi } from "./api";
import { PATIENTS } from "@/mock/data";
import type { Patient } from "@/types";

export const patientService = {
  async getAll(): Promise<Patient[]> {
    if (IS_MOCK_DATA) {
      return PATIENTS;
    }
    return fetchFromApi<Patient[]>("/patients");
  },

  async getById(id: string): Promise<Patient | null> {
    if (IS_MOCK_DATA) {
      return PATIENTS.find((p) => p.id === id) || null;
    }
    return fetchFromApi<Patient>(`/patients/${id}`);
  },
};
