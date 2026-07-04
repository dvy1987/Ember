import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSchema } from './schema.js';

let configuredPath: string | null = null;
let db: Database.Database | null = null;

/** Resolve Ember repo root by walking up for pnpm-workspace.yaml */
function findRepoRoot(start: string): string | null {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function defaultDbPath(): string {
  const fromEnv = process.env['EMBER_DB_PATH'];
  if (fromEnv) return fromEnv;

  const repoRoot = findRepoRoot(process.cwd());
  if (repoRoot) {
    return path.join(repoRoot, 'data', 'ember.db');
  }

  // Fallback: package-relative (lib/ember-core → repo root)
  const pkgDir = path.dirname(fileURLToPath(import.meta.url));
  const guessedRoot = path.resolve(pkgDir, '..', '..', '..');
  if (fs.existsSync(path.join(guessedRoot, 'pnpm-workspace.yaml'))) {
    return path.join(guessedRoot, 'data', 'ember.db');
  }

  return path.join(process.cwd(), 'data', 'ember.db');
}

export interface EmberCoreConfig {
  dbPath?: string;
}

/**
 * Configure ember-core before first DB access. Call from MCP/CLI startup.
 * api-server may rely on env EMBER_DB_PATH or auto-discovery.
 */
export function configureEmber(config: EmberCoreConfig = {}): void {
  if (db) {
    throw new Error('configureEmber() must be called before getDb()');
  }
  if (config.dbPath) {
    configuredPath = config.dbPath;
  }
}

/** Test-only: close and reset singleton */
export function resetDbForTests(): void {
  if (db) {
    db.close();
    db = null;
  }
  configuredPath = null;
}

export function getDb(): Database.Database {
  if (!db) {
    const DB_PATH = configuredPath ?? defaultDbPath();
    const dir = path.dirname(DB_PATH);
    if (dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

export function getDbPath(): string {
  return configuredPath ?? defaultDbPath();
}
