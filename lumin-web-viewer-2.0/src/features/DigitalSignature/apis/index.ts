import axios from '@libs/axios';

import fileUtil from 'utils/file';
import { getLinearizedDocumentFile } from 'utils/getFileService';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

export const processCreateCertifiedVersion = async (
  currentDocument: IDocumentBase,
  orgOwnCurrentDocument: IOrganization
) => {
  const file = await getLinearizedDocumentFile(currentDocument.name, {
    shouldRemoveSecurity: true,
    flattenPdf: true,
  });
  const name = fileUtil.getFilenameWithoutExtension(currentDocument.name);
  const formData = new FormData();
  formData.append('documentId', currentDocument._id);
  formData.append('name', `${name}.pdf`);
  formData.append('file', file);
  if (orgOwnCurrentDocument) {
    formData.append('workspaceId', orgOwnCurrentDocument._id);
  }
  await axios.axiosLuminSignInstance.post('/contract/proofs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
