import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const COMPOSE_FILE = "docker-compose.e2e.yml"
const ENV_FILE = ".env.test"

/**
 * Sobe o Compose e2e (postgres-test + api) e esvazia a liga.
 * Não toca no Postgres da aplicação.
 */
function globalSetup() {
  const frontendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
  const repoRoot = path.dirname(frontendRoot)
  const sql =
    "TRUNCATE TABLE duelos_partida, partidas, escalacoes, transacoes, contratos, jogadores, clubes RESTART IDENTITY CASCADE"
  const compose = `docker compose --env-file "${repoRoot}/${ENV_FILE}" -f "${repoRoot}/${COMPOSE_FILE}" --project-directory "${repoRoot}"`

  execSync(`${compose} up -d --wait`, { stdio: "pipe" })

  execSync(`${compose} exec -T postgres-test sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "${sql}"'`, {
    stdio: "pipe",
  })
}

export default globalSetup
