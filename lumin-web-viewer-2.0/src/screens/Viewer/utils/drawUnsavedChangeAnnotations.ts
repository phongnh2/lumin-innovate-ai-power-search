import core from 'core';

import indexedDBService from 'services/indexedDBService';

import importFieldValue from 'features/DocumentFormBuild/importFieldValue';

import { IUser } from 'interfaces/user/user.interface';

type DrawUnsavedChangeAnnotationsParams = {
  currentUser: IUser;
  documentId: string;
};

export const drawUnsavedChangeAnnotations = async ({
  currentUser,
  documentId,
}: DrawUnsavedChangeAnnotationsParams): Promise<{
  xfdf: string;
  formField: { name: string; value: string }[];
  isDeleted: boolean;
}> => {
  const { xfdf, formField, isDeleted } = (await indexedDBService.getTempEditModeFileChanged(String(documentId))) || {};
  const annotManager = core.getAnnotationManager();
  if (xfdf) {
    annotManager.promoteUserToAdmin();
    await annotManager.importAnnotations(xfdf);
  }
  if (currentUser) {
    annotManager.setCurrentUser(currentUser.email);
  }
  if (formField?.length) {
    await Promise.all(formField.map((field) => importFieldValue(field.name, field.value)));
  }

  return {
    xfdf,
    formField,
    isDeleted,
  };
};
