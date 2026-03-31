export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function calculateInitialUsage(ranking: number): number {
  if (ranking < 2) {
    return generateRandomNumber(1, 10);
  }
  if (ranking < 99) {
    const rankingFixed = Number(ranking.toFixed(0));
    return generateRandomNumber((rankingFixed - 1) * 10, rankingFixed * 10);
  }
  return generateRandomNumber(991, 1000);
}
