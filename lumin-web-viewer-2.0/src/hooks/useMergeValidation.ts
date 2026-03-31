import { useCallback } from 'react';

import { ERROR_MESSAGE_TYPE } from '@new-ui/components/ToolProperties/components/MergePanel/constants';

import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { validator } from 'utils';

import { TOOLS_NAME } from 'constants/toolsName';

export const useMergeValidation = () => {
  const { t } = useTranslation();
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const validatePagePosition = useCallback(
    (pagePosition: number) => {
      const totalPages = core.getTotalPages();

      if (pagePosition > totalPages || pagePosition <= 0) {
        return {
          isValid: false,
          errorMessage: t(ERROR_MESSAGE_TYPE.INVALID_PAGE_POSITION),
        };
      }

      return { isValid: true, errorMessage: '' };
    },
    [t]
  );

  const validateFeatureAccess = useCallback(
    (currentMergeSize: number) =>
      validator.validateFeature({
        currentUser,
        currentDocument,
        toolName: TOOLS_NAME.MERGE_PAGE,
        currentMergeSize,
      }),
    [currentUser, currentDocument]
  );

  return {
    validatePagePosition,
    validateFeatureAccess,
  };
};
