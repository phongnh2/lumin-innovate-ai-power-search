/* eslint-disable no-await-in-loop */
import { inRange } from 'lodash';

import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { TDocumentOutline } from 'interfaces/document/document.interface';

import { TreeNode } from '../types';

const MINIMUM_PAGE_NUMBER = 1;

export class OutlineCoreUtils {
  static isValidPageNumber(pageNumber: number) {
    const totalPages = core.getTotalPages();
    const validPageEnd = totalPages + 1;
    return inRange(pageNumber, MINIMUM_PAGE_NUMBER, validPageEnd);
  }

  static goToOutline(outline: TDocumentOutline) {
    const { name, pageNumber, horizontalOffset, verticalOffset } = outline;
    if (!this.isValidPageNumber(pageNumber)) {
      return;
    }

    const { Bookmark } = window.Core;

    const outlineToGo = new Bookmark([], name, pageNumber, null, verticalOffset, horizontalOffset);
    core.goToOutline(outlineToGo);
  }

  static async createOutlineXYZ({
    name,
    pageNum,
    x,
    y,
    zoom,
    doc,
  }: {
    name: string;
    pageNum: number;
    x: number;
    y: number;
    zoom: number;
    doc: Core.PDFNet.PDFDoc;
  }) {
    const { PDFNet } = window.Core;
    const newOutline = await PDFNet.Bookmark.create(doc, name);
    if (!pageNum) {
      return newOutline;
    }

    const page = await doc.getPage(pageNum);
    if (!page) {
      return newOutline;
    }

    const dest = await PDFNet.Destination.createXYZ(page, x, y, zoom);
    await newOutline.setAction(await PDFNet.Action.createGoto(dest));
    return newOutline;
  }

  static async createOutlineFitPage({
    name,
    pageNum,
    doc,
  }: {
    name: string;
    pageNum: number;
    doc: Core.PDFNet.PDFDoc;
  }) {
    const newBookmark = await window.Core.PDFNet.Bookmark.create(doc, name);
    const page = Number.isFinite(pageNum) ? await doc.getPage(pageNum) : null;
    if (page) {
      const dest = await window.Core.PDFNet.Destination.createFit(page);
      await newBookmark.setAction(await window.Core.PDFNet.Action.createGoto(dest));
    }

    return newBookmark;
  }

  static resetDocOutlines = async ({ pdfDoc }: { pdfDoc: Core.PDFNet.PDFDoc }) => {
    const root = await pdfDoc.getRoot();
    await root.eraseFromKey('Outlines');
  };

  static convertOutline = async ({
    pdfDoc,
    outlines,
    parentOutline,
  }: {
    pdfDoc: Core.PDFNet.PDFDoc;
    outlines: TreeNode[];
    parentOutline: Core.PDFNet.Bookmark;
  }) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of outlines) {
      const { name, pageNumber } = item.model;
      const newBookmark = await this.createOutlineFitPage({
        name,
        pageNum: pageNumber,
        doc: pdfDoc,
      });

      if (parentOutline) {
        await parentOutline.addChild(newBookmark);
      } else {
        await pdfDoc.addRootBookmark(newBookmark);
      }

      if (item.children.length) {
        await this.convertOutline({ pdfDoc, outlines: item.children, parentOutline: newBookmark });
      }
    }
  };

  static importOutlinesToDoc = async ({ pdfDoc }: { pdfDoc: Core.PDFNet.PDFDoc }) => {
    await this.resetDocOutlines({ pdfDoc });
    const rootTree = selectors.getOutlines(store.getState());
    if (!rootTree.children.length) {
      return;
    }
    await this.convertOutline({ pdfDoc, outlines: rootTree.children, parentOutline: null });
  };
}
