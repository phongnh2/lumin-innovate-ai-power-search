import { general, images, office } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';

export const AppFeatures = {
  MERGE_FILE: 'MergeFile',
  EDIT_PDF: 'EditPdf',
  REDACTION: 'Redaction',
  SAVE_TO_GG_DRIVE: 'SaveToGoogleDrive',
  THUMBNAIL_ACTIONS: 'ThumbnailActions',
  SIGNED_URL_IMAGE: 'SignedUrlImage',
  REMOVE_PASSWORD: 'RemovePassword',
  SET_PASSWORD: 'SetPassword',
} as const;

export type AppFeaturesType = typeof AppFeatures[keyof typeof AppFeatures];

export type StorageType = typeof STORAGE_TYPE[keyof typeof STORAGE_TYPE];

export type ExternalStorages = typeof STORAGE_TYPE.DROPBOX | typeof STORAGE_TYPE.GOOGLE | typeof STORAGE_TYPE.ONEDRIVE;

type FeaturePolicies = {
  [key in AppFeaturesType]: {
    supportedStorageTypes?: StorageType[];
    supportedMimeTypes?: string[];
  };
};

class FeatureStoragePolicy {
  private isEnabled = true;

  private featurePolicies: FeaturePolicies = {
    [AppFeatures.REMOVE_PASSWORD]: {
      supportedMimeTypes: [general.PDF],
      supportedStorageTypes: [
        STORAGE_TYPE.S3,
        STORAGE_TYPE.GOOGLE,
        STORAGE_TYPE.DROPBOX,
        STORAGE_TYPE.ONEDRIVE,
        STORAGE_TYPE.SYSTEM,
        STORAGE_TYPE.LOCAL,
        STORAGE_TYPE.CACHING,
      ],
    },
    [AppFeatures.SET_PASSWORD]: {
      supportedMimeTypes: [general.PDF],
      supportedStorageTypes: [
        STORAGE_TYPE.S3,
        STORAGE_TYPE.GOOGLE,
        STORAGE_TYPE.DROPBOX,
        STORAGE_TYPE.ONEDRIVE,
        STORAGE_TYPE.SYSTEM,
        STORAGE_TYPE.LOCAL,
        STORAGE_TYPE.CACHING,
      ],
    },
    [AppFeatures.MERGE_FILE]: {
      supportedStorageTypes: [
        STORAGE_TYPE.S3,
        STORAGE_TYPE.GOOGLE,
        STORAGE_TYPE.CACHING,
        STORAGE_TYPE.LOCAL,
        STORAGE_TYPE.SYSTEM,
        STORAGE_TYPE.DROPBOX,
        STORAGE_TYPE.ONEDRIVE,
      ],
      supportedMimeTypes: [
        general.PDF,
        images.PNG,
        images.JPG,
        images.JPEG,
        office.DOCX,
        office.DOC,
        office.XLSX,
        office.XLS,
        office.PPTX,
        office.PPT,
      ],
    },
    [AppFeatures.EDIT_PDF]: {
      supportedStorageTypes: [
        STORAGE_TYPE.S3,
        STORAGE_TYPE.GOOGLE,
        STORAGE_TYPE.CACHING,
        STORAGE_TYPE.LOCAL,
        STORAGE_TYPE.SYSTEM,
        STORAGE_TYPE.DROPBOX,
        STORAGE_TYPE.ONEDRIVE,
      ],
      supportedMimeTypes: [general.PDF],
    },
    [AppFeatures.REDACTION]: {
      supportedStorageTypes: [
        STORAGE_TYPE.S3,
        STORAGE_TYPE.GOOGLE,
        STORAGE_TYPE.CACHING,
        STORAGE_TYPE.LOCAL,
        STORAGE_TYPE.SYSTEM,
        STORAGE_TYPE.DROPBOX,
        STORAGE_TYPE.ONEDRIVE,
      ],
      supportedMimeTypes: [general.PDF],
    },
    [AppFeatures.SAVE_TO_GG_DRIVE]: {
      supportedStorageTypes: [STORAGE_TYPE.DROPBOX, STORAGE_TYPE.ONEDRIVE],
    },
    [AppFeatures.THUMBNAIL_ACTIONS]: {
      supportedStorageTypes: [
        STORAGE_TYPE.S3,
        STORAGE_TYPE.GOOGLE,
        STORAGE_TYPE.CACHING,
        STORAGE_TYPE.LOCAL,
        STORAGE_TYPE.SYSTEM,
      ],
    },
    [AppFeatures.SIGNED_URL_IMAGE]: {
      supportedStorageTypes: [STORAGE_TYPE.S3, STORAGE_TYPE.GOOGLE, STORAGE_TYPE.DROPBOX, STORAGE_TYPE.ONEDRIVE],
    },
  };

  externalStorages = [STORAGE_TYPE.DROPBOX, STORAGE_TYPE.GOOGLE, STORAGE_TYPE.ONEDRIVE];

  storagesSupportCache = [STORAGE_TYPE.DROPBOX, STORAGE_TYPE.GOOGLE, STORAGE_TYPE.ONEDRIVE, STORAGE_TYPE.S3];

  isFeatureEnabledForStorage = (feature: AppFeaturesType, storageType: StorageType) => {
    const featurePolicy = this.featurePolicies[feature];
    return this.isEnabled && (featurePolicy?.supportedStorageTypes ?? []).includes(storageType);
  };

  areMultiFeaturesEnabledForStorage = (features: AppFeaturesType[], storageType: StorageType) =>
    features.every((feature) => this.isFeatureEnabledForStorage(feature, storageType));

  isFeatureEnabledForMimeType = (feature: AppFeaturesType, mimeType: string) => {
    const featurePolicy = this.featurePolicies[feature];
    return this.isEnabled && featurePolicy?.supportedMimeTypes?.includes(mimeType);
  };

  areMultiFeaturesEnabledForMimeType = (features: AppFeaturesType[], mimeType: string) =>
    features.every((feature) => this.isFeatureEnabledForMimeType(feature, mimeType));

  getSupportedMimeTypes = (feature: AppFeaturesType) => this.featurePolicies[feature].supportedMimeTypes;
}

export default new FeatureStoragePolicy();
