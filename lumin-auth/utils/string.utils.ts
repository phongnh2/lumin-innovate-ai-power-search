export const avoidNonOrphansWord = (str: string): string => {
  if (!str) {
    return '';
  }
  const convertedStr = str.split(' ');
  if (convertedStr.length < 2) {
    return str;
  }
  const first = convertedStr[0];
  const last = convertedStr[convertedStr.length - 1];
  // 160: char code of &nbsp;
  const nonBreakingSpaceChar = String.fromCharCode(160);
  if (convertedStr.length === 2) {
    return [first, nonBreakingSpaceChar, last].join('');
  }
  return [`${first}${nonBreakingSpaceChar}`, convertedStr.slice(1, -1).join(' ').trim(), `${nonBreakingSpaceChar}${last}`].join('');
};
