import type { ReactNode } from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex h-9 items-center rounded-lg bg-muted p-[3px]", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[30px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-body-sm-medium text-muted-foreground outline-none hover:text-foreground focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 data-active:bg-background data-active:text-foreground data-active:shadow-sm",
        className,
      )}
      {...props}
    />
  )
}

function TabsLineList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-line-list"
      className={cn("flex items-center gap-4 border-b border-border", className)}
      {...props}
    />
  )
}

function TabsLineTrigger({
  className,
  icon,
  count,
  children,
  ...props
}: TabsPrimitive.Tab.Props & {
  icon?: ReactNode
  count?: string
}) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-line-trigger"
      className={cn(
        "group inline-flex h-11 items-center gap-2 border-b-2 border-transparent px-0.5 text-body-sm-medium text-muted-foreground outline-none hover:text-foreground focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 data-active:border-primary data-active:text-foreground",
        className,
      )}
      {...props}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
      {count != null ? (
        <span className="inline-flex h-[18px] items-center rounded-full bg-muted px-1.5 text-caption-xs-medium text-muted-foreground group-data-active:bg-primary-soft group-data-active:text-primary-soft-foreground">
          {count}
        </span>
      ) : null}
    </TabsPrimitive.Tab>
  )
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel data-slot="tabs-panel" className={cn("text-body-sm outline-none", className)} {...props} />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsLineList, TabsLineTrigger, TabsPanel }
