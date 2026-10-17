import { expect, type APIRequestContext, type Page } from "@playwright/test"

const money = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type Position = "GOL" | "ZAG" | "LAT" | "MEI" | "ATA"

type ClubRow = {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
}

type SquadPlayer = {
  id: number
  name: string
  market_value: number
  contract: { loyalty_until: string; remaining_days: number; purchase_value: number }
}

type ClubDetail = ClubRow & { players: SquadPlayer[] }

type CreatedPlayer = { id: number; name: string; position: Position }

type Purchase = {
  value: number
  fee: number
  club_cash: number
  contract: { loyalty_until: string }
}

type Sale = {
  purchase_value: number
  value: number
  remaining_days: number
  penalty: number
  profit: number
  fee: number
  cash_change: number
  club_cash: number
}

type TransactionList = {
  data: Array<{
    id: number
    type: "COMPRA" | "VENDA"
    player_name: string
    value: number
    fee: number
    penalty: number
    profit: number
    cash_change: number
    created_at: string
  }>
  summary: {
    total_spent: number
    total_received: number
    total_fees: number
    total_penalties: number
    total_profit: number
  }
}

type Lineup = {
  formation: string
  players: Array<{ id: number; name: string }>
}

type MatchDetail = {
  id: number
  home: { club_id: number; club_name: string; goals: number }
  away: { club_id: number; club_name: string; goals: number }
  duels: unknown[]
}

type StandingRow = {
  club_id: number
  club_name: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  position: number
}

function uniqueToken() {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  return `Aaa${stamp.replace(/\d/g, "a")}`
}

function clubIdentity() {
  const pick = () => String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const first = pick()
  let middle = pick()
  let last = pick()
  while (first === middle && middle === last) {
    middle = pick()
    last = pick()
  }
  const noise = uniqueToken()
  const name = `${first}arco ${noise} ${middle}uli ${last}eta`
  const acronym = `${first}${middle}${last}`
  return { name, acronym }
}

async function reclaimClub(request: APIRequestContext, excludeIds: number[] = []) {
  const listed = await request.get("/api/v1/clubs")
  expect(listed.ok(), await listed.text()).toBeTruthy()
  const clubs = (await listed.json()) as ClubRow[]
  const candidate =
    clubs.find(
      (club) => !excludeIds.includes(club.id) && (/arco |uli |eta$/i.test(club.name) || club.name.startsWith("Bravo")),
    ) ?? clubs.find((club) => !excludeIds.includes(club.id))
  expect(candidate, "nenhum clube para reaproveitar").toBeTruthy()
  await request
    .put(`/api/v1/clubs/${candidate!.id}/lineup`, {
      data: { formation: "2-1-1", player_ids: [] },
    })
    .catch(() => undefined)
  const detail = await request.get(`/api/v1/clubs/${candidate!.id}`)
  expect(detail.ok(), await detail.text()).toBeTruthy()
  const body = (await detail.json()) as ClubDetail
  for (const player of body.players) {
    await deletePlayer(request, player.id)
  }
  return candidate!
}

async function createPlayer(
  request: APIRequestContext,
  name: string,
  position: Position = "ATA",
  extras: { age?: number; agility?: number } = {},
) {
  const response = await request.post("/api/v1/players", {
    data: {
      name,
      position,
      age: extras.age ?? 24,
      agility: extras.agility ?? 70,
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
  const body = (await response.json()) as { id: number }
  return { id: body.id, name, position } satisfies CreatedPlayer
}

async function buyPlayer(
  request: APIRequestContext,
  playerId: number,
  clubId: number,
  loyaltyUntil = "2027-06-01T12:00-03:00",
) {
  const response = await request.post(`/api/v1/players/${playerId}/buy`, {
    data: { club_id: clubId, loyalty_until: loyaltyUntil },
  })
  expect(response.ok(), await response.text()).toBeTruthy()
  return (await response.json()) as Purchase
}

async function sellPlayer(request: APIRequestContext, playerId: number) {
  const response = await request.post(`/api/v1/players/${playerId}/sell`)
  expect(response.ok(), await response.text()).toBeTruthy()
  return (await response.json()) as Sale
}

async function deletePlayer(request: APIRequestContext, id: number) {
  let response = await request.delete(`/api/v1/players/${id}`)
  if (!response.ok() && response.status() !== 204) {
    await request.post(`/api/v1/players/${id}/sell`)
    response = await request.delete(`/api/v1/players/${id}`)
  }
}

async function saveLineup(request: APIRequestContext, clubId: number, formation: string, playerIds: number[]) {
  const response = await request.put(`/api/v1/clubs/${clubId}/lineup`, {
    data: { formation, player_ids: playerIds },
  })
  expect(response.ok(), await response.text()).toBeTruthy()
  return (await response.json()) as Lineup
}

async function seedSquad(request: APIRequestContext, clubId: number) {
  const roster: Array<[Position, string]> = [
    ["GOL", "Goleiro"],
    ["ZAG", "Zagueiro"],
    ["LAT", "Lateral"],
    ["MEI", "Meio"],
    ["ATA", "Ataque"],
  ]
  const players: CreatedPlayer[] = []
  for (const [position, label] of roster) {
    const player = await createPlayer(request, `${uniqueToken()} ${label}`, position)
    await buyPlayer(request, player.id, clubId)
    players.push(player)
  }
  return players
}

async function seedMatchReadyClub(request: APIRequestContext, excludeIds: number[] = []) {
  const club = await createClubRecord(request, excludeIds)
  const players = await seedSquad(request, club.id)
  await saveLineup(
    request,
    club.id,
    "2-1-1",
    players.map((player) => player.id),
  )
  return { club, players }
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
  await page.locator("main").getByRole("button", { name: "Novo clube" }).first().click()
  const dialog = page.getByRole("dialog", { name: "Novo clube" })

  for (let attempt = 0; attempt < 8; attempt += 1) {
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
    if (/máximo 20 clubes/i.test(text)) {
      await dialog
        .getByRole("button", { name: "Cancelar" })
        .click()
        .catch(() => undefined)
      throw new Error(text)
    }
    if (!/sigla|nome|cadastrad/i.test(text) || attempt === 7) throw new Error(text)
  }

  throw new Error("Não foi possível criar o clube.")
}

async function createClubRecord(request: APIRequestContext, excludeIds: number[] = []) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const identity = clubIdentity()
    const response = await request.post("/api/v1/clubs", { data: identity })
    if (response.ok()) return (await response.json()) as ClubRow
    const text = await response.text()
    if (/máximo 20 clubes/i.test(text)) return reclaimClub(request, excludeIds)
    if (!/sigla|nome|cadastrad/i.test(text) || attempt === 11) throw new Error(text)
  }

  throw new Error("Não foi possível criar o clube.")
}

async function openClubSection(page: Page, clubId: number, section: "Elenco" | "Escalação" | "Histórico") {
  await page.goto(`/club/${clubId}`)
  await page.getByRole("tab", { name: section }).click()
}

export type { ClubDetail, ClubRow, CreatedPlayer, MatchDetail, Purchase, Sale, StandingRow, TransactionList }
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
  openClubSection,
  saveLineup,
  seedMatchReadyClub,
  seedSquad,
  sellPlayer,
  uniqueToken,
}
