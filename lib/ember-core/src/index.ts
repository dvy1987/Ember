// Domain layer — single source of truth for Ember business logic

export { configureEmber, getDb, getDbPath, resetDbForTests, type EmberCoreConfig } from './db/db.js';
export { initializeSchema } from './db/schema.js';

export * from './services/projectService.js';
export * from './services/demoSeedService.js';
export * from './services/callingDragonService.js';
export * from './services/taskService.js';
export * from './services/sessionService.js';
export * from './services/dragonEngine.js';
export * from './services/contextBuilder.js';
export * from './services/aiService.js';
export * from './services/analyticsService.js';
export * from './services/ritualService.js';
export * from './services/sagaService.js';
export * from './services/skillRegistry.js';
export * from './services/skillRuntime.js';
export * from './services/skillRules.js';
export * from './services/suggestionEvaluator.js';
export * from './services/ritualMetricsService.js';
export * from './services/settingsService.js';
export * from './services/insightTrayService.js';
export { localDateString, localWeekStartString } from './dateUtils.js';

export * from './errors.js';
export * from './ritual.js';
