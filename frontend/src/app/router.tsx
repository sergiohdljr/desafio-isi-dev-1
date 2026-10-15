import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { HomePage } from "@/features/home/pages/home-page"
import { PlayersPage } from "@/features/players/pages/players-page"
import { paths } from "@/app/routes"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.players} element={<PlayersPage />} />
        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export { AppRouter }
