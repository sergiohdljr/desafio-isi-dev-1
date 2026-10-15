function Hint({ children, error }: { children: string; error?: string }) {
  return (
    <span className={error ? "text-caption-xs text-destructive" : "text-caption-xs text-muted-foreground"}>
      {error ?? children}
    </span>
  )
}

export { Hint }
