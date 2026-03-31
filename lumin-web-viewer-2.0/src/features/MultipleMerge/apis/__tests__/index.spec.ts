import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';

import { getDocumentData, DocumentDataType } from '../index';

// Polyfill Request for Node.js test environment
if (typeof global.Request === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Request: NodeRequest, Headers: NodeHeaders } = require('node-fetch');
  global.Request = NodeRequest;
  global.Headers = NodeHeaders;
}

jest.mock('@microsoft/fetch-event-source', () => ({
  EventStreamContentType: 'text/event-stream',
  fetchEventSource: jest.fn(),
}));

jest.mock('utils/session', () => ({
  __esModule: true,
  default: {
    getAuthorizedToken: jest.fn(),
  },
}));

jest.mock('constants/urls', () => ({
  EDITOR_BACKEND_BASE_URL: 'https://api.example.com',
}));

jest.mock('constants/authConstant', () => ({
  AUTHORIZATION_HEADER: 'authorization-v2',
}));

describe('getDocumentData', () => {
  const mockFetchEventSource = fetchEventSource as jest.MockedFunction<typeof fetchEventSource>;
  const mockToken = 'mock-auth-token';

  const mockDocumentData = {
    document: {
      _id: 'doc-123',
      name: 'test-document.pdf',
      pageCount: 10,
      imageSignedUrls: {
        'page-1': 'https://signed-url.example.com/page-1',
        'page-2': 'https://signed-url.example.com/page-2',
      },
    },
    annotations: [{ _id: 'ann-1', type: 'highlight' }],
    outlines: {
      data: [{ title: 'Chapter 1', pageNumber: 1 }],
    },
    formFields: {
      data: [{ name: 'field1', type: 'text' }],
    },
  } as unknown as DocumentDataType;

  beforeEach(() => {
    jest.clearAllMocks();
    const SessionUtils = require('utils/session').default;
    SessionUtils.getAuthorizedToken.mockResolvedValue(mockToken);
  });

  it('should construct the correct URL with query parameters', async () => {
    const documentId = 'doc-123';
    const abortController = new AbortController();

    mockFetchEventSource.mockImplementation(async (request, options) => {
      // Verify URL construction
      expect(request).toBeInstanceOf(Request);
      const requestUrl = (request as Request).url;
      expect(requestUrl).toContain('https://api.example.com/document/stream/documents');
      expect(requestUrl).toContain('ids%5B%5D=doc-123');
      expect(requestUrl).toContain('includeFormFields=true');
      expect(requestUrl).toContain('includeOutlines=true');
      expect(requestUrl).toContain('includeAnnotations=true');

      // Simulate successful response
      await options?.onopen?.({
        ok: true,
        headers: new Headers({ 'content-type': EventStreamContentType }),
      } as Response);
      options?.onmessage?.({ data: JSON.stringify(mockDocumentData), event: '', id: '', retry: undefined });
    });

    await getDocumentData({ documentId, abortSignal: abortController.signal });

    expect(mockFetchEventSource).toHaveBeenCalledTimes(1);
  });

  it('should set the correct authorization header', async () => {
    const documentId = 'doc-123';
    const abortController = new AbortController();

    mockFetchEventSource.mockImplementation(async (_request, options) => {
      expect(options?.headers).toEqual({
        'authorization-v2': `Bearer ${mockToken}`,
      });

      await options?.onopen?.({
        ok: true,
        headers: new Headers({ 'content-type': EventStreamContentType }),
      } as Response);
      options?.onmessage?.({ data: JSON.stringify(mockDocumentData), event: '', id: '', retry: undefined });
    });

    await getDocumentData({ documentId, abortSignal: abortController.signal });

    const SessionUtils = require('utils/session').default;
    expect(SessionUtils.getAuthorizedToken).toHaveBeenCalledTimes(1);
  });

  it('should pass the abort signal to fetchEventSource', async () => {
    const documentId = 'doc-123';
    const abortController = new AbortController();

    mockFetchEventSource.mockImplementation(async (_request, options) => {
      expect(options?.signal).toBe(abortController.signal);

      await options?.onopen?.({
        ok: true,
        headers: new Headers({ 'content-type': EventStreamContentType }),
      } as Response);
      options?.onmessage?.({ data: JSON.stringify(mockDocumentData), event: '', id: '', retry: undefined });
    });

    await getDocumentData({ documentId, abortSignal: abortController.signal });
  });

  it('should return properly formatted document data on success', async () => {
    const documentId = 'doc-123';
    const abortController = new AbortController();

    mockFetchEventSource.mockImplementation(async (_request, options) => {
      await options?.onopen?.({
        ok: true,
        headers: new Headers({ 'content-type': EventStreamContentType }),
      } as Response);
      options?.onmessage?.({ data: JSON.stringify(mockDocumentData), event: '', id: '', retry: undefined });
    });

    const result = await getDocumentData({ documentId, abortSignal: abortController.signal });

    expect(result).toEqual({
      document: mockDocumentData.document,
      annotations: mockDocumentData.annotations,
      outlines: mockDocumentData.outlines.data,
      fields: mockDocumentData.formFields.data,
      signedUrls: mockDocumentData.document.imageSignedUrls,
    });
  });

  it('should handle empty outlines data', async () => {
    const documentId = 'doc-123';
    const abortController = new AbortController();
    const dataWithEmptyOutlines = {
      ...mockDocumentData,
      outlines: { data: null },
    } as unknown as DocumentDataType;

    mockFetchEventSource.mockImplementation(async (_request, options) => {
      await options?.onopen?.({
        ok: true,
        headers: new Headers({ 'content-type': EventStreamContentType }),
      } as Response);
      options?.onmessage?.({ data: JSON.stringify(dataWithEmptyOutlines), event: '', id: '', retry: undefined });
    });

    const result = await getDocumentData({ documentId, abortSignal: abortController.signal });

    expect(result.outlines).toEqual([]);
  });

  it('should handle empty formFields data', async () => {
    const documentId = 'doc-123';
    const abortController = new AbortController();
    const dataWithEmptyFormFields = {
      ...mockDocumentData,
      formFields: { data: null },
    } as unknown as DocumentDataType;

    mockFetchEventSource.mockImplementation(async (_request, options) => {
      await options?.onopen?.({
        ok: true,
        headers: new Headers({ 'content-type': EventStreamContentType }),
      } as Response);
      options?.onmessage?.({ data: JSON.stringify(dataWithEmptyFormFields), event: '', id: '', retry: undefined });
    });

    const result = await getDocumentData({ documentId, abortSignal: abortController.signal });

    expect(result.fields).toEqual([]);
  });

  describe('error handling', () => {
    it('should throw error when response is not ok', async () => {
      const documentId = 'doc-123';
      const abortController = new AbortController();

      mockFetchEventSource.mockImplementation(async (_request, options) => {
        await options?.onopen?.({
          ok: false,
          status: 500,
          headers: new Headers({ 'content-type': 'text/plain' }),
        } as Response);
      });

      await expect(getDocumentData({ documentId, abortSignal: abortController.signal })).rejects.toThrow();
    });

    it('should throw error when content-type is not event-stream', async () => {
      const documentId = 'doc-123';
      const abortController = new AbortController();

      mockFetchEventSource.mockImplementation(async (_request, options) => {
        await options?.onopen?.({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response);
      });

      await expect(getDocumentData({ documentId, abortSignal: abortController.signal })).rejects.toThrow();
    });

    it('should rethrow error from onerror callback', async () => {
      const documentId = 'doc-123';
      const abortController = new AbortController();
      const testError = new Error('Stream error');

      mockFetchEventSource.mockImplementation(async (_request, options) => {
        await options?.onopen?.({
          ok: true,
          headers: new Headers({ 'content-type': EventStreamContentType }),
        } as Response);

        // Simulate error during streaming
        options?.onerror?.(testError);
      });

      await expect(getDocumentData({ documentId, abortSignal: abortController.signal })).rejects.toThrow('Stream error');
    });
  });

  describe('message handling', () => {
    it('should ignore messages with no data', async () => {
      const documentId = 'doc-123';
      const abortController = new AbortController();

      mockFetchEventSource.mockImplementation(async (_request, options) => {
        await options?.onopen?.({
          ok: true,
          headers: new Headers({ 'content-type': EventStreamContentType }),
        } as Response);

        // Send empty message first
        options?.onmessage?.({ data: '', event: '', id: '', retry: undefined });
        // Then send actual data
        options?.onmessage?.({ data: JSON.stringify(mockDocumentData), event: '', id: '', retry: undefined });
      });

      const result = await getDocumentData({ documentId, abortSignal: abortController.signal });

      expect(result.document).toEqual(mockDocumentData.document);
    });

    it('should use the last message data when multiple messages received', async () => {
      const documentId = 'doc-123';
      const abortController = new AbortController();

      const firstData = {
        ...mockDocumentData,
        document: { ...mockDocumentData.document, name: 'first-document.pdf' },
      } as unknown as DocumentDataType;

      const secondData = {
        ...mockDocumentData,
        document: { ...mockDocumentData.document, name: 'second-document.pdf' },
      } as unknown as DocumentDataType;

      mockFetchEventSource.mockImplementation(async (_request, options) => {
        await options?.onopen?.({
          ok: true,
          headers: new Headers({ 'content-type': EventStreamContentType }),
        } as Response);

        options?.onmessage?.({ data: JSON.stringify(firstData), event: '', id: '', retry: undefined });
        options?.onmessage?.({ data: JSON.stringify(secondData), event: '', id: '', retry: undefined });
      });

      const result = await getDocumentData({ documentId, abortSignal: abortController.signal });

      expect(result.document.name).toBe('second-document.pdf');
    });
  });
});

