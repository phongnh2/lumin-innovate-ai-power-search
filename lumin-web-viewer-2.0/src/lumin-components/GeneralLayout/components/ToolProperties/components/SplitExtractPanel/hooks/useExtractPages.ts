import { saveAs } from 'file-saver';
import produce from 'immer';
import { useDispatch } from 'react-redux';

import * as userActions from 'actions/userActions';

import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import exportAnnotations from 'helpers/exportAnnotations';

import fileUtils from 'utils/file';
import { eventTracking } from 'utils/recordUtil';

import { increaseExploredFeatureUsage } from 'features/EnableToolFromQueryParams/apis/increaseExploredFeatureUsage';
import { ExploredFeatureKeys } from 'features/EnableToolFromQueryParams/constants/exploredFeatureKeys';
import { accessToolModalActions } from 'features/ToolPermissionChecker/slices/accessToolModalSlice';

import UserEventConstants from 'constants/eventConstants';

export enum SplitBy {
  RANGE = 'byRange',
  PAGE = 'byNumberOfPages',
}

interface ExtractPagesParams {
  pagesToExtract: number[][];
  ranges: Array<{ value: string }>;
  downloadFileName?: string;
  toolName: string;
  eventName: string;
  isToolAvailable: boolean;
  isExploringFeature: boolean;
}

type UseExtractPagesParams = {
  splitBy: SplitBy;
};

export const getExtractedData = async (pages: number[], xfdf: string): Promise<ArrayBuffer> => {
  try {
    return await (core.getDocument().extractPages(pages, xfdf) as Promise<ArrayBuffer>);
  } catch (err: unknown) {
    if (err instanceof Error && 'type' in err && err.type === 'PDFWorkerError') {
      await core.getDocument().getFileData({ flags: window.Core.SaveOptions.INCREMENTAL });
      return core.getDocument().extractPages(pages, xfdf) as Promise<ArrayBuffer>;
    }
    throw err;
  }
};

export const saveFile = async (
  extractedFiles: { blob: Blob; extractedFileName: string }[],
  defaultExtractedFileName: string
) => {
  if (extractedFiles.length === 1) {
    saveAs(extractedFiles[0].blob, `${defaultExtractedFileName}.pdf`);
  } else {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    extractedFiles.forEach(({ blob, extractedFileName }) => {
      zip.file(extractedFileName, blob);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const savedName = `${defaultExtractedFileName}.zip`;
    saveAs(content, savedName);
  }
};

export const useExtractPages = ({ splitBy }: UseExtractPagesParams) => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);

  const extractPages = async ({
    pagesToExtract,
    ranges,
    downloadFileName,
    toolName,
    eventName,
    isToolAvailable,
    isExploringFeature,
  }: ExtractPagesParams): Promise<void> => {
    if (!isToolAvailable && !isExploringFeature) {
      dispatch(
        accessToolModalActions.openModal({
          toolName,
          eventName,
        })
      );
      return;
    }

    const { name: filename } = currentDocument;
    const defaultExtractedFileName = `Extracted_${fileUtils.getFilenameWithoutExtension(filename)}`;
    const extractPromises = pagesToExtract.map(async (pageRange, idx) => {
      const extractedFileName = downloadFileName || `${defaultExtractedFileName}_${idx + 1}.pdf`;

      const annotationManager = core.getAnnotationManager();
      const annotList = annotationManager
        .getAnnotationsList()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .filter((annot: any) => pageRange.indexOf(annot.PageNumber) > -1);

      const xfdfString = await exportAnnotations({
        annotList,
        widgets: true,
        fields: true,
      });

      const data = await getExtractedData(pageRange, xfdfString);
      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: 'application/pdf' });
      return {
        blob,
        extractedFileName,
      };
    });
    const extractedFiles = await Promise.all(extractPromises);
    await saveFile(extractedFiles, defaultExtractedFileName);

    const pages = JSON.stringify([...ranges].map((item) => item.value));
    eventTracking(UserEventConstants.EventType.DOCUMENT_SPLIT_PAGES, {
      pages,
      splitType: splitBy,
      LuminFileId: currentDocument._id,
    }).catch(() => {});

    if (isExploringFeature) {
      increaseExploredFeatureUsage({ key: ExploredFeatureKeys.SPLIT_PDF }).catch(() => {});
      const updatedUserMetadata = produce(currentUser.metadata, (draft) => {
        draft.exploredFeatures.splitPdf = 1;
      });
      dispatch(userActions.updateUserMetadata(updatedUserMetadata));
    }
  };

  return {
    extractPages,
  };
};
