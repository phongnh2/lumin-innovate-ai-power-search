import { APP_MARKETPLACE_SOURCES } from '../constants';

export type InvoiceExtractionData = {
  id: string;
  value: string;
  description: string;
  isTableView?: boolean;
};

export type ExtractedResult = Array<
  Record<string, string> & {
    table_items?: Record<string, string>[];
  }
>;

export type AppMarketplaceSource = typeof APP_MARKETPLACE_SOURCES[keyof typeof APP_MARKETPLACE_SOURCES];

export type SelectedDocument = {
  _id: string;
  name: string;
  size: number;
  isOverTimeLimit: boolean;
};

export type OnGetDocumentInstancesProps = {
  documentIds?: string[];
  abortSignal?: AbortSignal;
};

type OnGetDocumentInstancesFn = (props?: OnGetDocumentInstancesProps) => Promise<Core.Document[]>;

export interface BasePanelProps {
  documentId?: string;
  source: AppMarketplaceSource;
  documentViewer: Core.DocumentViewer;
  selectedDocuments?: SelectedDocument[];
  onClose: () => void;
  onGetDocumentInstances?: OnGetDocumentInstancesFn;
}
