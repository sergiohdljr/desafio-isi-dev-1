export function foldAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Mn}/gu, '');
}
