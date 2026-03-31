/* eslint-disable class-methods-use-this */
import { IHandlerParams, OutlinePageManipulation } from './OutlinePageManipulation';
import { OutlineStoreUtils } from '../utils/outlineStore.utils';

export class OutlinePageMerged extends OutlinePageManipulation {
  protected handler({ node, manipulationPages, mergedPagesCount }: IHandlerParams): boolean {
    const { pageNumber } = node.model;
    if (!Number.isFinite(pageNumber)) {
      return;
    }
    if (pageNumber < manipulationPages[0]) {
      return;
    }

    node.model.pageNumber = OutlineStoreUtils.sanitizePageNumber(pageNumber + mergedPagesCount);
  }
}
