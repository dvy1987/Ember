import { KeepResponse, Project } from './types';

/** Parse GET /api/projects — supports legacy array and keep bundle shapes. */
export function parseKeepResponse(data: unknown): KeepResponse {
  if (Array.isArray(data)) {
    return {
      projects: data as Project[],
      calling_dragon_id: null,
      calling_reason: null,
    };
  }
  if (data && typeof data === 'object' && 'projects' in data) {
    const bundle = data as KeepResponse;
    return {
      projects: Array.isArray(bundle.projects) ? bundle.projects : [],
      calling_dragon_id: bundle.calling_dragon_id ?? null,
      calling_reason: bundle.calling_reason ?? null,
    };
  }
  return { projects: [], calling_dragon_id: null, calling_reason: null };
}
