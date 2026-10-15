function pageRange(page: number, pageSize: number, totalItems: number) {
  if (totalItems === 0) return { start: 0, end: 0 }
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  return { start, end }
}

export { pageRange }
