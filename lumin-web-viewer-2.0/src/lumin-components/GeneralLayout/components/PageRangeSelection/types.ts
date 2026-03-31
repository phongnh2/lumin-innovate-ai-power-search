import { PAGE_RANGE_OPTIONS } from './constants';

export type PageRangeType = keyof typeof PAGE_RANGE_OPTIONS;

export type PageRangeSelectionType = {
  listPageRanges: PageRangeType[];
  pageRangeType: PageRangeType;
  pageRangeLabel?: string;
  pageRangeValue?: string;
  pageRangeError?: string;
  setPageRange: (pageRange: PageRangeType) => void;
  onPageRangeValueChange?: (value: string, isValid: boolean) => void;
  onPageRangeBlur?: (value: string, isValid: boolean, errorMessage: string) => void;
};
