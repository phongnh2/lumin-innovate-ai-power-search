import { findIndex } from 'lodash';

import { CHECKBOX_TYPE } from 'constants/lumin-common';
import getIndex from './getIndex';

export default class ArrowUpHandler {
  constructor({
    tempSelected,
    lastSelectedDocId,
    handleSelectDocuments,
    documentList,
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

  _getNextDocumentIndex() {
    return findIndex(this.documentList, { _id: this.tempSelected[0]._id }) - 1;
  }

  _selectMore() {
    const nextDocument = this._isMultiSelect()
      ? this.documentList[this._getNextDocumentIndex()]
      : this.documentList[this.getInitialIndex() - 1];
    if (!nextDocument) {
      return;
    }
    this.handleSelectDocuments({
      currentDocument: nextDocument,
      lastSelectedDocId: this.lastSelectedDocId,
      checkboxType: CHECKBOX_TYPE.SELECT,
    });
  }

  _deselect() {
    const nextDocument =
      this.tempSelected.length >= 2
        ? this.tempSelected[this.tempSelected.length - 2]
        : this.documentList[this.getInitialIndex()];
    if (!nextDocument) {
      return;
    }
    this.handleSelectDocuments({
      currentDocument: nextDocument,
      lastSelectedDocId: this.lastSelectedDocId,
      checkboxType: CHECKBOX_TYPE.DESELECT,
    });
  }

  exec() {
    if (
      !this._isMultiSelect() ||
      (this._isMultiSelect() &&
        this.getInitialIndex() >
          getIndex(this.documentList, this.tempSelected[0]))
    ) {
      this._selectMore();
    } else {
      this._deselect();
    }
  }
}
