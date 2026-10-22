import { expect, test, type Page } from "@playwright/test"
import { clubOption } from "@/features/players/utils/club-option"
import {
  buyPlayer,
  clubIdentity,
  createClubRecord,
  createPlayer,
  deletePlayer,
  openClubSection,
  seedMatchReadyClub,
  seedSquad,
  uniqueToken,
} from "./clubs.helpers"
import { fillPlayerForm, openPlayers, playerRow, removeByName, searchPlayers } from "./players.helpers"

const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"]
const RESPONSE_DELAY_MS = 600

/**
 * O barema exige que o clique duplo envie um só pedido (HAR com uma entrada).
 * Cada teste conta as gravações da própria rota e dispara os dois cliques.
 * A resposta é atrasada para que o segundo clique caia enquanto o envio está
 * pendente, que é quando a tela precisa bloquear o botão.
 */
async function countWrites(page: Page, pathname: string) {
  const sent: string[] = []
  page.on("request", (request) => {
    if (!WRITE_METHODS.includes(request.method())) return
    if (new URL(request.url()).pathname !== pathname) return
    sent.push(`${request.method()} ${pathname}`)
  })
  await page.route(pathname, async (route) => {
    if (!WRITE_METHODS.includes(route.request().method())) return route.fallback()
    await new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY_MS))
    return route.fallback()
  })
  return sent
}

async function expectSingleWrite(page: Page, sent: string[]) {
  await page.waitForTimeout(500)
  expect(sent).toHaveLength(1)
}

test("[F3.mensagens] clique duplo no cadastro envia um só POST", async ({ page, request }) => {
  const name = `${uniqueToken()} Duplo Cadastro`
  try {
    await openPlayers(page)
    const dialog = await fillPlayerForm(page, { name, position: "MEI", age: 23 })
    const sent = await countWrites(page, "/api/v1/players")
    await dialog.getByRole("button", { name: "Salvar jogador" }).dblclick()
    await expect(page.getByText("Jogador cadastrado")).toBeVisible()
    await expectSingleWrite(page, sent)
  } finally {
    await removeByName(request, name)
  }
})

test("[F3.mensagens] clique duplo na edição envia um só PUT", async ({ page, request }) => {
  const name = `${uniqueToken()} Duplo Edicao`
  const player = await createPlayer(request, name, "ATA", { age: 22 })
  try {
    await openPlayers(page)
    await searchPlayers(page, name)
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Editar" }).click()
    const dialog = page.getByRole("dialog", { name: "Editar jogador" })
    await dialog.getByRole("textbox", { name: /^Idade/ }).fill("25")
    const sent = await countWrites(page, `/api/v1/players/${player.id}`)
    await dialog.getByRole("button", { name: "Salvar alterações" }).dblclick()
    await expect(page.getByText("Jogador atualizado")).toBeVisible()
    await expectSingleWrite(page, sent)
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F3.mensagens] clique duplo na condição envia um só PATCH", async ({ page, request }) => {
  const name = `${uniqueToken()} Duplo Condicao`
  const player = await createPlayer(request, name, "ATA")
  try {
    await openPlayers(page)
    await searchPlayers(page, name)
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Alterar condição" }).click()
    const dialog = page.getByRole("dialog", { name: "Alterar condição física" })
    await dialog.getByText("Mal condicionado", { exact: true }).click()
    const sent = await countWrites(page, `/api/v1/players/${player.id}/condition`)
    await dialog.getByRole("button", { name: "Salvar condição" }).dblclick()
    await expect(playerRow(page, name)).toContainText("Mal condicionado")
    await expectSingleWrite(page, sent)
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F3.mensagens] clique duplo na exclusão envia um só DELETE", async ({ page, request }) => {
  const name = `${uniqueToken()} Duplo Exclusao`
  const player = await createPlayer(request, name, "ATA")
  try {
    await openPlayers(page)
    await searchPlayers(page, name)
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Excluir" }).click()
    const sent = await countWrites(page, `/api/v1/players/${player.id}`)
    await page.getByRole("button", { name: "Excluir jogador" }).dblclick()
    await expect(playerRow(page, name)).toHaveCount(0)
    await expectSingleWrite(page, sent)
  } finally {
    await removeByName(request, name)
  }
})

