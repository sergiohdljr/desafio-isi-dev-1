import { createContext, useContext, useEffect, useRef, useState } from "react"
import { ChevronRight, PanelLeft, RefreshCw } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { pathForSidebar, paths } from "@/app/routes"
import { CreateClubDialog } from "@/features/clubs/components/create-club-dialog"
import { useQuery } from "@tanstack/react-query"
import { useClubs, useCreateClub } from "@/features/clubs/hooks/use-clubs"
import { listMatches } from "@/features/league/api/league.api"
import { usePlayersDirectory } from "@/features/players/hooks/use-players"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/ui/sidebar"

type Crumb = { label: string; to?: string }

type Chrome = {
  crumbs: Crumb[]
  onRefresh: () => void
}

type AppChromeContextValue = {
  setChrome: (chrome: Chrome) => void
  openCreateClub: () => void
}

const AppChromeContext = createContext<AppChromeContextValue | null>(null)

function useAppChrome({ crumbs, onRefresh }: Chrome) {
  const context = useContext(AppChromeContext)
  if (!context) throw new Error("useAppChrome deve ficar dentro do layout.")
  const { setChrome, openCreateClub } = context
  const onRefreshRef = useRef(onRefresh)
  const crumbsRef = useRef(crumbs)
  onRefreshRef.current = onRefresh
  crumbsRef.current = crumbs
  const crumbsKey = crumbs.map((crumb) => `${crumb.label}:${crumb.to ?? ""}`).join("|")

  useEffect(() => {
    setChrome({
      crumbs: crumbsRef.current,
      onRefresh: () => {
        onRefreshRef.current()
      },
    })
  }, [crumbsKey, setChrome])

  return { openCreateClub }
}

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const createClub = useCreateClub()
  const [collapsed, setCollapsed] = useState(false)
  const [creating, setCreating] = useState(false)
  const [chrome, setChrome] = useState<Chrome>({
    crumbs: [],
    onRefresh: () => undefined,
  })
  const { clubs } = useClubs("name")
  const matches = useQuery({
    queryKey: ["matches", ""],
    queryFn: () => listMatches(),
  })
  const { counts } = usePlayersDirectory({
    sort: "name",
    scope: "all",
    page: 1,
    limit: 10,
  })
  const active = location.pathname.startsWith(paths.players)
    ? "Jogadores"
    : location.pathname.startsWith(paths.matches)
      ? "Partidas"
      : location.pathname.startsWith(paths.standings)
        ? "Classificação"
        : "Clubes"
  const activeClubId = location.pathname.match(/^\/club\/(\d+)/)?.[1]
  const activeClub = clubs.find((club) => String(club.id) === activeClubId)?.name

  return (
    <AppChromeContext.Provider value={{ setChrome, openCreateClub: () => setCreating(true) }}>
      <div className="flex min-h-svh bg-sidebar text-foreground">
        <Sidebar
          active={active}
          activeClub={activeClub}
          collapsed={collapsed}
          onHome={() => navigate(paths.home)}
          onNavigate={(label) => {
            const path = pathForSidebar(label)
            if (path) void navigate(path)
          }}
          onCreateClub={() => setCreating(true)}
          counts={{
            players: counts.all,
            clubs: clubs.length,
            matches: matches.data?.length ?? 0,
          }}
          latestMatch={latestMatchLabel(matches.data)}
          clubs={clubs.map((club) => ({
            initial: club.name.charAt(0),
            name: club.name,
            href: paths.club(club.id),
          }))}
        />
        <div className="flex min-h-svh min-w-0 flex-1 flex-col py-2 pr-2">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-background shadow-sm">
            <header className="flex h-[56px] shrink-0 items-center gap-[8px] border-b border-border px-[16px]">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                onClick={() => setCollapsed((value) => !value)}
              >
                <PanelLeft className="size-4" />
              </Button>
              <span className="h-[16px] w-px shrink-0 bg-border" aria-hidden />
              <p className="flex min-w-0 flex-1 items-center gap-[8px] pl-[4px] text-body-sm text-muted-foreground">
                {chrome.crumbs.map((crumb, index) => {
                  const current = index === chrome.crumbs.length - 1
                  return (
                    <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-[8px]">
                      {index > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden /> : null}
                      {crumb.to && !current ? (
                        <button type="button" className="hover:text-foreground" onClick={() => navigate(crumb.to!)}>
                          {crumb.label}
                        </button>
                      ) : (
                        <span className={current ? "truncate text-foreground" : undefined}>{crumb.label}</span>
                      )}
                    </span>
                  )
                })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Atualizar dados"
                onClick={() => chrome.onRefresh()}
              >
                <RefreshCw className="size-4" />
              </Button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      {creating ? (
        <CreateClubDialog
          onClose={() => setCreating(false)}
          onSubmit={async (input) => {
            const created = await createClub(input)
            setCreating(false)
            void navigate(paths.club(created.id), { state: { created: true } })
          }}
        />
      ) : null}
    </AppChromeContext.Provider>
  )
}

function latestMatchLabel(
  matches: { home: { club_name: string; goals: number }; away: { club_name: string; goals: number } }[] | undefined,
) {
  const latest = matches?.[0]
  if (!latest) return "Nenhuma partida ainda"
  return `${latest.home.club_name} ${latest.home.goals} × ${latest.away.goals} ${latest.away.club_name}`
}

export { AppLayout, useAppChrome }
export type { Crumb }
