import { CircleCheck } from "lucide-react"

function SuccessMark() {
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
      <CircleCheck className="size-5" aria-hidden />
    </div>
  )
}

export { SuccessMark }
