import produce from 'immer';
import { useCallback } from 'react';

import indexedDBService from 'services/indexedDBService';

export const useSaveFormFieldInTempEditMode = () => {
  const saveFormFieldInTempEditMode = useCallback(
    async (
      documentId: string,
      formField: {
        name: string;
        value: string;
      },
      isFromFunctionalLandingPage: boolean
    ) => {
      const { formField: currentFormFields = [] } =
        (await indexedDBService.getTempEditModeFileChanged(documentId)) || {};
      const updatedFormFields = produce(currentFormFields, (draft) => {
        const index = draft.findIndex((item) => item.name === formField.name);
        if (index !== -1) {
          draft[index].value = formField.value;
        } else {
          draft.push(formField);
        }
      });
      if (isFromFunctionalLandingPage) {
        await indexedDBService.saveTempEditModeFieldChangedByRemoteId(documentId, { formField: updatedFormFields });
      } else {
        await indexedDBService.saveTempEditModeFieldChanged(documentId, { formField: updatedFormFields });
      }
    },
    []
  );

  return {
    saveFormFieldInTempEditMode,
  };
};
