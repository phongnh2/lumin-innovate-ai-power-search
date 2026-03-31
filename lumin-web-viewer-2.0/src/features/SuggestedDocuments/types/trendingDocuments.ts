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

export interface DocumentQueryOrgIdentity {
  orgId: string;
  tab: typeof DocumentTab[keyof typeof DocumentTab];
}

export interface DocumentQueryOrgTeamIdentity {
  teamId: string;
}

export interface GetTrendingDocumentsInput {
  query: DocumentQueryInput;
  filter: DocumentFilterInput;
  identity: DocumentQueryOrgIdentity | DocumentQueryOrgTeamIdentity;
}

export interface GetTrendingDocumentsPayload {
  documents: IDocumentBase[];
  total: number;
  hasNextPage: boolean;
  cursor: string;
}
