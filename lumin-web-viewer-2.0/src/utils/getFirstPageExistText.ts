/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { range } from 'lodash';

import { getPageText } from 'core/getPageText';

import core from 'core';

export const getFirstPageExistText = async () => {
  const totalPages = core.getTotalPages();
  const pagesArray = range(1, totalPages + 1);

  for (const pageNumber of pagesArray) {
    const pageText = await getPageText(pageNumber);
    if (pageText) {
      return pageNumber;
    }
  }
};
