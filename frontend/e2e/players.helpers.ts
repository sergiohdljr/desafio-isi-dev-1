import { expect, type APIRequestContext, type Page } from "@playwright/test"

const SKILL_LABELS = ["Velocidade", "Finalização", "Passe", "Drible", "Defesa", "Físico"]

type CreatedPlayer = {
  id: number
}

type PlayerDraft = {
  name: string
  position?: "GOL" | "ZAG" | "LAT" | "MEI" | "ATA"
  age?: number
  agility?: number
  skill?: number
  potential?: number
}

async function deletePlayer(request: APIRequestContext, id: number) {
  const response = await request.delete(`/api/v1/players/${id}`)
  expect(response.ok() || response.status() === 204, await response.text()).toBeTruthy()
}

async function removeByName(request: APIRequestContext, name: string) {
  const listed = await request.get("/api/v1/players", { params: { search: name, limit: "5" } })
  if (!listed.ok()) return
  const body = (await listed.json()) as { data: CreatedPlayer[] }
  for (const player of body.data) await deletePlayer(request, player.id)
}

async function openPlayers(page: Page) {
  await page.goto("/jogadores")
  await expect(page.getByRole("heading", { name: "Jogadores" })).toBeVisible()
}

async function searchPlayers(page: Page, term: string) {
  const search = page.getByLabel("Buscar jogador pelo nome")
  await search.click()
  await search.fill(term)
  await expect(search).toHaveValue(term)
  await expect(page.getByText(`Busca: ${term}`, { exact: true })).toBeVisible()
}

function playerRow(page: Page, name: string) {
  return page.getByRole("row").filter({ hasText: name })
}

async function fillPlayerForm(page: Page, draft: PlayerDraft) {
  await page.getByRole("button", { name: "Novo jogador" }).first().click()
  const dialog = page.getByRole("dialog", { name: "Novo jogador" })
  await dialog.getByLabel("Nome").fill(draft.name)
  await dialog.getByRole("radio", { name: new RegExp(draft.position ?? "ATA") }).click()
  await dialog.getByRole("textbox", { name: /^Idade/ }).fill(String(draft.age ?? 23))
  await dialog.getByRole("textbox", { name: /^Agilidade/ }).fill(String(draft.agility ?? 70))
  const skill = String(draft.skill ?? 60)
  for (const label of SKILL_LABELS) {
    await dialog.getByLabel(label, { exact: true }).fill(skill)
  }
  await dialog.getByLabel("Potencial").fill(String(draft.potential ?? 80))
  return dialog
}

async function fillAndSave(page: Page, draft: PlayerDraft) {
  const dialog = await fillPlayerForm(page, draft)
  await dialog.getByRole("button", { name: "Salvar jogador" }).click()
  await expect(page.getByText("Jogador cadastrado")).toBeVisible()
  await expect(page.getByRole("dialog", { name: "Novo jogador" })).toHaveCount(0)
}

export { fillAndSave, fillPlayerForm, openPlayers, playerRow, removeByName, searchPlayers }
