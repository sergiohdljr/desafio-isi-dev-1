import { expect, test } from "@playwright/test"
import { penaltyRateFor } from "@/features/clubs/utils/penalty-rate"
import { splitLoyalty } from "@/features/players/utils/format-loyalty"
import { signedCoins } from "@/features/players/utils/signed-coins"
import {
  buyPlayer,
  chooseSort,
  createClub,
  createClubRecord,
  createPlayer,
  deletePlayer,
  expectTableOrder,
  money,
  openClubSection,
  seedSquad,
  uniqueToken,
  type ClubDetail,
  type Sale,
  type TransactionList,
} from "./clubs.helpers"

test("[F05] cria o clube e lista na ordem do GET", async ({ page }) => {
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

test("[F07] mostra o patrimônio e o elenco na ordem do GET do clube", async ({ page, request }) => {
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

test("[F08] vende pela tela do clube e mostra o resultado da API", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const player = await createPlayer(request, `${uniqueToken()} Venda`, "ATA")
  const reserve = await createPlayer(request, `${uniqueToken()} Reserva`, "MEI")
  try {
    await buyPlayer(request, player.id, club.id)
    await buyPlayer(request, reserve.id, club.id)
    await openClubSection(page, club.id, "Elenco")
    await page.getByRole("row").filter({ hasText: player.name }).getByRole("button", { name: "Vender" }).click()

    const confirm = page.getByRole("dialog", { name: `Vender ${player.name}?` })
    const sellResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname.endsWith(`/players/${player.id}/sell`),
    )
    await confirm.getByRole("button", { name: "Confirmar venda" }).click()
    const response = await sellResponse
    expect(response.ok()).toBeTruthy()
    const sale = (await response.json()) as Sale

    const done = page.getByRole("dialog", { name: "Venda concluída" })
    await expect(done.getByText("Valor de compra", { exact: true })).toBeVisible()
    await expect(done.getByText(money.format(sale.purchase_value), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Valor de venda", { exact: true })).toBeVisible()
    await expect(done.getByText(money.format(sale.value), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Dias restantes", { exact: true })).toBeVisible()
    await expect(done.getByText(String(sale.remaining_days), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Multa", { exact: true })).toBeVisible()
    await expect(done.getByText(money.format(sale.penalty), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Lucro", { exact: true })).toBeVisible()
    await expect(done.getByText(signedCoins(sale.profit), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Comissão", { exact: true })).toBeVisible()
    await expect(done.getByText(money.format(sale.fee), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Crédito no caixa", { exact: true })).toBeVisible()
    await expect(done.getByText(signedCoins(sale.cash_change), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(`Novo caixa do ${club.name}`, { exact: true })).toBeVisible()
    await expect(done.getByText(money.format(sale.club_cash), { exact: true }).first()).toBeVisible()
  } finally {
    await deletePlayer(request, player.id)
    await deletePlayer(request, reserve.id)
  }
})

test("[F09][F10][F11] histórico com filtros, summary e exportação CSV", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const kept = await createPlayer(request, `${uniqueToken()} Mantido`, "ATA")
  const sold = await createPlayer(request, `${uniqueToken()} Alienado`, "MEI")
  try {
    await buyPlayer(request, kept.id, club.id)
    await buyPlayer(request, sold.id, club.id)
    await request.post(`/api/v1/players/${sold.id}/sell`)

    const historyPending = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname.endsWith(`/clubs/${club.id}/transactions`) &&
        !response.url().includes("/export"),
    )
    await openClubSection(page, club.id, "Histórico")
    const historyResponse = await historyPending
    expect(historyResponse.ok()).toBeTruthy()
    const history = (await historyResponse.json()) as TransactionList

    await expect(page.getByRole("heading", { name: "Histórico de transações" })).toBeVisible()
    for (const heading of [
      "Data e hora",
      "Tipo",
      "Jogador",
      "Valor",
      "Taxa ou comissão",
      "Multa",
      "Lucro",
      "Variação do caixa",
    ]) {
      await expect(page.getByRole("columnheader", { name: heading, exact: true })).toBeVisible()
    }

    for (const row of history.data) {
      const when = splitLoyalty(row.created_at)
      const typeLabel = row.type === "COMPRA" ? "Compra" : "Venda"
      const tableRow = page
        .getByRole("row")
        .filter({ hasText: row.player_name })
        .filter({ has: page.getByText(typeLabel, { exact: true }) })
      await expect(tableRow).toContainText(when.date)
      await expect(tableRow).toContainText(money.format(row.value))
      await expect(tableRow).toContainText(money.format(row.fee))
      await expect(tableRow).toContainText(money.format(row.penalty))
      await expect(tableRow).toContainText(signedCoins(row.cash_change))
    }

    await expect(page.getByText("Total pago em compras")).toBeVisible()
    await expect(page.getByText(money.format(history.summary.total_spent), { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Total recebido em vendas")).toBeVisible()
    await expect(page.getByText(money.format(history.summary.total_received), { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Taxas e comissões")).toBeVisible()
    await expect(page.getByText(money.format(history.summary.total_fees), { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Multas", { exact: true })).toBeVisible()
    await expect(page.getByText(money.format(history.summary.total_penalties), { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Lucro total")).toBeVisible()
    await expect(page.getByText(signedCoins(history.summary.total_profit), { exact: true }).first()).toBeVisible()

    const compraOnly = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname.endsWith(`/clubs/${club.id}/transactions`) &&
        response.url().includes("type=COMPRA") &&
        !response.url().includes("/export"),
    )
    await page
      .locator("label")
      .filter({ hasText: /^Venda$/ })
      .locator('[data-slot="checkbox"]')
      .click()
    const filteredResponse = await compraOnly
    expect(filteredResponse.ok()).toBeTruthy()
    const filtered = (await filteredResponse.json()) as TransactionList
    expect(filtered.data.every((row) => row.type === "COMPRA")).toBeTruthy()
    await expect(page.getByText(money.format(filtered.summary.total_spent), { exact: true }).first()).toBeVisible()

    const byPlayer = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname.endsWith(`/clubs/${club.id}/transactions`) &&
        response.url().includes(`player_id=${kept.id}`) &&
        !response.url().includes("/export"),
    )
    await page.getByRole("combobox", { name: "Filtrar por jogador" }).click()
    await page.getByRole("option", { name: kept.name, exact: true }).click()
    await byPlayer
    await expect(page.getByRole("row").filter({ hasText: kept.name })).toBeVisible()

    const exportResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname.endsWith(`/clubs/${club.id}/transactions/export`),
    )
    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("button", { name: "Exportar CSV" }).click()
    const [download, exported] = await Promise.all([downloadPromise, exportResponse])
    expect(exported.ok()).toBeTruthy()
    expect(exported.url()).toContain("type=COMPRA")
    expect(exported.url()).toContain(`player_id=${kept.id}`)
    expect(download.suggestedFilename()).toBe("historico.csv")
    await expect(page.getByText("CSV baixado")).toBeVisible()
  } finally {
    await deletePlayer(request, kept.id)
    await deletePlayer(request, sold.id)
  }
})

test("[F12] escala titulares pela tela e avisa quando incompleta", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const players = await seedSquad(request, club.id)
  try {
    await openClubSection(page, club.id, "Escalação")
    await expect(page.getByText(`Escalação incompleta: o ${club.name} não pode jogar partidas`)).toBeVisible()

    await page.getByRole("radiogroup", { name: "Formação" }).getByText("2-1-1", { exact: true }).click()

    const slotPlan: Array<{ label: string; playerIndex: number; nth: number }> = [
      { label: "Goleiro", playerIndex: 0, nth: 0 },
      { label: "Defesa", playerIndex: 1, nth: 0 },
      { label: "Defesa", playerIndex: 2, nth: 1 },
      { label: "Meio", playerIndex: 3, nth: 0 },
      { label: "Ataque", playerIndex: 4, nth: 0 },
    ]
    for (const slot of slotPlan) {
      const player = players[slot.playerIndex]!
      await page.getByRole("combobox", { name: slot.label }).nth(slot.nth).click()
      await page.getByRole("option", { name: `${player.name} (${player.position})`, exact: true }).click()
    }

    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && new URL(response.url()).pathname.endsWith(`/clubs/${club.id}/lineup`),
    )
    await page.getByRole("button", { name: "Salvar escalação" }).click()
    const response = await saved
    expect(response.ok()).toBeTruthy()
    const lineup = (await response.json()) as { formation: string; players: Array<{ name: string }> }
    expect(lineup.formation).toBe("2-1-1")
    expect(lineup.players).toHaveLength(5)

    await expect(page.getByText("Escalação salva")).toBeVisible()
    await expect(page.getByText("Completa", { exact: true })).toBeVisible()
    for (const player of lineup.players) {
      await expect(page.getByRole("combobox").filter({ hasText: player.name }).first()).toBeVisible()
    }
  } finally {
    for (const player of players) await deletePlayer(request, player.id)
  }
})
