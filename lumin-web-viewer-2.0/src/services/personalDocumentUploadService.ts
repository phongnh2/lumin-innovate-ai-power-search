/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import axios from '@libs/axios';

import selectors from 'selectors';
import { store } from 'store';

import documentServices from 'services/documentServices';
import organizationServices from 'services/organizationServices';

import { eventTracking } from 'utils';

import { UploadDocFormField } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

import {
  UploadOptions,
  WithUser,
  UploadParams,
  AxiosReturnPayload,
  ImportParams,
} from './types/personalDocumentUploadService.type';

class PersonalDocumentUploadService {
  private _options: UploadOptions;

  constructor(options?: UploadOptions) {
    this._options = options;
  }

  private async axiosUploadDocument(params: Omit<WithUser<UploadParams>, 'orgId'>): Promise<IDocumentBase> {
    const { userId, documentId, folderId, encodedUploadData, fileName } = params;
    const postParams = {
      [UploadDocFormField.CLIENT_ID]: userId,
      [UploadDocFormField.UPLOAD_DATA]: encodedUploadData,
      [UploadDocFormField.FILE_NAME]: fileName,
    };

    if (folderId) {
      postParams[UploadDocFormField.FOLDER_ID] = folderId;
    }
    if (documentId) {
      postParams[UploadDocFormField.DOCUMENT_ID] = documentId;
    }

    const response: AxiosReturnPayload = await axios.axiosInstance.post(
      '/document/v2/upload',
      postParams,
      this._options
    );
    return response.data;
  }

  private graphUploadDocument(params: WithUser<UploadParams>): Promise<IDocumentBase> {
    return organizationServices.uploadDocumentToPersonal(params, this._options);
  }
  // graph: upload/import

  private importPersonalDocument(params: Omit<WithUser<ImportParams>, 'orgId'>): Promise<IDocumentBase[]> {
    return documentServices.importThirdPartyDocuments({
      userId: params.userId,
      documents: params.documents,
      folderId: params.folderId,
    });
  }

  private importPersonalDocumentInOrg(params: WithUser<ImportParams>): Promise<IDocumentBase[]> {
    return organizationServices.uploadThirdPartyDocuments({
      orgId: params.orgId,
      documents: params.documents,
      folderId: params.folderId,
    });
  }

  private getCurrentUserId(): string {
    const state = store.getState();
    const currentUser = selectors.getCurrentUser(state);
    return currentUser._id;
  }

  private combineParams(params: UploadParams | ImportParams): WithUser<UploadParams | ImportParams> {
    return {
      ...params,
      userId: this.getCurrentUserId(),
    };
  }

  async upload(params: UploadParams): Promise<IDocumentBase> {
    const { orgId } = params;
    const payload = this.combineParams(params) as WithUser<UploadParams>;
    if (orgId) {
      return this.graphUploadDocument(payload);
    }
    return this.axiosUploadDocument(payload);
  }

  async import(params: ImportParams): Promise<IDocumentBase[]> {
    const { orgId, documents } = params;
    const payload = this.combineParams(params) as WithUser<ImportParams>;
    const res = orgId ? await this.importPersonalDocumentInOrg(payload) : await this.importPersonalDocument(payload);
    res.forEach((document) => {
      const importedDocument = documents.find((item) => item.remoteId === document.remoteId);
      eventTracking(UserEventConstants.EventType.IMPORT_DOCUMENT, {
        fileName: importedDocument.name,
        source: importedDocument.service,
      }).catch(() => {});
    });
    return res;
  }
}

export default PersonalDocumentUploadService;
