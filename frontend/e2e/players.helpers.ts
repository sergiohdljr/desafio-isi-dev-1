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

function uniqueToken() {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  return `Aaa${stamp.replace(/\d/g, "a")}`
}

function draftBody(draft: PlayerDraft) {
  const skill = draft.skill ?? 60
  const potential = draft.potential ?? Math.max(skill, 70)
  return {
    name: draft.name,
    position: draft.position ?? "ATA",
    age: draft.age ?? 23,
    agility: draft.agility ?? 70,
    pace: skill,
    shooting: skill,
    passing: skill,
    dribbling: skill,
    defending: skill,
    physical: skill,
    potential,
  }
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
  await page.getByLabel("Buscar jogador pelo nome").fill(term)
  await expect(page.getByText(`Busca: ${term}`)).toBeVisible()
}

function playerRow(page: Page, name: string) {
  return page.getByRole("row").filter({ hasText: name })
}

async function fillAndSave(page: Page, draft: PlayerDraft) {
  await page.getByRole("button", { name: "Novo jogador" }).click()
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
  await dialog.getByRole("button", { name: "Salvar jogador" }).click()
  await expect(page.getByText("Jogador cadastrado")).toBeVisible()
}

export { fillAndSave, openPlayers, playerRow, removeByName, searchPlayers, uniqueToken }
