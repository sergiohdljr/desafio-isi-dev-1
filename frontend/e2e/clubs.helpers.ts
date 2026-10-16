import { expect, type APIRequestContext, type Page } from "@playwright/test"

const money = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type ClubRow = {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
}

type SquadPlayer = {
  name: string
  market_value: number
  contract: { loyalty_until: string; remaining_days: number }
}

type ClubDetail = ClubRow & { players: SquadPlayer[] }

function uniqueToken() {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  return `Aaa${stamp.replace(/\d/g, "a")}`
}

function clubIdentity() {
  const noise = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.replace(/\d/g, "x")
  let name = `Bravo ${noise}`
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "")
  let acronym = `${letters[0]}${letters[5]}${letters.at(-1)}`
  if (acronym[0] === acronym[1] && acronym[1] === acronym[2]) {
    name = `${name} Zeta`
    acronym = "BRZ"
  }
  return { name, acronym }
}

async function createPlayer(request: APIRequestContext, name: string, position: "GOL" | "ATA") {
  const response = await request.post("/api/v1/players", {
    data: {
      name,
      position,
      age: 24,
      agility: 70,
      pace: 40,
      shooting: 40,
      passing: 40,
      dribbling: 40,
      defending: 40,
      physical: 40,
      potential: 50,
    },
  })
  expect(response.ok(), await response.text()).toBeTruthy()
  return (await response.json()) as { id: number }
}

async function buyPlayer(request: APIRequestContext, playerId: number, clubId: number) {
  const response = await request.post(`/api/v1/players/${playerId}/buy`, {
    data: { club_id: clubId, loyalty_until: "2027-06-01T12:00-03:00" },
  })
  expect(response.ok(), await response.text()).toBeTruthy()
}

async function deletePlayer(request: APIRequestContext, id: number) {
  let response = await request.delete(`/api/v1/players/${id}`)
  if (!response.ok() && response.status() !== 204) {
    await request.post(`/api/v1/players/${id}/sell`)
    response = await request.delete(`/api/v1/players/${id}`)
  }
}

function clubsFromList(url: string, method: string) {
  if (method !== "GET") return false
  const path = new URL(url).pathname
  return path.endsWith("/clubs")
}

async function chooseSort(page: Page, sort: string, option: string) {
  const listed = page.waitForResponse(
    (response) => clubsFromList(response.url(), response.request().method()) && response.url().includes(`sort=${sort}`),
  )
  await page.getByRole("combobox", { name: "Ordenar por" }).click()
  await page.getByRole("option", { name: option, exact: true }).click()
  const response = await listed
  expect(response.ok()).toBeTruthy()
  return (await response.json()) as ClubRow[]
}

async function expectTableOrder(page: Page, clubs: ClubRow[]) {
  const rows = page.locator("tbody tr")
  await expect(rows).toHaveCount(clubs.length)
  for (const [index, club] of clubs.entries()) {
    await expect(rows.nth(index)).toContainText(club.name)
  }
}

async function createClub(page: Page) {
  await page.locator("main").getByRole("button", { name: "Novo clube" }).click()
  const dialog = page.getByRole("dialog", { name: "Novo clube" })

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { name, acronym } = clubIdentity()
    await dialog.getByRole("textbox", { name: /^Nome/ }).fill(name)
    await dialog.getByRole("textbox", { name: /^Sigla/ }).fill(acronym)
    const created = page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/clubs"),
    )
    await dialog.getByRole("button", { name: "Criar clube" }).click()
    const response = await created
    if (response.ok()) return (await response.json()) as ClubRow
    const text = await response.text()
    if (!text.includes("Sigla") || attempt === 4) throw new Error(text)
  }

  throw new Error("Não foi possível criar o clube.")
}

async function createClubRecord(request: APIRequestContext) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const identity = clubIdentity()
    const response = await request.post("/api/v1/clubs", { data: identity })
    if (response.ok()) return (await response.json()) as ClubRow
    const text = await response.text()
    if (!text.includes("Sigla") || attempt === 4) throw new Error(text)
  }

  throw new Error("Não foi possível criar o clube.")
}

export type { ClubDetail, ClubRow }
export {
  buyPlayer,
  chooseSort,
  clubIdentity,
  createClub,
  createClubRecord,
  createPlayer,
  deletePlayer,
  expectTableOrder,
  money,
  uniqueToken,
}
