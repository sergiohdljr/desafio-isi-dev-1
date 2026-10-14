export function formatBrasilia(instant: Date): string {
  const wall = new Date(instant.getTime() - 3 * 60 * 60 * 1000);
  const [date, time] = wall.toISOString().split('T');
  return `${date}T${time.slice(0, 8)}-03:00`;
}
