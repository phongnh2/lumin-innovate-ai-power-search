import { useMutation } from '@tanstack/react-query';

import core from 'core';
import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { documentServices } from 'services';

import exportAnnotations from 'helpers/exportAnnotations';

import { getFileData } from 'utils/getFileService';

import { general } from 'constants/documentType';

import { createUploadPresignedUrlForSummarization } from '../apis/createUploadPresignedUrl';

export const useUploadFileViaPresignedUrl = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const upload = async (documentId: string) => {
    await core.getDocument().getDocumentCompletePromise();
    const xfdfString = await exportAnnotations();
    const fileBuffer = await getFileData({ xfdfString, flatten: true });
    const presignedUrlData = await createUploadPresignedUrlForSummarization(documentId);
    await documentServices.uploadFileToS3({
      presignedUrl: presignedUrlData.url,
      file: new File([fileBuffer], currentDocument.name, { type: general.PDF }),
    });

    return presignedUrlData.fields.key;
  };

  const { isLoading, data, error, mutate, mutateAsync } = useMutation({
    mutationFn: upload,
  });

  return { isLoading, data, error, mutate, mutateAsync };
};
