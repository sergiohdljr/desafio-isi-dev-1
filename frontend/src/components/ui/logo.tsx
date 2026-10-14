import { cn } from "cn"
import logoLg from "@/assets/logo-lg.svg"
import logoMd from "@/assets/logo-md.svg"

const logoMarks = {
  md: { src: logoMd, size: 28 },
  lg: { src: logoLg, size: 56 },
} as const

function Logo({
  className,
  size = "md",
}: {
  className?: string
  size?: keyof typeof logoMarks
}) {
  const mark = logoMarks[size]

  return (
    <a
      href="/"
      data-slot="logo"
      aria-label="Passe, página inicial"
      className={cn(
        "inline-flex items-center rounded-md outline-none focus-visible:shadow-focus",
        size === "lg" ? "gap-5" : "gap-2.5",
        className,
      )}
    >
      <img src={mark.src} alt="" width={mark.size} height={mark.size} />
      <span className={size === "lg" ? "text-heading-page" : "text-heading-dialog"}>
        Passe
      </span>
    </a>
  )
}

export { Logo }
