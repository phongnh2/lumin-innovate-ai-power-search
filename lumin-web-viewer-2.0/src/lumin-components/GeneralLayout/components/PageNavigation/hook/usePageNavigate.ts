/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { validator } from 'utils';

import { IUsePageNavigate } from '../interface';

export enum NavigateType {
  GO_FIRST = 'GO_FIRST',
  GO_PREVIOUS = 'GO_PREVIOUS',
  GO_NEXT = 'GO_NEXT',
  GO_LAST = 'GO_LAST',
};

export default function usePageNavigate(): IUsePageNavigate {
  const currentPage = useSelector<unknown, number>(selectors.getCurrentPage) || 1;
  const totalPages = useSelector<unknown, number>(selectors.getTotalPages) || 1;

  const validatePageInput = (pageNumber: number): boolean =>
    validator.validateInputPages(pageNumber) && pageNumber <= totalPages;

  const getValidPageNumber = (updatePage: string): number => {
    let validPage = currentPage;

    if (validatePageInput(Number(updatePage))) {
      validPage = parseInt(updatePage);
    }
    return validPage;
  };

  const getPageByAction = (action: NavigateType): number => {
    switch (action) {
      case NavigateType.GO_FIRST: {
        return 1;
      }
      case NavigateType.GO_PREVIOUS: {
        if (currentPage > 1) {
          return currentPage - 1;
        }
        return currentPage;
      }
      case NavigateType.GO_NEXT: {
        if (currentPage < totalPages) {
          return currentPage + 1;
        }
        return totalPages;
      }
      case NavigateType.GO_LAST: {
        return totalPages;
      }
      default:
        return currentPage;
    }
  };

  return {
    validatePageInput,
    getValidPageNumber,
    getPageByAction,
  };
}
