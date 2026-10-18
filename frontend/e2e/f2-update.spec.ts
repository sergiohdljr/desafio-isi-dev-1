import { expect, test } from "@playwright/test"
import { formatLoyalty } from "@/features/players/utils/format-loyalty"
import { signedCoins } from "@/features/players/utils/signed-coins"
import { clubOption } from "@/features/players/utils/club-option"
import {
  buyPlayer,
  createClub,
  createClubRecord,
  createPlayer,
  deletePlayer,
  money,
  openClubSection,
  seedMatchReadyClub,
  seedSquad,
  uniqueToken,
  type MatchDetail,
  type Sale,
} from "./clubs.helpers"
import { fillAndSave, openPlayers, playerRow, removeByName, searchPlayers } from "./players.helpers"

test("[F2.atualizacao] cadastro mostra overall e valores da API sem reload", async ({ page, request }) => {
  const name = `${uniqueToken()} Cadastro`
  try {
    await openPlayers(page)
    const created = page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/players"),
    )
    await fillAndSave(page, { name, position: "MEI", age: 23, agility: 70, skill: 55, potential: 70 })
    const response = await created
    expect(response.ok()).toBeTruthy()
    const player = (await response.json()) as {
      name: string
      overall: number
      base_value: number
      market_value: number
      age: number
    }
    expect(page.url()).toContain("/jogadores")
    await searchPlayers(page, name)
    const row = playerRow(page, name)
    await expect(row).toContainText(String(player.overall))
    await expect(row).toContainText(money.format(player.base_value))
    await expect(row).toContainText(money.format(player.market_value))
    await expect(row).toContainText(String(player.age))
  } finally {
    await removeByName(request, name)
  }
})

test("[F2.atualizacao] edição mostra a idade devolvida pelo PUT", async ({ page, request }) => {
  const name = `${uniqueToken()} Edicao`
  const player = await createPlayer(request, name, "ATA", { age: 22 })
  try {
    await openPlayers(page)
    await searchPlayers(page, name)
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Editar" }).click()
    const edit = page.getByRole("dialog", { name: "Editar jogador" })
    await edit.getByRole("textbox", { name: /^Idade/ }).fill("25")
    const updated = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" && new URL(response.url()).pathname.endsWith(`/players/${player.id}`),
    )
    await edit.getByRole("button", { name: "Salvar alterações" }).click()
    const response = await updated
    expect(response.ok()).toBeTruthy()
    const body = (await response.json()) as { age: number; market_value: number }
    await expect(playerRow(page, name)).toContainText(String(body.age))
    await expect(playerRow(page, name)).toContainText(money.format(body.market_value))
    expect(page.url()).toContain("/jogadores")
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F2.atualizacao] condição mostra o rótulo da API após o PATCH", async ({ page, request }) => {
  const name = `${uniqueToken()} Condicao`
  const player = await createPlayer(request, name, "ATA")
  try {
    await openPlayers(page)
    await searchPlayers(page, name)
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Alterar condição" }).click()
    const dialog = page.getByRole("dialog", { name: "Alterar condição física" })
    await dialog.getByText("Mal condicionado", { exact: true }).click()
    const patched = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        new URL(response.url()).pathname.endsWith(`/players/${player.id}/condition`),
    )
    await dialog.getByRole("button", { name: "Salvar condição" }).click()
    const response = await patched
    expect(response.ok()).toBeTruthy()
    const body = (await response.json()) as { condition: string; market_value: number }
    expect(body.condition).toBe("MAL_CONDICIONADO")
    await expect(playerRow(page, name)).toContainText("Mal condicionado")
    await expect(playerRow(page, name)).toContainText(money.format(body.market_value))
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F2.atualizacao] exclusão remove o jogador da lista sem reload", async ({ page, request }) => {
  const name = `${uniqueToken()} Exclusao`
  const player = await createPlayer(request, name, "ATA")
  try {
    await openPlayers(page)
    await searchPlayers(page, name)
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Excluir" }).click()
    const deleted = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" && new URL(response.url()).pathname.endsWith(`/players/${player.id}`),
    )
    await page.getByRole("button", { name: "Excluir jogador" }).click()
    expect((await deleted).status()).toBe(204)
    await expect(playerRow(page, name)).toHaveCount(0)
    expect(page.url()).toContain("/jogadores")
  } finally {
    await removeByName(request, name)
  }
})

test("[F2.atualizacao] criação de clube lista caixa e patrimônio da API", async ({ page }) => {
  await page.goto("/clubes")
  const club = await createClub(page)
  await page.goto("/clubes")
  expect(page.url()).toContain("/clubes")
  const row = page.getByRole("row").filter({ hasText: club.name })
  await expect(row).toContainText(money.format(club.cash))
  await expect(row).toContainText(money.format(club.squad_value))
  await expect(row).toContainText(money.format(club.net_worth))
})

