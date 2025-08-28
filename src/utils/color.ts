export type RGB = { r: number; g: number; b: number };

function expandHex(shortHex: string): string {
  const r = shortHex[1];
  const g = shortHex[2];
  const b = shortHex[3];
  return `#${r}${r}${g}${g}${b}${b}`;
}

export function parseHexColor(input: string): RGB | null {
  if (!input) return null;
  let hex = input.trim().toLowerCase();
  if (!hex.startsWith("#")) return null;
  if (hex.length === 4) hex = expandHex(hex);
  if (hex.length !== 7) return null;
  const int = Number.parseInt(hex.slice(1), 16);
  if (Number.isNaN(int)) return null;
  return { r: (int >> 16) & 0xff, g: (int >> 8) & 0xff, b: int & 0xff };
}

function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }: RGB): number {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hex1: string, hex2: string): number | null {
  const c1 = parseHexColor(hex1);
  const c2 = parseHexColor(hex2);
  if (!c1 || !c2) return null;
  const L1 = relativeLuminance(c1);
  const L2 = relativeLuminance(c2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isLowContrast(hex1: string, hex2: string, threshold = 4.5): boolean {
  const ratio = contrastRatio(hex1, hex2);
  if (ratio == null) return false;
  return ratio < threshold;
}

export function randomHexColor(): string {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, "0")}`;
}
