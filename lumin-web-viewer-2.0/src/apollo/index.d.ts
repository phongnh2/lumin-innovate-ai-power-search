import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export const client: ApolloClient<NormalizedCacheObject>;

export const clientUpload: ({
  mutation,
  variables,
  cancelToken,
  onUploadProgress,
}: {
  mutation: any;
  variables: any;
  cancelToken?: any;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}) => Promise<any>;
