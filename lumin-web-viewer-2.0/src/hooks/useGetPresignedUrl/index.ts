import { LazyQueryHookOptions, useLazyQuery } from '@apollo/client';

import { GET_PRESIGNED_URL_UPLOAD_DOC } from 'graphQL/DocumentGraph';

import { UploadDocFrom } from 'services/types/documentServices.types';

export const PolicyAcl = {
  PublicRead: 'public-read',
  Private: 'private',
};

export type TPolicyAcl = keyof typeof PolicyAcl;

export type TPresignedUrl = {
  url: string;
  fields: {
    key: string;
  };
};

export interface IPresignedUrlResult {
  document: TPresignedUrl;
  thumbnail: TPresignedUrl;
  encodedUploadData: string;
}

export type TGetUploadParams = {
  documentMimeType: string;
  thumbnailMimeType?: string;
  documentKey?: string;
  thumbnailKey?: string;
  uploadDocFrom?: UploadDocFrom;
};

export const useGetPresignedUrlForUploadDoc = (): [
  (params: TGetUploadParams) => Promise<IPresignedUrlResult>,
  LazyQueryHookOptions
] => {
  const [getUploadPresignedUrlQuery, state] = useLazyQuery<{ getPresignedUrlForUploadDoc: IPresignedUrlResult }>(
    GET_PRESIGNED_URL_UPLOAD_DOC,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const getUploadPresignedUrl = async ({
    documentMimeType,
    thumbnailMimeType,
  }: TGetUploadParams): Promise<IPresignedUrlResult> => {
    const res = await getUploadPresignedUrlQuery({
      variables: {
        input: {
          documentMimeType,
          thumbnailMimeType,
        },
      },
    });
    if (res.error) {
      throw res.error;
    }
    if (!res.data) {
      return null;
    }
    return res.data.getPresignedUrlForUploadDoc;
  };
  return [getUploadPresignedUrl, state];
};
