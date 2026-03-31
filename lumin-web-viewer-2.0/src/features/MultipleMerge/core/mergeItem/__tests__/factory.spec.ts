import { MergeItemFactory } from '../factory';
import { ArrayBufferMergeItem } from '../buffer';
import { RemoteMergeItem } from '../remote';

jest.mock('../buffer', () => ({
  ArrayBufferMergeItem: jest.fn(),
}));

jest.mock('../remote', () => ({
  RemoteMergeItem: jest.fn(),
}));

describe('MergeItemFactory', () => {
  const defaultParams = {
    abortSignal: new AbortController().signal,
    id: 'doc-1',
    name: 'test.pdf',
    onError: jest.fn(),
    onLoadDocumentComplete: jest.fn(),
    onSetupPasswordHandler: jest.fn(),
    onCancelPassword: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMergeItem', () => {
    it('should create an ArrayBufferMergeItem if buffer is provided', () => {
      const buffer = new ArrayBuffer(8);
      const params = { ...defaultParams, buffer };

      MergeItemFactory.createMergeItem(params);

      expect(ArrayBufferMergeItem).toHaveBeenCalledWith(buffer);
      expect(RemoteMergeItem).not.toHaveBeenCalled();
    });

    it('should create a RemoteMergeItem if buffer is missing but remoteId is provided', () => {
      const params = { ...defaultParams, remoteId: 'remote-123' };

      MergeItemFactory.createMergeItem(params);

      expect(RemoteMergeItem).toHaveBeenCalledWith(expect.objectContaining({
        id: 'doc-1',
        remoteId: 'remote-123',
        abortSignal: params.abortSignal,
      }));
      expect(ArrayBufferMergeItem).not.toHaveBeenCalled();
    });

    it('should throw an error if both buffer and remoteId are missing', () => {
      const params = { ...defaultParams }; // No buffer, no remoteId

      expect(() => {
        MergeItemFactory.createMergeItem(params);
      }).toThrow('Remote ID is required');

      expect(ArrayBufferMergeItem).not.toHaveBeenCalled();
      expect(RemoteMergeItem).not.toHaveBeenCalled();
    });
  });
});