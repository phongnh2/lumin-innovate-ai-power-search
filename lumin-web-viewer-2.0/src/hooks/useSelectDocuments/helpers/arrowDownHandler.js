import { findIndex } from 'lodash';

import { CHECKBOX_TYPE } from 'constants/lumin-common';
import getIndex from './getIndex';

export default class ArrowDownHandler {
  constructor({
    tempSelected, lastSelectedDocId, handleSelectDocuments, documentList,
  }) {
    this.tempSelected = tempSelected;
    this.lastSelectedDocId = lastSelectedDocId;
    this.handleSelectDocuments = handleSelectDocuments;
    this.documentList = documentList;
  }

  _isMultiSelect() {
    return Boolean(this.tempSelected.length);
  }

  getInitialIndex() {
    return findIndex(this.documentList, {
      _id: this.lastSelectedDocId,
    });
  }

  _deselect() {
    const nextDocument =
    this.tempSelected.length >= 2 ? this.tempSelected[1] : this.documentList[this.getInitialIndex()];
    if (!nextDocument) {
      return;
    }
    this.handleSelectDocuments({
      currentDocument: nextDocument,
      lastSelectedDocId: this.lastSelectedDocId,
      checkboxType: CHECKBOX_TYPE.DESELECT,
    });
  }

  _getNextDocumentIndex() {
    return getIndex(this.documentList, this.tempSelected[this.tempSelected.length - 1]) + 1;
  }

  _selectMore() {
    const nextDocument = this._isMultiSelect()
      ? this.documentList[this._getNextDocumentIndex()]
      : this.documentList[this.getInitialIndex() + 1];
    if (!nextDocument) {
      return;
    }
    this.handleSelectDocuments({
      currentDocument: nextDocument,
      lastSelectedDocId: this.lastSelectedDocId,
      checkboxType: CHECKBOX_TYPE.SELECT,
    });
  }

  exec() {
    if (
      !this._isMultiSelect() ||
      (this._isMultiSelect() &&
        this.getInitialIndex() <
          getIndex(this.documentList, this.tempSelected[0]))
    ) {
      this._selectMore();
    } else {
      this._deselect();
    }
  }
}
