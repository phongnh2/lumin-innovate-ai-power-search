import {
  getExtractedData,
  saveFile,
} from '@new-ui/components/ToolProperties/components/SplitExtractPanel/hooks/useExtractPages';

import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import exportAnnotations from 'helpers/exportAnnotations';

import fileUtils from 'utils/file';

const splitExtract = async (toolCall: { pagesToExtract: number[][] }) => {
  const state = store.getState();
  const { name } = selectors.getCurrentDocument(state);
  const defaultExtractedFileName = `Extracted_${fileUtils.getFilenameWithoutExtension(name)}`;
  const extractSplitPromises = toolCall.pagesToExtract.map(async (pageRange, idx) => {
    const extracteSplitFileName = `${defaultExtractedFileName}_${idx + 1}.pdf`;

    const annotationManager = core.getAnnotationManager();
    const annotList = annotationManager
      .getAnnotationsList()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .filter((annot: any) => pageRange.indexOf(annot.PageNumber) > -1);

    const xfdf = await exportAnnotations({
      annotList,
      widgets: true,
      fields: true,
    });

    const data = await getExtractedData(pageRange, xfdf);
    const arr = new Uint8Array(data);
    const blob = new Blob([arr], { type: 'application/pdf' });
    return {
      blob,
      extractedFileName: extracteSplitFileName,
    };
  });
  const extractedSplitFiles = await Promise.all(extractSplitPromises);
  await saveFile(extractedSplitFiles, defaultExtractedFileName);
  return 'done';
};

export default splitExtract;
