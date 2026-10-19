import { config as loadEnv } from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, devices } from "@playwright/test"

const frontendRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.dirname(frontendRoot)
loadEnv({ path: path.join(repoRoot, ".env") })

const API_PORT = Number(process.env.E2E_API_PORT)
const UI_PORT = Number(process.env.E2E_UI_PORT)
if (!Number.isFinite(API_PORT) || !Number.isFinite(UI_PORT)) {
  throw new Error(
    "E2E_API_PORT e E2E_UI_PORT são obrigatórios no .env da raiz (veja .env.example).",
  )
}

const apiOrigin = `http://127.0.0.1:${API_PORT}`
const baseURL = `http://127.0.0.1:${UI_PORT}`

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${UI_PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      E2E_API_ORIGIN: apiOrigin,
    },
  },
})
