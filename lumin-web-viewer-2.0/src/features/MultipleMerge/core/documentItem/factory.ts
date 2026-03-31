import { DocumentBaseItem } from './base';
import { GoogleDriveItem } from './googleDrive';
import { LocalDocumentItem } from './local';
import { FileSource, FileSourceType } from '../../enum';

export class DocumentItemFactory {
  static createDocumentItem({
    mergeItem,
    onError,
    onLoadDocumentComplete,
    onSetupPasswordHandler,
  }: {
    mergeItem: { _id: string; remoteId?: string; file?: File; name: string; source: FileSourceType };
    onError: (error: Error) => void;
    onLoadDocumentComplete: () => void;
    onSetupPasswordHandler: (params: { attempt: number; name: string }) => void;
  }): DocumentBaseItem {
    if (!mergeItem.file) {
      return null;
    }

    if (mergeItem.source === FileSource.GOOGLE) {
      return new GoogleDriveItem({
        _id: mergeItem._id,
        remoteId: mergeItem.remoteId,
        name: mergeItem.name,
        onError,
        onLoadDocumentComplete,
        onSetupPasswordHandler,
      });
    }

    return new LocalDocumentItem({
      _id: mergeItem._id,
      file: mergeItem.file,
      name: mergeItem.name,
      onError,
      onLoadDocumentComplete,
      onSetupPasswordHandler,
    });
  }
}
