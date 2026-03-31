import { Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import selectors from 'selectors';

import { useDocumentViewerLoaded } from 'hooks/useDocumentViewerLoaded';

import { useContentCheckerContext } from 'features/ContentChecker/hooks/useContentCheckerContext';
import { readAloudSelectors } from 'features/ReadAloud/slices';

import { useCheckFormFieldsInDocument } from './useCheckFormFieldsInDocument';
import { useFormFieldDetectionBannerStore } from './useFormFieldDetectionBannerStore';
import { useIsValidDocumentForFormFieldDetection } from './useIsValidDocumentForFormFieldDetection';
import { formFieldDetectionSelectors } from '../slice';

type UseShouldShowFormFieldDetectionBannerPayload = {
  shouldShowFormFieldDetectionBanner: boolean;
  shouldReopenViewerBanner: boolean;
  hasCloseViewerBanner: boolean;
  setHasCloseViewerBanner: Dispatch<SetStateAction<boolean>>;
  setHasCloseFormFieldDetectionBanner: Dispatch<SetStateAction<boolean>>;
};

export const useShouldShowFormFieldDetectionBanner = (): UseShouldShowFormFieldDetectionBannerPayload => {
  const { loaded } = useDocumentViewerLoaded();
  const hasCloseViewerBanner = useFormFieldDetectionBannerStore((state) => state.hasCloseViewerBanner);
  const setHasCloseViewerBanner = useFormFieldDetectionBannerStore((state) => state.setHasCloseViewerBanner);
  const hasCloseFormFieldDetectionBanner = useFormFieldDetectionBannerStore(
    (state) => state.hasCloseFormFieldDetectionBanner
  );
  const setHasCloseFormFieldDetectionBanner = useFormFieldDetectionBannerStore(
    (state) => state.setHasCloseFormFieldDetectionBanner
  );

  const isInFillAndSignTab = useSelector(selectors.toolbarValue) === LEFT_SIDE_BAR_VALUES.FILL_AND_SIGN.value;
  const isInFormFieldMode = useSelector(selectors.toolPropertiesValue) === TOOL_PROPERTIES_VALUE.FORM_BUILD;
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const hasEnteredFormFieldDetection = useSelector(formFieldDetectionSelectors.hasEnteredFormFieldDetection);
  const { isValidDocumentForFormFieldDetection } = useIsValidDocumentForFormFieldDetection();
  const { isContainFormFieldIndicator } = useContentCheckerContext();
  const { hasFormFieldsInDocument } = useCheckFormFieldsInDocument();

  const shouldShowFormFieldDetectionBanner =
    loaded &&
    isValidDocumentForFormFieldDetection &&
    isContainFormFieldIndicator &&
    isInFormFieldMode &&
    !isPreviewOriginalVersionMode &&
    !hasCloseFormFieldDetectionBanner &&
    !hasFormFieldsInDocument &&
    !isInReadAloudMode &&
    !hasEnteredFormFieldDetection;
  const shouldReopenViewerBanner = !isInFillAndSignTab && !hasCloseViewerBanner && hasCloseFormFieldDetectionBanner;

  return {
    shouldShowFormFieldDetectionBanner,
    shouldReopenViewerBanner,
    hasCloseViewerBanner,
    setHasCloseViewerBanner,
    setHasCloseFormFieldDetectionBanner,
  };
};
