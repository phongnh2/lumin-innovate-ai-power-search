import { findIndex } from 'lodash';

import { CHECKBOX_TYPE } from 'constants/lumin-common';

import getIndex from '../../useSelectDocuments/helpers/getIndex';
import { HandleSelectedItems, IItem } from '../useSelectItems';

export default class ArrowUpHandler {
  private tempSelected: IItem[];

  private lastSelectedDocId: string;

  private handleSelectedItems: ({
    currentItem,
    lastSelectedDocId,
    checkboxType,
  }: HandleSelectedItems) => void;

  private itemList: IItem[];

  constructor({
    tempSelected, lastSelectedDocId, handleSelectedItems, itemList,
  }: {
    tempSelected: IItem[];
    lastSelectedDocId: string;
    handleSelectedItems: ({
      currentItem,
      lastSelectedDocId,
      checkboxType,
    }: HandleSelectedItems) => void;
    itemList: IItem[];
  }) {
    this.tempSelected = tempSelected;
    this.lastSelectedDocId = lastSelectedDocId;
    this.handleSelectedItems = handleSelectedItems;
    this.itemList = itemList;
  }

  _isMultiSelect() {
    return Boolean(this.tempSelected.length);
  }

  getInitialIndex() {
    return findIndex(this.itemList, {
      _id: this.lastSelectedDocId,
    });
  }

  _getNextDocumentIndex() {
    return findIndex(this.itemList, { _id: this.tempSelected[0]._id }) - 1;
  }

  _selectMore() {
    const nextDocument = this._isMultiSelect()
      ? this.itemList[this._getNextDocumentIndex()]
      : this.itemList[this.getInitialIndex() - 1];
    if (!nextDocument) {
      return;
    }
    this.handleSelectedItems({
      currentItem: nextDocument,
      lastSelectedDocId: this.lastSelectedDocId,
      checkboxType: CHECKBOX_TYPE.SELECT,
    });
  }

  _deselect() {
    const nextDocument =
      this.tempSelected.length >= 2
        ? this.tempSelected[this.tempSelected.length - 2]
        : this.itemList[this.getInitialIndex()];
    if (!nextDocument) {
      return;
    }
    this.handleSelectedItems({
      currentItem: nextDocument,
      lastSelectedDocId: this.lastSelectedDocId,
      checkboxType: CHECKBOX_TYPE.DESELECT,
    });
  }

  exec() {
    if (
      !this._isMultiSelect() ||
      (this._isMultiSelect() &&
        this.getInitialIndex() >
          getIndex(this.itemList, this.tempSelected[0]))
    ) {
      this._selectMore();
    } else {
      this._deselect();
    }
  }
}
