import { expect, test } from "@playwright/test"
import { createClubRecord, deletePlayer, seedMatchReadyClub, type MatchDetail, type StandingRow } from "./clubs.helpers"

test("[F13] joga partida pela tela com placar e 6 duelos; recusa escalação incompleta", async ({ page, request }) => {
  const home = await seedMatchReadyClub(request)
  const away = await seedMatchReadyClub(request, [home.club.id])
  const incomplete = await createClubRecord(request, [home.club.id, away.club.id])
  try {
    expect(new Set([home.club.id, away.club.id, incomplete.id]).size).toBe(3)

    await page.goto("/partidas")
    await expect(page.getByRole("heading", { name: "Partidas", exact: true })).toBeVisible()
    await page.getByRole("button", { name: "Nova partida" }).first().click()

    const dialog = page.getByRole("dialog", { name: "Nova partida" })
    await dialog.getByRole("combobox", { name: "Mandante" }).click()
    await page.getByRole("option", { name: `${incomplete.name} (${incomplete.acronym})`, exact: true }).click()
    await dialog.getByRole("combobox", { name: "Visitante" }).click()
    await page.getByRole("option", { name: `${away.club.name} (${away.club.acronym})`, exact: true }).click()
    const refused = page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/matches"),
    )
    await dialog.getByRole("button", { name: "Jogar partida" }).click()
    const refusedResponse = await refused
    expect(refusedResponse.ok()).toBeFalsy()
    await expect(dialog.getByText(/escala/i).first()).toBeVisible()
    await dialog.getByRole("button", { name: "Cancelar" }).click()

    await page.getByRole("button", { name: "Nova partida" }).first().click()
    const playDialog = page.getByRole("dialog", { name: "Nova partida" })
    await playDialog.getByRole("combobox", { name: "Mandante" }).click()
    await page.getByRole("option", { name: `${home.club.name} (${home.club.acronym})`, exact: true }).click()
    await playDialog.getByRole("combobox", { name: "Visitante" }).click()
    await page.getByRole("option", { name: `${away.club.name} (${away.club.acronym})`, exact: true }).click()

    const matchResponse = page.waitForResponse(
      (response) => response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/matches"),
    )
    await playDialog.getByRole("button", { name: "Jogar partida" }).click()
    const response = await matchResponse
    expect(response.ok()).toBeTruthy()
    const match = (await response.json()) as MatchDetail
    expect(match.duels).toHaveLength(6)

    await expect(page).toHaveURL(new RegExp(`/partidas/${match.id}$`))
    await expect(
      page.getByRole("paragraph").filter({ hasText: new RegExp(`^${match.home.goals} × ${match.away.goals}$`) }),
    ).toBeVisible()
    await expect(page.getByText(match.home.club_name).first()).toBeVisible()
    await expect(page.getByText(match.away.club_name).first()).toBeVisible()
    await expect(page.getByRole("heading", { name: "Duelos" })).toBeVisible()
    await expect(page.locator("tbody tr").filter({ hasText: /º/ })).toHaveCount(6)
  } finally {
    for (const player of [...home.players, ...away.players]) await deletePlayer(request, player.id)
  }
})

test("[F14] histórico de partidas com filtro e classificação na ordem do GET", async ({ page, request }) => {
  const home = await seedMatchReadyClub(request)
  const away = await seedMatchReadyClub(request, [home.club.id])
  try {
    expect(home.club.id).not.toBe(away.club.id)
    const played = await request.post("/api/v1/matches", {
      data: { home_club_id: home.club.id, away_club_id: away.club.id },
    })
    expect(played.ok(), await played.text()).toBeTruthy()
    const match = (await played.json()) as MatchDetail

    const listPending = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname.endsWith("/matches") &&
        !/\/matches\/\d+/.test(new URL(response.url()).pathname),
    )
    await page.goto("/partidas")
    const listResponse = await listPending
    expect(listResponse.ok()).toBeTruthy()
    const listed = (await listResponse.json()) as Array<{
      id: number
      home: { club_name: string; goals: number }
      away: { club_name: string; goals: number }
      played_at: string
    }>
    expect(listed.map((item) => item.id)).toContain(match.id)

    const history = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Histórico de partidas" }) })
    await expect(history.getByRole("columnheader", { name: "Data e hora" })).toBeVisible()
    await expect(history.getByRole("columnheader", { name: "Mandante" })).toBeVisible()
    await expect(history.getByRole("columnheader", { name: "Placar" })).toBeVisible()
    await expect(history.getByRole("columnheader", { name: "Visitante" })).toBeVisible()

    const matchRow = history.getByRole("row").filter({ hasText: home.club.name }).filter({ hasText: away.club.name })
    await expect(matchRow).toContainText(`${match.home.goals} × ${match.away.goals}`)

    const filtered = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname.endsWith("/matches") &&
        response.url().includes(`club_id=${home.club.id}`),
    )
    await page.getByRole("combobox", { name: "Filtrar por clube" }).click()
    await page.getByRole("option", { name: home.club.name, exact: true }).click()
    await filtered
    await expect(matchRow).toBeVisible()

    await matchRow.getByRole("button", { name: "Ver duelos" }).click()
    await expect(page).toHaveURL(new RegExp(`/partidas/${match.id}$`))
    await expect(page.getByRole("heading", { name: "Duelos" })).toBeVisible()
    await expect(page.locator("tbody tr").filter({ hasText: /º/ })).toHaveCount(6)

    const standingsPending = page.waitForResponse(
      (response) => response.request().method() === "GET" && new URL(response.url()).pathname.endsWith("/standings"),
    )
    await page.goto("/classificacao")
    const standingsResponse = await standingsPending
    expect(standingsResponse.ok()).toBeTruthy()
    const standings = (await standingsResponse.json()) as StandingRow[]

    await expect(page.getByRole("heading", { name: "Classificação" })).toBeVisible()
    for (const heading of ["#", "Clube", "J", "V", "E", "D", "GP", "GC", "SG", "Pts"]) {
      await expect(page.getByRole("columnheader", { name: heading, exact: true })).toBeVisible()
    }

    const rows = page.locator("main table tbody tr")
    await expect(rows).toHaveCount(standings.length)
    for (const [index, row] of standings.entries()) {
      const tableRow = rows.nth(index)
      await expect(tableRow).toContainText(row.club_name)
      await expect(tableRow).toContainText(String(row.played))
      await expect(tableRow).toContainText(String(row.wins))
      await expect(tableRow).toContainText(String(row.draws))
      await expect(tableRow).toContainText(String(row.losses))
      await expect(tableRow).toContainText(String(row.goals_for))
      await expect(tableRow).toContainText(String(row.goals_against))
      await expect(tableRow).toContainText(String(row.goal_difference))
      await expect(tableRow).toContainText(String(row.points))
    }
  } finally {
    for (const player of [...home.players, ...away.players]) await deletePlayer(request, player.id)
  }
})
