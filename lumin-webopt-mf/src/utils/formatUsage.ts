export const USAGE_OFFSET = 1000;

export function formatUsageCount(n: number): string {
  const count = Number(n) || 0;
  if (count >= 1_000_000) {
    const m = count / 1_000_000;
    const s = m % 1 === 0 ? String(m) : m.toFixed(1).replace(/\.0$/, '');
    return `${s}M uses`;
  }
  if (count >= 1000) {
    const k = count / 1000;
    const s = k % 1 === 0 ? String(k) : k.toFixed(1).replace(/\.0$/, '');
    return `${s}K uses`;
  }
  return `${count.toLocaleString()} uses`;
}
