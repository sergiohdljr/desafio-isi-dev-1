import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTestEnv } from './load-test-env.js';

const COMPOSE_FILE = 'docker-compose.e2e.yml';

export default function setup(): void {
  loadTestEnv();

  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(testDir, '../..');
  const compose = `docker compose -f "${repoRoot}/${COMPOSE_FILE}" --project-directory "${repoRoot}"`;

  execSync(`${compose} up -d --wait postgres-test`, { stdio: 'inherit' });

  execSync('./node_modules/.bin/prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  });
}
