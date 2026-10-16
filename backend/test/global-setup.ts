import { execSync } from 'node:child_process';
import { loadTestEnv } from './load-test-env.js';

export default function setup(): void {
  loadTestEnv();
  execSync('./node_modules/.bin/prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
  });
}
