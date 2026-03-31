import { range } from 'lodash';

import core from 'core';

import logger from 'helpers/logger';

import { hasFormFieldIndicator } from './detectionValidator';

const verifyFirstPageWithKeyword = ({
  pagesArray,
  doc,
}: {
  pagesArray: number[];
  doc: Core.Document;
}): Promise<boolean> =>
  Promise.any<boolean>(
    pagesArray.map(
      (pageNumber) =>
        new Promise((resolve, reject) => {
          doc
            .loadPageText(pageNumber)
            .then((content) => {
              const isContainFormFieldIndicator = hasFormFieldIndicator(content);
              if (isContainFormFieldIndicator) {
                resolve(isContainFormFieldIndicator);
                return;
              }

              reject(isContainFormFieldIndicator);
            })
            .catch(reject);
        })
    )
  );

const verifyKeyword = async ({ pagesArray, doc }: { pagesArray: number[]; doc: Core.Document }): Promise<boolean> => {
  const keywordCheckerList = await Promise.all<Promise<boolean>[]>(
    pagesArray.map(
      (pageNumber) =>
        new Promise((resolve, reject) => {
          doc
            .loadPageText(pageNumber)
            .then((content) => {
              resolve(hasFormFieldIndicator(content));
            })
            .catch(reject);
        })
    )
  );

  return keywordCheckerList.some((value) => value);
};

const verifyContentInDocument = async (pagesArray: number[]): Promise<boolean> => {
  const doc = core.getDocument();
  if ('any' in Promise) {
    return verifyFirstPageWithKeyword({ pagesArray, doc });
  }

  return verifyKeyword({ pagesArray, doc });
};

export const checkFormFieldIndicator = async (): Promise<boolean> => {
  try {
    const totalPages = core.getTotalPages();
    const pagesArray = range(1, totalPages + 1);
    return await verifyContentInDocument(pagesArray);
  } catch (error) {
    if (!(error instanceof AggregateError) || error.errors.some((err) => typeof err !== 'boolean')) {
      logger.logError({ error: error as Error, reason: 'Failed to get text content' });
    }

    return false;
  }
};
