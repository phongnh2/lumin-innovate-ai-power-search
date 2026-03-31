import { useEffect } from 'react';

import { cachingFileHandler } from 'HOC/OfflineStorageHOC';

import { IDocumentBase } from 'interfaces/document/document.interface';

type UseCachingFileHandlerProps = {
  pendingDownloadedDocument: IDocumentBase[];
  setPendingDownloadedDocument: React.Dispatch<React.SetStateAction<IDocumentBase | null>>;
  onDownloadDocument: (downloadingDocument: IDocumentBase[]) => Promise<void>;
};

const useCachingFileHandler = ({
  pendingDownloadedDocument,
  setPendingDownloadedDocument,
  onDownloadDocument,
}: UseCachingFileHandlerProps) => {
  useEffect(() => {
    const messageHandler = ({ process }: { process: Record<string, string> }) => {
      if (cachingFileHandler.isSourceDownloadSuccess(process) && pendingDownloadedDocument) {
        onDownloadDocument(pendingDownloadedDocument);
        setPendingDownloadedDocument(null);
      }
    };
    cachingFileHandler.subServiceWorkerHandler(messageHandler);

    return () => cachingFileHandler.unSubServiceWorkerHandler(messageHandler);
  }, [pendingDownloadedDocument]);
};

export default useCachingFileHandler;
