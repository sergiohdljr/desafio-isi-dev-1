function incompleteLineupMessage(names: string[]) {
  if (names.length === 1) {
    return `Escalação incompleta: o ${names[0]} não tem os 5 titulares.`
  }
  if (names.length > 1) {
    return `Escalação incompleta: o ${names[0]} e o ${names[1]} não têm os 5 titulares.`
  }
  return "Escalação incompleta."
}

export { incompleteLineupMessage }
