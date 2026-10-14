import { useEffect, useRef } from "react"
import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  Clock,
  HandCoins,
  History,
  Shield,
  ShoppingCart,
  Swords,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"
import campo from "@/assets/campo.svg"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Logo } from "@/components/ui/logo"

const CAMPO_WIDTH = 1233.5
const CAMPO_HEIGHT = 701.5

const league = {
  name: "Liga Fictícia 2026",
  leader: "Delta FC",
  points: 6,
  players: 23,
  freePlayers: 7,
  clubs: 6,
  matches: 2,
}

const steps: { step: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    step: "01",
    title: "Jogadores",
    description: "Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.",
    icon: Users,
  },
  {
    step: "02",
    title: "Clubes",
    description: "Começam com 300,00 em caixa e sem jogadores.",
    icon: Shield,
  },
  {
    step: "03",
    title: "Compra",
    description: "Valor + taxa, até 50% do caixa, com contrato de fidelidade.",
    icon: ShoppingCart,
  },
  {
    step: "04",
    title: "Venda",
    description: "Multa antes do fim da fidelidade e comissão sobre o lucro.",
    icon: HandCoins,
  },
  {
    step: "05",
    title: "Histórico",
    description: "Toda compra e venda fica registrada, com totais e CSV.",
    icon: History,
  },
  {
    step: "06",
    title: "Liga",
    description: "Escale 5 titulares e jogue partidas que entram na classificação.",
    icon: Trophy,
  },
]

const stats: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Users, value: String(league.players), label: "jogadores" },
  { icon: UserRound, value: String(league.freePlayers), label: "livres" },
  { icon: Shield, value: String(league.clubs), label: "clubes" },
  { icon: Swords, value: String(league.matches), label: "partidas" },
]

function leagueStatus() {
  if (league.matches === 0) return "nenhuma partida ainda"
  return `líder: ${league.leader}, ${league.points} pontos`
}

function HomePage({ onStart }: { onStart?: () => void }) {
  const startRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest("button, a, input, textarea, select")) {
        return
      }
      event.preventDefault()
      startRef.current?.click()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-6 py-10 text-foreground">
      <img
        src={campo}
        alt=""
        width={CAMPO_WIDTH}
        height={CAMPO_HEIGHT}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <section className="relative flex w-full max-w-180 flex-col items-center gap-5.5 rounded-3xl bg-background px-12 py-8 text-center">
        <Logo size="lg" />
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pr-3 pl-2.5">
          <span aria-hidden className="size-2 rounded-full bg-success" />
          <span className="text-caption-xs-medium">{league.name}</span>
          <span className="text-caption-xs text-muted-foreground" aria-hidden>
            ·
          </span>
          <span className="text-caption-xs text-muted-foreground">{leagueStatus()}</span>
        </p>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-12 font-semibold tracking-tight whitespace-nowrap">
            Gestão da liga, do mercado à classificação
          </h1>
          <p className="text-body-base text-muted-foreground">
            Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade. Depois,
            escale os titulares e jogue partidas com placar calculado pelos atributos.
          </p>
        </div>
        <div className="flex items-center gap-3.5">
          <Button ref={startRef} size="lg" className="w-50" onClick={onStart}>
            Iniciar
            <ArrowRight />
          </Button>
          <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
            ou tecle
            <Kbd>Enter</Kbd>
          </p>
        </div>
        <ul className="flex list-none flex-wrap items-center justify-center gap-4">
          {stats.flatMap((stat, index) => {
            const item = (
              <li key={stat.label} className="flex items-center gap-1.5">
                <stat.icon aria-hidden className="size-3.5 text-muted-foreground" />
                <span className="text-caption-xs-medium">{stat.value}</span>
                <span className="text-caption-xs text-muted-foreground">{stat.label}</span>
              </li>
            )
            if (index === 0) return [item]
            return [
              <li key={`${stat.label}-sep`} aria-hidden className="size-0.75 rounded-full bg-border" />,
              item,
            ]
          })}
          <li aria-hidden className="size-0.75 rounded-full bg-border" />
          <li className="flex items-center gap-1.5 text-caption-xs text-muted-foreground">
            <CircleCheck aria-hidden className="size-3.5" />
            Não precisa de login
          </li>
        </ul>
      </section>

      <ol aria-label="Como o sistema funciona" className="relative flex list-none items-stretch gap-2">
        {steps.map((step, index) => (
          <li key={step.step} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight aria-hidden className="size-4 text-muted-foreground" /> : null}
            <article className="flex h-40 w-43 flex-col gap-2.5 rounded-xl border border-border bg-background p-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <step.icon aria-hidden className="size-4" />
                </span>
                <span className="text-caption-xs text-muted-foreground tabular-nums">{step.step}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-body-sm-medium">{step.title}</h2>
                <p className="text-caption-xs text-muted-foreground">{step.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <footer className="relative flex items-center gap-1.5 text-caption-xs text-muted-foreground">
        <Clock aria-hidden className="size-4" />
        <p>
          {league.name} · Horário de Brasília (UTC−3)
        </p>
      </footer>
    </main>
  )
}

export { HomePage }
