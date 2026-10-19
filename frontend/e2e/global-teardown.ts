import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const COMPOSE_FILE = "docker-compose.e2e.yml"

/**
 * Derruba o Compose e2e (postgres-test + api) após o Playwright.
 * Use E2E_KEEP_UP=1 para manter a stack no ar (debug).
 */
function globalTeardown() {
  if (process.env.E2E_KEEP_UP === "1") {
    console.log("E2E_KEEP_UP=1 — mantendo docker-compose.e2e.yml no ar.")
    return
  }

  const frontendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
  const repoRoot = path.dirname(frontendRoot)
  const compose = `docker compose -f "${repoRoot}/${COMPOSE_FILE}" --project-directory "${repoRoot}"`

  execSync(`${compose} down`, { stdio: "pipe" })
}

export default globalTeardown
