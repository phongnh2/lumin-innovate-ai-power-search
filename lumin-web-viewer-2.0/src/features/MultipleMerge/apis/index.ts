import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';

import SessionUtils from 'utils/session';

import { AUTHORIZATION_HEADER } from 'constants/authConstant';
import { EDITOR_BACKEND_BASE_URL } from 'constants/urls';

import { IAnnotation, IDocumentBase, IFormField, TDocumentOutline } from 'interfaces/document/document.interface';

import { GetRemoteDocumentDataPayload } from '../types';

export type DocumentDataType = {
  document: IDocumentBase & { imageSignedUrls: Record<string, string> };
  annotations: IAnnotation[];
  outlines: { data: TDocumentOutline[] };
  formFields: { data: IFormField[] };
};

export const getDocumentData = async ({
  documentId,
  abortSignal,
}: {
  documentId: string;
  abortSignal: AbortSignal;
}): Promise<GetRemoteDocumentDataPayload> => {
  let data: DocumentDataType;
  const url = new URL(`${EDITOR_BACKEND_BASE_URL}/document/stream/documents`);
  url.searchParams.append('ids[]', documentId);
  url.searchParams.append('includeFormFields', 'true');
  url.searchParams.append('includeOutlines', 'true');
  url.searchParams.append('includeAnnotations', 'true');
  const request = new Request(url);
  const token = await SessionUtils.getAuthorizedToken();
  await fetchEventSource(request, {
    headers: {
      [AUTHORIZATION_HEADER]: `Bearer ${token}`,
    },
    onopen(response) {
      if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
        return Promise.resolve(); // everything's good
      }
      throw new Error();
    },
    onmessage(event) {
      if (event.data) {
        data = JSON.parse(event.data) as DocumentDataType;
      }
    },
    onerror(err) {
      throw err; // rethrow to stop the operation
    },
    signal: abortSignal,
  });

  return {
    document: data.document,
    annotations: data.annotations,
    outlines: data.outlines.data || [],
    fields: data.formFields.data || [],
    signedUrls: data.document.imageSignedUrls,
  };
};
