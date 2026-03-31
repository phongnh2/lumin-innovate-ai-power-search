import isFinite from 'lodash/isFinite';

import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { FORCE_SYNC_ANNOTATIONS_THRESHOLD } from 'constants/urls';

import { DEFAULT_FORCE_SYNC_ANNOTATIONS_THRESHOLD } from '../constants/forceSync';

export class ForceSyncDocumentManager {
  private static instance: ForceSyncDocumentManager | null = null;

  private static forceSyncAnnotationsThreshold =
    Number(FORCE_SYNC_ANNOTATIONS_THRESHOLD) || Number(DEFAULT_FORCE_SYNC_ANNOTATIONS_THRESHOLD);

  private _modifiedAnnotationIds: Set<string> = new Set();

  private _totalUnsyncedAnnots = 0;

  get totalUnsyncedAnnots(): number {
    return this._totalUnsyncedAnnots;
  }

  set totalUnsyncedAnnots(value: number) {
    this._totalUnsyncedAnnots = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getForceSyncAnnotationsThreshold(): number {
    return ForceSyncDocumentManager.forceSyncAnnotationsThreshold;
  }

  public static getInstance(): ForceSyncDocumentManager {
    if (!ForceSyncDocumentManager.instance) {
      ForceSyncDocumentManager.instance = new ForceSyncDocumentManager();
    }
    return ForceSyncDocumentManager.instance;
  }

  public static clearInstance(): void {
    ForceSyncDocumentManager.instance = null;
  }

  public addModifiedAnnotations(annotations: Core.Annotations.Annotation[]): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const annotation of annotations) {
      this._modifiedAnnotationIds.add(annotation.Id);
    }
  }

  public async checkAutomaticallyForceSync(): Promise<boolean> {
    return (
      (await ForceSyncDocumentManager.shouldForceSyncEncryptedDocument()) ||
      (isFinite(this._totalUnsyncedAnnots) &&
        this._totalUnsyncedAnnots >= ForceSyncDocumentManager.forceSyncAnnotationsThreshold)
    );
  }

  public checkAnnotationsChangedForceSync(): boolean {
    return (
      this._modifiedAnnotationIds.size + (this._totalUnsyncedAnnots || 0) >=
      ForceSyncDocumentManager.forceSyncAnnotationsThreshold
    );
  }

  public prepareNextSync(): void {
    this._totalUnsyncedAnnots = 0;
    this._modifiedAnnotationIds.clear();
  }

  public getTotalAnnots(): number {
    return this._modifiedAnnotationIds.size + (this._totalUnsyncedAnnots || 0);
  }

  public static async shouldForceSyncEncryptedDocument(): Promise<boolean> {
    const isEncrypt = await core.isDocumentEncrypted();
    const { isUsingPresignedUrlForImage } = core.getDocument() as Core.Document & {
      isUsingPresignedUrlForImage: boolean;
    };
    const internalAnnotationIds = selectors.getInternalAnnotationIds(store.getState());
    const hasExternalSignedUrlSignature = core
      .getAnnotationsList()
      .some(
        (annotation) =>
          annotation.Subject === AnnotationSubjectMapping.signature && !internalAnnotationIds.includes(annotation.Id)
      );
    return isEncrypt && isUsingPresignedUrlForImage && hasExternalSignedUrlSignature;
  }
}
