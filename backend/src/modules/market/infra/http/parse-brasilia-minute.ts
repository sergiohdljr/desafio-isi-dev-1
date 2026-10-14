const BRASILIA_MINUTE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

export function parseBrasiliaMinute(value: string): Date | null {
  const match = BRASILIA_MINUTE.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59) {
    return null;
  }

  const instant = new Date(Date.UTC(year, month - 1, day, hour + 3, minute, 0));
  const wall = new Date(instant.getTime() - 3 * 60 * 60 * 1000).toISOString();
  const expected = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00.000Z`;
  return wall === expected ? instant : null;
}
