import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
  configureEmber,
  createProject,
  getProject,
  healthCheck,
  listMenagerie,
  openProject,
  resetDbForTests,
  buildKeepResponse,
  ensureInvestorDemoDragon,
  DEMO_PROJECT_NAME,
  recordRitualMetric,
  getRitualMetrics,
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
  it("healthCheck reports ok and memory db path", () => {
    const h = healthCheck();
    assert.equal(h.status, "ok");
    assert.equal(h.db_path, TEST_DB);
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
});
