export const handleSplitArray = (arr: number[], n: number) => {
  const totalLength = arr.length;
  const result = [];
  if (n === 1) {
    return [arr];
  }
  const baseSubArrayLength = Math.floor(totalLength / n);
  const extraElementsCount = totalLength % n;
  let currentIndex = 0;
  for (let i = 0; i < n; i++) {
    let currentSubArrayLength = baseSubArrayLength;
    if (i < extraElementsCount) {
      currentSubArrayLength++;
    }
    const subArray = arr.slice(currentIndex, currentIndex + currentSubArrayLength);
    result.push(subArray);
    currentIndex += currentSubArrayLength;
  }
  return result;
};

export const handleSplitEqualType = (pageRange: number[][]): { pageRange: number[][]; numberFiles: number } => {
  const numberFiles = pageRange.length;
  const flatPageRange = pageRange.flat();
  const result = handleSplitArray(flatPageRange, numberFiles);
  return {
    pageRange: result,
    numberFiles,
  };
};

export const handleMessageSplit = (pageRange: number[][]) =>
  pageRange.map((range, idx) => {
    if (range.length === 1) {
      return `* File ${idx + 1}: Pages ${range[0]}\n\n`;
    }
    return `* File ${idx + 1}: Pages ${range[0]}-${range[range.length - 1]}\n\n`;
  });
