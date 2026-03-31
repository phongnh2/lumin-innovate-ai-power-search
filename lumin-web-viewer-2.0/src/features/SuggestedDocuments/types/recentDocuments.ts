import { DocumentTab, modifiedFilter, ownerFilter } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

interface DocumentQueryInput {
  cursor?: string;
  searchKey?: string;
  minimumQuantity: number;
}

interface DocumentFilterInput {
  ownedFilterCondition?: typeof ownerFilter[keyof typeof ownerFilter];
  lastModifiedFilterCondition?: typeof modifiedFilter[keyof typeof modifiedFilter];
}

export interface GetRecentDocumentsInput {
  query: DocumentQueryInput;
  filter: DocumentFilterInput;
  orgId: string;
  tab: typeof DocumentTab[keyof typeof DocumentTab];
}

export interface GetRecentDocumentsPayload {
  documents: IDocumentBase[];
  total: number;
  hasNextPage: boolean;
  cursor: string;
}