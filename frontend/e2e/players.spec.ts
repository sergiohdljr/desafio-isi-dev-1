import { expect, test } from "@playwright/test"
import { fillAndSave, openPlayers, playerRow, removeByName, searchPlayers, uniqueToken } from "./players.helpers"

test("cadastra, edita, altera a condição e exclui o jogador", async ({ page, request }) => {
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
