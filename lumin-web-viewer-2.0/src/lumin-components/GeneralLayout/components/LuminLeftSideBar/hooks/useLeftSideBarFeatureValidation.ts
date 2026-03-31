import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { documentSyncSelectors } from 'features/Document/document-sync.slice';
import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';
import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';

export const useLeftSideBarFeatureValidation = () => {
  const { t } = useTranslation();
  const { isTempEditMode } = useIsTempEditMode();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isAnySyncingProcess = useSelector(documentSyncSelectors.isSyncing);

  const features = [AppFeatures.REDACTION, AppFeatures.EDIT_PDF];

  const validMimeType =
    currentDocument && featureStoragePolicy.areMultiFeaturesEnabledForMimeType(features, currentDocument.mimeType);
  const validStorageType =
    currentDocument && featureStoragePolicy.areMultiFeaturesEnabledForStorage(features, currentDocument.service);

  const isFeatureDisabled = !validMimeType || !validStorageType || isAnySyncingProcess;

  const getTooltipContent = ({
    validateMimeType,
    allowInTempEditMode,
  }: {
    validateMimeType: boolean;
    allowInTempEditMode: boolean;
  }) => {
    if (!validateMimeType || (isTempEditMode && !allowInTempEditMode)) {
      return null;
    }
    if (!validMimeType) {
      return t('viewer.leftPanelEditMode.availableForPDFDocuments');
    }
    if (!validStorageType) {
      return t('viewer.leftPanelEditMode.availableForDocumentsStoredWithinLumin');
    }
    return null;
  };

  return {
    validMimeType,
    validStorageType,
    isFeatureDisabled,
    isAnySyncingProcess,
    getTooltipContent,
  };
};
