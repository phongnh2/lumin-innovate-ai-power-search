import { IDocumentInfo } from 'features/DocumentCaching/frequentlyUsedDocument';
import { FormFieldSuggestion } from 'features/FormFieldAutosuggestion/types';
import { IAutoDetectPredictionData } from 'features/FormFieldDetection/types/detectionField.type';
import { IGuestModeManipulateDocument } from 'features/GuestModeManipulateCache/guestModeManipulateIndexedDb';
import { ScaleInfo } from 'features/MeasureTool/interfaces';
import { Signature } from 'features/Signature/interfaces';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganizationData, OrganizationListData } from 'interfaces/redux/organization.redux.interface';
import { ITeam } from 'interfaces/team/team.interface';
import { IUser } from 'interfaces/user/user.interface';

type OffineInfoType = {
  user: IUser;
  organizations: OrganizationListData[];
  organization: IOrganizationData;
  team: ITeam;
  document_list: {
    lastUrl: string;
  };
};

export const INDEXED_DB_TABLES: {
  SYSTEM_DOCUMENTS: string;
  INFO: string;
  CLOUD_DOCUMENTS: string;
  DOCUMENTS_CACHING: string;
  DOCUMENT_COMMANDS: string;
  DOCUMENT_OFFLINE_TRACKING_EVENTS: string;
  DOCUMENT_TEMP_COMMANDS: string;
  WIDGET_CACHING: string;
  FREQUENTLY_USED_DOCUMENTS_CACHING: string;
  FORM_FIELD_SUGGESTIONS: string;
  TEMP_EDIT_MODE_FILE_CHANGED: string;
  AUTO_DETECT_FORM_FIELDS: string;
};

declare namespace indexedDBService {
  export function openDb(): Promise<IDBDatabase>;

  export function getFrequentlyUsedDocument(documentId: string): Promise<IDocumentInfo>;

  export function insertFrequentlyUsedDocument(document: IDocumentInfo): Promise<void>;

  export function updateFrequentlyUsedDocument(documentId: string, updatedProps: any): Promise<IDocumentInfo | null>;

  export function getAllFrequentlyUsedDocuments(): Promise<IDocumentInfo[]>;

  export function deleteFrequentlyUsedDocument(documentId: string): Promise<void>;

  export function getAllFormFieldSuggestions(): Promise<FormFieldSuggestion[]>;

  export function addFormFieldSuggestion(suggestion: string): Promise<FormFieldSuggestion>;

  export function deleteFormFieldSuggestion(suggestion: string): Promise<FormFieldSuggestion>;

  export function countFormFieldSuggestions(): Promise<number>;

  export function getFormFieldSuggestion(suggestion: string): Promise<FormFieldSuggestion>;

  export function getOfflineInfo(): Promise<OffineInfoType>;

  export function setAutoCompleteFormField(value: boolean, userId: string): Promise<void>;

  export function isEnabledAutoCompleteFormField(userId: string): Promise<boolean>;

  export function putProfileDataByKey<T>(key: string, value: T): Promise<void>;

  export function getProfileDataByKey<T>(key: string): Promise<T>;

  export function shouldManualUpdate(): Promise<boolean>;

  export function clearFormFieldSuggestions(): Promise<void>;

  export function canUseIndexedDB(): boolean;

  export function deleteAllFrequentlyUsedDocuments(): Promise<void>;

  export function getUserSignatures(): Promise<{ width: number; height: number; imgSrc: string; remoteId: string }[]>;

  export function addSignature(signature: Signature): Promise<void>;

  export function addScale(scale: ScaleInfo): Promise<void>;

  export function replaceScale(originalScale: ScaleInfo, scale: ScaleInfo): Promise<void>;

  export function deleteScale(scale: ScaleInfo): Promise<void>;

  export function getScales(): Promise<ScaleInfo[]>;

  export function updateSignatures(signatures: Signature[]): Promise<void>;

  export function insertField(documentId: string, data: { name: string; value?: string }): Promise<void>;

  export function saveTempEditModeAnnotChanged(
    documentId: string,
    {
      xfdf,
    }: {
      xfdf: string;
    }
  ): Promise<void>;

  export function saveTempEditModeFieldChanged(
    documentId: string,
    {
      formField,
    }: {
      formField: {
        name: string;
        value: string;
      }[];
    }
  ): Promise<void>;

  type FormTemplatesCache = {
    formId: string;
    xfdf?: string;
    formField?: {
      name: string;
      value: string;
    }[];
    isDeleted?: boolean;
    documentRemoteId?: string;
  };

  export function getTempEditModeFileChanged(formId: string): Promise<FormTemplatesCache>;

  export function deleteTempEditModeFileChanged(formId: string): Promise<void>;

  export function markDeleteTempEditModeFileChanged({
    id,
    documentRemoteId,
  }: {
    id: string;
    documentRemoteId: string;
  }): Promise<void>;

  export function getTempEditModeFileChangedByDocumentId(documentId: string): Promise<FormTemplatesCache>;

  export function saveTempEditModeFieldChangedByRemoteId(
    remoteId: string,
    { formField }: { formField: { name: string; value: string }[] }
  ): Promise<void>;

  export function saveTempEditModeAnnotChangedByRemoteId(remoteId: string, { xfdf }: { xfdf: string }): Promise<void>;

  export function setCloudDoclist(documents: IDocumentBase[]): Promise<void>;

  export function getAutoDetectFormFields(documentId: string, pages?: number[]): Promise<IAutoDetectPredictionData>;

  export function saveAutoDetectFormFields(
    documentId: string,
    data: IAutoDetectPredictionData['predictions']
  ): Promise<void>;

  export function deleteAutoDetectFormFields(documentIds: string[]): Promise<void>;

  export function removeFieldsFromAutoDetectFormFields({
    documentId,
    deletedFields,
  }: {
    documentId: string;
    deletedFields: {
      fieldId: string;
      pageNumber: number;
    }[];
  }): Promise<void>;

  export function updateAutoDetectFormFieldsPageNumber({
    documentId,
    manipulationId,
    pageMapper,
  }: {
    documentId: string;
    manipulationId: string;
    pageMapper: Map<number, number>;
  }): Promise<void>;

  export function updateAutoDetectFormFields(
    documentId: string,
    data: IAutoDetectPredictionData['predictions']
  ): Promise<void>;

  export function recoverDetectedPlaceholders({
    documentId,
    recoverableDetectedPlaceholders,
    shouldAddDetectedPlaceholder,
  }: {
    documentId: string;
    recoverableDetectedPlaceholders: Map<number, string[]>;
    shouldAddDetectedPlaceholder?: boolean;
  }): Promise<{ predictions: IAutoDetectPredictionData['predictions'] }>;

  export function getGuestModeManipulateDocument(remoteId: string): Promise<IGuestModeManipulateDocument>;

  export function insertGuestModeManipulateDocument(
    remoteId: string,
    lastModified: number,
    count: number
  ): Promise<void>;

  export function getAllGuestModeManipulateDocument(): Promise<IGuestModeManipulateDocument[]>;

  export function deleteGuestModeManipulateDocument(remoteId: string): Promise<void>;

  export function getGuestModeManipulateByDocumentId(documentId: string): Promise<IGuestModeManipulateDocument>;

  export function updateGuestModeManipulateDocument(
    remoteId: string,
    updates: Partial<IGuestModeManipulateDocument>
  ): Promise<void>;
}

export default indexedDBService;
