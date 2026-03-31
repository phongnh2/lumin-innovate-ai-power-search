import indexedDBService from 'services/indexedDBService';

import exportAnnotations from 'helpers/exportAnnotations';

export const useSaveFileChangedInTempEditMode = () => {
  const saveFileChangedInTempEditMode = async (id: string, isFromFunctionalLandingPage: boolean) => {
    const annots = await exportAnnotations();
    if (!annots?.length) {
      return;
    }
    if (isFromFunctionalLandingPage) {
      await indexedDBService.saveTempEditModeAnnotChangedByRemoteId(id, { xfdf: annots });
    } else {
      await indexedDBService.saveTempEditModeAnnotChanged(id, { xfdf: annots });
    }
  };

  return {
    saveFileChangedInTempEditMode,
  };
};
