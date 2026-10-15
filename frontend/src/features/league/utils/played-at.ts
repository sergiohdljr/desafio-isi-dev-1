function formatPlayedAt(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}, ${match[4]}:${match[5]}`
}

function splitPlayedAt(value: string) {
  const formatted = formatPlayedAt(value)
  const [date, time] = formatted.split(", ")
  return { date: date ?? formatted, time: time ?? "" }
}

export { formatPlayedAt, splitPlayedAt }
