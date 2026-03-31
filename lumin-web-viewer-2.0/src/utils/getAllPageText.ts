import { range } from 'lodash';
import pLimit from 'p-limit';

import { getPageText } from 'core/getPageText';

import core from 'core';

const CONCURRENT_PAGE_LIMIT = 100;
const limitPromise = pLimit(CONCURRENT_PAGE_LIMIT);

export const getAllPageText = async (): Promise<string[]> => {
  const totalPages = core.getTotalPages();
  const pagesArray = range(1, totalPages + 1);

  return Promise.all(pagesArray.map((pageNumber) => limitPromise(async () => getPageText(pageNumber))))
    .then((response: string[]) => response)
    .catch((error: unknown) => {
      throw error;
    });
};