test("[F2.atualizacao] compra atualiza clube e valores a partir do POST", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const player = await createPlayer(request, `${uniqueToken()} Compra`, "ATA")
  try {
    await openPlayers(page)
    await searchPlayers(page, player.name)
    await playerRow(page, player.name).getByRole("button", { name: "Comprar" }).click()
    const dialog = page.getByRole("dialog", { name: "Comprar jogador" })
    await dialog.getByRole("combobox").click()
    await page.getByRole("option", { name: clubOption(club), exact: true }).click()
    await dialog.getByLabel("Data da fidelidade").fill("2027-06-01")
    await dialog.getByLabel("Hora da fidelidade").fill("12:00")
    const bought = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname.endsWith(`/players/${player.id}/buy`),
    )
    await dialog.getByRole("button", { name: "Confirmar compra" }).click()
    const response = await bought
    expect(response.ok()).toBeTruthy()
    const purchase = (await response.json()) as {
      value: number
      fee: number
      club_cash: number
      contract: { loyalty_until: string }
    }
    expect(response.request().postDataJSON()).toMatchObject({ loyalty_until: "2027-06-01T12:00-03:00" })
    const done = page.getByRole("dialog", { name: "Compra concluída" })
    await expect(done.getByText(money.format(purchase.value), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(money.format(purchase.fee), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(money.format(purchase.value + purchase.fee), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(formatLoyalty(purchase.contract.loyalty_until))).toBeVisible()
    await expect(done.getByText(money.format(purchase.club_cash), { exact: true }).first()).toBeVisible()
    await done
      .locator("button")
      .filter({ hasText: /^Fechar$/ })
      .click()
    await expect(playerRow(page, player.name)).toContainText(club.acronym)
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F2.atualizacao] venda mostra multa, lucro e caixa da API", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const player = await createPlayer(request, `${uniqueToken()} Venda`, "ATA")
  const reserve = await createPlayer(request, `${uniqueToken()} Reserva`, "MEI")
  try {
    await buyPlayer(request, player.id, club.id)
    await buyPlayer(request, reserve.id, club.id)
    await openClubSection(page, club.id, "Elenco")
    await page.getByRole("row").filter({ hasText: player.name }).getByRole("button", { name: "Vender" }).click()
    const sold = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname.endsWith(`/players/${player.id}/sell`),
    )
    await page
      .getByRole("dialog", { name: `Vender ${player.name}?` })
      .getByRole("button", { name: "Confirmar venda" })
      .click()
    const response = await sold
    expect(response.ok()).toBeTruthy()
    const sale = (await response.json()) as Sale
    const done = page.getByRole("dialog", { name: "Venda concluída" })
    await expect(done.getByText(money.format(sale.purchase_value), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(money.format(sale.value), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(money.format(sale.penalty), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(signedCoins(sale.profit), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(money.format(sale.fee), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(signedCoins(sale.cash_change), { exact: true }).first()).toBeVisible()
    await expect(done.getByText(money.format(sale.club_cash), { exact: true }).first()).toBeVisible()
  } finally {
    await deletePlayer(request, player.id)
    await deletePlayer(request, reserve.id)
  }
})

test("[F2.atualizacao] escalação salva mostra a formação devolvida pelo PUT", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const players = await seedSquad(request, club.id)
  try {
    await openClubSection(page, club.id, "Escalação")
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
    await expect(page.getByText("Escalação salva")).toBeVisible()
    await expect(page.getByText("Completa", { exact: true })).toBeVisible()
    for (const player of lineup.players) {
      await expect(page.getByRole("combobox").filter({ hasText: player.name }).first()).toBeVisible()
    }
  } finally {
    for (const player of players) await deletePlayer(request, player.id)
  }
})

test("[F2.atualizacao] partida mostra placar e 6 duelos da API", async ({ page, request }) => {
  const home = await seedMatchReadyClub(request)
  const away = await seedMatchReadyClub(request, [home.club.id])
  try {
    await page.goto("/partidas")
    await page.getByRole("button", { name: "Nova partida" }).first().click()
    const dialog = page.getByRole("dialog", { name: "Nova partida" })
    await dialog.getByRole("combobox", { name: "Mandante" }).click()
    await page.getByRole("option", { name: `${home.club.name} (${home.club.acronym})`, exact: true }).click()
    await dialog.getByRole("combobox", { name: "Visitante" }).click()
    await page.getByRole("option", { name: `${away.club.name} (${away.club.acronym})`, exact: true }).click()
    const played = page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/matches"),
    )
    await dialog.getByRole("button", { name: "Jogar partida" }).click()
    const response = await played
    expect(response.ok()).toBeTruthy()
    const match = (await response.json()) as MatchDetail
    expect(match.duels).toHaveLength(6)
    await expect(page).toHaveURL(new RegExp(`/partidas/${match.id}$`))
    await expect(
      page.getByRole("paragraph").filter({ hasText: new RegExp(`^${match.home.goals} × ${match.away.goals}$`) }),
    ).toBeVisible()
    await expect(page.getByRole("heading", { name: "Duelos" })).toBeVisible()
    await expect(page.locator("tbody tr").filter({ hasText: /º/ })).toHaveCount(6)
  } finally {
    for (const player of [...home.players, ...away.players]) await deletePlayer(request, player.id)
  }
})
