/* eslint-disable sonarjs/cognitive-complexity */
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import getToolPopper from 'helpers/getToolPopper';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

import DataElements from 'constants/dataElement';
import { general } from 'constants/documentType';
import ToolsName from 'constants/toolsName';

const useTextPopupConditions = () => {
  const isDisabled = useSelector((state) => selectors.isElementDisabled(state, 'textPopup'));
  const isOpen = useSelector((state) => selectors.isElementOpen(state, 'textPopup'));

  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const isDisabledLink = useSelector((state) => selectors.isElementDisabled(state, DataElements.LINK_BUTTON));
  const { t } = useTranslation();

  const canUseRedact =
    currentDocument?.service &&
    featureStoragePolicy.isFeatureEnabledForStorage(AppFeatures.REDACTION, currentDocument.service);
  const isPdfDocument = currentDocument?.mimeType === general.PDF;

  const [
    isDisabledHighlight,
    isDisabledUnderline,
    isDisabledSquiggly,
    isDisabledStrikeout,
    isDisabledSticky,
    isDisabledRedaction,
  ] = [
    ToolsName.HIGHLIGHT,
    ToolsName.UNDERLINE,
    ToolsName.SQUIGGLY,
    ToolsName.STRIKEOUT,
    ToolsName.STICKY,
    ToolsName.REDACTION,
  ].map(
    (tool) => currentDocument && !!getToolPopper({ currentDocument, currentUser, toolName: tool, translator: t }).title
  );

  return {
    isDisabledHighlight,
    isDisabledUnderline,
    isDisabledSquiggly,
    isDisabledStrikeout,
    isDisabledSticky,
    isDisabledRedaction,
    isDisabledLink,
    isPreviewOriginalVersionMode,
    isPageEditMode,
    isDisabled,
    isOpen,
    canUseRedact,
    isPdfDocument,
  };
};

export default useTextPopupConditions;
