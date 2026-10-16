import { expect, test } from "@playwright/test"
import { penaltyRateFor } from "@/features/clubs/utils/penalty-rate"
import { splitLoyalty } from "@/features/players/utils/format-loyalty"
import {
  buyPlayer,
  chooseSort,
  createClub,
  createClubRecord,
  createPlayer,
  deletePlayer,
  expectTableOrder,
  money,
  uniqueToken,
  type ClubDetail,
} from "./clubs.helpers"

test("cria o clube e lista na ordem do GET", async ({ page }) => {
  await page.goto("/clubes")
  await expect(page.getByRole("heading", { name: "Clubes" })).toBeVisible()
  const club = await createClub(page)
  await page.goto("/clubes")

  const row = page.getByRole("row").filter({ hasText: club.name })
  await expect(row).toContainText(club.acronym)
  await expect(row).toContainText(money.format(club.cash))
  await expect(row).toContainText(money.format(club.squad_value))
  await expect(row).toContainText(money.format(club.net_worth))
  expect(club.cash).toBe(300)
  expect(club.squad_value).toBe(0)

  const byName = await chooseSort(page, "name", "Nome")
  await expectTableOrder(page, byName)

  const byWorth = await chooseSort(page, "net_worth_desc", "Patrimônio (maior para o menor)")
  await expectTableOrder(page, byWorth)
  expect(byWorth.map((item) => item.id)).toContain(club.id)
})

test("mostra o patrimônio e o elenco na ordem do GET do clube", async ({ page, request }) => {
  const clubCreated = await createClubRecord(request)
  const clubId = clubCreated.id

  const keeper = await createPlayer(request, `${uniqueToken()} Goleiro`, "GOL")
  const forward = await createPlayer(request, `${uniqueToken()} Atacante`, "ATA")
  try {
    await buyPlayer(request, keeper.id, clubId)
    await buyPlayer(request, forward.id, clubId)

    await page.goto(`/club/${clubId}`)
    const loaded = await page.waitForResponse(
      (response) =>
        response.request().method() === "GET" && new URL(response.url()).pathname.endsWith(`/clubs/${clubId}`),
    )
    expect(loaded.ok()).toBeTruthy()
    const club = (await loaded.json()) as ClubDetail

    const card = (label: string) =>
      page.locator("[data-slot=summary-card]").filter({ has: page.locator("p", { hasText: new RegExp(`^${label}$`) }) })

    await expect(page.getByRole("heading", { name: club.name })).toBeVisible()
    await expect(card("Caixa")).toContainText(money.format(club.cash))
    await expect(card("Valor do elenco")).toContainText(money.format(club.squad_value))
    await expect(card("Patrimônio")).toContainText(money.format(club.net_worth))

    const rows = page.locator("tbody tr")
    await expect(rows).toHaveCount(club.players.length)
    for (const [index, player] of club.players.entries()) {
      const loyalty = splitLoyalty(player.contract.loyalty_until)
      const row = rows.nth(index)
      await expect(row).toContainText(player.name)
      await expect(row).toContainText(money.format(player.market_value))
      await expect(row).toContainText(loyalty.date)
      await expect(row).toContainText(loyalty.time)
      await expect(row).toContainText(String(player.contract.remaining_days))
      await expect(row).toContainText(`${penaltyRateFor(player.contract.remaining_days)}%`)
    }
  } finally {
    await deletePlayer(request, keeper.id)
    await deletePlayer(request, forward.id)
  }
})
