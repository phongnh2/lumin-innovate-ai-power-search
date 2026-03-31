/* eslint-disable class-methods-use-this */
import { IHandlerParams, OutlinePageManipulation } from './OutlinePageManipulation';

export class OutlinePageInserted extends OutlinePageManipulation {
  protected handler({ node, manipulationPages }: IHandlerParams): boolean {
    manipulationPages.forEach((manipulationPage) => {
      const { pageNumber } = node.model;
      if (!Number.isFinite(pageNumber) || pageNumber < manipulationPage) {
        return;
      }
      node.model.pageNumber = pageNumber + 1;
    });
    return true;
  }
}
