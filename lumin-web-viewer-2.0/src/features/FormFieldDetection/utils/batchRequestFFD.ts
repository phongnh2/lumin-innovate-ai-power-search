const MAX_PAGE_TO_APPLY_FFD = 15;

const splitPagesForFFD = (totalPages: number): number[][] => {
  const batches: number[][] = [];

  if (totalPages <= MAX_PAGE_TO_APPLY_FFD) {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return [pages];
  }

  for (let i = 1; i <= totalPages; i += MAX_PAGE_TO_APPLY_FFD) {
    const batch: number[] = [];
    const endPage = Math.min(i + MAX_PAGE_TO_APPLY_FFD - 1, totalPages);

    for (let j = i; j <= endPage; j++) {
      batch.push(j);
    }
    batches.push(batch);
  }

  return batches;
};

export { splitPagesForFFD };
