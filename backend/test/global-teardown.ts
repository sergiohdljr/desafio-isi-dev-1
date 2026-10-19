import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPOSE_FILE = 'docker-compose.e2e.yml';

/**
 * Derruba o Compose e2e após a suíte.
 * Use E2E_KEEP_UP=1 para manter postgres-test no ar (debug).
 */
export default function teardown(): void {
  if (process.env.E2E_KEEP_UP === '1') {
    console.log('E2E_KEEP_UP=1 — mantendo docker-compose.e2e.yml no ar.');
    return;
  }

  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(testDir, '../..');
  const compose = `docker compose -f "${repoRoot}/${COMPOSE_FILE}" --project-directory "${repoRoot}"`;

  execSync(`${compose} down`, { stdio: 'inherit' });
}
