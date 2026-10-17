import { execSync } from "node:child_process"

/**
 * Limpa a liga da API local para os e2e terem espaço (máx. 20 clubes)
 * e lista de jogadores previsível dentro do fetch de 50 itens da UI.
 */
function globalSetup() {
  const container = process.env.E2E_POSTGRES_CONTAINER ?? "desafio-isi-dev-1-postgres-1"
  const sql =
    "TRUNCATE TABLE duelos_partida, partidas, escalacoes, transacoes, contratos, jogadores, clubes RESTART IDENTITY CASCADE"

  try {
    execSync(`docker exec ${container} sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "${sql}"'`, {
      stdio: "pipe",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`[e2e] não foi possível limpar o Postgres (${container}): ${message}`)
  }
}

export default globalSetup
