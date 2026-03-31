import { MANIPULATION_TYPE } from 'constants/lumin-common';

import {
  PageManipulationHandler,
  PageManipulationHandlerParams,
  PageManipulationHandlerResult,
  PageManipulationType,
} from '../types/pageTracker.type';

export class PageManipulation {
  public static readonly MANIPULATION_HANDLERS: Record<PageManipulationType, PageManipulationHandler> = {
    [MANIPULATION_TYPE.INSERT_BLANK_PAGE]: (params) => this.processInsert(params),
    [MANIPULATION_TYPE.REMOVE_PAGE]: (params) => this.processDelete(params),
    [MANIPULATION_TYPE.MOVE_PAGE]: (params) => this.processMove(params),
    [MANIPULATION_TYPE.MERGE_PAGE]: (params) => this.processMerge(params),
  } as const;

  private static isValidPage(pageNumber: number): boolean {
    return Number.isFinite(pageNumber);
  }

  private static getPageMapper(originalPages: number[]): PageManipulationHandlerResult {
    return new Map(originalPages.map((page) => [page, page]));
  }

  public static processInsert({
    originalPages,
    manipulationData: { manipulationPages },
  }: PageManipulationHandlerParams): PageManipulationHandlerResult {
    const pageNumber = manipulationPages[0];
    const pageMapper = this.getPageMapper(originalPages);
    pageMapper.forEach((mappedPage, currentPage) => {
      if (!this.isValidPage(pageNumber) || mappedPage < pageNumber) {
        return;
      }

      pageMapper.set(currentPage, mappedPage + manipulationPages.length);
    });

    return pageMapper;
  }

  public static processDelete({
    originalPages,
    manipulationData: { manipulationPages },
  }: PageManipulationHandlerParams): PageManipulationHandlerResult {
    const pageMapper = this.getPageMapper(originalPages);

    pageMapper.forEach((mappedPage, currentPage) => {
      const lowerPages = manipulationPages.filter((page) => page < mappedPage);
      const isDeletingCurrentPage = manipulationPages.includes(mappedPage);
      if (!this.isValidPage(mappedPage)) {
        return;
      }

      if (isDeletingCurrentPage) {
        pageMapper.set(currentPage, null);
        return;
      }

      if (lowerPages.length > 0) {
        pageMapper.set(currentPage, mappedPage - lowerPages.length);
      }
    });

    return pageMapper;
  }

  public static processMove({
    originalPages,
    manipulationData: { manipulationPages, movedOriginPage },
  }: PageManipulationHandlerParams): PageManipulationHandlerResult {
    const pageMapper = this.getPageMapper(originalPages);
    const [manipPage] = manipulationPages;
    if (!this.isValidPage(manipPage)) {
      return pageMapper;
    }

    pageMapper.forEach((mappedPage, currentPage) => {
      if (currentPage === movedOriginPage) {
        pageMapper.set(currentPage, manipPage);
        return;
      }
      const isMovingDown = movedOriginPage < manipPage;
      let isInModifiedRange = false;
      if (isMovingDown) {
        isInModifiedRange = mappedPage > movedOriginPage && mappedPage <= manipPage;
      } else {
        isInModifiedRange = mappedPage < movedOriginPage && mappedPage >= manipPage;
      }

      if (!isInModifiedRange) {
        return;
      }

      const delta = isMovingDown ? -1 : 1;
      pageMapper.set(currentPage, mappedPage + delta);
    });

    return pageMapper;
  }

  private static calculateMergedPage(pageNumber: number, mergedPagesCount: number): number | null {
    return Number.isFinite(pageNumber + mergedPagesCount) ? pageNumber + mergedPagesCount : null;
  }

  public static processMerge({
    originalPages,
    manipulationData: { manipulationPages, mergedPagesCount },
  }: PageManipulationHandlerParams) {
    const pageNumber = manipulationPages[0];
    const pageMapper = this.getPageMapper(originalPages);
    if (!this.isValidPage(pageNumber)) {
      return pageMapper;
    }

    const [manipPage] = manipulationPages;

    pageMapper.forEach((mappedPage, currentPage) => {
      if (!this.isValidPage(manipPage)) {
        return;
      }

      const mergedPage = this.calculateMergedPage(mappedPage, mergedPagesCount);
      if (mergedPage) {
        pageMapper.set(currentPage, mergedPage);
      }
    });

    return pageMapper;
  }
}
