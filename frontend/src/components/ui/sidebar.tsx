import type { ReactNode } from "react"
import { Clock, ListOrdered, Plus, Shield, Swords, Trophy, Users } from "lucide-react"
import { cn } from "cn"
import logoSidebar from "@/assets/logo-sidebar.svg"
import { Button } from "@/components/ui/button"

function SidebarItem({
  className,
  icon,
  label,
  count,
  active = false,
  collapsed = false,
  onSelect,
}: {
  className?: string
  icon: ReactNode
  label: string
  count?: string
  active?: boolean
  collapsed?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      data-slot="sidebar-item"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={onSelect}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left outline-none hover:bg-sidebar-accent focus-visible:shadow-focus",
        active
          ? "border border-sidebar-border bg-background text-body-sm-medium text-sidebar-foreground shadow-xs"
          : "text-body-sm text-sidebar-foreground",
        collapsed && "justify-center px-0",
        className,
      )}
    >
      <span className={cn(active ? "text-primary" : "text-muted-foreground")} aria-hidden>
        {icon}
      </span>
      {collapsed ? null : <span className="min-w-0 flex-1 truncate">{label}</span>}
      {!collapsed && count != null ? (
        <span className="text-caption-xs-medium text-muted-foreground">{count}</span>
      ) : null}
    </button>
  )
}

function SidebarClub({
  className,
  initial,
  name,
  active = false,
  collapsed = false,
}: {
  className?: string
  initial: string
  name: string
  active?: boolean
  collapsed?: boolean
}) {
  return (
    <a
      href={`#${name}`}
      data-slot="sidebar-club"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? name : undefined}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md px-2 outline-none hover:bg-sidebar-accent focus-visible:shadow-focus",
        active
          ? "border border-sidebar-border bg-background text-body-sm-medium shadow-xs"
          : "text-body-sm",
        collapsed && "justify-center px-0",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-caption-xs-medium",
          active
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-muted text-foreground",
        )}
      >
        {initial}
      </span>
      {collapsed ? null : (
        <span className="min-w-0 flex-1 truncate text-sidebar-foreground">{name}</span>
      )}
    </a>
  )
}

const clubs = [
  { initial: "A", name: "Águias FC" },
  { initial: "D", name: "Delta FC" },
  { initial: "E", name: "Épsilon EC" },
  { initial: "G", name: "Gama SC" },
  { initial: "M", name: "Mangue FC" },
  { initial: "T", name: "Tubarões EC" },
] as const

function SidebarGroup({
  label,
  action,
  children,
  collapsed = false,
}: {
  label: string
  action?: ReactNode
  children: ReactNode
  collapsed?: boolean
}) {
  return (
    <div className="flex w-full flex-col gap-0.5 p-2">
      <div className="flex h-8 items-center justify-between px-2">
        {collapsed ? null : (
          <p className="text-caption-xs-medium text-muted-foreground">{label}</p>
        )}
        {action}
      </div>
      {children}
    </div>
  )
}

function Sidebar({
  className,
  active = "Partidas",
  collapsed = false,
  onNavigate,
  onHome,
  counts,
  clubs: clubItems = [...clubs],
}: {
  className?: string
  active?: string
  collapsed?: boolean
  onNavigate?: (label: string) => void
  onHome?: () => void
  counts?: { players?: number; clubs?: number; matches?: number }
  clubs?: { initial: string; name: string }[]
}) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "flex h-svh shrink-0 flex-col bg-sidebar",
        collapsed ? "w-12" : "w-64",
        className,
      )}
    >
      <button
        type="button"
        onClick={onHome}
        className="flex items-center gap-2.5 rounded-md px-4 py-3 text-left outline-none focus-visible:shadow-focus"
      >
        <img src={logoSidebar} alt="" width={32} height={32} />
        {collapsed ? null : (
          <span className="min-w-0">
            <span className="block text-body-sm-semibold text-sidebar-foreground">Passe</span>
            <span className="block text-caption-xs text-muted-foreground">Gestão da liga</span>
          </span>
        )}
      </button>

      <SidebarGroup label="Mercado" collapsed={collapsed}>
        <SidebarItem
          icon={<Users className="size-4" />}
          label="Jogadores"
          count={String(counts?.players ?? 23)}
          active={active === "Jogadores"}
          collapsed={collapsed}
          onSelect={() => onNavigate?.("Jogadores")}
        />
        <SidebarItem
          icon={<Shield className="size-4" />}
          label="Clubes"
          count={String(counts?.clubs ?? 6)}
          active={active === "Clubes"}
          collapsed={collapsed}
          onSelect={() => onNavigate?.("Clubes")}
        />
      </SidebarGroup>

      <SidebarGroup label="Liga" collapsed={collapsed}>
        <SidebarItem
          icon={<Swords className="size-4" />}
          label="Partidas"
          count={String(counts?.matches ?? 2)}
          active={active === "Partidas"}
          collapsed={collapsed}
          onSelect={() => onNavigate?.("Partidas")}
        />
        <SidebarItem
          icon={<ListOrdered className="size-4" />}
          label="Classificação"
          active={active === "Classificação"}
          collapsed={collapsed}
          onSelect={() => onNavigate?.("Classificação")}
        />
      </SidebarGroup>

      <SidebarGroup
        label="Clubes"
        collapsed={collapsed}
        action={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Novo clube"
            className="size-8"
          >
            <Plus />
          </Button>
        }
      >
        {clubItems.map((club) => (
          <SidebarClub
            key={club.name}
            initial={club.initial}
            name={club.name}
            active={active === club.name}
            collapsed={collapsed}
          />
        ))}
      </SidebarGroup>

      <div className="min-h-0 flex-1" />

      {collapsed ? null : (
        <div className="p-2">
          <div className="flex flex-col gap-2.5 rounded-xl border border-sidebar-border bg-background p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted" aria-hidden>
                <Trophy className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-body-sm-medium text-foreground">Liga Fictícia 2026</p>
                <p className="text-caption-xs text-muted-foreground">
                  {counts?.clubs ?? 6} clubes · {counts?.players ?? 23} jogadores
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted" aria-hidden>
                <Swords className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-body-sm-medium text-foreground">Última partida</p>
                <p className="text-caption-xs text-muted-foreground">Delta FC 2 × 1 Águias FC</p>
              </div>
            </div>
            <div className="h-px bg-sidebar-border" />
            <p className="flex items-center gap-1.5 text-caption-xs text-muted-foreground">
              <Clock className="size-4" aria-hidden />
              Horário de Brasília (UTC−3)
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

export { Sidebar, SidebarItem, SidebarClub }
