export const PAGE_RANGE_OPTIONS = {
  ALL_PAGES: 'ALL_PAGES',
  CURRENT_PAGE: 'CURRENT_PAGE',
  SPECIFIC_PAGES: 'SPECIFIC_PAGES',
} as const;

export const PAGE_RANGES = [
  {
    title: 'common.allPages',
    value: PAGE_RANGE_OPTIONS.ALL_PAGES,
  },
  {
    title: 'common.currentPage',
    value: PAGE_RANGE_OPTIONS.CURRENT_PAGE,
  },
  {
    title: 'common.specificPage',
    value: PAGE_RANGE_OPTIONS.SPECIFIC_PAGES,
  },
];
