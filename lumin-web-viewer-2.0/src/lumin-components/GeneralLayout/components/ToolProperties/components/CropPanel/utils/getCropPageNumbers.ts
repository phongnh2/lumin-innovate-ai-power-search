import lodashRange from 'lodash/range';

import { parsePageRange } from '@new-ui/components/PageRangeInput/utils/parsePageRange';
import { PAGE_RANGE_OPTIONS } from '@new-ui/components/PageRangeSelection/constants';
import { PageRangeType } from '@new-ui/components/PageRangeSelection/types';

/**
 * Get the page numbers to crop based on crop mode and page range value
 */
export const getCropPageNumbers = (cropMode: PageRangeType, pageRangeValue: string, totalPages: number): number[] => {
  switch (cropMode) {
    case PAGE_RANGE_OPTIONS.ALL_PAGES:
      return lodashRange(1, totalPages + 1);
    case PAGE_RANGE_OPTIONS.CURRENT_PAGE:
    case PAGE_RANGE_OPTIONS.SPECIFIC_PAGES:
      return parsePageRange(pageRangeValue).filter((page) => page >= 1 && page <= totalPages);

    default:
      return [];
  }
};
