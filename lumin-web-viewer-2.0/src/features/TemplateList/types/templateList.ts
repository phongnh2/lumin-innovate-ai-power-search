import { DocumentTemplate } from 'interfaces/document/document.interface';

export type GetTemplateListPayload = {
  documents: DocumentTemplate[];
  hasNextPage: boolean;
  cursor: string;
};

export type TemplateListState = {
  documents: DocumentTemplate[];
  pagination: {
    hasNextPage: boolean;
    cursor: string;
  };
  isFetching: boolean;
};

export type TemplateActionsType = {
  previewTemplate: () => void;
  useTemplate: () => void;
  copyLinkTemplate: () => void;
  editTemplate: () => void;
  deleteTemplate: () => void;
};
