/* eslint-disable class-methods-use-this */
import { IHandlerParams, OutlinePageManipulation } from './OutlinePageManipulation';

export class OutlinePageMoved extends OutlinePageManipulation {
  protected handler({ node, manipulationPages, movedOriginPage }: IHandlerParams): boolean {
    const { pageNumber } = node.model;
    if (!Number.isFinite(pageNumber)) {
      return;
    }
    const [page] = manipulationPages;

    if (pageNumber === movedOriginPage) {
      node.model.pageNumber = page;
      return;
    }

    const isMovingDown = movedOriginPage < page;
    let isInModifiedRange = false;
    if (isMovingDown) {
      isInModifiedRange = pageNumber > movedOriginPage && pageNumber <= page;
    } else {
      isInModifiedRange = pageNumber < movedOriginPage && pageNumber >= page;
    }

    if (!isInModifiedRange) {
      return;
    }

    const delta = isMovingDown ? -1 : 1;
    node.model.pageNumber = pageNumber + delta;
  }
}
