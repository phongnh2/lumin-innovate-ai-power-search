import { AnyAction } from 'redux';
import { v4 } from 'uuid';

import actions from 'actions';
import { store } from 'store';

import { DocumentService } from 'constants/document.enum';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import UploadUtils from './uploadUtils';

interface UploadingModalHandler {
  createUploadingFile: (params: UploadingFileParams) => UploadingFile;
  updateUploadingFiles: (
    uploadingFiles: UploadingFile[],
    updateCallback: (file: UploadingFile, index: number) => Partial<UploadingFile>
  ) => void;
  createUploadingFilesFromDocs: (
    docs: IDocumentBase[],
    storageType: DocumentService,
    folderType: string,
    entityId: string,
    folderId?: string
  ) => UploadingFile[];
  showCompleted: (uploadingFiles: UploadingFile[], createdDocuments: IDocumentBase[]) => void;
  showError: (errorMessage: string, uploadingFiles: UploadingFile[]) => void;
}

interface UploadingFile {
  name: string;
  service: DocumentService;
  groupId: string;
  fileData: {
    file: {
      name: string;
      size: number;
    };
    uploadFrom: DocumentService;
  };
  status: string;
  folderType: string;
  entityId: string;
  folderId?: string;
  documentId?: string;
  document?: IDocumentBase;
  errorMessage?: string;
}

interface UploadingFileParams {
  name: string;
  size: number;
  service: DocumentService;
  folderType: string;
  entityId: string;
  folderId?: string;
}

const createUploadingModalHandler = (): UploadingModalHandler => {
  const handler: UploadingModalHandler = {
    createUploadingFile: ({
      name,
      size,
      service,
      folderType,
      entityId,
      folderId,
    }: UploadingFileParams): UploadingFile => ({
      name,
      service,
      groupId: v4(),
      fileData: {
        file: { name, size },
        uploadFrom: service,
      },
      status: UploadUtils.UploadStatus.UPLOADING,
      folderId,
      folderType,
      entityId,
    }),

    updateUploadingFiles: (
      uploadingFiles: UploadingFile[],
      updateCallback: (file: UploadingFile, index: number) => Partial<UploadingFile>
    ) => {
      const { dispatch } = store;
      dispatch(actions.addUploadingFiles(uploadingFiles) as AnyAction);
      uploadingFiles.forEach((file, index) => {
        dispatch(actions.updateUploadingFile(updateCallback(file, index)) as AnyAction);
      });
    },

    createUploadingFilesFromDocs: (
      docs: IDocumentBase[],
      storageType: DocumentService,
      folderType: string,
      entityId: string,
      folderId?: string
    ): UploadingFile[] =>
      docs.map((doc) =>
        handler.createUploadingFile({
          name: doc.name,
          size: doc.size,
          service: storageType,
          folderType,
          entityId,
          folderId,
        })
      ),

    showCompleted: (uploadingFiles: UploadingFile[], createdDocuments: IDocumentBase[]) => {
      handler.updateUploadingFiles(uploadingFiles, (file, index) => ({
        groupId: file.groupId,
        status: UploadUtils.UploadStatus.COMPLETED,
        documentId: createdDocuments[index]._id,
        document: createdDocuments[index],
      }));
    },

    showError: (errorMessage: string, uploadingFiles: UploadingFile[]) => {
      handler.updateUploadingFiles(uploadingFiles, (file) => ({
        groupId: file.groupId,
        status: UploadUtils.UploadStatus.ERROR,
        errorMessage,
      }));
    },
  };

  return handler;
};

export const handleDisplayModal = (
  createdDocuments: IDocumentBase[],
  storageType: DocumentService,
  folderType: string,
  currentOrganization: IOrganization | undefined,
  folderId: string
) => {
  const uploadingHandler = createUploadingModalHandler();
  const uploadingFiles = uploadingHandler.createUploadingFilesFromDocs(
    createdDocuments,
    storageType,
    folderType,
    currentOrganization?._id,
    folderId
  );
  uploadingHandler.showCompleted(uploadingFiles, createdDocuments);
};
