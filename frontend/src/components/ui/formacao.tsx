import type { ComponentProps } from "react"
import { cn } from "cn"
import formacao121 from "@/assets/formacao-1-2-1.svg"
import formacao211 from "@/assets/formacao-2-1-1.svg"
import formacao22 from "@/assets/formacao-2-2.svg"
import formacao31 from "@/assets/formacao-3-1.svg"

const formations = {
  "3-1": formacao31,
  "2-2": formacao22,
  "2-1-1": formacao211,
  "1-2-1": formacao121,
} as const

type Formation = keyof typeof formations

function Formacao({ formation }: { formation: Formation }) {
  return (
    <img
      data-slot="formacao"
      src={formations[formation]}
      alt=""
      width={40}
      height={52}
    />
  )
}

function FormacaoOption({
  formation,
  selected = false,
  ...props
}: ComponentProps<"button"> & {
  formation: Formation
  selected?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Formação ${formation}`}
      className={cn(
        "rounded-md p-1 outline-none hover:bg-muted focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50",
        selected && "bg-primary-soft",
      )}
      {...props}
    >
      <Formacao formation={formation} />
    </button>
  )
}

export { Formacao, FormacaoOption }
export type { Formation }
