export function formatNumber(number: number) {
  const units = ["", "K", "M", "B", "T"];
  const magnitude = Math.floor(Math.log10(number) / 3);
  if (magnitude >= units.length || magnitude < 1) {
    return number.toLocaleString();
  }

  const rounded = number / Math.pow(10, magnitude * 3);
  const suffix = units[magnitude];

  return `${rounded.toFixed(1)}${suffix}`;
}

export function formatNaN(
  checkingValue: string | number,
  defaultFallback = 0,
): number {
  const isNan = Number.isNaN(checkingValue);
  return isNan ? defaultFallback : Number(checkingValue);
}
