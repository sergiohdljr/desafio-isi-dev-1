import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AppLayout } from "@/app/app-layout"
import { ClubPage } from "@/features/clubs/pages/club-page"
import { ClubsPage } from "@/features/clubs/pages/clubs-page"
import { MatchPage } from "@/features/league/pages/match-page"
import { MatchesPage } from "@/features/league/pages/matches-page"
import { StandingsPage } from "@/features/league/pages/standings-page"
import { HomePage } from "@/features/home/pages/home-page"
import { PlayersPage } from "@/features/players/pages/players-page"
import { paths } from "@/app/routes"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />
        <Route element={<AppLayout />}>
          <Route path={paths.players} element={<PlayersPage />} />
          <Route path={paths.clubs} element={<ClubsPage />} />
          <Route path="/club/:id" element={<ClubPage />} />
          <Route path={paths.matches} element={<MatchesPage />} />
          <Route path="/partidas/:id" element={<MatchPage />} />
          <Route path={paths.standings} element={<StandingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export { AppRouter }
