import { MergeBaseItem } from './base';
import { ArrayBufferMergeItem } from './buffer';
import { RemoteMergeItem } from './remote';

export class MergeItemFactory {
  static createMergeItem(mergeItem: {
    abortSignal: AbortSignal;
    buffer?: ArrayBuffer;
    id: string;
    name: string;
    remoteId?: string;
    onError: (error: Error) => void;
    onLoadDocumentComplete: () => void;
    onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;
    onCancelPassword: () => void;
  }): MergeBaseItem {
    if (mergeItem.buffer) {
      return new ArrayBufferMergeItem(mergeItem.buffer);
    }

    if (!mergeItem.remoteId) {
      throw new Error('Remote ID is required');
    }

    return new RemoteMergeItem({
      ...mergeItem,
      remoteId: mergeItem.remoteId,
    });
  }
}
