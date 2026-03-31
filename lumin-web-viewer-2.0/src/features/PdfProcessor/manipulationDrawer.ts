/* eslint-disable @typescript-eslint/unbound-method */
import sequentialRequestBuilder from 'helpers/sequentialRequestBuilder';

import { MANIPULATION_TYPE } from 'constants/lumin-common';

import {
  ManipulationOption,
  DeletePageOption,
  CropPageOption,
  MovePageOption,
  RotatePageOption,
  InsertBlankPageOption,
} from './manipulation.interface';

type TManipulationType = Omit<typeof MANIPULATION_TYPE, 'MERGE_PAGE' | 'SPLIT_PAGE'>;

const ROTATION_360 = 4;

class ManipulationDrawer {
  private _doc: Core.PDFNet.PDFDoc;

  constructor(doc: Core.PDFNet.PDFDoc) {
    this._doc = doc;
  }

  private async rotatePage(option: RotatePageOption) {
    const { rotatePages, angle } = option;
    const pageNumber = rotatePages[0];
    const page = await this._doc.getPage(pageNumber);
    const originalRotation = await page.getRotation();
    await page.setRotation((angle + originalRotation + ROTATION_360) % ROTATION_360);
  }

  private async removePage(pageNumber: number) {
    const pageIterator = await this._doc.getPageIterator(pageNumber);
    await this._doc.pageRemove(pageIterator);
  }

  private async removePages(option: DeletePageOption) {
    const pageNumbers = [...option.pagesRemove].reverse();
    // eslint-disable-next-line no-restricted-syntax
    for (const pageNumber of pageNumbers) {
      // eslint-disable-next-line no-await-in-loop
      await this.removePage(pageNumber);
    }
  }

  private async movePage(option: MovePageOption) {
    const pagesToMove = +option.pagesToMove;
    const insertBeforePage = +option.insertBeforePage;

    const [currentPageIterator, incomingPageIterator] = await Promise.all([
      this._doc.getPageIterator(pagesToMove),
      this._doc.getPageIterator(insertBeforePage),
    ]);

    const page = await currentPageIterator.current();
    await Promise.all([this._doc.pageRemove(currentPageIterator), this._doc.pageInsert(incomingPageIterator, page)]);
  }

  private async insertBlankPage(pageNumber: number) {
    const [newPage, currentPosIterator] = await Promise.all([
      this._doc.pageCreate(),
      this._doc.getPageIterator(pageNumber),
    ]);
    await this._doc.pageInsert(currentPosIterator, newPage);
  }

  private async insertBlankPages(option: InsertBlankPageOption) {
    const { insertPages } = option;
    // eslint-disable-next-line no-restricted-syntax
    for (const pageNumber of insertPages) {
      // eslint-disable-next-line no-await-in-loop
      await this.insertBlankPage(pageNumber);
    }
  }

  private async cropPage(option: CropPageOption) {
    const { pageCrops, top, left, right, bottom } = option;
    const pageNumber = +pageCrops[0];
    const page = await this._doc.getPage(pageNumber);
    await page.setCropBox(new window.Core.PDFNet.Rect(top, left, bottom, right));
  }

  private getHandler(type: keyof TManipulationType): (option: ManipulationOption) => Promise<void> {
    const MANIPULATION_HANDLER_MAPPING: Record<keyof TManipulationType, (option: ManipulationOption) => Promise<void>> =
      {
        [MANIPULATION_TYPE.ROTATE_PAGE]: this.rotatePage,
        [MANIPULATION_TYPE.REMOVE_PAGE]: this.removePages,
        [MANIPULATION_TYPE.MOVE_PAGE]: this.movePage,
        [MANIPULATION_TYPE.INSERT_BLANK_PAGE]: this.insertBlankPages,
        [MANIPULATION_TYPE.CROP_PAGE]: this.cropPage,
      };
    return MANIPULATION_HANDLER_MAPPING[type];
  }

  async draw(manipulations: Array<{ type: keyof TManipulationType; option: ManipulationOption }>) {
    if (!manipulations?.length) {
      return Promise.resolve();
    }
    return sequentialRequestBuilder(
      manipulations,
      (manipulation) => this.getHandler(manipulation.type)?.call(this, manipulation.option) as Promise<void>
    );
  }
}

export default ManipulationDrawer;
