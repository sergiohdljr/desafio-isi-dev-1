import type { ReactNode } from "react"
import { LoaderCircle, ServerOff } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_UNAVAILABLE = "A API não respondeu. Verifique se o backend está no ar e tente de novo."

function ResourceState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </span>
      <h2 className="text-heading-card">{title}</h2>
      <p className="w-[420px] max-w-full text-body-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

function LoadingRows({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-6" role="status">
      <p className="flex items-center gap-2 text-body-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden />
        {label}
      </p>
      <span className="h-3 w-4/5 animate-pulse rounded bg-muted" />
      <span className="h-3 w-3/5 animate-pulse rounded bg-muted" />
      <span className="h-3 w-2/5 animate-pulse rounded bg-muted" />
    </div>
  )
}

function ResourceCard({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden rounded-[12px] border border-border bg-card shadow-xs">{children}</section>
}

function ResourceLoading({ label }: { label: string }) {
  return (
    <ResourceCard>
      <LoadingRows label={label} />
    </ResourceCard>
  )
}

function ResourceEmpty({
  icon,
  title,
  description,
  action,
  framed = true,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  framed?: boolean
}) {
  const body = <ResourceState icon={icon} title={title} description={description} action={action} />
  if (!framed) return body
  return <ResourceCard>{body}</ResourceCard>
}

function ResourceError({
  title,
  onRetry,
  description = API_UNAVAILABLE,
  framed = true,
}: {
  title: string
  onRetry: () => void
  description?: string
  framed?: boolean
}) {
  const body = (
    <ResourceState
      icon={<ServerOff className="size-6" aria-hidden />}
      title={title}
      description={description}
      action={
        <Button type="button" variant="outline" onClick={onRetry}>
          Tentar de novo
        </Button>
      }
    />
  )
  if (!framed) return body
  return <ResourceCard>{body}</ResourceCard>
}

export { LoadingRows, ResourceEmpty, ResourceError, ResourceLoading, ResourceState }