test("[F3.mensagens] clique duplo na criação de clube envia um só POST", async ({ page }) => {
  await page.goto("/clubes")
  await page.locator("main").getByRole("button", { name: "Novo clube" }).first().click()
  const dialog = page.getByRole("dialog", { name: "Novo clube" })
  const { name, acronym } = clubIdentity()
  await dialog.getByRole("textbox", { name: /^Nome/ }).fill(name)
  await dialog.getByRole("textbox", { name: /^Sigla/ }).fill(acronym)
  const sent = await countWrites(page, "/api/v1/clubs")
  await dialog.getByRole("button", { name: "Criar clube" }).dblclick()
  await expect(page.getByText("Clube criado")).toBeVisible()
  await expectSingleWrite(page, sent)
})

test("[F3.mensagens] clique duplo na compra envia um só POST", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const player = await createPlayer(request, `${uniqueToken()} Duplo Compra`, "ATA")
  try {
    await openPlayers(page)
    await searchPlayers(page, player.name)
    await playerRow(page, player.name).getByRole("button", { name: "Comprar" }).click()
    const dialog = page.getByRole("dialog", { name: "Comprar jogador" })
    await dialog.getByRole("combobox").click()
    await page.getByRole("option", { name: clubOption(club), exact: true }).click()
    await dialog.getByLabel("Data da fidelidade").fill("2027-06-01")
    await dialog.getByLabel("Hora da fidelidade").fill("12:00")
    const sent = await countWrites(page, `/api/v1/players/${player.id}/buy`)
    await dialog.getByRole("button", { name: "Confirmar compra" }).dblclick()
    await expect(page.getByRole("dialog", { name: "Compra concluída" })).toBeVisible()
    await expectSingleWrite(page, sent)
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F3.mensagens] clique duplo na venda envia um só POST", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const player = await createPlayer(request, `${uniqueToken()} Duplo Venda`, "ATA")
  const reserve = await createPlayer(request, `${uniqueToken()} Duplo Reserva`, "MEI")
  try {
    await buyPlayer(request, player.id, club.id)
    await buyPlayer(request, reserve.id, club.id)
    await openClubSection(page, club.id, "Elenco")
    await page.getByRole("row").filter({ hasText: player.name }).getByRole("button", { name: "Vender" }).click()
    const sent = await countWrites(page, `/api/v1/players/${player.id}/sell`)
    await page
      .getByRole("dialog", { name: `Vender ${player.name}?` })
      .getByRole("button", { name: "Confirmar venda" })
      .dblclick()
    await expect(page.getByRole("dialog", { name: "Venda concluída" })).toBeVisible()
    await expectSingleWrite(page, sent)
  } finally {
    await deletePlayer(request, player.id)
    await deletePlayer(request, reserve.id)
  }
})

test("[F3.mensagens] clique duplo na escalação envia um só PUT", async ({ page, request }) => {
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
    const sent = await countWrites(page, `/api/v1/clubs/${club.id}/lineup`)
    await page.getByRole("button", { name: "Salvar escalação" }).dblclick()
    await expect(page.getByText("Escalação salva")).toBeVisible()
    await expectSingleWrite(page, sent)
  } finally {
    for (const player of players) await deletePlayer(request, player.id)
  }
})

test("[F3.mensagens] recusa da partida mostra o message da API", async ({ page, request }) => {
  const home = await seedMatchReadyClub(request)
  const incomplete = await createClubRecord(request, [home.club.id])
  try {
    await page.goto("/partidas")
    await page.getByRole("button", { name: "Nova partida" }).first().click()
    const dialog = page.getByRole("dialog", { name: "Nova partida" })
    await dialog.getByRole("combobox", { name: "Mandante" }).click()
    await page.getByRole("option", { name: `${incomplete.name} (${incomplete.acronym})`, exact: true }).click()
    await dialog.getByRole("combobox", { name: "Visitante" }).click()
    await page.getByRole("option", { name: `${home.club.name} (${home.club.acronym})`, exact: true }).click()
    const refused = page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/matches"),
    )
    await dialog.getByRole("button", { name: "Jogar partida" }).click()
    const response = await refused
    expect(response.ok()).toBeFalsy()
    const { message } = (await response.json()) as { message: string }
    await expect(dialog.getByText(message, { exact: true })).toBeVisible()
  } finally {
    for (const player of home.players) await deletePlayer(request, player.id)
  }
})

test("[F3.mensagens] clique duplo na partida envia um só POST", async ({ page, request }) => {
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
    const sent = await countWrites(page, "/api/v1/matches")
    await dialog.getByRole("button", { name: "Jogar partida" }).dblclick()
    await expect(page).toHaveURL(/\/partidas\/\d+$/)
    await expectSingleWrite(page, sent)
  } finally {
    for (const player of [...home.players, ...away.players]) await deletePlayer(request, player.id)
  }
})
