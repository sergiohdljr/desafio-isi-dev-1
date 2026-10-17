import type { ReactNode } from "react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const RETRY_HINT = "Tente de novo."

function LoadingRows({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-start gap-2.5 p-4" role="status">
      <span className="h-3 w-full animate-pulse rounded-md bg-muted" />
      <span className="h-3 w-60 max-w-full animate-pulse rounded-md bg-muted" />
      <span className="h-3 w-44 max-w-full animate-pulse rounded-md bg-muted" />
      <p className="text-caption-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ResourceCard({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">{children}</section>
}

function ResourceLoading({ label = "Carregando…" }: { label?: string }) {
  return (
    <ResourceCard>
      <LoadingRows label={label} />
    </ResourceCard>
  )
}

function ResourceEmpty({
  title,
  description,
  action,
  framed = true,
}: {
  title: string
  description: string
  action?: ReactNode
  framed?: boolean
}) {
  const body = (
    <div className="flex flex-col items-start gap-1.5 p-4 text-left">
      <p className="text-body-sm-medium">{title}</p>
      <p className="text-caption-xs text-muted-foreground">{description}</p>
      {action}
    </div>
  )
  if (!framed) return body
  return <ResourceCard>{body}</ResourceCard>
}

function ResourceError({
  title,
  onRetry,
  description = RETRY_HINT,
  framed = true,
}: {
  title: string
  onRetry: () => void
  description?: string
  framed?: boolean
}) {
  const body = (
    <div className="flex flex-col items-start gap-2.5 p-4">
      <Alert variant="destructive" title={title} description={description} />
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  )
  if (!framed) return body
  return <ResourceCard>{body}</ResourceCard>
}

export { LoadingRows, ResourceEmpty, ResourceError, ResourceLoading }
