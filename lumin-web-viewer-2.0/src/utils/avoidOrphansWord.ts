export const avoidOrphansWord = (str: string): string => {
  if (!str) {
    return '';
  }
  const convertedStr = str.split(' ');
  if (convertedStr.length < 2) {
    return str;
  }
  const last = convertedStr[convertedStr.length - 1];
  // 160: char code of &nbsp;
  const nonBreakingSpaceChar = String.fromCharCode(160);
  return [convertedStr.slice(0, -1).join(' ').trim(), `${nonBreakingSpaceChar}${last}`].join('');
};
