import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { ClubPage } from "@/features/clubs/pages/club-page"
import { ClubsPage } from "@/features/clubs/pages/clubs-page"
import { HomePage } from "@/features/home/pages/home-page"
import { PlayersPage } from "@/features/players/pages/players-page"
import { paths } from "@/app/routes"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.players} element={<PlayersPage />} />
        <Route path={paths.clubs} element={<ClubsPage />} />
        <Route path="/clubes/:id" element={<ClubPage />} />
        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export { AppRouter }
