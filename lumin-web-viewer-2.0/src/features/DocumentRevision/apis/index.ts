import { gql } from '@apollo/client';

import { client } from '@app-apollo';

import { Nullable } from 'interfaces/common';

export interface GetBackupAnnotationPresignedUrlPayload {
  url: string;
  fields: { [key: string]: string };
}

export const getBackupAnnotationPresignedUrl = async (
  documentId: string,
  options?: { signal: AbortController['signal'] }
) => {
  const { signal } = options || {};
  const res = await client.query<{
    getBackupAnnotationPresignedUrl: GetBackupAnnotationPresignedUrlPayload;
  }>({
    query: gql`
      query getBackupAnnotationPresignedUrl($input: GetBackupAnnotationPresignedUrlInput!) {
        getBackupAnnotationPresignedUrl(input: $input) {
          url
          fields {
            key
          }
        }
      }
    `,
    variables: {
      input: {
        documentId,
      },
    },
    fetchPolicy: 'no-cache',
    context: {
      fetch: {
        signal,
      },
    },
  });
  return res.data.getBackupAnnotationPresignedUrl;
};

export interface GetDocumentVersionListPayload {
  _id: string;
  documentId: string;
  annotationSignedUrl: string;
  versionId: string;
  modifiedBy: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

export const getDocumentVersionList = async (documentId: string, options?: { signal: AbortController['signal'] }) => {
  const { signal } = options || {};
  const res = await client.query<{
    getDocumentVersionList: { data: GetDocumentVersionListPayload[] };
  }>({
    query: gql`
      query getDocumentVersionList($input: GetDocumentVersionListInput!) {
        getDocumentVersionList(input: $input) {
          data {
            modifiedBy {
              _id
              name
            }
            documentId
            annotationSignedUrl
            versionId
            createdAt
            _id
          }
        }
      }
    `,
    variables: {
      input: {
        documentId,
      },
    },
    fetchPolicy: 'no-cache',
    context: {
      fetch: {
        signal,
      },
    },
  });
  return res.data.getDocumentVersionList;
};

interface GetVersionPresignedUrlPayload {
  fileContentPresignedUrl?: Nullable<string>;
  annotationPresignedUrl?: Nullable<string>;
}

export const getVersionPresignedUrl = async (versionId: string, options?: { signal: AbortController['signal'] }) => {
  const { signal } = options || {};
  const res = await client.query<{
    getVersionPresignedUrl: GetVersionPresignedUrlPayload;
  }>({
    query: gql`
      query getVersionPresignedUrl($input: GetVersionPresignedUrlInput!) {
        getVersionPresignedUrl(input: $input) {
          fileContentPresignedUrl
          annotationPresignedUrl
        }
      }
    `,
    variables: {
      input: {
        _id: versionId,
      },
    },
    fetchPolicy: 'no-cache',
    context: {
      fetch: {
        signal,
      },
    },
  });

  return res.data.getVersionPresignedUrl;
};
