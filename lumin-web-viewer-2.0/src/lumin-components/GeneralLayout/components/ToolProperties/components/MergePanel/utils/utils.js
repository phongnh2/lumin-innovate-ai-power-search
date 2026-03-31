/// <reference path="./utils.d.ts" />

import { SELECT_VALUE } from '@new-ui/components/ToolProperties/components/MergePanel/constants';

import { file as fileUtils, validator } from 'utils';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

export const isThereAFileWithError = (filesInfo) => filesInfo.some((fileInfo) => fileInfo.error);

export const hasLoadingFile = (filesInfo) => filesInfo.some((fileInfo) => fileInfo.loading);

export const getFilesInfoSize = (filesInfo) => filesInfo.reduce((acc, { file: { size } }) => acc + size, 0);

export const getItems = (translator) => [
  {
    name: translator('viewer.leftPanelEditMode.before'),
    value: SELECT_VALUE.BEFORE,
    class: 'item-label',
  },
  {
    name: translator('viewer.leftPanelEditMode.after'),
    value: SELECT_VALUE.AFTER,
    class: 'item-label',
  },
];

export const isAllPageAvailable = (filesInfo, allPages) => {
  if (filesInfo.length > 1) {
    return true;
  }

  return allPages;
};
export const onInputPageInsertKeydown = (event) => {
  if (event.key.length > 1 || /\d/.test(event.key) || event.key === ',' || event.key === '-') {
    return;
  }
  event.preventDefault();
};

export const onInputPositionKeyDown = (event) => {
  if (event.key.length > 1 || /\d/.test(event.key)) {
    return;
  }
  event.preventDefault();
};

export const getFormControlLabelColor = (theme) =>
  ({
    [THEME_MODE.LIGHT]: Colors.NEUTRAL_80,
    [THEME_MODE.DARK]: Colors.NEUTRAL_20,
  }[theme]);

export const getPasswordErrorMessage = (fileName) =>
  `${fileUtils.getShortFilename(fileName)} is failed to upload. Password entry cancelled`;

export const getTotalMergeSize = (filesInfo, currentDocument) => currentDocument.size + getFilesInfoSize(filesInfo);

export const isMergingFileSizeNotValid = (filesInfo, currentDocument) => {
  const validFileSize = validator.getValidMergeFileSize(currentDocument);
  return getTotalMergeSize(filesInfo, currentDocument) >= validFileSize;
};
