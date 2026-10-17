import { expect, test } from "@playwright/test"
import { buyPlayer, createClubRecord, createPlayer, deletePlayer, money, uniqueToken } from "./clubs.helpers"
import { fillAndSave, openPlayers, playerRow, removeByName, searchPlayers } from "./players.helpers"
import { formatLoyalty } from "@/features/players/utils/format-loyalty"
import { clubOption } from "@/features/players/utils/club-option"

test("[F01] tabela de jogadores com colunas e paginação de 10", async ({ page, request }) => {
  const token = uniqueToken()
  const ids: number[] = []
  try {
    const suffixes = ["Um", "Dois", "Tres", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Onze"]
    for (const suffix of suffixes) {
      const player = await createPlayer(request, `${token} Pagina ${suffix}`, "ATA", { age: 20 })
      ids.push(player.id)
    }

    await openPlayers(page)
    await searchPlayers(page, token)

    for (const heading of [
      "Jogador",
      "Posição",
      "Overall",
      "Agilidade",
      "Idade",
      "Condição",
      "Valor base",
      "Valor de mercado",
      "Clube",
    ]) {
      await expect(page.getByRole("columnheader", { name: heading, exact: true })).toBeVisible()
    }

    const rows = page.locator("tbody tr")
    await expect(rows).toHaveCount(10)
    await expect(page.getByText("Mostrando 1–10 de 11 jogadores")).toBeVisible()

    await page.getByRole("button", { name: "Próxima" }).click()
    await expect(page.getByText("Mostrando 11–11 de 11 jogadores")).toBeVisible()
    await expect(rows).toHaveCount(1)
    await expect(rows.nth(0)).toContainText(token)

    await page.getByRole("button", { name: "Anterior" }).click()
    await expect(page.getByText("Mostrando 1–10 de 11 jogadores")).toBeVisible()
    await expect(rows).toHaveCount(10)
  } finally {
    for (const id of ids) await deletePlayer(request, id)
  }
})

test("[F02] busca, filtros, ordenações e Livres sem clube", async ({ page, request }) => {
  const token = uniqueToken()
  const young = await createPlayer(request, `${token} Jovem Ata`, "ATA", { age: 18 })
  const old = await createPlayer(request, `${token} Velho Gol`, "GOL", { age: 30 })
  const club = await createClubRecord(request)
  try {
    await buyPlayer(request, old.id, club.id)

    await openPlayers(page)
    await searchPlayers(page, token)
    await expect(playerRow(page, young.name)).toBeVisible()
    await expect(playerRow(page, old.name)).toBeVisible()

    await page.getByRole("combobox", { name: "Posição" }).click()
    await page.getByRole("option", { name: "Atacante", exact: true }).click()
    await expect(playerRow(page, young.name)).toBeVisible()
    await expect(playerRow(page, old.name)).toHaveCount(0)

    await page.getByRole("button", { name: "Limpar filtros" }).click()
    await searchPlayers(page, token)

    await page.getByRole("combobox", { name: "Condição" }).click()
    await page.getByRole("option", { name: "Apto", exact: true }).click()
    await expect(playerRow(page, young.name)).toBeVisible()

    await page.getByRole("button", { name: "Idade" }).click()
    await page.getByLabel("Mínimo").fill("30")
    await page.getByLabel("Máximo").fill("40")
    await page.getByRole("heading", { name: "Jogadores" }).click()
    await expect(playerRow(page, old.name)).toBeVisible()
    await expect(playerRow(page, young.name)).toHaveCount(0)

    await page.getByRole("button", { name: "Limpar filtros" }).click()
    await searchPlayers(page, token)

    await page.getByRole("combobox", { name: "Ordenar por" }).click()
    await page.getByRole("option", { name: "maior idade", exact: true }).click()
    await expect(page.locator("tbody tr").first()).toContainText(old.name)

    await page.getByRole("combobox", { name: "Ordenar por" }).click()
    await page.getByRole("option", { name: "menor idade", exact: true }).click()
    await expect(page.locator("tbody tr").first()).toContainText(young.name)

    await page.getByRole("tab", { name: /Livres/ }).click()
    await expect(page.getByRole("combobox", { name: "Clube" })).toBeDisabled()
    await expect(page.getByText(/filtro por clube fica desabilitado/i)).toBeVisible()
    await expect(playerRow(page, young.name)).toBeVisible()
    await expect(playerRow(page, old.name)).toHaveCount(0)

    await page.getByRole("tab", { name: /Todos/ }).click()
    await page.getByRole("combobox", { name: "Clube" }).click()
    await page.getByRole("option", { name: club.name, exact: true }).click()
    await expect(playerRow(page, old.name)).toBeVisible()
    await expect(playerRow(page, young.name)).toHaveCount(0)
  } finally {
    await deletePlayer(request, young.id)
    await deletePlayer(request, old.id)
  }
})

test("[F03][F04] cadastra, edita, altera a condição e exclui o jogador", async ({ page, request }) => {
  const name = `${uniqueToken()} Cadastro`

  try {
    await openPlayers(page)
    await fillAndSave(page, { name, position: "ZAG", age: 22, agility: 66, skill: 55, potential: 70 })
    await searchPlayers(page, name)

    const row = playerRow(page, name)
    await expect(row.getByText("ZAG", { exact: true })).toBeVisible()
    await expect(row.getByText("22", { exact: true })).toBeVisible()
    await expect(row.getByText("66", { exact: true })).toBeVisible()
    await expect(row.getByText("Apto")).toBeVisible()
    await expect(row.getByText("Livre")).toBeVisible()
    await expect(row.getByText(/\d+,\d{2}/).first()).toBeVisible()

    await row.getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Editar" }).click()
    const edit = page.getByRole("dialog", { name: "Editar jogador" })
    await edit.getByRole("textbox", { name: /^Idade/ }).fill("25")
    await edit.getByRole("button", { name: "Salvar alterações" }).click()
    await expect(playerRow(page, name).getByText("25", { exact: true })).toBeVisible()

    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Alterar condição" }).click()
    const condition = page.getByRole("dialog", { name: "Alterar condição física" })
    await condition.getByText("Mal condicionado", { exact: true }).click()
    await condition.getByRole("button", { name: "Salvar condição" }).click()
    await expect(playerRow(page, name).getByText("Mal condicionado")).toBeVisible()

    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Excluir" }).click()
    await page.getByRole("button", { name: "Excluir jogador" }).click()
    await expect(playerRow(page, name)).toHaveCount(0)
  } finally {
    await removeByName(request, name)
  }
})

test("[F06] compra pela tela com fidelidade em Brasília e atualiza a lista", async ({ page, request }) => {
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

    const buyResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname.endsWith(`/players/${player.id}/buy`),
    )
    await dialog.getByRole("button", { name: "Confirmar compra" }).click()
    const response = await buyResponse
    expect(response.ok()).toBeTruthy()
    const body = response.request().postDataJSON() as { club_id: number; loyalty_until: string }
    expect(body.club_id).toBe(club.id)
    expect(body.loyalty_until).toBe("2027-06-01T12:00-03:00")
    const purchase = (await response.json()) as {
      value: number
      fee: number
      club_cash: number
      contract: { loyalty_until: string }
    }

    const done = page.getByRole("dialog", { name: "Compra concluída" })
    await expect(done.getByText("Valor", { exact: true })).toBeVisible()
    await expect(done.getByText(money.format(purchase.value), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Taxa", { exact: true })).toBeVisible()
    await expect(done.getByText(money.format(purchase.fee), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Custo total")).toBeVisible()
    await expect(done.getByText(money.format(purchase.value + purchase.fee), { exact: true }).first()).toBeVisible()
    await expect(done.getByText("Fim da fidelidade")).toBeVisible()
    await expect(done.getByText(formatLoyalty(purchase.contract.loyalty_until))).toBeVisible()
    await expect(done.getByText(`Novo caixa do ${club.name}`)).toBeVisible()
    await expect(done.getByText(money.format(purchase.club_cash), { exact: true }).first()).toBeVisible()
    await done
      .locator("button")
      .filter({ hasText: /^Fechar$/ })
      .click()

    await expect(playerRow(page, player.name)).toContainText(club.acronym)
    await expect(playerRow(page, player.name)).toContainText(club.name)

    await page.getByRole("combobox", { name: "Clube" }).click()
    await page.getByRole("option", { name: club.name, exact: true }).click()
    await expect(playerRow(page, player.name)).toBeVisible()

    await page.getByRole("button", { name: "Limpar filtros" }).click()
    await searchPlayers(page, player.name)
    await page.getByRole("tab", { name: /Livres/ }).click()
    await expect(playerRow(page, player.name)).toHaveCount(0)
  } finally {
    await deletePlayer(request, player.id)
  }
})
