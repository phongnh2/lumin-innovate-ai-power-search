export function expandRanges(input: string): number[] | null {
  if (!input) {
    return null;
  }
  const parts = input.split(',');
  const expanded = parts.reduce((result: number[], part) => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    } else {
      const num = Number(part);
      result.push(num);
    }
    return result;
  }, []);

  return Array.from(new Set(expanded)).sort((a, b) => a - b);
}

export function checkValidPageRemovedForSingle(value: string) {
  if (/^\d+$/.test(value)) {
    // For single numbers, ensure > 0
    const num = parseInt(value, 10);
    return num > 0;
  }
  return false;
}

export function checkValidPageRemovedForRange(value: string) {
  if (/^\d+-\d+$/.test(value)) {
    // For ranges, ensure both numbers > 0 and end > start
    const [start, end] = value.split('-').map(Number);
    return start > 0 && end > 0 && end >= start;
  }
  return false;
}
