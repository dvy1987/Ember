import {
  EmberError,
  buildProjectContext,
  configureEmber,
  ensureSeedSkills,
  getInbox,
  healthCheck,
  keeperVerdict,
  listMenagerie,
  openProject,
  beginTraining,
  finishTraining,
  thinkOutLoud,
  dragonAsk,
  getInsightTray,
} from "@workspace/ember-core";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function jsonText(data: unknown): { content: [{ type: "text"; text: string }] } {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function jsonResource(data: unknown) {
  return {
    contents: [
      {
        uri: "",
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function toolError(err: unknown): { content: [{ type: "text"; text: string }]; isError: true } {
  if (err instanceof EmberError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { code: err.code, message: err.message, details: err.details ?? null },
            null,
            2,
          ),
        },
      ],
    };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { isError: true, content: [{ type: "text", text: message }] };
}

function asId(value: string | string[]): string {
  return Array.isArray(value) ? value[0]! : value;
}

function notFound(message: string) {
  return toolError(new EmberError(message, "not_found"));
}

/** Bootstrap SQLite + seed skills before any tool/resource handler runs */
export function bootstrapEmberCore(): void {
  const dbPath = process.env["EMBER_DB_PATH"];
  if (dbPath) {
    configureEmber({ dbPath });
  }
  ensureSeedSkills();
}

export function createEmberMcpServer(): McpServer {
  bootstrapEmberCore();

  const server = new McpServer({
    name: "ember",
    version: "0.2.0",
  });

  // ---- Ritual tools --------------------------------------------------------

  server.tool(
    "ember_health",
    "Check Ember is ready — database path, AI availability, and MCP version. Call first to know if brain dump will work.",
    {},
    async () => jsonText(healthCheck()),
  );

  server.tool(
    "ember_list_menagerie",
    "See all your dragons — stage, focus minutes, and what needs your attention in the inbox.",
    {},
    async () => jsonText(listMenagerie()),
  );

  server.tool(
    "ember_open_project",
    "Where was I? — resume card, tasks, memory, and ritual hint in one bundle. Start here for any project.",
    { project_id: z.string().describe("Dragon project UUID") },
    async ({ project_id }) => {
      try {
        const bundle = await openProject(project_id);
        if (!bundle) return notFound(`Project not found: ${project_id}`);
        return jsonText(bundle);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    "ember_begin_training",
    "Start a focus training session — pre-selects active tasks. Default 20 minutes; pass duration_minutes for 15, 25, or 45.",
    {
      project_id: z.string(),
      task_ids: z.array(z.string()).optional().describe("Optional subset of active task IDs"),
      duration_minutes: z
        .union([z.literal(15), z.literal(20), z.literal(25), z.literal(45)])
        .optional()
        .describe("Session length in minutes (default from settings)"),
    },
    async ({ project_id, task_ids, duration_minutes }) => {
      try {
        const result = beginTraining(project_id, task_ids, duration_minutes);
        if (!result) return notFound(`Project not found: ${project_id}`);
        return jsonText(result);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    "ember_finish_training",
    "End training — reflection updates what your dragon remembers and grows the dragon.",
    {
      session_id: z.string(),
      reflection: z.string().describe("What happened this session"),
      tasks_completed_count: z.number().int().optional(),
    },
    async ({ session_id, reflection, tasks_completed_count }) => {
      try {
        const result = await finishTraining(session_id, reflection, tasks_completed_count);
        if (!result) return notFound(`Session not found: ${session_id}`);
        return jsonText(result);
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    "ember_think_out_loud",
    "Brain dump — unstructured thoughts become tasks and insights. Requires AI (API key or env).",
    {
      project_id: z.string(),
      user_input: z.string().describe("Raw thoughts or notes"),
    },
    async ({ project_id, user_input }) => {
      try {
        return jsonText(await thinkOutLoud(project_id, user_input));
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    "ember_dragon_ask",
    "Ask your dragon to help — skill harness with trust bands and keeper verdict when needed.",
    {
      dragon_id: z.string().describe("Dragon (project) UUID"),
      user_prompt: z.string(),
      skill_name: z.string().optional().describe("Skill name; defaults to general-assistance"),
      mode: z.enum(["paired", "autonomous"]).optional(),
      confirm_high_cost: z.boolean().optional().describe("Required when harness returns requires_confirmation"),
    },
    async ({ dragon_id, user_prompt, skill_name, mode, confirm_high_cost }) => {
      try {
        return jsonText(
          await dragonAsk({
            dragonId: dragon_id,
            userPrompt: user_prompt,
            skillName: skill_name,
            mode,
            confirmHighCost: confirm_high_cost,
          }),
        );
      } catch (err) {
        return toolError(err);
      }
    },
  );

  server.tool(
    "ember_keeper_verdict",
    "Review dragon output — approve, edit, or reject a skill run awaiting your verdict.",
    {
      run_id: z.string(),
      verdict: z.enum(["approve", "edit", "reject"]),
      user_edit: z.string().optional().describe("Required when verdict is edit"),
    },
    async ({ run_id, verdict, user_edit }) => {
      try {
        return jsonText(keeperVerdict({ runId: run_id, verdict, userEdit: user_edit }));
      } catch (err) {
        return toolError(err);
      }
    },
  );

  // ---- MCP resources ---------------------------------------------------------

  server.registerResource(
    "menagerie",
    "ember://projects",
    {
      title: "Ember menagerie",
      description: "All active dragon projects with inbox signals",
      mimeType: "application/json",
    },
    async (uri) => {
      const data = listMenagerie();
      const result = jsonResource(data);
      result.contents[0]!.uri = uri.href;
      return result;
    },
  );

  const projectContextTemplate = new ResourceTemplate("ember://project/{project_id}/context", {
    list: async () => ({
      resources: listMenagerie().map((p) => ({
        uri: `ember://project/${p.id}/context`,
        name: p.name,
        mimeType: "application/json",
      })),
    }),
    complete: {
      project_id: async () => listMenagerie().map((p) => p.id),
    },
  });

  server.registerResource(
    "project_context",
    projectContextTemplate,
    {
      title: "Project context",
      description: "Full project context bundle for agent grounding",
      mimeType: "application/json",
    },
    async (uri, { project_id }) => {
      const id = asId(project_id);
      const ctx = buildProjectContext(id);
      if (!ctx) {
        throw new EmberError(`Project not found: ${id}`, "not_found");
      }
      const result = jsonResource(ctx);
      result.contents[0]!.uri = uri.href;
      return result;
    },
  );

  const inboxTemplate = new ResourceTemplate("ember://project/{project_id}/inbox", {
    list: async () => ({
      resources: listMenagerie()
        .filter((p) => p.pending_inbox_count > 0)
        .map((p) => ({
          uri: `ember://project/${p.id}/inbox`,
          name: `${p.name} inbox`,
          mimeType: "application/json",
        })),
    }),
    complete: {
      project_id: async () => listMenagerie().map((p) => p.id),
    },
  });

  server.registerResource(
    "project_inbox",
    inboxTemplate,
    {
      title: "Dragon inbox",
      description: "Pending skill runs awaiting keeper verdict",
      mimeType: "application/json",
    },
    async (uri, { project_id }) => {
      const id = asId(project_id);
      const inbox = getInbox(id, id);
      const result = jsonResource(inbox);
      result.contents[0]!.uri = uri.href;
      return result;
    },
  );

  const insightsTrayTemplate = new ResourceTemplate("ember://project/{project_id}/insights-tray", {
    list: async () => ({
      resources: listMenagerie().map((p) => ({
        uri: `ember://project/${p.id}/insights-tray`,
        name: `${p.name} insights`,
        mimeType: "application/json",
      })),
    }),
    complete: {
      project_id: async () => listMenagerie().map((p) => p.id),
    },
  });

  server.registerResource(
    "insights_tray",
    insightsTrayTemplate,
    {
      title: "Insight tray",
      description: "What your dragon holds — memory, insights, contradictions",
      mimeType: "application/json",
    },
    async (uri, { project_id }) => {
      const id = asId(project_id);
      const tray = getInsightTray(id);
      if (!tray) {
        throw new EmberError(`Project not found: ${id}`, "not_found");
      }
      const result = jsonResource(tray);
      result.contents[0]!.uri = uri.href;
      return result;
    },
  );

  // ---- MCP prompts -----------------------------------------------------------

  server.registerPrompt(
    "resume_ritual",
    {
      title: "Resume ritual",
      description: "Guide an agent through Ember's sacred loop for a project",
      argsSchema: {
        project_id: z.string().describe("Dragon project UUID"),
      },
    },
    async ({ project_id }) => {
      const bundle = await openProject(project_id);
      if (!bundle) {
        return {
          messages: [
            {
              role: "user" as const,
              content: { type: "text" as const, text: `Project not found: ${project_id}` },
            },
          ],
        };
      }

      const text = [
        "# Ember resume ritual",
        "",
        bundle.ritual_hint,
        "",
        `## ${bundle.project.name} (${bundle.project.dragon_type} · ${bundle.project.dragon_stage})`,
        "",
        "**Status:** " + bundle.resume.status_summary,
        "**Suggested next step:** " + bundle.resume.suggested_next_step,
        bundle.resume.last_session_summary
          ? "**Last session:** " + bundle.resume.last_session_summary
          : "",
        "",
        `Active tasks (${bundle.active_tasks.length}):`,
        ...bundle.active_tasks.map((t) => `- ${t.task_text}`),
        "",
        bundle.inbox.pending.length > 0
          ? `⚠ ${bundle.inbox.pending.length} skill run(s) need keeper verdict — check inbox resource.`
          : "Inbox clear.",
        "",
        "Next: call ember_begin_training (optional duration_minutes), work the session, then ember_finish_training with reflection.",
      ]
        .filter(Boolean)
        .join("\n");

      return {
        messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
      };
    },
  );

  return server;
}
