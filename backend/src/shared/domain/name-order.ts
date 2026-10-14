export function foldAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Mn}/gu, '');
}

export function foldName(value: string): string {
  return foldAccents(value).toLowerCase();
}

export function compareNames(left: string, right: string): number {
  const foldedLeft = foldName(left);
  const foldedRight = foldName(right);
  if (foldedLeft < foldedRight) {
    return -1;
  }
  if (foldedLeft > foldedRight) {
    return 1;
  }
  return 0;
}
