import React, { useCallback } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { file as fileUtils } from 'utils';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

export const withPagetoolFeatureCheck = (Component) => (props) => {
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const { t } = useTranslation();

  const getDisabledMessage = useCallback(() => {
    let msg = '';

    const { service, mimeType } = currentDocument;

    if (
      featureStoragePolicy.isFeatureEnabledForStorage(AppFeatures.MERGE_FILE, service) &&
      !fileUtils.isOffice(mimeType)
    ) {
      return null;
    }

    if (!featureStoragePolicy.isFeatureEnabledForStorage(AppFeatures.MERGE_FILE, service)) {
      msg = t('viewer.leftPanelEditMode.availableForDocumentsStoredWithinLumin');
    }

    if (fileUtils.isOffice(mimeType) && featureStoragePolicy.externalStorages.includes(service)) {
      msg = t('viewer.leftPanelEditMode.availableForPDFDocuments');
    }

    return msg;
  }, [currentDocument, t]);

  return <Component {...props} disabledMessage={getDisabledMessage()} />;
};

export default withPagetoolFeatureCheck;
