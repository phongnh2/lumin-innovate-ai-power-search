/* eslint-disable class-methods-use-this */
import { IHandlerParams, OutlinePageManipulation } from './OutlinePageManipulation';

export class OutlinePageDeleted extends OutlinePageManipulation {
  protected handler({ node, manipulationPages }: IHandlerParams): boolean {
    const lowerPages = manipulationPages.filter((page) => page < node.model.pageNumber);
    const isDeletingCurrentPage = manipulationPages.includes(node.model.pageNumber);
    const { pageNumber } = node.model;
    if (!Number.isFinite(pageNumber)) {
      return;
    }
    if (isDeletingCurrentPage) {
      node.model.pageNumber = null;
      return;
    }
    if (lowerPages.length > 0) {
      node.model.pageNumber = pageNumber - lowerPages.length;
    }
  }
}
