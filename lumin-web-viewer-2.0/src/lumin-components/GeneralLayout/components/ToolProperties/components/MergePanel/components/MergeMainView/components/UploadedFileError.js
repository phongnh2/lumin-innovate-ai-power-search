/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';

import {
  getTotalMergeSize,
  isMergingFileSizeNotValid,
} from '@new-ui/components/ToolProperties/components/MergePanel/utils/utils';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { MAX_SIZE_MERGE_DOCUMENT } from 'constants/documentConstants';

import { ERROR_MESSAGE_TYPE, MEGABYTES_TO_BYTES } from '../../../constants';
import { MergeMainViewContext } from '../MergeMainView';
import * as Styled from '../MergeMainView.styled';

const UploadedFileError = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { filesInfo, errorUploadFile } = useContext(MergeMainViewContext);
  const { t } = useTranslation();
  const totalFileSize = getTotalMergeSize(filesInfo, currentDocument);
  const isFileSizeNotValid = !!currentDocument && isMergingFileSizeNotValid(filesInfo, currentDocument);
  const overMaxUploadFileSize = totalFileSize >= MAX_SIZE_MERGE_DOCUMENT.PAID * MEGABYTES_TO_BYTES;

  if (isFileSizeNotValid && overMaxUploadFileSize) {
    return <Styled.Error>{t(ERROR_MESSAGE_TYPE.PDF_SIZE, { maxSize: MAX_SIZE_MERGE_DOCUMENT.PAID })}</Styled.Error>;
  }

  if (errorUploadFile) {
    return <Styled.Error>{errorUploadFile}</Styled.Error>;
  }

  return null;
};

export default UploadedFileError;
