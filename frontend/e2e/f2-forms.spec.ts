import { expect, test, type Page } from "@playwright/test"
import {
  createClubRecord,
  createPlayer,
  deletePlayer,
  openClubSection,
  seedSquad,
  uniqueToken,
} from "./clubs.helpers"
import { openPlayers, playerRow } from "./players.helpers"

async function expectNoRequest(page: Page, method: string, pathSuffix: string, action: () => Promise<void>) {
  let hit = false
  const onRequest = (request: { method: () => string; url: () => string }) => {
    if (request.method() !== method) return
    if (new URL(request.url()).pathname.endsWith(pathSuffix)) hit = true
  }
  page.on("request", onRequest)
  try {
    await action()
    await page.waitForTimeout(300)
    expect(hit, `não deveria haver ${method} …${pathSuffix}`).toBe(false)
  } finally {
    page.off("request", onRequest)
  }
}

test("[F2.formularios] cadastro valida idade e nome antes do POST", async ({ page }) => {
  await openPlayers(page)
  await page.getByRole("button", { name: "Novo jogador" }).first().click()
  const dialog = page.getByRole("dialog", { name: "Novo jogador" })

  await dialog.getByPlaceholder("Davi Melo").fill("Ab")
  await dialog.getByRole("radio", { name: /ATA|Atacante/ }).click()
  await dialog.getByRole("textbox", { name: /^Idade/ }).fill("15")
  await dialog.getByRole("textbox", { name: /^Agilidade/ }).fill("70")
  for (const label of ["Velocidade", "Finalização", "Passe", "Drible", "Defesa", "Físico"]) {
    await dialog.getByLabel(label, { exact: true }).fill("60")
  }
  await dialog.getByLabel("Potencial").fill("80")

  await expectNoRequest(page, "POST", "/players", async () => {
    await dialog.getByRole("button", { name: "Salvar jogador" }).click()
  })
  await expect(dialog.getByText("De 16 a 45 anos.")).toBeVisible()
  await expect(dialog.getByText(/duas palavras|sem números|3 a 100/i).first()).toBeVisible()
  await expect(dialog.getByText("Corrija os campos destacados para salvar.")).toBeVisible()
})

test("[F2.formularios] edição valida idade antes do PUT", async ({ page, request }) => {
  const name = `${uniqueToken()} Edicao`
  const player = await createPlayer(request, name, "ATA", { age: 24 })
  try {
    await openPlayers(page)
    await page.getByLabel("Buscar jogador pelo nome").fill(name)
    await expect(page.getByText(`Busca: ${name}`, { exact: true })).toBeVisible()
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Editar" }).click()
    const edit = page.getByRole("dialog", { name: "Editar jogador" })
    await edit.getByRole("textbox", { name: /^Idade/ }).fill("20")

    await expectNoRequest(page, "PUT", `/players/${player.id}`, async () => {
      await edit.getByRole("button", { name: "Salvar alterações" }).click()
    })
    await expect(edit.getByText(/sem diminuir/i)).toBeVisible()
    await expect(edit.getByText("Corrija os campos destacados para salvar.")).toBeVisible()
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F2.formularios] condição impede Doente para Apto na tela", async ({ page, request }) => {
  const name = `${uniqueToken()} Doente`
  const player = await createPlayer(request, name, "ATA")
  try {
    const patched = await request.patch(`/api/v1/players/${player.id}/condition`, {
      data: { condition: "DOENTE" },
    })
    expect(patched.ok(), await patched.text()).toBeTruthy()

    await openPlayers(page)
    await page.getByLabel("Buscar jogador pelo nome").fill(name)
    await expect(page.getByText(`Busca: ${name}`, { exact: true })).toBeVisible()
    await playerRow(page, name).getByLabel(`Ações de ${name}`).click()
    await page.getByRole("menuitem", { name: "Alterar condição" }).click()
    const dialog = page.getByRole("dialog", { name: "Alterar condição física" })
    await expect(dialog.getByText("De Doente não passa direto para Apto.")).toBeVisible()
    await expect(dialog.getByRole("radio", { name: /Apto/ })).toBeDisabled()
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F2.formularios] criação de clube valida nome antes do POST", async ({ page }) => {
  await page.goto("/clubes")
  await page.locator("main").getByRole("button", { name: "Novo clube" }).first().click()
  const dialog = page.getByRole("dialog", { name: "Novo clube" })
  await dialog.getByRole("textbox", { name: /^Nome/ }).fill("X")
  await dialog.getByRole("textbox", { name: /^Sigla/ }).fill("XXX")

  await expectNoRequest(page, "POST", "/clubs", async () => {
    await dialog.getByRole("button", { name: "Criar clube" }).click()
  })
  await expect(dialog.getByText(/Nome inválido|3 a 60|2 a 5 palavras/i).first()).toBeVisible()
})

test("[F2.formularios] compra exige clube e fidelidade antes do POST", async ({ page, request }) => {
  const player = await createPlayer(request, `${uniqueToken()} Compra`, "ATA")
  try {
    await openPlayers(page)
    await page.getByLabel("Buscar jogador pelo nome").fill(player.name)
    await expect(page.getByText(`Busca: ${player.name}`, { exact: true })).toBeVisible()
    await playerRow(page, player.name).getByRole("button", { name: "Comprar" }).click()
    const dialog = page.getByRole("dialog", { name: "Comprar jogador" })

    await expectNoRequest(page, "POST", `/players/${player.id}/buy`, async () => {
      await dialog.getByRole("button", { name: "Confirmar compra" }).click()
    })
    await expect(dialog.getByText("Escolha o clube, a data e a hora da fidelidade.")).toBeVisible()
  } finally {
    await deletePlayer(request, player.id)
  }
})

test("[F2.formularios] escalação incompleta não envia PUT", async ({ page, request }) => {
  const club = await createClubRecord(request)
  const players = await seedSquad(request, club.id)
  try {
    await openClubSection(page, club.id, "Escalação")
    await expect(page.getByRole("button", { name: "Salvar escalação" })).toBeDisabled()

    await expectNoRequest(page, "PUT", `/clubs/${club.id}/lineup`, async () => {
      await page.getByRole("button", { name: "Salvar escalação" }).click({ force: true })
    })
    await expect(page.getByText(`Escalação incompleta: o ${club.name} não pode jogar partidas`)).toBeVisible()
  } finally {
    for (const player of players) await deletePlayer(request, player.id)
  }
})

test("[F2.formularios] nova partida exige dois clubes diferentes antes do POST", async ({ page, request }) => {
  const club = await createClubRecord(request)
  try {
    await page.goto("/partidas")
    await page.getByRole("button", { name: "Nova partida" }).first().click()
    const dialog = page.getByRole("dialog", { name: "Nova partida" })
    await dialog.getByRole("combobox", { name: "Mandante" }).click()
    await page.getByRole("option", { name: `${club.name} (${club.acronym})`, exact: true }).click()
    await dialog.getByRole("combobox", { name: "Visitante" }).click()
    await page.getByRole("option", { name: `${club.name} (${club.acronym})`, exact: true }).click()

    await expectNoRequest(page, "POST", "/matches", async () => {
      await dialog.getByRole("button", { name: "Jogar partida" }).click()
    })
    await expect(dialog.getByText("Escolha dois clubes diferentes.")).toBeVisible()
  } finally {
    // clube sem jogadores — nada a limpar além do limite da liga
  }
})
