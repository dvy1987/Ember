/** Structured errors for MCP/CLI — maps harness + API failure modes */

export type EmberErrorCode =
  | 'not_found'
  | 'no_ai_config'
  | 'over_budget'
  | 'requires_confirmation'
  | 'paused'
  | 'trust_insufficient'
  | 'llm_failed'
  | 'already_verdicted'
  | 'invalid_input'
  | 'db_not_configured';

export class EmberError extends Error {
  constructor(
    message: string,
    readonly code: EmberErrorCode,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'EmberError';
  }
}

export function mapSkillInvokeError(
  error: string,
  extras?: Record<string, unknown>,
): EmberError {
  const map: Record<string, EmberErrorCode> = {
    no_project: 'not_found',
    no_skill: 'not_found',
    no_ai_config: 'no_ai_config',
    over_budget: 'over_budget',
    requires_confirmation: 'requires_confirmation',
    paused: 'paused',
    trust_insufficient: 'trust_insufficient',
    llm_failed: 'llm_failed',
  };
  const code = map[error] ?? 'invalid_input';
  return new EmberError(error, code, extras);
}
