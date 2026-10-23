import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const PLAYWRIGHT_IMAGE = "mcr.microsoft.com/playwright:v1.64.1-noble"
const COMPOSE_FILE = "docker-compose.e2e.yml"
const ENV_FILE = ".env.test"
const NODE_MODULES_VOLUME = "liga-e2e-frontend-modules"
const RESET_SQL =
  "TRUNCATE TABLE duelos_partida, partidas, escalacoes, transacoes, contratos, jogadores, clubes RESTART IDENTITY CASCADE"

const frontendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const repoRoot = path.dirname(frontendRoot)

function composeArgs(extra) {
  return [
    "compose",
    "--env-file",
    path.join(repoRoot, ENV_FILE),
    "-f",
    path.join(repoRoot, COMPOSE_FILE),
    "--project-directory",
    repoRoot,
    ...extra,
  ]
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" })
  if (result.error) throw result.error
  if (result.status !== 0) {
    const error = new Error(`${command} exited ${result.status}`)
    error.exitCode = result.status ?? 1
    throw error
  }
}

const build = process.argv.includes("--build")
let exitCode = 0

run("docker", composeArgs(["up", "-d", "--wait", ...(build ? ["--build"] : [])]))

try {
  run(
    "docker",
    composeArgs([
      "exec",
      "-T",
      "postgres-test",
      "sh",
      "-c",
      `psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "${RESET_SQL}"`,
    ]),
  )

  run("docker", [
    "run",
    "--rm",
    "--network",
    "host",
    "-v",
    `${repoRoot}:/work`,
    "-v",
    `${NODE_MODULES_VOLUME}:/work/frontend/node_modules`,
    "-w",
    "/work/frontend",
    "-e",
    "E2E_SKIP_COMPOSE=1",
    "--env-file",
    path.join(repoRoot, ENV_FILE),
    "--entrypoint",
    "bash",
    PLAYWRIGHT_IMAGE,
    "-lc",
    "npm ci && npx playwright test",
  ])
} catch (error) {
  exitCode = error.exitCode ?? 1
  if (!error.exitCode) console.error(error)
} finally {
  if (process.env.E2E_KEEP_UP === "1") {
    console.log("E2E_KEEP_UP=1 — mantendo docker-compose.e2e.yml no ar.")
  } else {
    spawnSync("docker", composeArgs(["down"]), { stdio: "inherit" })
  }
}

process.exit(exitCode)
