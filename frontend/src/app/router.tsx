import { useState } from "react"
import { HomePage } from "@/features/home/pages/home-page"
import { PlayersPage } from "@/features/players/pages/players-page"

type Screen = "home" | "players"

function AppRouter() {
  const [screen, setScreen] = useState<Screen>("home")

  if (screen === "home") {
    return <HomePage onStart={() => setScreen("players")} />
  }

  return <PlayersPage onHome={() => setScreen("home")} />
}

export { AppRouter }
