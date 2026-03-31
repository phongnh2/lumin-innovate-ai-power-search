import { TFunction } from 'i18next';
import { get } from 'lodash';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';
import { StorageType } from 'features/FeatureConfigs/featureStoragePolicies';

import { IDocumentBase } from 'interfaces/document/document.interface';

export const handleStorageMerge = (currentDocument: IDocumentBase, t: TFunction): string => {
  const documentService = get(currentDocument, 'service', '') as StorageType;
  const isValidStorage = featureStoragePolicy.isFeatureEnabledForStorage(AppFeatures.MERGE_FILE, documentService);

  if (!isValidStorage) {
    return t('viewer.chatbot.restrictions.storage', { featureName: t('viewer.chatbot.feature.merge') });
  }

  return '';
};
