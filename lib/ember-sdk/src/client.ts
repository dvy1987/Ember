import type {
  AiExtractionResult,
  DragonType,
  EndSessionResponse,
  Project,
  ResumeResponse,
  Session,
  Task,
  TaskSource,
  TaskStatus,
} from "./types.js";
import { EmberApiError } from "./types.js";

export interface EmberClientOptions {
  /** Base URL without trailing slash, e.g. http://localhost:8080 */
  baseUrl?: string;
  fetch?: typeof fetch;
}

/**
 * HTTP client for the Ember api-server. All paths are under `/api`.
 */
export class EmberClient {
  private readonly apiBase: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: EmberClientOptions = {}) {
    const root = (options.baseUrl ?? process.env["EMBER_API_URL"] ?? "http://localhost:8080").replace(
      /\/$/,
      "",
    );
    this.apiBase = root.endsWith("/api") ? root : `${root}/api`;
    this.fetchFn = options.fetch ?? fetch;
  }

  async health(): Promise<{ status: string }> {
    return this.get("/healthz");
  }

  async getAiStatus(): Promise<{ available: boolean }> {
    return this.get("/ai/status");
  }

  async listProjects(archived = false): Promise<Project[]> {
    return this.get("/projects", archived ? { archived: "true" } : undefined);
  }

  async getProject(id: string): Promise<Project> {
    return this.get(`/projects/${id}`);
  }

  async createProject(name: string, dragonType: DragonType, summary = ""): Promise<Project> {
    return this.post("/projects", { name, dragon_type: dragonType, summary });
  }

  async listTasks(projectId: string, status?: TaskStatus): Promise<Task[]> {
    const query: Record<string, string> = { project_id: projectId };
    if (status) query.status = status;
    return this.get("/tasks", query);
  }

  async createTask(
    projectId: string,
    taskText: string,
    options?: { source?: TaskSource; status?: TaskStatus },
  ): Promise<Task> {
    return this.post("/tasks", {
      project_id: projectId,
      task_text: taskText,
      ...options,
    });
  }

  async completeTask(taskId: string): Promise<Task> {
    return this.patch(`/tasks/${taskId}`, { action: "complete" });
  }

  async getResume(projectId: string): Promise<ResumeResponse> {
    return this.get("/resume", { project_id: projectId });
  }

  async startSession(projectId: string, taskIds?: string[]): Promise<Session> {
    return this.post("/sessions/start", { project_id: projectId, task_ids: taskIds });
  }

  async endSession(
    sessionId: string,
    options?: { reflection?: string; tasksCompletedCount?: number },
  ): Promise<EndSessionResponse> {
    return this.post("/sessions/end", {
      session_id: sessionId,
      reflection: options?.reflection,
      tasks_completed_count: options?.tasksCompletedCount,
    });
  }

  async brainDump(projectId: string, userInput: string): Promise<AiExtractionResult> {
    return this.post("/ai/extract-tasks", { project_id: projectId, user_input: userInput });
  }

  async processReflection(
    projectId: string,
    sessionId: string,
    reflection: string,
  ): Promise<AiExtractionResult> {
    return this.post("/ai/process-reflection", {
      project_id: projectId,
      session_id: sessionId,
      reflection,
    });
  }

  private async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.apiBase}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    }
    const res = await this.fetchFn(url, { method: "GET", headers: { Accept: "application/json" } });
    return this.parse<T>(res);
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.fetchFn(`${this.apiBase}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return this.parse<T>(res);
  }

  private async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetchFn(`${this.apiBase}${path}`, {
      method: "PATCH",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.parse<T>(res);
  }

  private async parse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let body: unknown = undefined;
    if (text) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = text;
      }
    }
    if (!res.ok) {
      const msg =
        typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: unknown }).error)
          : `HTTP ${res.status}`;
      throw new EmberApiError(msg, res.status, body);
    }
    return body as T;
  }
}
