/* eslint-disable class-methods-use-this */
import React from 'react';
import {
  FolderUtils,
} from 'utils';
import { DOCUMENT_TYPE } from 'constants/documentConstants';

class BaseUtility {
  getInfoOf() {
    return {};
  }

  getBreadcrumb() {
    return [];
  }

  formatStrongText(text) {
    return <b>{text}</b>;
  }

  getSuccessMessage(documentType, content) {
    if (documentType === DOCUMENT_TYPE.FOLDER) {
      return <>{this.formatStrongText(FolderUtils.shorten(content))} folder</>;
    }
    return this.formatStrongText('Personal Documents');
  }
}

export default BaseUtility;
