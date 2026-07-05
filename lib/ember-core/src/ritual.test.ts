import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
  configureEmber,
  createProject,
  getProject,
  healthCheck,
  listMenagerie,
  openProject,
  beginTraining,
  finishTraining,
  endSession,
  resetDbForTests,
  buildKeepResponse,
  ensureInvestorDemoDragon,
  DEMO_PROJECT_NAME,
  recordRitualMetric,
  getRitualMetrics,
  setDefaultSessionMinutes,
  getDefaultSessionMinutes,
  getInsightTray,
  getRitualSummary,
} from "./index.js";

const TEST_DB = ":memory:";

before(() => {
  resetDbForTests();
  configureEmber({ dbPath: TEST_DB });
});

after(() => {
  resetDbForTests();
});

describe("ritual API", () => {
  it("healthCheck reports ok, db path, and mcp metadata", () => {
    const h = healthCheck();
    assert.equal(h.status, "ok");
    assert.equal(h.db_path, TEST_DB);
    assert.equal(h.mcp_version, "0.2.0");
    assert.equal(typeof h.ai_via, "string");
  });

  it("listMenagerie is empty before projects exist", () => {
    assert.deepEqual(listMenagerie(), []);
  });

  it("openProject returns full resume bundle", async () => {
    const project = createProject("Test Dragon", "cinder", "A test project");
    const bundle = await openProject(project.id);
    assert.ok(bundle);
    assert.equal(bundle!.project.id, project.id);
    assert.equal(bundle!.project.name, "Test Dragon");
    assert.ok(bundle!.resume.status_summary);
    assert.ok(bundle!.ritual_hint.includes("Sacred loop"));
    assert.equal(Array.isArray(bundle!.active_tasks), true);
    assert.equal(Array.isArray(bundle!.inbox.pending), true);
  });

  it("openProject returns null for missing project", async () => {
    const bundle = await openProject("00000000-0000-0000-0000-000000000000");
    assert.equal(bundle, null);
  });

  it("createProject persists dragon defaults", () => {
    const p = createProject("Moss Hatchling", "moss");
    const loaded = getProject(p.id);
    assert.ok(loaded);
    assert.equal(loaded!.dragon_type, "moss");
    assert.equal(loaded!.dragon_stage, "egg");
  });
});

describe("keep + pitch demo", () => {
  it("buildKeepResponse returns projects and a valid calling dragon", () => {
    const keep = buildKeepResponse();
    assert.ok(keep.projects.length >= 1);
    assert.ok(keep.calling_dragon_id);
    assert.ok(keep.projects.some((p) => p.id === keep.calling_dragon_id));
    assert.ok(keep.calling_reason);
  });

  it("ensureInvestorDemoDragon force creates pitch dragon on busy keep", () => {
    createProject("One", "moss");
    createProject("Two", "drift");
    createProject("Three", "frost");
    const demo = ensureInvestorDemoDragon({ force: true });
    assert.ok(demo);
    assert.equal(demo!.name, DEMO_PROJECT_NAME);
    const keep = buildKeepResponse();
    assert.ok(keep.projects.some((p) => p.name === DEMO_PROJECT_NAME));
  });

  it("recordRitualMetric appends and trims events", () => {
    recordRitualMetric({ event: "app_open", at: new Date().toISOString() });
    recordRitualMetric({ event: "train_tap", at: new Date().toISOString(), ms_since_flow_start: 1200 });
    const events = getRitualMetrics();
    assert.ok(events.length >= 2);
    assert.equal(events.at(-1)?.event, "train_tap");
  });

  it("default session minutes is 20 and beginTraining respects settings", () => {
    assert.equal(getDefaultSessionMinutes(), 20);
    const project = createProject("Duration Test", "cinder");
    setDefaultSessionMinutes(25);
    const result = beginTraining(project.id);
    assert.ok(result);
    assert.equal(result!.duration_hint_minutes, 25);
    assert.equal(result!.session.planned_duration_minutes, 25);
    setDefaultSessionMinutes(20);
  });

  it("beginTraining accepts explicit duration override", () => {
    const project = createProject("Override", "moss");
    const result = beginTraining(project.id, undefined, 15);
    assert.ok(result);
    assert.equal(result!.duration_hint_minutes, 15);
  });

  it("sacred loop: open → train → finish updates resume context path", async () => {
    const project = createProject("Loop Dragon", "cinder", "Starting summary");
    const bundle = await openProject(project.id);
    assert.ok(bundle);

    const training = beginTraining(project.id);
    assert.ok(training);
    const finished = await finishTraining(training!.session.id, "Shipped the loop test", 0);
    assert.ok(finished);
    assert.ok(finished!.session.end_time);
    assert.equal(finished!.session.duration_minutes >= 0, true);

    const after = await openProject(project.id);
    assert.ok(after);
    assert.ok(after!.recent_sessions.length >= 1);
  });

  it("getRitualSummary returns structure with empty data", () => {
    const summary = getRitualSummary();
    assert.equal(typeof summary.days_active_14d, "number");
    assert.equal(typeof summary.sessions_this_week, "number");
  });

  it("getInsightTray returns bundle for new project", () => {
    const project = createProject("Empty Tray", "frost");
    const tray = getInsightTray(project.id);
    assert.ok(tray);
    assert.ok(tray!.summary);
    const nonHatch = tray!.items.filter((i) => i.source !== "hatch");
    assert.equal(nonHatch.length, 0);
    if (tray!.items.length === 0) {
      assert.ok(tray!.empty_message);
    }
  });

  it("endSession is idempotent — no double-counting", () => {
    const project = createProject("Idempotent", "cinder");
    const training = beginTraining(project.id);
    assert.ok(training);
    endSession(training!.session.id, "first", 0);
    const minutesAfterFirst = getProject(project.id)!.total_focus_minutes;
    endSession(training!.session.id, "second", 0);
    const minutesAfterSecond = getProject(project.id)!.total_focus_minutes;
    assert.equal(minutesAfterFirst, minutesAfterSecond);
    assert.ok(minutesAfterFirst >= 0);
  });

  it("finishTraining is idempotent on retry", async () => {
    const project = createProject("Finish Idem", "moss");
    const training = beginTraining(project.id);
    assert.ok(training);
    const first = await finishTraining(training!.session.id, "done", 0);
    assert.ok(first);
    const second = await finishTraining(training!.session.id, "done again", 0);
    assert.ok(second);
    assert.equal(second!.already_completed, true);
    assert.equal(getProject(project.id)!.total_focus_minutes, first!.project.total_focus_minutes);
  });
});
