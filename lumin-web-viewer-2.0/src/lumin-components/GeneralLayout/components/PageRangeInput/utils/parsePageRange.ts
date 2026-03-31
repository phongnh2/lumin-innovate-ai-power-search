import lodashRange from 'lodash/range';

/**
 * Parse page range string into array of page numbers
 * Examples:
 * - "1-3, 5, 7" -> [1, 2, 3, 5, 7]
 * - "1, 3-5" -> [1, 3, 4, 5]
 * - "2" -> [2]
 */
export const parsePageRange = (pageRangeValue: string): number[] => {
  if (!pageRangeValue?.trim()) {
    return [];
  }

  const pages: number[] = [];
  const rangeValues = pageRangeValue.split(',');

  // eslint-disable-next-line no-restricted-syntax
  for (const rangeValue of rangeValues) {
    const trimmedValue = rangeValue.trim();
    if (!trimmedValue) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const arrRangeValue = trimmedValue.split('-').map((v) => v.trim());

    if (arrRangeValue.length === 1) {
      const pageNum = parseInt(arrRangeValue[0], 10);
      if (!Number.isNaN(pageNum) && pageNum > 0) {
        pages.push(pageNum);
      }
    } else if (arrRangeValue.length === 2) {
      const startPage = parseInt(arrRangeValue[0], 10);
      const endPage = parseInt(arrRangeValue[1], 10);

      if (!Number.isNaN(startPage) && !Number.isNaN(endPage) && startPage > 0 && endPage > 0 && startPage <= endPage) {
        pages.push(...lodashRange(startPage, endPage + 1));
      }
    }
  }

  const uniquePages = Array.from(new Set(pages));
  return uniquePages.sort((a, b) => a - b);
};
