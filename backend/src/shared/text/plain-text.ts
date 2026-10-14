export function codePointLength(value: string): number {
  return Array.from(value).length;
}

export function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
}

export function normalizeSpaces(value: string): string {
  return value.replace(/^ +| +$/g, '').replace(/ {2,}/g, ' ');
}
