function lastName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts[parts.length - 1] ?? name
}

export { lastName }
