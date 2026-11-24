import type { TrainingSet } from "../domain";
import { request } from "./http";

export type SetSummary = {
  id: string;
  title: string;
};

export function loadSets(): Promise<SetSummary[]> {
  return request<SetSummary[]>("/api/sets");
}

export function loadSet(id: string): Promise<TrainingSet> {
  return request<TrainingSet>(`/api/sets/${id}`);
}